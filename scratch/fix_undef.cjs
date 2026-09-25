/**
 * fix_undef.cjs
 * Fixes "not defined" array spreading issues in Home, Discover, etc.
 * where the declarations were left at the module scope instead of
 * inside the component scope (after useAsync hooks).
 */
const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '..', 'src');

function fixHome() {
  const file = path.join(srcDir, 'Home.jsx');
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove module scope arrays
  const moduleArrays = [
    'const fashionProducts = [\\s*\\.\\.\\.womenFashionProducts,\\s*\\.\\.\\.menFashionProducts,\\s*];',
    'const fashionBusinesses = [\\s*\\.\\.\\.womenFashionBusinesses,\\s*\\.\\.\\.menFashionBusinesses,\\s*];',
    'const handmadeBusinesses = [\\s*\\.\\.\\.crochetBusinesses,\\s*\\.\\.\\.resinBusinesses,\\s*\\.\\.\\.candleBusinesses,\\s*\\.\\.\\.embroideryBusinesses,\\s*];'
  ];
  for (const regexStr of moduleArrays) {
    content = content.replace(new RegExp(regexStr, 'gm'), '');
  }
  
  // Insert inside the function right after the guard
  const guard = 'if (load_candleProducts || load_crochetProducts || load_dessertsProducts || load_embroideryProducts || load_fashionProducts || load_giftsProducts || load_handmadeProducts || load_jewelleryProducts || load_menFashionProducts || load_resinProducts || load_womenFashionProducts || load_candleBusinesses || load_crochetBusinesses || load_dessertBusinesses || load_embroideryBusinesses || load_jewelleryBusinesses || load_menFashionBusinesses || load_resinBusinesses || load_womenFashionBusinesses) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;';
  
  const insert = `
  const fashionProducts = [...womenFashionProducts, ...menFashionProducts];
  const fashionBusinesses = [...womenFashionBusinesses, ...menFashionBusinesses];
  const handmadeBusinesses = [...crochetBusinesses, ...resinBusinesses, ...candleBusinesses, ...embroideryBusinesses];
  `;
  
  content = content.replace(guard, guard + '\n' + insert);
  fs.writeFileSync(file, content);
  console.log('Fixed Home.jsx');
}

function fixDiscover() {
  const file = path.join(srcDir, 'Discover.jsx');
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove module scope arrays
  const moduleArrays = [
    'const allReels = \\[([\\s\\S]*?)\\];',
    'const allBusinesses = \\[([\\s\\S]*?)\\];'
  ];
  let allReelsContent = '';
  let allBusinessesContent = '';
  
  content = content.replace(/const allReels = \[([\s\S]*?)\];/, (match, group) => {
    allReelsContent = group;
    return '';
  });
  content = content.replace(/const allBusinesses = \[([\s\S]*?)\];/, (match, group) => {
    allBusinessesContent = group;
    return '';
  });
  
  const guard = 'if (load_candleBusinesses || load_crochetBusinesses || load_dessertBusinesses || load_embroideryBusinesses || load_giftsBusinesses || load_jewelleryBusinesses || load_menFashionBusinesses || load_resinBusinesses || load_womenFashionBusinesses || load_candleReels || load_crochetReels || load_dessertReels || load_embroideryReels || load_giftsReels || load_jewelleryReels || load_menFashionReels || load_resinReels || load_womenFashionReels) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;';
  
  const insert = `
  const allReels = [${allReelsContent}];
  const allBusinesses = [${allBusinessesContent}];
  `;
  
  if (content.includes(guard)) {
     content = content.replace(guard, guard + '\n' + insert);
  }
  
  fs.writeFileSync(file, content);
  console.log('Fixed Discover.jsx');
}

function fixSaved() {
  const file = path.join(srcDir, 'Saved.jsx');
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove module scope arrays
  let allProductsContent = '';
  content = content.replace(/const allProducts = \[([\s\S]*?)\];/, (match, group) => {
    allProductsContent = group;
    return '';
  });
  
  const guard = 'if (load_candleProducts || load_crochetProducts || load_dessertsProducts || load_embroideryProducts || load_fashionProducts || load_giftsProducts || load_handmadeProducts || load_jewelleryProducts || load_menFashionProducts || load_resinProducts || load_womenFashionProducts || load_candleBusinesses || load_crochetBusinesses || load_dessertBusinesses || load_embroideryBusinesses || load_jewelleryBusinesses || load_menFashionBusinesses || load_resinBusinesses || load_womenFashionBusinesses) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;';
  
  const insert = `
  const allProducts = [${allProductsContent}];
  `;
  
  if (content.includes(guard)) {
     content = content.replace(guard, guard + '\n' + insert);
  }
  
  fs.writeFileSync(file, content);
  console.log('Fixed Saved.jsx');
}

function fixFashion() {
  const file = path.join(srcDir, 'Fashion.jsx');
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/const fashionSearchProducts = \[([\s\S]*?)\];/, (match, group) => {
    const guard = 'if (load_menFashionProducts || load_womenFashionProducts) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;';
    const insert = match;
    content = content.replace(guard, guard + '\\n' + insert);
    return ''; // remove old one
  });
  
  fs.writeFileSync(file, content);
  console.log('Fixed Fashion.jsx');
}

function fixHandmade() {
  const file = path.join(srcDir, 'Handmade.jsx');
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/const handmadeSearchProducts = \[([\s\S]*?)\];/, (match, group) => {
    const guard = 'if (load_candleProducts || load_crochetProducts || load_embroideryProducts || load_resinProducts) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;';
    const insert = match;
    content = content.replace(guard, guard + '\\n' + insert);
    return ''; // remove old one
  });
  
  fs.writeFileSync(file, content);
  console.log('Fixed Handmade.jsx');
}

fixHome();
fixDiscover();
fixSaved();
fixFashion();
fixHandmade();
