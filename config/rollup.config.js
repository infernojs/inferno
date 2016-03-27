import * as p from 'path';
import * as fs from 'fs';
import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import pack from '../package.json';

const development = process.argv[2] === 'dev';
const production = process.argv[2] === 'prod';
const dist = process.argv[3];
const src = process.argv[4];
const packageName = process.argv[5];
const moduleName = process.argv[6];
const es6 = process.argv[7];

if (development) {
	process.env.NODE_ENV = 'development';
} else {
	process.env.NODE_ENV = 'production';
}

/**
 * Banner
 */
const copyright =
	'/*!\n' +
	' * ' + packageName + ' v' + pack.version + '\n' +
	' * (c) ' + new Date().getFullYear() + ' ' + pack.author.name + '\n' +
	' * Released under the ' + pack.license + ' License.\n' +
	' */';

const entry = p.resolve(src, 'index.js');
const filename = production ? packageName + '.min.js' : packageName + (es6 ? '.es2015.js' : '.js');
const dest = p.resolve(dist, filename);
const bundleConfig = {
	dest,
	format: es6 ? 'es6' : 'umd',
	moduleName: moduleName,
	globals: {
		inferno: 'Inferno'
	},
	banner: copyright,
	sourceMap: false // set to false to generate sourceMap
};

const babelConfig = JSON.parse(fs.readFileSync('.babelrc', 'utf8'));
babelConfig.babelrc = false;
babelConfig.presets = babelConfig.presets.map((preset) => {
	return preset === 'es2015' ? 'es2015-rollup' : preset;
});

const plugins = [
	babel(babelConfig),
	nodeResolve({
		jsnext: true,
		main: true
	}),
	replace({
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
	//	exclude: 'node_modules/**',
		VERSION: pack.version
	})
];

const external = ['inferno'];

if (production && !es6) {
	plugins.push(
		uglify({
			warnings: false,
			compress: {
				screw_ie8: true,
				dead_code: true,
				unused: true,
				drop_debugger: true,
				booleans: true // various optimizations for boolean context, for example !!a ? b : c → a ? b : c
			},
			mangle: {
				screw_ie8: true
			}
		})
	);
}

Promise.resolve(rollup({ entry, plugins, external }))
	.then(({ write }) => write(bundleConfig));

process.on('unhandledRejection', (reason) => {throw reason;});
