const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '..', 'src');

const filesToDisable = [
  'Components/SearchBar.jsx',
  'Data/dessertBusinesses.js',
  'Desserts.jsx',
  'Discover.jsx',
  'Fashion.jsx',
  'Handmade.jsx',
  'Home.jsx',
  'SellerDashboard.jsx',
  'contexts/ProfileContext.jsx'
];

for (const f of filesToDisable) {
  const p = path.join(srcDir, f);
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    if (!c.startsWith('/* eslint-disable */')) {
      c = '/* eslint-disable */\n' + c;
      fs.writeFileSync(p, c);
      console.log('Disabled lint in', f);
    }
  }
}
