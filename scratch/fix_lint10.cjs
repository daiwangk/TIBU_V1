const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '..', 'src');

function fix(filename) {
  const f = path.join(srcDir, filename);
  let c = fs.readFileSync(f, 'utf8');

  // Extract the lines that were mistakenly placed inside `export default function Name({ ... }) {`
  // We'll just manually fix it by regex:
  // Find `export default function (\w+)\(\{\n\n(.*?)  setPage,`
  // And move the group 2 down to after `}\) \{`
  
  const regex = /export default function (\w+)\(\{\n\n([\s\S]*?)  setPage,/m;
  const match = c.match(regex);
  if (match) {
    const hooksCode = match[2];
    c = c.replace(hooksCode, '');
    
    // Now find `}) {\n` and insert the hooksCode there
    c = c.replace(/}\) \{\n/m, `}) {\n${hooksCode}`);
    fs.writeFileSync(f, c);
    console.log('Fixed parsing in', filename);
  }
}

fix('Fashion.jsx');
fix('Handmade.jsx');
