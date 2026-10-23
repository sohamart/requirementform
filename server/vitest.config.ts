import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 60000, // MongoDB in-memory can take a few seconds on first run
  },
  resolve: {
    alias: [
      {
        find: /^@shared\/(.*)\.js$/,
        replacement: path.resolve(__dirname, '../shared/$1.ts'),
      },
      {
        find: /^@shared\/(.*)$/,
        replacement: path.resolve(__dirname, '../shared/$1'),
      },
    ],
  },
});
