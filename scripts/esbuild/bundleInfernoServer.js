['iife', 'cjs', 'esm'].forEach((format) => {
  const commonOpts = {
    platform: 'node',
    entryPoints: ['src/index.ts'],
    format,
    target: [
      'node10', // Maintained versions https://nodejs.org/en/about/releases/
    ],
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
        minify: true,
      },
      // TODO: esmnext
      ]
      break;
  }

  buildTargets.forEach((opts) => {
    require('esbuild').build({ ...opts });
  });
})