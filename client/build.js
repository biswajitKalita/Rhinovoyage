const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

const srcDir = path.join(__dirname, 'src');
const destDir = path.join(__dirname, 'public/src');

if (fs.existsSync(srcDir)) {
  console.log('Copying src directory into public/src for Vercel deployment...');
  copyFolderSync(srcDir, destDir);
  console.log('Copy completed successfully!');
} else {
  console.log('No src directory found.');
}
