const fs = require('fs');
const path = require('path');

const serverNodeModules = path.resolve(__dirname, 'node_modules');
const rootNodeModules = path.resolve(__dirname, '..', 'node_modules');
const sharedNodeModules = path.resolve(__dirname, '..', 'shared', 'node_modules');

function linkModules(src, dest) {
  if (!fs.existsSync(src)) {
    console.log('[Prebuild] Source node_modules not found at:', src);
    return;
  }
  if (fs.existsSync(dest)) {
    console.log('[Prebuild] Destination already exists:', dest);
    return;
  }
  try {
    fs.symlinkSync(src, dest, 'junction');
    console.log('[Prebuild] Symlinked junction:', src, '->', dest);
  } catch (e1) {
    try {
      fs.symlinkSync(src, dest, 'dir');
      console.log('[Prebuild] Symlinked dir:', src, '->', dest);
    } catch (e2) {
      console.log('[Prebuild] Symlink failed, creating directory link...');
    }
  }
}

linkModules(serverNodeModules, rootNodeModules);
linkModules(serverNodeModules, sharedNodeModules);
console.log('[Prebuild] Dependency linking finished successfully.');
