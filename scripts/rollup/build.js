const { mkdir } = require('fs');
const { join } = require('path');

const cwd = process.cwd();
const pkgJSON = require(join(cwd, 'package.json'));

if (pkgJSON.private || !pkgJSON.rollup) {
  return;
}

mkdir(join(cwd, 'dist'), err => {
  if (err && err.code !== 'EEXIST') {
    throw Error(e);
  }

  var exit = process.exit;

  const options = require('minimist')(process.argv.slice(2), {
    boolean: ['replace', 'optimize', 'uglify'],
    default: {
      env: 'development',
      ext: '.js',
      format: 'umd',
      name: pkgJSON.name,
      replace: true,
      uglify: true,
      version: pkgJSON.version
    }
  });

  const createRollup = require('./rollup');
  const createBundle = require('./bundle');

  const rollup = createRollup(options);
  const bundle = createBundle(options);

  rollup
    .then(bundle)
    .then(() => {
      console.log(`${pkgJSON.name} in ${options.format} is DONE`);
    })
    .catch(error => {
      console.error(error); // Print whole error object

      if (error.snippet) {
        console.error('\u001b[31;1m');
        console.error('\n-------- Details -------');
        console.error(error.id);
        console.error(error.loc);
        console.error('\n-------- Snippet --------');
        console.error(error.snippet);
        console.error('\n-------------------------');
        console.error('\u001b[0m');
      }

      console.error(`${pkgJSON.name} in ${options.format} is FAILED ${error.message}`);
      exit(-1); // Do not continue build in case of error to avoid publishing garbage, Github #1157
    });
});
