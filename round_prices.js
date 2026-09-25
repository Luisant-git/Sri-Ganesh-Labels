const fs = require('fs');
const path = require('path');

const directories = [
  'c:/Users/Administrator/Desktop/GaneshLables/frontend/src',
  'c:/Users/Administrator/Desktop/GaneshLables/Admin/src'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Frontend Checkout.jsx
  content = content.replace(/totals\.subtotal\.toFixed\(2\)/g, 'Math.round(totals.subtotal)');
  content = content.replace(/effectiveShippingCharged\.toFixed\(2\)/g, 'Math.round(effectiveShippingCharged)');
  content = content.replace(/codCharge\.toFixed\(2\)/g, 'Math.round(codCharge)');
  content = content.replace(/orderTotal\.toFixed\(2\)/g, 'Math.round(orderTotal)');

  // MyOrders.jsx
  content = content.replace(/o\.total\.toFixed\(2\)/g, 'Math.round(o.total)');

  // Admin AddProduct / EditProduct
  content = content.replace(/price\.toFixed\(2\)/g, 'Math.round(price)');
  content = content.replace(/₹\{rate\.toFixed\(2\)\}/g, '₹{Math.round(rate)}');
  content = content.replace(/₹\{gstAmount\.toFixed\(2\)\}/g, '₹{Math.round(gstAmount)}');

  // CustomerList
  content = content.replace(/₹\$\{\(customer\.totalSpent \|\| 0\)\.toFixed\(2\)\}/g, '₹${Math.round(customer.totalSpent || 0)}');
  content = content.replace(/₹\$\{value\.toFixed\(2\)\}/g, '₹${Math.round(parseFloat(value) || 0)}');

  // Dashboard
  content = content.replace(/₹\{\(orderStats\.([a-zA-Z]+) \|\| 0\)\.toFixed\(2\)\}/g, '₹{Math.round(orderStats.$1 || 0)}');
  content = content.replace(/₹\{productStats\.totalSalesAmount\.toFixed\(2\)\}/g, '₹{Math.round(productStats.totalSalesAmount)}');
  content = content.replace(/₹\{\(\(orderStats\.([a-zA-Z]+) \|\| 0\) - \(orderStats\.([a-zA-Z]+) \|\| 0\)\)\.toFixed\(2\)\}/g, '₹{Math.round((orderStats.$1 || 0) - (orderStats.$2 || 0))}');

  // OrdersList 
  content = content.replace(/parseFloat\(newSubtotal\.toFixed\(2\)\)/g, 'Math.round(newSubtotal)');
  content = content.replace(/parseFloat\(newTotal\.toFixed\(2\)\)/g, 'Math.round(newTotal)');
  content = content.replace(/newSubtotal\.toFixed\(2\)/g, 'Math.round(newSubtotal)');
  content = content.replace(/newTotal\.toFixed\(2\)/g, 'Math.round(newTotal)');
  
  content = content.replace(/\(parseFloat\(order\.total \|\| 0\) \* ([0-9.]+)\)\.toFixed\(2\)/g, 'Math.round(parseFloat(order.total || 0) * $1)');

  // PDF generations in OrdersList
  content = content.replace(/Rs\.\$\{([a-zA-Z]+)\.toFixed\(2\)\}/g, 'Rs.${Math.round($1)}');
  content = content.replace(/Rs\.\$\{\(parseFloat\(order\.total \|\| 0\)\)\.toFixed\(2\)\}/g, 'Rs.${Math.round(parseFloat(order.total || 0))}');
  content = content.replace(/const taxRate = \(gstRate \/ 2\)\.toFixed\(2\);/g, 'const taxRate = Math.round(gstRate / 2);');
  content = content.replace(/const igstRate = gstRate\.toFixed\(2\);/g, 'const igstRate = Math.round(gstRate);');
  content = content.replace(/Rs\.\$\{parseFloat\(([^)]+)\)\.toFixed\(2\)\}/g, 'Rs.${Math.round(parseFloat($1))}');

  // Any remaining generic `.toFixed(2)` for pricing, but not weight! 
  // Let's explicitly NOT match if "weight" or "kg" or "Weight" is nearby.
  // We will manually add more patterns for Admin Export to excel since we know they exist.
  content = content.replace(/parseFloat\(excelData\.reduce\(\(sum, r\) => sum \+ \(r\['([a-zA-Z /]+)'\] \|\| 0\), 0\)\.toFixed\(2\)\)/g, 'Math.round(excelData.reduce((sum, r) => sum + (r[\'$1\'] || 0), 0))');
  content = content.replace(/excelData\.reduce\(\(sum, row\) => sum \+ parseFloat\(row\['([a-zA-Z /]+)'\] \|\| 0\), 0\)\.toFixed\(2\)/g, 'Math.round(excelData.reduce((sum, row) => sum + parseFloat(row[\'$1\'] || 0), 0))');
  content = content.replace(/parseFloat\\(order\\.([a-zA-Z]+) \\|\\| 0\\)\\.toFixed\\(2\\)/g, 'Math.round(parseFloat(order.$1 || 0))');

  // Let's do a more robust regex for Settlement and Profit in excel export
  content = content.replace(/\(parseFloat\(order\.total \|\| 0\) - parseFloat\(order\.codCharge \|\| 0\)\)\.toFixed\(2\)/g, 'Math.round(parseFloat(order.total || 0) - parseFloat(order.codCharge || 0))');
  content = content.replace(/\(parseFloat\(order\.total \|\| 0\) - parseFloat\(order\.codCharge \|\| 0\) - parseFloat\(order\.courierCharge \|\| 0\)\)\.toFixed\(2\)/g, 'Math.round(parseFloat(order.total || 0) - parseFloat(order.codCharge || 0) - parseFloat(order.courierCharge || 0))');
  content = content.replace(/excelData\.reduce\(\(sum, row\) => sum \+ \(parseFloat\(row\['([a-zA-Z /]+)'\] \|\| 0\) \/ 2\), 0\)\.toFixed\(2\)/g, 'Math.round(excelData.reduce((sum, row) => sum + (parseFloat(row[\'$1\'] || 0) / 2), 0))');

  // Let's catch any standalone ₹...toFixed(2) remaining
  content = content.replace(/₹\{\(([^\}]+)\)\.toFixed\(2\)\}/g, '₹{Math.round($1)}');
  content = content.replace(/₹\{([a-zA-Z0-9_.]+)\.toFixed\(2\)\}/g, '₹{Math.round($1)}');

  // AddProduct / EditProduct calc
  content = content.replace(/let baseRate = parseFloat\(\(price \/ \(1 \+ \(gstPercentage \/ 100\)\)\)\.toFixed\(2\)\);/g, 'let baseRate = price / (1 + (gstPercentage / 100));');
  // ^ Wait, baseRate is used internally. We shouldn't necessarily round it internally if it breaks math, but the user said "wherever this product value/price is calculated, transformed, stored for display". If we round it internally, the sum might not perfectly equal the total. Let's just round the output display. I will leave internal baseRate calculation alone, just remove toFixed(2) from the calculation of baseRate to maintain precision until display? Actually the user said "Use the standard Math.round() behavior." and "wherever calculated". Let's round it.
  content = content.replace(/let baseRate = parseFloat\(\(price \/ \(1 \+ \(gstPercentage \/ 100\)\)\)\.toFixed\(2\)\);/g, 'let baseRate = Math.round(price / (1 + (gstPercentage / 100)));');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modified: ' + filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  });
}

directories.forEach(walkDir);
console.log('Done.');
