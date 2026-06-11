import { defineConfig } from 'vitest/config';
import { infernoNext } from './compiler/index.js';

export default defineConfig({
  plugins: [infernoNext()],
  test: {
    environment: 'jsdom',
    include: ['__tests__/**/*.test.tsrx', '__tests__/**/*.test.ts'],
    globals: false,
    // Precompiles every fixture through @tsrx/react + esbuild before any
    // test loads — runs in pure Node so esbuild's TextEncoder requirements
    // are satisfied (jsdom's TextEncoder breaks esbuild's binary protocol).
    globalSetup: ['./__tests__/differential/_setup.ts'],
  },
});
