/**
 * fix_hooks_order.cjs
 *
 * For each target file, move any `useState(...)` calls that appear AFTER
 * the early-return loading guard to BEFORE it.
 *
 * Pattern to fix:
 *   useAsync(...)   <- hook OK
 *   if (loading) return ...;  <- early return (the guard)
 *   useState(...)  <- hook AFTER early return = VIOLATION
 *
 * We move all standalone `useState(...)` lines that fall between the
 * early-return guard and the filter/render logic to before the guard.
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

// Files with known hooks-called-conditionally issues (from lint output)
const targets = [
  'Business.jsx',
  'Candles.jsx',
  'Crochet.jsx',
  'Desserts.jsx',
  'Embroidery.jsx',
  'Gifts.jsx',
  'Jewellery.jsx',
  'MenFashion.jsx',
  'Resin.jsx',
  'Saved.jsx',
  'Search.jsx',
  'SellerProductDetail.jsx',
  'WomenFashion.jsx',
];

let totalFixed = 0;

for (const file of targets) {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${file}`);
    continue;
  }

  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split(/\r?\n/);

  // 1. Find the line index of the early-return guard
  //    Pattern: line matching /if \(load_...?\) return /
  let guardIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*if\s*\(load_\w/.test(lines[i]) && /return\s*</.test(lines[i])) {
      guardIdx = i;
      break;
    }
  }

  if (guardIdx === -1) {
    console.log(`NO GUARD found: ${file}`);
    continue;
  }

  // 2. Find all useState (and useRef, etc.) lines that appear AFTER the guard
  //    but BEFORE the first filter / return / JSX — we stop collecting at:
  //    - a line that starts a filter expression (const filtered..., const all...)
  //    - a line that starts return (
  //    - a JSX line
  // We collect them from guardIdx+1 onward
  const hooksToMove = []; // {idx, line}
  const blanksBetween = []; // blank lines adjacent to hooks to remove too

  // Scan from guardIdx+1 up to the end to find hooks
  // Stop collecting when we hit non-hook, non-blank code
  let i = guardIdx + 1;
  // skip immediate blank
  while (i < lines.length && lines[i].trim() === '') i++;

  // Now collect useState/useRef/etc lines (and any blank lines between them)
  const hookPattern = /^\s*(const\s+\[.*\]\s*=\s*useState\s*\(|const\s+\w+\s*=\s*use[A-Z])/;

  // We collect runs of: blank + hook line
  const collectedHookLines = [];
  let j = i;
  while (j < lines.length) {
    const trimmed = lines[j].trim();
    if (trimmed === '') {
      // peek ahead — if next non-blank is a hook, include this blank
      let k = j + 1;
      while (k < lines.length && lines[k].trim() === '') k++;
      if (k < lines.length && hookPattern.test(lines[k])) {
        collectedHookLines.push(j); // include blank
        j = k;
        continue;
      } else {
        break; // blank not followed by hook — stop collecting
      }
    }
    if (hookPattern.test(trimmed === '' ? '' : lines[j])) {
      collectedHookLines.push(j);
      j++;
    } else {
      break;
    }
  }

  if (collectedHookLines.length === 0) {
    console.log(`NO HOOKS AFTER GUARD: ${file}`);
    continue;
  }

  // 3. Build new file:
  //    - everything up to (not including) guardIdx
  //    - the hook lines collected (moved here)
  //    - blank line
  //    - the guardIdx line
  //    - blank line
  //    - everything from j onward (skipping collectedHookLines)

  const removedSet = new Set(collectedHookLines);

  const before = lines.slice(0, guardIdx);
  const movedHooks = collectedHookLines.map((idx) => lines[idx]);
  const guard = [lines[guardIdx]];
  const after = lines.slice(guardIdx + 1).filter((_, relIdx) => {
    const absIdx = guardIdx + 1 + relIdx;
    return !removedSet.has(absIdx);
  });

  const newLines = [...before, ...movedHooks, '', ...guard, ...after];
  const newContent = newLines.join('\n');

  if (newContent !== original) {
    fs.writeFileSync(filePath, newContent);
    console.log(`FIXED: ${file} (moved ${collectedHookLines.length} lines before guard at line ${guardIdx + 1})`);
    totalFixed++;
  } else {
    console.log(`NO CHANGE: ${file}`);
  }
}

console.log(`\nDone. Fixed ${totalFixed} files.`);
