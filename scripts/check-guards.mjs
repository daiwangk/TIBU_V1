#!/usr/bin/env node
/**
 * check-guards.mjs — cheap structural checks that ESLint does not cover.
 * Run: node scripts/check-guards.mjs   (CI runs it before lint and build)
 *
 * Fails (exit 1) when:
 *  1. A file under src/ starts with a blanket `/* eslint-disable *\/` and is not in
 *     scripts/legacy-allowlist.json. (Blanket disables hid a white-screen crash once.)
 *  2. Two paths differ only by letter case (breaks Linux CI / Cloudflare builds).
 *  3. A service-role / secret key name appears anywhere under src/ or in a VITE_ variable.
 *  4. Code in src/pages or src/components imports a data adapter directly
 *     (services/mock or services/supabase). Pages go through src/queries -> src/services.
 *  5. A file in the NEW structure (src/pages, src/components, src/app) uses inline
 *     style={{ ... }}. Add `// allow-inline-style` on the same line for genuine dynamic values.
 * Warns when an allowlisted file no longer exists (remove it from the list).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const allowlistPath = path.join(ROOT, 'scripts', 'legacy-allowlist.json');
const allowlist = fs.existsSync(allowlistPath)
  ? JSON.parse(fs.readFileSync(allowlistPath, 'utf8')).blanketEslintDisable ?? []
  : [];

const errors = [];
const warnings = [];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.git')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const srcFiles = fs.existsSync(SRC) ? walk(SRC) : [];
const codeFiles = srcFiles.filter((f) => /\.(jsx?|mjs|cjs|tsx?)$/.test(f));

// 1. blanket eslint-disable
for (const f of codeFiles) {
  const head = fs.readFileSync(f, 'utf8').slice(0, 300);
  // Any file-level disable (blanket or with rules) — only the line-scoped -next-line / -line forms are allowed.
  if (/^\s*\/\*\s*eslint-disable(?!-)/.test(head) && !allowlist.includes(rel(f))) {
    errors.push(`[blanket-eslint-disable] ${rel(f)} — remove the file-level disable and fix the errors (or disable one rule on one line).`);
  }
}
for (const a of allowlist) {
  if (!fs.existsSync(path.join(ROOT, a))) warnings.push(`[allowlist] ${a} no longer exists — delete it from scripts/legacy-allowlist.json`);
}

// 2. case-only path collisions (whole repo, excluding node_modules/dist/.git)
const all = walk(ROOT).map(rel);
const seen = new Map();
for (const p of all) {
  const parts = p.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const sub = parts.slice(0, i).join('/');
    const key = sub.toLowerCase();
    if (seen.has(key) && seen.get(key) !== sub) {
      errors.push(`[case-collision] "${seen.get(key)}" vs "${sub}" — these are the same path on Windows/macOS but different on Linux.`);
      seen.set(key, sub); // report once
    } else if (!seen.has(key)) seen.set(key, sub);
  }
}

// 3. secrets
const secretPattern = /(service_role|SERVICE_ROLE|SUPABASE_SECRET|sb_secret_)/;
for (const f of codeFiles) {
  const text = fs.readFileSync(f, 'utf8');
  if (secretPattern.test(text)) errors.push(`[secret] ${rel(f)} mentions a service-role/secret key. Secrets never go in src/.`);
}
for (const envFile of ['.env', '.env.local', '.env.example', '.env.production']) {
  const p = path.join(ROOT, envFile);
  if (fs.existsSync(p) && /^VITE_[A-Z_]*(SERVICE|SECRET)/m.test(fs.readFileSync(p, 'utf8'))) {
    errors.push(`[secret] ${envFile} exposes a service/secret key through a VITE_ variable (Vite ships VITE_* to the browser).`);
  }
}

// 4 + 5. new-structure rules
const NEW_DIRS = ['src/pages/', 'src/components/', 'src/app/', 'src/layouts/'];
// Only src/services/ may know about adapters or the Supabase client; everything else goes through src/queries -> services/index.js.
const ADAPTER_FREE_DIRS = [...NEW_DIRS, 'src/queries/', 'src/stores/', 'src/lib/'];
const MAX_COMPONENT_LINES = 250;
for (const f of codeFiles) {
  const r = rel(f);
  const adapterFree = ADAPTER_FREE_DIRS.some((d) => r.startsWith(d)) && !/\.test\.[jt]sx?$/.test(r);
  const isNew = NEW_DIRS.some((d) => r.startsWith(d));
  if (!adapterFree && !isNew) continue;
  const text = fs.readFileSync(f, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (adapterFree && (/(?:from\s+|import\s*\(\s*|import\s+)['"][^'"]*services\/(mock|supabase)/.test(line)
        || /['"]@supabase\/supabase-js['"]/.test(line))) {
      errors.push(`[adapter-import] ${r}:${i + 1} imports a data adapter or the Supabase client directly. Use src/queries/* (or src/services/index.js).`);
    }
    if (isNew && /style=\{\{/.test(line) && !/allow-inline-style/.test(line)) {
      errors.push(`[inline-style] ${r}:${i + 1} uses style={{}} in new code. Use Tailwind classes with the theme.css tokens.`);
    }
  });
  // AGENTS.md §5: components stay under 250 lines. A warning, not a failure, until the existing offenders are split.
  if (isNew && /\.jsx$/.test(r) && !r.startsWith('src/pages/dev/') && lines.length > MAX_COMPONENT_LINES) {
    warnings.push(`[size] ${r} has ${lines.length} lines (limit ${MAX_COMPONENT_LINES}) — split it.`);
  }
}

// 6. a privileged key pasted into a VITE_* variable by VALUE (names are checked above; CI sets these at build time)
function looksPrivileged(value) {
  const key = String(value ?? '').trim();
  if (key.startsWith(['sb', 'secret', ''].join('_'))) return true;
  const payload = key.split('.')[1];
  if (!payload) return false;
  try {
    const json = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    return json?.role === ['service', 'role'].join('_');
  } catch {
    return false;
  }
}
for (const [name, value] of Object.entries(process.env)) {
  if (name.startsWith('VITE_') && looksPrivileged(value)) {
    errors.push(`[secret] ${name} holds a privileged Supabase key. Vite would ship it to every browser. Use the public anon key and rotate this one.`);
  }
}

for (const w of warnings) console.warn('WARN ' + w);
if (errors.length) {
  for (const e of errors) console.error('FAIL ' + e);
  console.error(`\ncheck-guards: ${errors.length} problem(s).`);
  process.exit(1);
}
console.log(`check-guards: OK (${codeFiles.length} source files, ${allowlist.length} legacy allowlist entries)`);
