const fs = require('fs');
const path = require('path');

/**
 * Saves a base64 encoded image string to the client/public/uploads folder.
 * @param {string} base64Str - The complete data URL string (e.g. data:image/png;base64,...)
 * @param {string} prefix - The file prefix (e.g. aadhar, license)
 * @returns {string} The relative web URL path (e.g. /uploads/filename.png)
 */
exports.saveBase64Image = (base64Str, prefix) => {
  if (!base64Str) return '';

  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid document photo format. Must be a valid image file.');
  }

  const ext = matches[1].split('/')[1] || 'png';
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

  const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../client/public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  return `/public/uploads/${filename}`;
};
