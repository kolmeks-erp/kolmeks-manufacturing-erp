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

      // 1. Replace Euro symbol € with ₹
      content = content.replaceAll('€', '₹');

      // 2. Replace ($) currency header indicators
      content = content.replaceAll('($)', '(₹)');
      content = content.replaceAll('($k)', '(₹k)');
      content = content.replaceAll('(in $)', '(in ₹)');

      // 3. Replace text prefixes like "Value: $" or "Amount: $"
      content = content.replaceAll('Value: $', 'Value: ₹');
      content = content.replaceAll('Amount: $', 'Amount: ₹');
      content = content.replaceAll('Total: $', 'Total: ₹');
      content = content.replaceAll('Price: $', 'Price: ₹');
      content = content.replaceAll('Cost: $', 'Cost: ₹');
      content = content.replaceAll('Balance: $', 'Balance: ₹');
      content = content.replaceAll('Budget: $', 'Budget: ₹');

      // 4. Double dollar currency prefix in template literals: `$${var}` -> `₹${var}`
      content = content.replaceAll('`$${', '`₹${');
      content = content.replaceAll(' "$${', ' "₹${');
      content = content.replaceAll(" '$${", " '₹${");
      content = content.replaceAll(' >$${', ' >₹${');
      content = content.replaceAll('($${', '(₹${');

      // 5. JSX text currency prefix like `>$` followed by number or space or `{`
      content = content.replace(/>\s*\$([0-9]|\{|\s)/g, '>₹$1');

      // 6. Attribute placeholders like placeholder="$0.00"
      content = content.replace(/placeholder="\$([0-9])/g, 'placeholder="₹$1');
      content = content.replace(/placeholder='\$([0-9])/g, "placeholder='₹$1");

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated currency in:', filePath);
      }
    }
  }
}

walk('client/src');
walk('server/src');
console.log('Precise currency replacement complete.');
