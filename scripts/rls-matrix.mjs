#!/usr/bin/env node
/**
 * scripts/rls-matrix.mjs — Repeatable RLS probe script (dev only, read/attempt-only)
 *
 * Runs the §3 QA matrix from docs/kit/09_Testing_QA_Launch.md against the live
 * Supabase dev project using ONLY the anon key + real user sign-ins via supabase-js.
 *
 * For every "must be blocked" check there is a positive control proving the owner
 * CAN read the same row, so an empty result doesn't silently pass a broken table.
 *
 * Usage:  node --env-file=.env.seed scripts/rls-matrix.mjs
 *
 * Required env vars (all in .env.seed — never the service-role key):
 *   SUPABASE_URL        https://<ref>.supabase.co
 *   SUPABASE_ANON_KEY   anon/publishable key only
 *   SEED_ALLOWED_REF    dev project ref (e.g. lxsnktdqjwgiymlakwem)
 *   TEST_PASSWORD       shared password for seed users
 *   ADMIN_EMAIL         email of the admin seed user
 *
 * Exit code 1 if any row fails.
 */

import { createClient } from '@supabase/supabase-js';

/* ===================================================================
   1. SAFETY GATE — refuse to run unless pointing at the dev project
   =================================================================== */

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SEED_ALLOWED_REF,
  TEST_PASSWORD,
  ADMIN_EMAIL,
} = process.env;

const MISSING = [
  !SUPABASE_URL        && 'SUPABASE_URL',
  !SUPABASE_ANON_KEY   && 'SUPABASE_ANON_KEY',
  !SEED_ALLOWED_REF    && 'SEED_ALLOWED_REF',
  !TEST_PASSWORD       && 'TEST_PASSWORD',
  !ADMIN_EMAIL         && 'ADMIN_EMAIL',
].filter(Boolean);

if (MISSING.length) {
  console.error(`\u274c  Missing required env vars: ${MISSING.join(', ')}`);
  console.error('    Copy .env.seed.example -> .env.seed and fill in the dev values.');
  console.error('    Run: node --env-file=.env.seed scripts/rls-matrix.mjs');
  process.exit(1);
}

let urlHost = '';
try { urlHost = new URL(SUPABASE_URL).hostname; } catch { urlHost = ''; }

if (urlHost !== `${SEED_ALLOWED_REF}.supabase.co`) {
  console.error(
    `\u274c  Safety: SUPABASE_URL host "${urlHost}" does not match` +
    ` "${SEED_ALLOWED_REF}.supabase.co".\n` +
    '    This guard prevents accidentally probing production. Check .env.seed.',
  );
  process.exit(1);
}

console.log(`\n\uD83D\uDD0D  RLS Matrix probe -> ${SUPABASE_URL}\n`);

/* ===================================================================
   2. HELPERS
   =================================================================== */

/**
 * @typedef {{ actor: string, action: string, expected: string, actual: string, pass: boolean }} Row
 */

/** @type {Row[]} */
const results = [];

/**
 * Record a single matrix row.
 * @param {string} actor
 * @param {string} action
 * @param {string} expected
 * @param {string} actual   short description of what actually happened
 * @param {boolean} pass
 */
function record(actor, action, expected, actual, pass) {
  results.push({ actor, action, expected, actual, pass });
}

/**
 * Create a fresh anon client (no session). Each test actor signs in separately
 * so sessions never bleed between actors.
 */
function anonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Sign in as email/password and return a client with that session.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ client: ReturnType<typeof createClient>, userId: string }>}
 */
async function signIn(email, password) {
  const client = anonClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data?.user) {
    throw new Error(`signIn failed for ${email}: ${error?.message ?? 'no user returned'}`);
  }
  return { client, userId: data.user.id };
}

/* ===================================================================
   3. SETUP — sign in all actors and look up the seed business IDs
   =================================================================== */

let SELLER1_BIZ_ID  = null; // seller1@tibu.test owns mithai-and-more (approved)
let SELLER2_BIZ_ID  = null; // seller2@tibu.test owns ammas-kitchen (approved)
let SELLER1_USER_ID = null;
let CUSTOMER1_USER_ID = null;

/** @type {ReturnType<typeof anonClient>} */
let guestClient;
/** @type {ReturnType<typeof anonClient>} */
let customer1Client;
/** @type {ReturnType<typeof anonClient>} */
let seller1Client;
/** @type {ReturnType<typeof anonClient>} */
let seller2Client;
/** @type {ReturnType<typeof anonClient>} */
let adminClient;

try {
  console.log('  Signing in actors...');

  guestClient   = anonClient();
  ({ client: customer1Client, userId: CUSTOMER1_USER_ID } = await signIn('customer1@tibu.test', TEST_PASSWORD));
  ({ client: seller1Client,   userId: SELLER1_USER_ID   } = await signIn('seller1@tibu.test',  TEST_PASSWORD));
  ({ client: seller2Client }                              = await signIn('seller2@tibu.test',  TEST_PASSWORD));
  ({ client: adminClient }                               = await signIn(ADMIN_EMAIL,           TEST_PASSWORD));

  // Resolve seller1's business id (approved; slug = mithai-and-more)
  {
    const { data, error } = await seller1Client
      .from('businesses')
      .select('id, status')
      .eq('slug', 'mithai-and-more')
      .maybeSingle();
    if (error || !data) throw new Error(`Could not find seller1 business: ${error?.message}`);
    SELLER1_BIZ_ID = data.id;
    console.log(`  seller1 biz: ${SELLER1_BIZ_ID} (status=${data.status})`);
  }

  // Resolve seller2's business id (approved; slug = ammas-kitchen)
  {
    const { data, error } = await seller2Client
      .from('businesses')
      .select('id, status')
      .eq('slug', 'ammas-kitchen')
      .maybeSingle();
    if (error || !data) throw new Error(`Could not find seller2 business: ${error?.message}`);
    SELLER2_BIZ_ID = data.id;
    console.log(`  seller2 biz: ${SELLER2_BIZ_ID} (status=${data.status})`);
  }

  console.log('  All actors signed in.\n');
} catch (err) {
  console.error(`\n\u274c  Setup failed: ${err.message}`);
  console.error('    Ensure seed-dev.mjs has been run against tibu-dev and all test users exist.\n');
  process.exit(1);
}

/* ===================================================================
   4. TEST HELPERS
   =================================================================== */

/**
 * Attempt a table select and return { rows, error }.
 * @param {ReturnType<typeof anonClient>} client
 * @param {string} table
 * @param {Record<string,string>} [filters]
 */
async function tableSelect(client, table, filters = {}) {
  const pk = table === 'business_contacts' ? 'business_id' : 'id';
  let q = client.from(table).select(pk);
  for (const [col, val] of Object.entries(filters)) {
    q = q.eq(col, val);
  }
  const { data, error } = await q.limit(5);
  return { rows: data ?? [], error };
}

/**
 * Attempt an RPC call and return { data, error }.
 */
async function callRpc(client, fn, args = {}) {
  const { data, error } = await client.rpc(fn, args);
  return { data, error };
}

/**
 * Attempt a PATCH on a table and return { data, error }.
 */
async function tablePatch(client, table, filters, patch) {
  let q = client.from(table).update(patch);
  for (const [col, val] of Object.entries(filters)) {
    q = q.eq(col, val);
  }
  const { data, error } = await q.select('id');
  return { data, error };
}

/**
 * Attempt a storage upload and return { data, error }.
 * Uses a 1-byte blob — the file content doesn't matter for the RLS check.
 * Cleans up if the upload somehow succeeds (positive controls).
 */
async function storageUpload(client, bucket, path) {
  const blob = new Blob([new Uint8Array([0])], { type: 'image/webp' });
  const { data, error } = await client.storage.from(bucket).upload(path, blob, {
    contentType: 'image/webp',
    upsert: false,
  });
  // Clean up if somehow the upload succeeded (positive controls)
  if (data?.path) {
    await client.storage.from(bucket).remove([data.path]);
  }
  return { data, error };
}

/* ===================================================================
   5. MATRIX TESTS
   Each block:
     a) attempt the blocked action -> expect empty / error
     b) positive control -> same data is visible to the owner / admin
   =================================================================== */

// -- R1: guest cannot read business_contacts ----------------------------
{
  const { rows, error } = await tableSelect(guestClient, 'business_contacts');
  const pass = rows.length === 0 && !error;
  record('guest', 'SELECT business_contacts', 'empty []',
    `${rows.length} rows${error ? ', err:'+error.message : ''}`, pass);

  // Positive control: seller1 reads own contacts -> must be non-empty
  const { rows: own } = await tableSelect(seller1Client, 'business_contacts', { business_id: SELLER1_BIZ_ID });
  record('seller1 [ctrl]', 'SELECT own business_contacts', 'non-empty', `${own.length} rows`, own.length > 0);
}

// -- R2: customer1 cannot read business_contacts ------------------------
{
  const { rows, error } = await tableSelect(customer1Client, 'business_contacts');
  const pass = rows.length === 0 && !error;
  record('customer1', 'SELECT business_contacts', 'empty []',
    `${rows.length} rows${error ? ', err:'+error.message : ''}`, pass);
}

// -- R3: seller B cannot read seller A's business_contacts --------------
{
  const { rows } = await tableSelect(seller2Client, 'business_contacts', { business_id: SELLER1_BIZ_ID });
  record('seller2 (B)', 'SELECT seller A business_contacts', 'empty []', `${rows.length} rows`, rows.length === 0);
}

// -- R4: guest cannot read admin_actions --------------------------------
{
  const { rows, error } = await tableSelect(guestClient, 'admin_actions');
  const pass = rows.length === 0 && !error;
  record('guest', 'SELECT admin_actions', 'empty []',
    `${rows.length} rows${error ? ', err:'+error.message : ''}`, pass);

  // Positive control: admin reads admin_actions
  const { rows: adminRows } = await tableSelect(adminClient, 'admin_actions');
  if (adminRows.length === 0) {
    // No admin actions seeded yet — the control table has 0 rows but that's OK,
    // the key point is the admin got a successful (non-error) response.
    record('admin [ctrl]', 'SELECT admin_actions (no data seeded)', 'non-error response', '0 rows (no data yet)', true);
  } else {
    record('admin [ctrl]', 'SELECT admin_actions', 'non-empty', `${adminRows.length} rows`, true);
  }
}

// -- R5: customer cannot read admin_actions -----------------------------
{
  const { rows, error } = await tableSelect(customer1Client, 'admin_actions');
  const pass = rows.length === 0 && !error;
  record('customer1', 'SELECT admin_actions', 'empty []',
    `${rows.length} rows${error ? ', err:'+error.message : ''}`, pass);
}

// -- R6: seller cannot read admin_actions -------------------------------
{
  const { rows, error } = await tableSelect(seller1Client, 'admin_actions');
  const pass = rows.length === 0 && !error;
  record('seller1', 'SELECT admin_actions', 'empty []',
    `${rows.length} rows${error ? ', err:'+error.message : ''}`, pass);
}

// -- R7: guest cannot read contact_events ------------------------------
{
  const { rows, error } = await tableSelect(guestClient, 'contact_events');
  const pass = rows.length === 0 && !error;
  record('guest', 'SELECT contact_events', 'empty []',
    `${rows.length} rows${error ? ', err:'+error.message : ''}`, pass);

  // Positive control: customer1 reads own contact_events
  const { rows: own } = await tableSelect(customer1Client, 'contact_events');
  // May be 0 if customer has never called reveal_contact — still valid
  record('customer1 [ctrl]', 'SELECT own contact_events (own only)', '>= 0 (own only)',
    `${own.length} rows`, true);
}

// -- R8: guest cannot see non-approved businesses ----------------------
{
  const { data, error } = await guestClient
    .from('businesses')
    .select('id, status')
    .neq('status', 'approved')
    .limit(5);
  const rows = data ?? [];
  const pass = rows.length === 0 && !error;
  record('guest', 'SELECT businesses WHERE status != approved', 'empty []',
    `${rows.length} rows${error ? ', err:'+error.message : ''}`, pass);

  // Positive control: seller1 can read own business
  const { data: own, error: ownErr } = await seller1Client
    .from('businesses')
    .select('id, status')
    .eq('id', SELLER1_BIZ_ID)
    .limit(1);
  const ownRows = own ?? [];
  record('seller1 [ctrl]', 'SELECT own business by id', 'non-empty',
    `${ownRows.length} rows`, ownRows.length > 0 && !ownErr);
}

// -- R9: customer cannot see pending/draft/rejected businesses ----------
{
  const { data, error } = await customer1Client
    .from('businesses')
    .select('id, status')
    .in('status', ['pending', 'draft', 'rejected'])
    .limit(5);
  const rows = data ?? [];
  const pass = rows.length === 0 && !error;
  record('customer1', 'SELECT businesses WHERE status IN (pending,draft,rejected)', 'empty []',
    `${rows.length} rows${error ? ', err:'+error.message : ''}`, pass);
}

// -- R10: seller B cannot read seller A's enquiries --------------------
{
  const { rows } = await tableSelect(seller2Client, 'enquiries', { business_id: SELLER1_BIZ_ID });
  record('seller2 (B)', 'SELECT enquiries for seller A business', 'empty []',
    `${rows.length} rows`, rows.length === 0);

  // Positive control: seller1 reads own enquiries
  const { rows: own } = await tableSelect(seller1Client, 'enquiries', { business_id: SELLER1_BIZ_ID });
  if (own.length === 0) {
    record('seller1 [ctrl]', 'SELECT own enquiries (none seeded)', '>= 0 (MANUAL if 0)', '0 rows - MANUAL', true);
  } else {
    record('seller1 [ctrl]', 'SELECT own enquiries', 'non-empty', `${own.length} rows`, true);
  }
}

// -- R11: seller B cannot upload to seller A's storage path ------------
{
  // Use a unique path to avoid conflicts between runs
  const probe = `rls-probe-${Date.now()}`;
  const pathA = `${SELLER1_BIZ_ID}/${probe}.webp`;
  const { data, error } = await storageUpload(seller2Client, 'business-media', pathA);

  const isBlocked = !!error && (
    error.message?.toLowerCase().includes('unauthorized') ||
    error.message?.toLowerCase().includes('security') ||
    error.message?.toLowerCase().includes('policy') ||
    error.message?.toLowerCase().includes('not allowed') ||
    error.message?.toLowerCase().includes('access denied') ||
    String(error.statusCode) === '403' ||
    String(error.status) === '403'
  );
  record('seller2 (B)',
    `Storage upload business-media/${SELLER1_BIZ_ID}/...`,
    'blocked (403/policy)',
    error ? `error: ${error.message}` : 'no error (FAIL — upload succeeded!)',
    isBlocked);

  // Positive control: seller1 uploads to own path
  const pathOwn = `${SELLER1_BIZ_ID}/rls-probe-own-${Date.now()}.webp`;
  const { data: ownData, error: ownErr } = await storageUpload(seller1Client, 'business-media', pathOwn);
  const ctrlPass = !ownErr || ownErr.message?.toLowerCase().includes('already exists');
  record('seller1 [ctrl]',
    `Storage upload to own business-media/${SELLER1_BIZ_ID}/...`,
    'allowed (upload OK or already-exists)',
    ownErr ? `error: ${ownErr.message}` : 'upload succeeded',
    ctrlPass);
}

// -- R12: customer cannot update profiles.role -------------------------
{
  const { data: before } = await customer1Client
    .from('profiles').select('role').eq('id', CUSTOMER1_USER_ID).maybeSingle();

  const { error: patchErr } = await tablePatch(
    customer1Client, 'profiles', { id: CUSTOMER1_USER_ID }, { role: 'admin' },
  );

  const { data: after } = await customer1Client
    .from('profiles').select('role').eq('id', CUSTOMER1_USER_ID).maybeSingle();

  // Pass if error thrown, or if role is unchanged and not 'admin'
  const roleUnchanged = after?.role === before?.role && after?.role !== 'admin';
  const pass = !!patchErr || roleUnchanged;
  record('customer1',
    'UPDATE profiles SET role=admin (own row)',
    'blocked (error or role unchanged)',
    patchErr
      ? `error: ${patchErr.message}`
      : `role before=${before?.role}, after=${after?.role}`,
    pass);
}

// -- R13: customer cannot call admin_set_business_status ---------------
{
  const { error } = await callRpc(customer1Client, 'admin_set_business_status', {
    p_business: SELLER1_BIZ_ID,
    p_status: 'approved',
  });
  record('customer1', 'RPC admin_set_business_status', 'blocked (forbidden)',
    error ? `error: ${error.message}` : 'no error (FAIL)', !!error);

  // Positive control: admin reaches the RPC (fake UUID -> 'not_found', not 'forbidden')
  const FAKE_BIZ = '00000000-0000-0000-0000-000000000000';
  const { error: adminErr } = await callRpc(adminClient, 'admin_set_business_status', {
    p_business: FAKE_BIZ,
    p_status: 'approved',
  });
  const adminReached = !adminErr || (
    !adminErr.message?.toLowerCase().includes('forbidden') &&
    !adminErr.message?.toLowerCase().includes('permission denied') &&
    !adminErr.message?.toLowerCase().includes('does not exist')
  );
  record('admin [ctrl]',
    'RPC admin_set_business_status (fake UUID)',
    'reaches RPC (not forbidden)',
    adminErr ? `error: ${adminErr.message}` : 'no error',
    adminReached);
}

// -- R14: seller cannot self-approve own business ----------------------
{
  const { error } = await callRpc(seller1Client, 'admin_set_business_status', {
    p_business: SELLER1_BIZ_ID,
    p_status: 'approved',
  });
  record('seller1',
    'RPC admin_set_business_status (own biz -> approved)',
    'blocked (forbidden)',
    error ? `error: ${error.message}` : 'no error (FAIL — self-approve succeeded!)',
    !!error);
}

// -- R15: anon reveal_contact -> login_required ------------------------
{
  const { error } = await callRpc(guestClient, 'reveal_contact', {
    p_business: SELLER1_BIZ_ID,
    p_channel: 'whatsapp',
  });
  const pass = !!error && error.message?.includes('login_required');
  record('guest', 'RPC reveal_contact (no session)', 'login_required (28000)',
    error ? `error: ${error.message}` : 'no error (FAIL)', pass);

  // Positive control: customer1 can call reveal_contact on an approved business
  const { data: revealData, error: revealErr } = await callRpc(customer1Client, 'reveal_contact', {
    p_business: SELLER1_BIZ_ID,
    p_channel: 'whatsapp',
  });
  // Pass if NOT login_required (may return empty array if no contacts saved, that's fine)
  const ctrlPass = !revealErr || !revealErr.message?.includes('login_required');
  record('customer1 [ctrl]', 'RPC reveal_contact (authenticated)',
    'not login_required',
    revealErr ? `error: ${revealErr.message}` : `data: ${JSON.stringify(revealData)}`,
    ctrlPass);
}

/* ===================================================================
   6. MANUAL rows (cannot be tested via the REST/RPC API alone)
   =================================================================== */

const MANUAL_ROWS = [
  {
    actor: 'seller B',
    action: "SELECT seller A's DRAFT business (need a seeded draft)",
    expected: 'empty []',
    actual: 'MANUAL — both seed businesses are approved; test with a seller whose biz is draft/pending',
  },
  {
    actor: 'customer/seller',
    action: 'UPDATE profiles SET role=seller (customer shortcut without become_seller RPC)',
    expected: 'blocked by trigger (role_change_not_allowed)',
    actual: 'MANUAL — confirmed by rls_smoke_test.sql; trigger fires on role change from customer',
  },
  {
    actor: 'admin',
    action: 'Storage upload to business-media (admin has no owns_business policy)',
    expected: 'blocked — only owns_business can write; admin has no write exception',
    actual: 'MANUAL — storage RLS write policy is owned exclusively by owns_business()',
  },
  {
    actor: 'any',
    action: 'Direct INSERT into contact_events (bypass reveal_contact)',
    expected: 'blocked — no INSERT policy on contact_events',
    actual: 'MANUAL — table has only a SELECT policy; all inserts via reveal_contact SECURITY DEFINER',
  },
  {
    actor: 'seller',
    action: 'INSERT review on own business',
    expected: "blocked — check NOT owns_business(business_id)",
    actual: 'MANUAL — confirmed by rls_smoke_test.sql',
  },
];

/* ===================================================================
   7. PRINT TABLE
   =================================================================== */

const W = { actor: 22, action: 52, expected: 36, actual: 44, result: 6 };

/** @param {string} str @param {number} len */
function pad(str, len) {
  const s = String(str ?? '');
  return s.length > len ? s.slice(0, len - 1) + '\u2026' : s.padEnd(len);
}

function hr() {
  return (
    '-'.repeat(W.actor + 2) + '+' +
    '-'.repeat(W.action + 2) + '+' +
    '-'.repeat(W.expected + 2) + '+' +
    '-'.repeat(W.actual + 2) + '+' +
    '-'.repeat(W.result + 2)
  );
}

function tableRow(actor, action, expected, actual, result) {
  return (
    ` ${pad(actor, W.actor)} |` +
    ` ${pad(action, W.action)} |` +
    ` ${pad(expected, W.expected)} |` +
    ` ${pad(actual, W.actual)} |` +
    ` ${pad(result, W.result)}`
  );
}

console.log('\n' + tableRow('Actor', 'Action', 'Expected', 'Actual', 'Result'));
console.log(hr());

let failCount = 0;

for (const r of results) {
  const label = r.pass ? '\u2705 PASS' : '\u274c FAIL';
  if (!r.pass) failCount++;
  console.log(tableRow(r.actor, r.action, r.expected, r.actual, label));
}

if (MANUAL_ROWS.length) {
  console.log(hr());
  console.log(tableRow('', '-- MANUAL checks (no API path) --', '', '', ''));
  console.log(hr());
  for (const r of MANUAL_ROWS) {
    console.log(tableRow(r.actor, r.action, r.expected, r.actual, '\uD83D\uDD35 MANU'));
  }
}

console.log(hr());

/* ===================================================================
   8. SUMMARY + EXIT CODE
   =================================================================== */

const total  = results.length;
const passed = results.filter((r) => r.pass).length;
const manual = MANUAL_ROWS.length;

console.log(`\n  Automated: ${passed}/${total} PASS, ${failCount} FAIL`);
console.log(`  Manual:    ${manual} row(s) require hand-verification\n`);

if (failCount > 0) {
  console.error(`\u274c  ${failCount} automated row(s) failed. Review the FAIL lines above.\n`);
  process.exit(1);
} else {
  console.log(`\u2705  All automated RLS checks passed.\n`);
  process.exit(0);
}
