const chalk = require('chalk');
const Table = require('cli-table');
const { existsSync, openSync, readdirSync, statSync } = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');

const fixtureDirs = readdirSync(__dirname).filter((file) => statSync(path.join(__dirname, file)).isDirectory());

const table = new Table({
  head: [chalk.gray.yellow('Fixture'), chalk.gray.yellow('Environment'), chalk.gray.yellow('Passed'), chalk.gray.yellow('Message')]
});

function addResult(tool, environment, result) {
  table.push([
    chalk.white.bold(tool),
    chalk.white.bold(environment),
    result.passed ? chalk.green.bold('Passed') : chalk.red.bold('Failed'),
    result.message === void 0 ? '' : chalk.white(result.message)
  ]);
}

function buildFixture(tool, environment) {
  const isWindows = os.type().includes('Windows');
  // Let console know what's going on
  console.log(`Running ${tool}:${environment}`);

  // setup options
  const opts = {
    cwd: path.join(__dirname, tool, environment),
    stdio: ['pipe', 'pipe', 'inherit']
  };

  // Run an NPM install
  const install_result = spawnSync(isWindows ? 'npm.cmd' : 'npm', ['install'], opts);
  if (install_result.status !== 0 || install_result.error || install_result.stderr) {
    return {
      passed: false,
      message: install_result.error || install_result.stderr
    };
  }

  // Run the test
  const test_result = spawnSync(isWindows ? 'npm.cmd' : 'npm', ['run', 'build'], opts);
  if (test_result.status !== 0 || test_result.error || test_result.stderr) {
    return {
      passed: false,
      message: test_result.error || test_result.stderr
    };
  }

  return {
    passed: true
  };
}

for (const dir of fixtureDirs) {
  const devPath = path.join(__dirname, dir, 'dev');
  if (existsSync(devPath)) {
    addResult(dir, 'dev', buildFixture(dir, 'dev'));
  }
  const prodPath = path.join(__dirname, dir, 'prod');
  if (existsSync(prodPath)) {
    addResult(dir, 'prod', buildFixture(dir, 'prod'));
  }
}

console.log(table.toString());
