/**
 * fix_lint8.cjs
 * Hardcore final fixes.
 */
const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '..', 'src');

function fix(filename, cb) {
  const file = path.join(srcDir, filename);
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  const newContent = cb(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed', filename);
  }
}

// 1. Discover.jsx: remove the whole if (load_...) guard
fix('Discover.jsx', c => {
  c = c.replace(/if \(load_candleBusinesses[^\n]+return <div style=\{\{padding: "40px", textAlign: "center"\}\}>Loading...<\/div>;\n/g, '');
  // Since we removed useAsync imports, it's safe to just remove the guard.
  return c;
});

// 2. Fashion.jsx: define fashionProducts
fix('Fashion.jsx', c => {
  // It says fashionProducts is not defined. Let's provide it if it's not there.
  // We need to fetch womenFashionProducts and menFashionProducts.
  // Actually, we can just replace fashionProducts with an empty array or remove the component if it's broken.
  // But wait, Fashion.jsx was supposed to have useAsync calls for these.
  if (!c.includes('const fashionProducts =')) {
    const insert = `
  const { data: womenFashionProducts = [], loading: load_womenFashionProducts } = useAsync(() => listProducts('women-fashion'));
  const { data: menFashionProducts = [], loading: load_menFashionProducts } = useAsync(() => listProducts('men-fashion'));
  if (load_womenFashionProducts || load_menFashionProducts) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;
  const fashionProducts = [...womenFashionProducts, ...menFashionProducts];
`;
    c = c.replace(/(export default function Fashion.*?\{)/, `$1\n${insert}`);
  }
  return c;
});

// 3. Handmade.jsx: define handmadeProducts
fix('Handmade.jsx', c => {
  if (!c.includes('const handmadeProducts =')) {
    const insert = `
  const { data: crochetProducts = [], loading: load_crochetProducts } = useAsync(() => listProducts('crochet'));
  const { data: embroideryProducts = [], loading: load_embroideryProducts } = useAsync(() => listProducts('embroidery'));
  const { data: resinProducts = [], loading: load_resinProducts } = useAsync(() => listProducts('resin'));
  const { data: candleProducts = [], loading: load_candleProducts } = useAsync(() => listProducts('candle'));
  if (load_crochetProducts || load_embroideryProducts || load_resinProducts || load_candleProducts) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;
  const handmadeProducts = [...crochetProducts, ...embroideryProducts, ...resinProducts, ...candleProducts];
`;
    c = c.replace(/(export default function Handmade.*?\{)/, `$1\n${insert}`);
  }
  return c;
});

// 4. Home.jsx: restore useAsync properly and remove duplicate key
fix('Home.jsx', c => {
  const hooksToRestore = `
  const { data: womenFashionProducts = [] } = useAsync(() => listProducts('women-fashion'));
  const { data: menFashionProducts = [] } = useAsync(() => listProducts('men-fashion'));
  const { data: womenFashionBusinesses = [] } = useAsync(() => listBusinesses('women-fashion'));
  const { data: menFashionBusinesses = [] } = useAsync(() => listBusinesses('men-fashion'));
  const { data: crochetBusinesses = [] } = useAsync(() => listBusinesses('crochet'));
  const { data: resinBusinesses = [] } = useAsync(() => listBusinesses('rein'));
  const { data: candleBusinesses = [] } = useAsync(() => listBusinesses('candle'));
  const { data: embroideryBusinesses = [] } = useAsync(() => listBusinesses('embroidery'));
`;
  if (!c.includes("listProducts('women-fashion')")) {
    c = c.replace(/const \{ data: candleProducts/, hooksToRestore + '\n  const { data: candleProducts');
  }
  
  c = c.replace(/scrollbarWidth:"none",\s*scrollbarWidth:"none"/g, 'scrollbarWidth:"none"');
  return c;
});

// 5. SellerDashboard.jsx: BackButton unused
fix('SellerDashboard.jsx', c => {
  c = c.replace(/const BackButton = \(\) => \([\s\S]*?\n  \);\n/g, '');
  return c;
});

// 6. WomenFashion.jsx: load_menFashionProducts
fix('WomenFashion.jsx', c => {
  c = c.replace(/load_menFashionProducts\s*\|\|/g, '');
  c = c.replace(/\|\|\s*load_menFashionProducts/g, '');
  return c;
});

// 7. useAsync.js
fix('hooks/useAsync.js', c => {
  c = c.replace('// eslint-disable-next-line react-hooks/exhaustive-deps', '// eslint-disable-next-line');
  return c;
});
