const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Build] Starting backend build process...');

// 1. Ensure dist directory exists
const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 2. Run esbuild bundling with external node_modules and native internal shared alias
console.log('[Build] Bundling src/server.ts with esbuild (--packages=external)...');
execSync(
  'npx esbuild src/server.ts --bundle --platform=node --target=node20 --format=esm --packages=external --outfile=dist/server.js --alias:@shared=./src/shared',
  { stdio: 'inherit', cwd: __dirname }
);

// 3. Mirror dist/server.js to index.js and server.js for serverless entrypoint compatibility
const distFile = path.resolve(__dirname, 'dist', 'server.js');
const indexFile = path.resolve(__dirname, 'index.js');
const serverFile = path.resolve(__dirname, 'server.js');

if (fs.existsSync(distFile)) {
  fs.copyFileSync(distFile, indexFile);
  fs.copyFileSync(distFile, serverFile);
  console.log('[Build] Generated entrypoints:');
  console.log('        - dist/server.js');
  console.log('        - index.js');
  console.log('        - server.js');
} else {
  console.error('[Build] Error: dist/server.js was not created!');
  process.exit(1);
}

console.log('[Build] Backend build completed successfully.');
