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
		return spawnPromise(require.resolve('typescript/bin/tsc'), [], { cwd });
	}
});
