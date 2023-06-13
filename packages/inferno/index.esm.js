export * from './dist/index.esm.js';

if (process.env.NODE_ENV !== 'production' || !process.env.THIRD_PARTY_LIBRARY) {
  console.warn('You are running production build of Inferno in development mode. Use dev:module entry point.');
}
