const fs = require('fs');
const path = require('path');

const clientNodeModules = path.resolve(__dirname, 'node_modules');
const rootNodeModules = path.resolve(__dirname, '..', 'node_modules');
const sharedNodeModules = path.resolve(__dirname, '..', 'shared', 'node_modules');

function linkModules(src, dest) {
  if (!fs.existsSync(src)) return;
  if (fs.existsSync(dest)) return;
  try {
    fs.symlinkSync(src, dest, 'junction');
  } catch (e1) {
    try {
      fs.symlinkSync(src, dest, 'dir');
    } catch (e2) {}
  }
}

linkModules(clientNodeModules, rootNodeModules);
linkModules(clientNodeModules, sharedNodeModules);
