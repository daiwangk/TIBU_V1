/**
 * fix_split_hooks.cjs
 * 
 * The previous fix_hooks_order.cjs moved hook lines but split multi-line
 * declarations. This script fixes files where a `const [x] = useState(` 
 * declaration was split by the loading guard line.
 * 
 * Pattern to fix: 
 *   const [x, setX] = useState([
 *                                   <- blank line inserted here
 *   if (load_...) return ...;        <- guard ended up here
 *                                   <- blank
 *   "item1",                         <- continuation of the array
 *   ...
 * ]);
 *
 * We need to:
 * 1. Find the loading guard line
 * 2. Move it AFTER the complete declarations that precede it
 */
const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '..', 'src');

const targets = [
  'Candles.jsx',
  'Crochet.jsx',
  'Desserts.jsx',
  'Embroidery.jsx',
  'Gifts.jsx',
  'Jewellery.jsx',
  'MenFashion.jsx',
  'Resin.jsx',
  'Search.jsx',
  'WomenFashion.jsx',
];

for (const file of targets) {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the guard line
  const guardMatch = content.match(/^[ \t]*if\s*\(load_\w[^\n]*return[^\n]*\n/m);
  if (!guardMatch) {
    console.log(`NO GUARD: ${file}`);
    continue;
  }
  
  const guardLine = guardMatch[0];
  const guardIdx = content.indexOf(guardLine);
  
  // Find the position where hooks/state declarations end and regular code begins
  // We look before the guard to see if there's an unclosed statement
  const before = content.slice(0, guardIdx);
  const after = content.slice(guardIdx + guardLine.length);
  
  // Count open parens in 'before' to check if we're inside an unclosed statement
  // Simple heuristic: count ( and )
  let openParens = 0;
  for (const ch of before) {
    if (ch === '(') openParens++;
    else if (ch === ')') openParens--;
  }
  
  if (openParens === 0) {
    // No unclosed parens — guard is in the right place
    console.log(`OK (balanced): ${file}`);
    continue;
  }
  
  // There are unclosed parens before the guard. Find where they close in 'after'
  let closeIdx = -1;
  let depth = openParens;
  for (let i = 0; i < after.length; i++) {
    if (after[i] === '(') depth++;
    else if (after[i] === ')') {
      depth--;
      if (depth === 0) {
        // Move to end of that statement (find the ; or })
        let j = i + 1;
        while (j < after.length && (after[j] === ';' || after[j] === '\r' || after[j] === '\n')) {
          j++;
          if (after[j-1] === '\n') break;
        }
        closeIdx = j;
        break;
      }
    }
  }
  
  if (closeIdx === -1) {
    console.log(`COULD NOT FIND CLOSE: ${file}`);
    continue;
  }
  
  // Reconstruct: before + closingPart + blank + guard + rest
  const closing = after.slice(0, closeIdx);
  const rest = after.slice(closeIdx);
  
  const newContent = before + closing + '\n' + guardLine + rest;
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`FIXED: ${file}`);
  } else {
    console.log(`NO CHANGE: ${file}`);
  }
}

console.log('Done.');
