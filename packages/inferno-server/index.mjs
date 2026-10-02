export * from './dist/index.mjs';

// Bundlers replace process.env.NODE_ENV, native ES modules in a browser have no process
try {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'You are running production build of Inferno-server in development mode. Use dev:module entry point.',
    );
  }
} catch {
  // Not bundled, there is no development mode to warn about
}
