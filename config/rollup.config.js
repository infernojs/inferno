const p = require('path');
const fs = require('fs');
const zlib = require('zlib');
const rollup = require('rollup');
const uglify = require('uglify-js');
const npm = require('rollup-plugin-npm');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
//const commonjs = require('rollup-plugin-commonjs');
const pack = require('../package.json');

const development = process.argv[2] === 'dev';
const production = process.argv[2] === 'prod';
const dist = process.argv[3];
const src = process.argv[4];
const packageName = process.argv[5];
const moduleName = process.argv[6];

if ( development ) {
	process.env.NODE_ENV = 'development'
} else {
	process.env.NODE_ENV = 'production'
}

const copyright =
	'/*!\n' +
	' * ' + packageName + ' v' + pack.version + '\n' +
	' * (c) ' + new Date().getFullYear() + ' ' + pack.author.name + '\n' +
	' * Released under the ' + pack.license + ' License.\n' +
	' */';

function createBundle() {
	var bundle = rollup.rollup({
		entry: p.resolve(src + '/index.js'),
		plugins: [
			babel({
				babelrc: false,
				presets: [
					'es2015-rollup'
				],
				plugins: [
					'transform-object-rest-spread'
				]
			}),
			npm({
				jsnext: true,
				main: true
			}),
			//commonjs({
			//		sourceMap: true
			//}),
			replace({
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
			})
		]
	});

	// Cast as native Promise.
	return Promise.resolve(bundle);
}

function zip() {
	return new Promise(function(resolve, reject) {
		fs.readFile(dist + '/' + packageName + '.min.js', function(err, buf) {
			if (err) return reject(err)
			zlib.gzip(buf, function(err, buf) {
				if (err) return reject(err)
				fs.writeFile(dist + '/' + packageName + '.min.js.gz', buf);
			})
		})
	})
}


function writeBundle(bundle) {
	const filename = production ? packageName + '.min.js' : packageName + '.js';
	console.log(filename)
	const dest = p.resolve(dist +`/${filename}`);

	var result = bundle.generate( {
		format: 'umd',
		moduleName: moduleName,
		banner: copyright,
		sourceMap: true,
		sourceMapFile: dest,
		globals: {}
	} );

	if (production) {
		result = uglify.minify(result.code, {
			fromString: true,
			inSourceMap: result.map,
			outSourceMap: `${filename}.map`,
			warnings: false
		});

		result.map = JSON.parse(result.map);
	} else {
		result.code += `\n//# sourceMappingURL=${filename}.map`;
	}

	var code = result.code;
	var map = result.map;


	const throwIfError = (err) => {
		if (err) {
			throw err;
		}

		console.log('\x1b[1m\x1b[34m' + dest + '\x1b[39m\x1b[22m' + ' ' + (code.length / 1024).toFixed(2) + 'kb')
	};

	fs.writeFile(dest, code, throwIfError);
	fs.writeFile(`${dest}.map`, JSON.stringify(map), throwIfError);
}

// -----------------------------------------------------------------------------

createBundle().then((bundle) => {
	writeBundle(bundle); // Development
	if(production){
		zip(); // gZip
	}
}).catch(e => {
	console.error(e);
});