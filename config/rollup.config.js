import * as p from 'path';
import * as fs from 'fs';
import zlib from 'zlib';
import rollup from 'rollup';
import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'uglify-js';
import pack from '../package.json';

const development = process.argv[2] === 'dev';
const production = process.argv[2] === 'prod';

if ( development ) {
	process.env.NODE_ENV = 'development'
} else {
	process.env.NODE_ENV = 'production'
}

const copyright =
	'/*!\n' +
	' * ' + pack.name + ' v' + pack.version + '\n' +
	' * (c) ' + new Date().getFullYear() + ' ' + pack.author.name + '\n' +
	' * Released under the ' + pack.license + ' License.\n' +
	' */'

function createBundle() {
	let bundle = rollup.rollup({
		entry: p.resolve('src/index.js'),
		plugins: [
			babel({
				babelrc: false,
				presets: [
					'es2015-rollup'
				],
				plugins: [
					'transform-object-rest-spread',
				],
			}),
			npm({
				jsnext: true,
				main: true,
			}),
			commonjs({
				sourceMap: true,
			}),
			replace({
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
				exclude: 'node_modules/**',
				VERSION: pack.version,

			}),
		],
	});

	// Cast as native Promise.
	return Promise.resolve(bundle);
}

function zip() {
	return new Promise(function(resolve, reject) {
		fs.readFile('dist/' + pack.name + '.min.js', function(err, buf) {
			if (err) return reject(err)
			zlib.gzip(buf, function(err, buf) {
				if (err) return reject(err)
				fs.writeFile('dist/' + pack.name + '.min.js.gz', buf);
			})
		})
	})
}

function writeBundle(bundle) {
	const filename = production ? pack.name + '.min.js' : pack.name + '.js';
	const dest = p.resolve(`dist/${filename}`);

	let result = bundle.generate({
		format: 'umd',
		moduleName: 'Inferno',
		banner: copyright,
		sourceMap: true,
		sourceMapFile: dest,
		globals: {
		},
	});

	if (production) {
		result = uglify.minify(result.code, {
			fromString: true,
			inSourceMap: result.map,
			outSourceMap: `${filename}.map`,
			warnings: false,
		});

		result.map = JSON.parse(result.map);
	} else {
		result.code += `\n//# sourceMappingURL=${filename}.map`;
	}

	let {
		code,
		map
		} = result;

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

process.on('unhandledRejection', (reason) => {
	throw reason;
});

createBundle().then((bundle) => {

	writeBundle(bundle);

	if ( production ) {
		zip(); // gZip
	}
})