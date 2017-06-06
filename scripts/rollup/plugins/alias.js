const { resolve, join } = require('path');
const alias = require('rollup-plugin-alias');

const ROOT = join(__dirname, '../../../');

module.exports = alias({
	inferno: resolve(ROOT, 'packages/inferno/dist/index.es.js'),
	'inferno-compat': resolve(ROOT, 'packages/inferno-compat/dist/index.es.js'),
	'inferno-component': resolve(ROOT, 'packages/inferno-component/dist/index.es.js'),
	'inferno-create-class': resolve(ROOT, 'packages/inferno-create-class/dist/index.es.js'),
	'inferno-create-element': resolve(ROOT, 'packages/inferno-create-element/dist/index.es.js'),
	'inferno-hyperscript': resolve(ROOT, 'packages/inferno-hyperscript/dist/index.es.js'),
	'inferno-mobx': resolve(ROOT, 'packages/inferno-mobx/dist/index.es.js'),
	'inferno-redux': resolve(ROOT, 'packages/inferno-redux/dist/index.es.js'),
	'inferno-router': resolve(ROOT, 'packages/inferno-router/dist/index.es.js'),
	'inferno-server': resolve(ROOT, 'packages/inferno-server/dist/index.es.js'),
	'inferno-shared': resolve(ROOT, 'packages/inferno-shared/dist/index.es.js')
});
