const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Build] Starting server build process...');

// 1. Run prebuild linking if prebuild.cjs exists
try {
  require('./prebuild.cjs');
} catch (e) {
  console.log('[Build] Prebuild note:', e.message);
}

// 2. Ensure dist directory exists
const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 3. Run esbuild bundling with external node_modules
console.log('[Build] Bundling src/server.ts with esbuild (--packages=external)...');
execSync(
  'npx esbuild src/server.ts --bundle --platform=node --target=node20 --format=esm --packages=external --outfile=dist/server.js --alias:@shared=../shared',
  { stdio: 'inherit', cwd: __dirname }
);

// 4. Copy dist/server.js to index.js and server.js for Vercel Express entrypoint discovery
const distFile = path.resolve(__dirname, 'dist', 'server.js');
const indexFile = path.resolve(__dirname, 'index.js');
const serverFile = path.resolve(__dirname, 'server.js');

if (fs.existsSync(distFile)) {
  fs.copyFileSync(distFile, indexFile);
  fs.copyFileSync(distFile, serverFile);
  console.log('[Build] Successfully generated and mirrored serverless entrypoints:');
  console.log('        - dist/server.js');
  console.log('        - index.js');
  console.log('        - server.js');
} else {
  console.error('[Build] Error: dist/server.js was not created!');
  process.exit(1);
}

console.log('[Build] Server build completed successfully.');
