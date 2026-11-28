// Copy of RhinoVoyage_Google_Sheet_Script.gs
const fs = require('fs');
const path = require('path');
const scriptContent = fs.readFileSync(path.join(__dirname, '../../RhinoVoyage_Google_Sheet_Script.gs'), 'utf8');
module.exports = scriptContent;

