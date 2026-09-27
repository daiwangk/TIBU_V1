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
  if (/^\s*\/\*\s*eslint-disable\s*\*\//.test(head) && !allowlist.includes(rel(f))) {
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
const NEW_DIRS = ['src/pages/', 'src/components/', 'src/app/'];
for (const f of codeFiles) {
  const r = rel(f);
  if (!NEW_DIRS.some((d) => r.startsWith(d))) continue;
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (/from\s+['"][^'"]*services\/(mock|supabase)/.test(line)) {
      errors.push(`[adapter-import] ${r}:${i + 1} imports a data adapter directly. Use src/queries/* (or src/services/index.js).`);
    }
    if (/style=\{\{/.test(line) && !/allow-inline-style/.test(line)) {
      errors.push(`[inline-style] ${r}:${i + 1} uses style={{}} in new code. Use Tailwind classes with the theme.css tokens.`);
    }
  });
}

for (const w of warnings) console.warn('WARN ' + w);
if (errors.length) {
  for (const e of errors) console.error('FAIL ' + e);
  console.error(`\ncheck-guards: ${errors.length} problem(s).`);
  process.exit(1);
}
console.log(`check-guards: OK (${codeFiles.length} source files, ${allowlist.length} legacy allowlist entries)`);
