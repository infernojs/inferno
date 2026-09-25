// The spec bundle is built by build-tests.js, which already includes all test files
export default {
  projectBaseDir: import.meta.dirname,
  srcDir: 'dist',
  srcFiles: [],
  specDir: 'dist',
  specFiles: ['tests.js'],
  env: {
    random: false, // Keep tests in declaration order, same as the karma setup
    // Deprecated in jasmine-core 7. Several test files share describe/it names
    // (e.g. "animation hooks"); remove this once those are renamed.
    forbidDuplicateNames: false,
  },
  browser: 'firefox',
};
