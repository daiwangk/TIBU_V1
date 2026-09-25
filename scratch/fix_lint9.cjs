const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '..', 'src');

function fixFashion() {
  const f = path.join(srcDir, 'Fashion.jsx');
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/import \{ useState \} from "react";\n/, `import { useState } from "react";\nimport { useAsync } from "./hooks/useAsync";\nimport { listProducts } from "./services/productService";\n`);
  c = c.replace(/}\) \{\nconst \[searchText, setSearchText\] = useState\(""\);/m, `}) {\n  const { data: womenFashionProducts = [], loading: load_womenFashionProducts } = useAsync(() => listProducts('women-fashion'));\n  const { data: menFashionProducts = [], loading: load_menFashionProducts } = useAsync(() => listProducts('men-fashion'));\n  if (load_womenFashionProducts || load_menFashionProducts) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;\n  const fashionProducts = [...womenFashionProducts, ...menFashionProducts];\n\nconst [searchText, setSearchText] = useState("");`);
  fs.writeFileSync(f, c);
  console.log('Fixed Fashion.jsx');
}

function fixHandmade() {
  const f = path.join(srcDir, 'Handmade.jsx');
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('import { useAsync }')) {
    c = c.replace(/import \{ useState \} from "react";\n/, `import { useState } from "react";\nimport { useAsync } from "./hooks/useAsync";\nimport { listProducts } from "./services/productService";\n`);
  }
  c = c.replace(/}\) \{\nconst \[searchText, setSearchText\] = useState\(""\);/m, `}) {\n  const { data: crochetProducts = [], loading: load_crochetProducts } = useAsync(() => listProducts('crochet'));\n  const { data: embroideryProducts = [], loading: load_embroideryProducts } = useAsync(() => listProducts('embroidery'));\n  const { data: resinProducts = [], loading: load_resinProducts } = useAsync(() => listProducts('resin'));\n  const { data: candleProducts = [], loading: load_candleProducts } = useAsync(() => listProducts('candle'));\n  if (load_crochetProducts || load_embroideryProducts || load_resinProducts || load_candleProducts) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;\n  const handmadeProducts = [...crochetProducts, ...embroideryProducts, ...resinProducts, ...candleProducts];\n\nconst [searchText, setSearchText] = useState("");`);
  fs.writeFileSync(f, c);
  console.log('Fixed Handmade.jsx');
}

fixFashion();
fixHandmade();
