['iife', 'cjs', 'esm'].forEach((format) => {
  const commonOpts = {
    entryPoints: ['src/index.ts'],
    format,
    // NOTE: Currently esbuild can't lower to es5 https://github.com/evanw/esbuild/issues/297
    target: 'es6',
    bundle: true,
    outdir: 'distEsbuild',

  }
  let buildTargets
  switch (format) {
    case 'iife':
      buildTargets = [
      { // Dev
        ...commonOpts,
        outExtension: { '.js': '.js' },
      },
      { // Production
        ...commonOpts,
        define: { 'NODE_ENV': 'production' },
        outExtension: { '.js': '.min.js' },
        minify: true,
      }]
      break;
    case 'cjs':
      buildTargets = [
      { // Dev
        ...commonOpts,
        outExtension: { '.js': '.cjs.js' },
      },
      { // Production
        ...commonOpts,
        define: { 'NODE_ENV': 'production' },
        outExtension: { '.js': '.cjs.min.js' },
        minify: true,
      }]
      break;
    case 'esm':
      buildTargets = [
      { // Dev
        ...commonOpts,
        outExtension: { '.js': '.dev.esm.js' },
      },
      { // Production
        ...commonOpts,
        define: { 'NODE_ENV': 'production' },
        outExtension: { '.js': '.esm.js' },
      },
      { // Esnext
        ...commonOpts,
        define: { 'NODE_ENV': 'production' },
        outExtension: { '.js': '.esnext.js' },
        target: 'esnext',
      },
      // TODO: esmnext
      ]
      break;
  }

  buildTargets.forEach((opts) => {
    require('esbuild').build({ ...opts });
  });
})