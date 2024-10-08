import fs, { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

import { createPlugins } from './plugins/index.js';

import { rollup } from 'rollup';

import minimist from 'minimist';

const {
  promises: { mkdir: mkdirAsync },
  lstatSync,
  readdirSync
} = fs;

const cwd = process.cwd();
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../../packages');

const pkgJSONtext = readFileSync(join(cwd, 'package.json'));
const pkgJSON = JSON.parse(pkgJSONtext);

// Self calling function to allow async/await for readability
(async () => {
  if (pkgJSON.private || !pkgJSON.rollup) {
    return;
  }

  const args = minimist(process.argv.slice(2));

  const moduleGlobals = readdirSync(ROOT)
    .filter((path) => lstatSync(join(ROOT, path)).isDirectory())
    .reduce((acc, pkgName) => {
      const pkgJSONtext = readFileSync(join(ROOT, pkgName, 'package.json'));
      const pkgJSON = JSON.parse(pkgJSONtext);

      if (pkgJSON.rollup && pkgJSON.rollup.moduleName) {
        acc[pkgJSON.name] = pkgJSON.rollup.moduleName;
      }

      return acc;
    }, {});

  // Create dist folder
  await mkdirAsync(join(cwd, 'dist')).catch((err) => {
    if (err.code !== 'EEXIST') {
      throw Error(err);
    }
  });

  // Get info from package.json
  const { version, rollup: rollupConfig = {}, dependencies = {}, devDependencies = {}, peerDependencies = {} } = pkgJSON;

  // Figure out from package.json what dependencies to bundle
  function exclusionFilter(name) {
    return !(rollupConfig.bundledDependencies || []).includes(name);
  }

  const deps = Object.assign({}, devDependencies, peerDependencies, dependencies);
  const external = Object.keys(deps)
    .filter(exclusionFilter)
    .filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    });

  // The import stream is NodeJS specific and should alwats be marked as external
  // Used in inferno-server
  external.push('stream');

  const defaultOptions = {
    name: 'index',
    replace: true,
    version: pkgJSON.version
  };

  const targets = [
    //esmDev --name=index --ext=.dev.esm.js --env=development --format=es --minify=false
    Object.assign({}, defaultOptions, { env: 'development', format: 'es', esnext: true, minify: false, ext: '.dev.mjs' }),
    //esmProd --name=index --ext=.esm.js --env=production --format=es --minify=false
    Object.assign({}, defaultOptions, { env: 'production', format: 'es', esnext: true, minify: false, ext: '.mjs' }),
    //cjsDev --env=development --format=cjs --replace=true --name=index.cjs --minify=false
    Object.assign({}, defaultOptions, { env: 'development', format: 'cjs', minify: false, ext: '.cjs' }),
    //cjsProd --env=production --format=cjs --replace=true --name=index.cjs --minify=true --ext=.min.js
    Object.assign({}, defaultOptions, { env: 'production', format: 'cjs', minify: true, ext: '.min.cjs' }),
    //umdDev --minify=false
    Object.assign({}, defaultOptions, {
      env: 'development',
      format: 'umd',
      minify: false,
      name: pkgJSON.name,
      ext: '.js'
    }),
    //umdProd --env=production --ext=.min.js
    Object.assign({}, defaultOptions, {
      env: 'production',
      format: 'umd',
      minify: true,
      name: pkgJSON.name,
      ext: '.min.js'
    })
  ].filter((target) => {
    if (args['target-ext']) {
      return target.ext === args['target-ext'];
    }
    return true;
  });

  async function startBuilding(options) {
    const errorFunc = (error) => {
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
      process.exit(-1); // Do not continue build in case of error to avoid publishing garbage, Github #1157
    };

    // Minify settings are found in plugins/index.js
    const rollupPlugins = createPlugins(version, options);

    // Transform
    const { write } = await rollup({
      input: join(cwd, 'tmpDist/index.js'),
      external: external,
      plugins: rollupPlugins
    }).catch(errorFunc);

    // Write bundle
    const filename = `${options.name}${options.ext}`;

    // TODO: Consider adding globals to avoid warnings:
    // No name was provided for external module 'stream' in output.globals – guessing 'stream'
    // No name was provided for external module 'history' in output.globals – guessing 'history'
    // No name was provided for external module 'path-to-regexp-es6' in output.globals – guessing 'pathToRegexp'
    // No name was provided for external module 'hoist-non-inferno-statics' in output.globals – guessing 'hoistNonReactStatics'
    // No name was provided for external module 'redux' in output.globals – guessing 'redux'
    // No name was provided for external module 'mobx' in output.globals – guessing 'mobx'

    const outputOptions = {
      file: `dist/${filename}`,
      format: options.format,
      globals: Object.assign(moduleGlobals, rollupConfig.moduleGlobals),
      name: rollupConfig.moduleName,
      indent: true,
      extend: true,
      sourcemap: false
    };

    if (options.format === 'cjs') {
      outputOptions.exports = 'named';
    }

    await write(outputOptions).catch(errorFunc);
    console.log(`${pkgJSON.name} in ${options.name}${options.ext} is DONE`);
  }

  await Promise.all(targets.map(startBuilding));
})();
