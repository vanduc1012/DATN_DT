const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../frontend/dist');
const dest = path.join(__dirname, '../backend/public');

if (!fs.existsSync(path.join(src, 'index.html'))) {
    console.error('ERROR: frontend/dist/index.html not found');
    process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log('Copied frontend build to backend/public');
