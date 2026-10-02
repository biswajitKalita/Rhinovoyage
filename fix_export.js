const fs = require('fs');
let data = fs.readFileSync('client/public/src/js/packages-data.js', 'utf8');
data = data.replace('const packagesData = [', 'module.exports = [');
// Remove any window.packagesData assignment at the end
data = data.replace(/window\.packagesData.*/g, '');
fs.writeFileSync('client/public/src/js/packages-data-export.js', data);
