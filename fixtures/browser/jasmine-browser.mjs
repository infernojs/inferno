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
  browser: 'firefox',
};
