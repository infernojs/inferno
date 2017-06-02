const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const fixtureDirs = fs.readdirSync(__dirname).filter((file) => {
	return fs.statSync(path.join(__dirname, file)).isDirectory();
});

const cmdArgs = [
	{cmd: 'npm', args: ['install']},
	{cmd: 'npm', args: ['run', 'build']},
];

function buildFixture(cmdArg, cwdPath) {
	const opts = {
		cwd: cwdPath,
		stdio: 'inherit',
	};
	const result = child_process.spawnSync(cmdArg.cmd, cmdArg.args, opts);
	if (result.status !== 0 || result.error) {
		throw new Error(`Failed to build fixtures!`);
	}
}

fixtureDirs.forEach(dir => {
	cmdArgs.forEach(cmdArg => {
		// we only care about directories that have DEV and PROD directories in
		// otherwise they don't need to be built
		const devPath = path.join(__dirname, dir, 'dev');

		if (fs.existsSync(devPath)) {
			buildFixture(cmdArg, devPath);
		}
		const prodPath = path.join(__dirname, dir, 'prod');

		if (fs.existsSync(prodPath)) {
			buildFixture(cmdArg, prodPath);
		}
	});
});

console.log(`-------------------------
All fixtures were built!');
Now ensure all frames display a welcome message:');
  npm install -g serve');
  serve ../..');
  open http://localhost:5000/fixtures/packaging/');
-------------------------`);
