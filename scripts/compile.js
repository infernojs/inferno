const { execute } = require('./packages')();
const { spawnPromise } = require('./spawnPromise');
const { statSync } = require('fs');
const { join } = require('path');

execute(({ location: cwd }) => {
	let tsconfigExist = false;
	try {
		tsconfigExist = statSync(join(cwd, 'tsconfig.json')).isFile();
	} catch (e) {}

	if (tsconfigExist) {
		const isWindows = /^win/.test(process.platform);
		const extension = isWindows ? '.cmd' : ''
		const tsCompiler = join(__dirname, `../node_modules/.bin/tsc${extension}`)
		return spawnPromise(tsCompiler, [], { cwd });
	}
});
