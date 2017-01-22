const { executeSync } = require('./packages')();
const { spawnPromise } = require('./spawnPromise');
const { statSync } = require('fs');
const { join } = require('path');

executeSync(({ location: cwd }) => {
	let tsconfigExist = false;
	try {
		tsconfigExist = statSync(join(cwd, 'tsconfig.es.json')).isFile();
	} catch (e) {}

	if (tsconfigExist) {
		return spawnPromise('tsc', ['-p', 'tsconfig.es.json'], { cwd });
	}
});
