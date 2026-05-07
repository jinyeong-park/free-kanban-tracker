const fs   = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env file not found. Copy .env.example and fill in values.');
  process.exit(1);
}
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
});

const clientId = process.env.GOOGLE_CLIENT_ID;
if (!clientId || clientId === 'YOUR_CLIENT_ID_HERE') {
  console.error('ERROR: GOOGLE_CLIENT_ID is not set in .env');
  process.exit(1);
}

// Prepare dist/
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

// Process index.html — replace placeholder
const src = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const out = src.replace("'__GOOGLE_CLIENT_ID__'", `'${clientId}'`);
fs.writeFileSync(path.join(distDir, 'index.html'), out);

// Copy static assets
['icon-192.png', 'icon-512.png', 'manifest.json', 'sw.js', '_headers'].forEach(file => {
  const src = path.join(__dirname, file);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(distDir, file));
});

console.log(`✅ Build complete → dist/  (Client ID: ${clientId.slice(0, 20)}...)`);
