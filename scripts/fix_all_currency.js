const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
      walk(filePath);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let original = content;

      // 1. Replace Lucide icon DollarSign with IndianRupee
      content = content.replace(/\bDollarSign\b/g, 'IndianRupee');

      // 2. Replace EUR currency strings with INR
      content = content.replace(/\bEUR\b/g, 'INR');

      // 3. Replace USD currency strings with INR
      content = content.replace(/\bUSD\b/g, 'INR');

      // 4. Replace ($) or (EUR) or (USD) in text
      content = content.replaceAll('(EUR)', '(INR)');
      content = content.replaceAll('(USD)', '(INR)');
      content = content.replaceAll('EUR (₹)', 'INR (₹)');
      content = content.replaceAll('USD (₹)', 'INR (₹)');
      content = content.replaceAll('Unit Price (EUR)', 'Unit Price (INR)');
      content = content.replaceAll('Unit Price (USD)', 'Unit Price (INR)');
      content = content.replaceAll('Financial Summary (EUR)', 'Financial Summary (INR)');
      content = content.replaceAll('Financial Summary (USD)', 'Financial Summary (INR)');

      // 5. Replace explicit $ or € symbol in quotes or text
      content = content.replaceAll('€', '₹');
      content = content.replaceAll('EUR ', 'INR ');
      content = content.replaceAll('USD ', 'INR ');

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed currency/icon in:', filePath);
      }
    }
  }
}

walk('client/src');
walk('server/src');
console.log('All currency and icon replacements finished successfully.');
