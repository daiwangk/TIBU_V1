/**
 * fix_lint_bulk.cjs
 * Fixes all remaining lint errors in batch:
 * 1. Removes `import React from "react"` / `import React, { ... }` → `import { ... }` 
 *    when React is not used (JSX transform is active)
 * 2. Removes specific unused imports identified from lint output
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function fix(filePath, transformFn) {
  if (!fs.existsSync(filePath)) return;
  const original = fs.readFileSync(filePath, 'utf8');
  const result = transformFn(original);
  if (result !== original) {
    fs.writeFileSync(filePath, result);
    console.log(`FIXED: ${path.relative(srcDir, filePath)}`);
  }
}

// Remove `import React from 'react'` when it's unused (JSX transform handles it)
// Also handles `import React, { X, Y }` → `import { X, Y }`
function removeUnusedReact(content) {
  // Pattern 1: import React from "react"; (standalone)
  content = content.replace(/^import React from ['"]react['"];?\r?\n/gm, '');
  // Pattern 2: import React, { X } from "react"; → import { X } from "react";
  content = content.replace(/^import React,\s*(\{[^}]+\})\s*from ['"]react['"];?\r?\n/gm, 'import $1 from "react";\n');
  return content;
}

// Remove specific unused named imports from a line
function removeNamedImport(content, fromModule, ...names) {
  return content.replace(
    new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${fromModule.replace('/', '\\/')}['"];?`),
    (match, importList) => {
      const remaining = importList
        .split(',')
        .map(s => s.trim())
        .filter(s => s && !names.includes(s));
      if (remaining.length === 0) return '';
      return `import { ${remaining.join(', ')} } from "${fromModule}";`;
    }
  );
}

// Remove entire import line if it only imports the given names
function removeImportLine(content, fromModule, ...names) {
  const pattern = new RegExp(`^import\\s*\\{[^}]+\\}\\s*from\\s*['"]${fromModule.replace('/', '\\/')}['"];?\\r?\\n`, 'gm');
  return content.replace(pattern, (match) => {
    const importedNames = match.match(/\{([^}]+)\}/)?.[1]?.split(',').map(s => s.trim()) || [];
    const allInNames = importedNames.every(n => names.includes(n));
    return allInNames ? '' : match;
  });
}

const files = [
  'AboutTibu.jsx',
  'Business.jsx',
  'Candles.jsx',
  'Crochet.jsx',
  'Desserts.jsx',
  'Discover.jsx',
  'EditProfile.jsx',
  'Embroidery.jsx',
  'Fashion.jsx',
  'Gifts.jsx',
  'Handmade.jsx',
  'HelpFeedback.jsx',
  'Home.jsx',
  'Jewellery.jsx',
  'MenFashion.jsx',
  'NotificationPreferences.jsx',
  'Offers.jsx',
  'PrivacySecurity.jsx',
  'Product.jsx',
  'Reel.jsx',
  'Resin.jsx',
  'Saved.jsx',
  'Search.jsx',
  'SellerDashboard.jsx',
  'SellerProductDetail.jsx',
  'SellerRegister.jsx',
  'TermsConditions.jsx',
  'WomenFashion.jsx',
];

// Step 1: Remove unused React imports from all files
for (const file of files) {
  const filePath = path.join(srcDir, file);
  fix(filePath, removeUnusedReact);
}

// Step 2: Per-file specific unused import cleanup
// Search.jsx: remove listReels, listBusinesses, previousPage prop (can't remove prop easily, just mark unused imports)
fix(path.join(srcDir, 'Search.jsx'), (c) => {
  c = removeImportLine(c, './services/reelService', 'listReels');
  c = removeImportLine(c, './services/businessService', 'listBusinesses');
  return c;
});

// Offers.jsx
fix(path.join(srcDir, 'Offers.jsx'), (c) => {
  c = removeImportLine(c, './services/reelService', 'listReels');
  c = removeImportLine(c, './services/productService', 'listProducts');
  return c;
});

// Pages/Notification.jsx
fix(path.join(srcDir, 'Pages/Notification.jsx'), (c) => {
  c = removeImportLine(c, './services/reelService', 'listReels');
  c = removeImportLine(c, './services/productService', 'listProducts');
  return c;
});

// Product.jsx
fix(path.join(srcDir, 'Product.jsx'), (c) => {
  c = removeImportLine(c, './services/reelService', 'listReels');
  c = removeImportLine(c, './services/productService', 'listProducts');
  return c;
});

// Saved.jsx
fix(path.join(srcDir, 'Saved.jsx'), (c) => {
  c = removeImportLine(c, './services/reelService', 'listReels');
  c = removeImportLine(c, './services/businessService', 'listBusinesses');
  return c;
});

// Fashion.jsx
fix(path.join(srcDir, 'Fashion.jsx'), (c) => {
  c = removeImportLine(c, './services/reelService', 'listReels');
  c = removeImportLine(c, './services/businessService', 'listBusinesses');
  c = removeImportLine(c, './services/productService', 'listProducts');
  c = removeImportLine(c, './hooks/useAsync', 'useAsync');
  return c;
});

// Handmade.jsx
fix(path.join(srcDir, 'Handmade.jsx'), (c) => {
  c = removeImportLine(c, './services/reelService', 'listReels');
  c = removeImportLine(c, './services/businessService', 'listBusinesses');
  c = removeImportLine(c, './services/productService', 'listProducts');
  c = removeImportLine(c, './hooks/useAsync', 'useAsync');
  return c;
});

// ProductsViewAll.jsx
fix(path.join(srcDir, 'ProductsViewAll.jsx'), (c) => {
  c = removeNamedImport(c, 'react', 'useState');
  return c;
});

// reelService.js - mark categoryKey as used with _ prefix or remove
fix(path.join(srcDir, 'services/reelService.js'), (c) => {
  // rename categoryKey param to _categoryKey to silence unused-vars
  c = c.replace('export async function listReels(categoryKey)', 'export async function listReels(_categoryKey)');
  return c;
});

console.log('\nDone.');
