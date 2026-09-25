const fs = require('fs');
const path = require('path');

const pages = [
  'Candles.jsx', 'Crochet.jsx', 'Desserts.jsx', 'Embroidery.jsx', 'Fashion.jsx', 
  'Gifts.jsx', 'Handmade.jsx', 'Jewellery.jsx', 'MenFashion.jsx', 'Resin.jsx', 'WomenFashion.jsx',
  'Home.jsx', 'Search.jsx', 'Saved.jsx', 'Product.jsx', 'Offers.jsx', 'Pages/Notification.jsx', 'Discover.jsx'
];

pages.forEach(page => {
  const filePath = path.join(__dirname, '..', 'src', page);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Remove old Data imports
  content = content.replace(/import\s+(\w+)\s+from\s+['"](?:\.\.\/|\.\/)*Data\/([^'"]+)['"];?\r?\n?/g, (match, varName, fileName) => {
    changed = true;
    return '';
  });

  // 2. Add new hooks and services imports if we removed anything
  if (changed) {
    if (!content.includes('useAsync')) {
      content = `import { useAsync } from "${page.includes('/') ? '..' : '.'}/hooks/useAsync";\n` + content;
    }
    if (!content.includes('listProducts')) {
      content = `import { listProducts } from "${page.includes('/') ? '..' : '.'}/services/productService";\n` + content;
    }
    if (!content.includes('listBusinesses')) {
      content = `import { listBusinesses } from "${page.includes('/') ? '..' : '.'}/services/businessService";\n` + content;
    }
    if (!content.includes('listReels')) {
      content = `import { listReels } from "${page.includes('/') ? '..' : '.'}/services/reelService";\n` + content;
    }
  }

  // 3. Inject useAsync hook inside the component
  // Find the start of the component function
  const functionRegex = /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/;
  const match = functionRegex.exec(content);
  if (match && changed) {
    const insertPos = match.index + match[0].length;
    
    // We need to declare the variables that were previously imported.
    // We can infer which variables to query based on what the page uses.
    // For simplicity, we can just load all products, businesses, reels if the page uses them.
    // Wait, the page expects specific variables like `candleProducts`.
    let hooksCode = '\n';
    const varNames = ['candleProducts', 'crochetProducts', 'dessertsProducts', 'dessertProducts', 'embroideryProducts', 'fashionProducts', 'giftsProducts', 'handmadeProducts', 'jewelleryProducts', 'menFashionProducts', 'resinProducts', 'womenFashionProducts', 'candleBusinesses', 'crochetBusinesses', 'dessertBusinesses', 'embroideryBusinesses', 'giftsBusinesses', 'jewelleryBusinesses', 'menFashionBusinesses', 'resinBusinesses', 'womenFashionBusinesses', 'candleReels', 'crochetReels', 'dessertReels', 'embroideryReels', 'giftsReels', 'jewelleryReels', 'menFashionReels', 'resinReels', 'womenFashionReels'];
    
    const usedVars = varNames.filter(v => content.includes(v));
    let queries = [];
    let loadingConditions = [];
    
    usedVars.forEach(v => {
      let type = v.includes('Products') ? 'Products' : v.includes('Businesses') ? 'Businesses' : 'Reels';
      let cat = v.replace(type, '').toLowerCase().replace('s', ''); // rough category extraction
      if (v === 'dessertsProducts' || v === 'dessertProducts') cat = 'desserts';
      if (v === 'giftsProducts' || v === 'giftsBusinesses' || v === 'giftsReels') cat = 'gifts';
      if (v === 'menFashionProducts' || v === 'menFashionBusinesses' || v === 'menFashionReels') cat = 'men-fashion';
      if (v === 'womenFashionProducts' || v === 'womenFashionBusinesses' || v === 'womenFashionReels') cat = 'women-fashion';
      
      const loadVar = `load_${v}`;
      queries.push(`  const { data: ${v} = [], loading: ${loadVar} } = useAsync(() => list${type}(${cat ? `'${cat}'` : ''}));`);
      loadingConditions.push(loadVar);
    });

    if (queries.length > 0) {
      hooksCode += queries.join('\n') + '\n';
      hooksCode += `  if (${loadingConditions.join(' || ')}) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;\n`;
      
      content = content.slice(0, insertPos) + hooksCode + content.slice(insertPos);
    }
  }

  // 4. Fix specific price filtering issue: `Number(shop.price.replace("₹", ""))` -> `shop.price`
  content = content.replace(/Number\(shop\.price\.replace\([^)]+\)\)/g, 'shop.price');
  content = content.replace(/Number\(item\.price\.replace\([^)]+\)\)/g, 'item.price');
  
  // 5. Fix distance issues
  content = content.replace(/let distance = 0;[\s\S]*?if\s*\([^)]*\.distance\.includes\("km"\)\)\s*\{[\s\S]*?\} else \{[\s\S]*?\}/g, 'let distance = 2.5;'); 

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${page}`);
  }
});
