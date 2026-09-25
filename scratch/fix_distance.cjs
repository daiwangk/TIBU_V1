const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const files = [
  'Candles.jsx',
  'Crochet.jsx',
  'Desserts.jsx',
  'Embroidery.jsx',
  'Gifts.jsx',
  'Home.jsx',
  'Jewellery.jsx',
  'MenFashion.jsx',
  'Resin.jsx',
  'Search.jsx',
  'WomenFashion.jsx',
];

let fixed = 0;

for (const file of files) {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${file}`);
    continue;
  }

  const original = fs.readFileSync(filePath, 'utf8');

  // Remove any line that is ONLY "let distance = 0;" (with optional leading whitespace)
  // but only when the NEXT non-blank line is "let distance = 2.5;"
  // Strategy: remove duplicate `let distance = 0;\n` lines when followed by `let distance = 2.5;`
  const fixed_content = original.replace(
    /^([ \t]*)let distance = 0;\r?\n(\r?\n)*([ \t]*)let distance = 2\.5;/gm,
    '$3let distance = 2.5;'
  );

  if (fixed_content !== original) {
    fs.writeFileSync(filePath, fixed_content);
    console.log(`FIXED: ${file}`);
    fixed++;
  } else {
    console.log(`NO CHANGE: ${file}`);
  }
}

console.log(`\nDone. Fixed ${fixed} files.`);
