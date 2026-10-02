// The spec bundle is built by build-tests.js, which already includes all test files
export default {
  projectBaseDir: import.meta.dirname,
  srcDir: 'dist',
  srcFiles: [],
  specDir: 'dist',
  specFiles: ['tests.js'],
  env: {
    random: false, // Keep tests in declaration order, same as the karma setup
  },
  // Headless: a visible window gets few or no animation frames while it is minimized, covered or on
  // another workspace, which fails the animation specs. Pass --browser=firefox for a visible window.
  browser: 'headlessFirefox',
};
