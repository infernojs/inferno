const { join } = require('path');

module.exports = {
	disableOutputCheck: true,
	excludeExternals: true,
	excludeNotExported: true,
	excludePrivate: true,
	mode: 'modules',
	name: 'Inferno',
	out: join(__dirname, './docs'),
	target: 'es6',
	tsconfig: join(__dirname, './tsconfig.json'),
};
