const pkg = require('./package.json');
const {
  fs,
  inspect,
  read,
  write,
  envrmts,
  program,
  inquirer,
  FlipHubCli,
  argv,
} = require('fliphub-cli-inferno');

const flip = new FlipHubCli(__dirname, '*');

function runner(apps, opts) {
	console.log('-- using nameless command option, is not implemented yet --');
}

// @TODO: https://github.com/tj/commander.js/blob/master/examples/env#L5
program
  .version(pkg.version)
  .command('[apps]')
  .option('-c, --clean', 'runs clean')
  .option('-t, --test', 'tests')
  .option('-n, --bench', 'benchmark')
  .option('-p, --production', 'use production env')
  .option('-d, --development', 'use development env')
  .option('-l, --lint', 'do linting')
  .option('-s, --server', 'use server')
  .option('-b, --build', 'build packages')
  .option('-o, --output', 'outputs only the command to run with npm or lerna @TODO')
  .action(runner);


// @TODO: extract flags elsewhere?
program
  .command('clean [apps]')
  .option('-p, --purge', 'removes node modules')
  .option('-r, --reinstall', 'reinstall')
  .option('-d, --dist', 'remove coverage/ and dist files (default)')
  .option('-l, --lerna', 'use lerna clean')
  .action(function (apps, options) {
	flip.runScriptFor('rimraf', 'coverage/ packages/*/dist*/');
	if (options.lerna) {
		flip.runScriptFor('lerna', 'clean');
	}
	if (options.purge) {
		flip.runScriptFor('rimraf', 'node_modules');
	}
	if (options.reinstall) {
		flip.execSync('npm i');
	}
});

program
.command('bench [apps]')
.option('-l, --log', 'logLevel')
.option('-a, --after', 'after tests')
.option('-b, --before', 'before tests')
.option('-b, --browser', 'build for browser')
.option('-p, --production', 'build for prod')
.option('-d, --development', 'build for dev')
.action(function (apps, options) {
	const glob = flip.envScope('BENCH_FILTER', apps) || '*';
	const globScoped = flip.globScope(apps) || '*';
	const BENCH_FILTER = `${glob}`;
	return flip.execSync(' npm run test:bench ' + globScoped);
});


function handleTestWrapped(apps, options, flaggedWithEnv) {
	const { karma, mocha, chrome, ie, ff, quick, filter, server, coverage, nyc } = options;
	let browsers = options.browsers;
	const hasBrowsers = (ff || chrome || ie);
	if (!browsers && hasBrowsers) {
		browsers = '';
		if (ff) {browsers += 'Firefox,';}
		if (ie) {browsers += 'IE,';}
		if (chrome) {browsers += 'Chrome,';}
		browsers = browsers.slice(0, browsers.length - 1);
	}
	const globScoped = flip.globScope(apps) || '*';
	const envScope = flip.envScope('PKG_FILTER', apps);
	let flagged = flaggedWithEnv + globScoped;
	if (browsers) {
		browsers.split(',').forEach(browser => {
      // also could do flip.execSync(flagged + 'npm run karma:' + browser.toLowerCase())
			flip.runScriptForBin('karma', 'start test/karma/karma.unit.conf.js --browsers=' + browsers + ' ' + flagged);
		});
	}
	else if (!karma && !quick && !server && !coverage) {
		flip.execSync(' npm run karma:chrome ' + flagged);
		flip.execSync(' npm run karma:firefox ' + flagged);
		flip.execSync(' npm run karma:ie ' + flagged);
		flip.execSync(' npm run test:server ' + flagged);
	}
	else if (karma) {
		flip.execSync(' npm run karma:chrome ' + flagged);
		flip.execSync(' npm run karma:ff ' + flagged);
		flip.execSync(' npm run karma:ie ' + flagged);
	}
	if (quick) {
		flip.execSync(' npm run test:quick ' + flagged);
	}
	if (server) {
		if (nyc) {
			flip.execSync(' npm run test:server ');
			// flip.runNodeForModule('nyc', ' mocha ', { env: flaggedWithEnv });
		} else {
      // is test:server:quick
			flip.execSync(' npm run test:quick ');
		}
	} else if (mocha) {
    // @TODO
    // flip.runNodeForModule('mocha', '  ', { env: flaggedWithEnv });
	}
	if (coverage) {
		flip.execSync(' npm run test:publish ' + flagged);
	}
}

const mochaOptsBackupFile = './.fliphub/mocha.opts';
const mochaOptsFile = './test/mocha.opts';
const infernoOptionsFile = './packages/inferno/src/core/options.ts';
let recyclingEnabled = false;

// wrap in try catch to be safe for recycling
function handleTest(apps, options, flaggedWithEnv) {
	if (recyclingEnabled) {
		try {
			const result = handleTestWrapped(apps, options, flaggedWithEnv);
			return result;
		} catch (e) {
			console.log('failed with recycling:');
			console.log('\n\n\n ------ ');
			console.log(e);
			console.log('\n\n\n ------ ');
			console.log(inspect(e));
		}
	} else {
		return handleTestWrapped(apps, options, flaggedWithEnv);
	}
}

function enableRecycling(state) {
	recyclingEnabled = state;
	let ogInfernoOptions = infernoOptions = read(infernoOptionsFile);
	infernoOptions = infernoOptions
  .replace('export default ', '')
  .replace(/[{};]/gmi, '')
  .split(',')
  .map(line => {
	if (line.includes('recyclingEnabled')) {
		return '\n\trecyclingEnabled: ' + state + '';
	}
	return line;
});

  // back to a string, replace the last extra empty line
	let backToString = 'export default {' + infernoOptions.join(',') + '};';
	backToString = backToString.replace(/(\n\n)/gmi, '');
	backToString = backToString.replace(/(\n\}\;$)/, '\n};');
	backToString = backToString.replace('null};', 'null\n};');
	backToString += '\n';

  // if it is the same, don't write it
	if (backToString.length === ogInfernoOptions.length) {
		console.log('recycling unchanged');
		return;
	}
	console.log(backToString);

	write(infernoOptionsFile, backToString);
}

function filterMochaOpts(filter) {
	let ogMochaOpts = mochaOpts = read(mochaOptsFile);

  // back it up if we haven't before
	if (!fs.existsSync(mochaOptsBackupFile)) {
		write(mochaOptsBackupFile, ogMochaOpts);
	}

  // pop off the last one, change it to our filer
	mochaOpts = mochaOpts.split('\n');
	let last = mochaOpts.length - 1;
	let mochaFilter = mochaOpts[last];
	if (mochaFilter === '') {
		last -= 1;
	}

	let globScoped = '*';
	if (filter !== '*') {
		globScoped = flip.filterer.globFlag('inferno', filter) || '*';
	}

	mochaFilter = `packages/${globScoped}/__tests__/**/*.js*`;
	mochaOpts[last] = mochaFilter;
	const backToString = mochaOpts.join('\n') + '\n';
	if (globScoped !== '*') {
		console.log('updating mochaOptsLog');
		write(mochaOptsFile, backToString);
	} else {
		write(mochaOptsFile, read(mochaOptsBackupFile));
	}
}

program
  .command('test [apps]')
  .option('-a, --all', 'all tests')
  .option('-b, --browsers', 'browser')
  .option('-C, --chrome', 'karma.Chrome')
  .option('-I, --ie', 'karma.IE')
  .option('-F, --ff', 'karma.firefox')
  .option('-k, --karma', 'karma')
  .option('-m, --mocha', 'mocha')
  .option('-q, --quick', 'test quick')
  .option('-s, --server', 'use the server tests')
  .option('-c, --coverage, --publish, --coveralls', 'test the coverage for publish with coveralls')
  .option('-n, --nyc', 'use nyc to check code coverage')
  .option('-p, --production', 'for prod env')
  .option('-d, --development', 'for dev env')
  .option('-r, --browser', 'browser env')
  .option('-y, --recycling', 'turns recycling on (default recycling is off)')
  .option('-o, --only', 'grep to run only tests matching this filter / grep')
  .option('-f, --filter', 'filter / apps to use (can be used when you grep)')
  .option('-g, --og', 'restore original mocha file')
  .action(function (apps, options) {
	let { production, development, browser, server } = options;
	if (!production && !development) {
		production = true;
	}

	if (options.recycling) {
		enableRecycling(true);
	} else {
		enableRecycling(false);
	}
	let flagged = '';
	if (argv.only) {
		let only = argv.only;
		only = only.split('-').join(' ');
		flagged += flip.defineEnv('TEST_GREP_FILTER', JSON.stringify(only));
	}
	if (production && !server) {
		flagged += flip.defineEnv('NODE_ENV', 'production') || '';
		handleTest(apps, options, flagged);
	}
	if (development && !server) {
		flagged += flip.defineEnv('NODE_ENV', 'development') || '';
		handleTest(apps, options, flagged);
	}
	if (browser) {
		flagged += flip.defineEnv('NODE_ENV', 'browser') || '';
		handleTest(apps, options, flagged);
	}
	if (server) {
		filterMochaOpts(apps);
		try {
			handleTest(apps, options, flagged);
			filterMochaOpts('*');
		} catch (e) {
			filterMochaOpts('*');
		}
	}
});

program
.command('browser [apps]')
.action(function (apps, options) {
	flip.runScriptFor('webpack-dev-server', '--config config/webpack.dev.conf.js');
});

program
.command('lint [apps]')
.option('-j, --js', 'lint js')
.option('-t, --ts', 'lint ts')
.option('-p, --production', 'use production env (should not need to be here)')
.option('-d, --development', 'use development env (should not need to be here)')
.option('-b, --browser', 'build for browse (should not need to be herer')
.action(function (apps, options) {
	if (options.js) {flip.execSync('npm run lint:js');}
	if (options.ts) {flip.execSync('npm run lint:ts');}
	// flip.execSync('npm run lint:js');
});

program
  .command('build [apps]')
  .option('-n, --nobuild', 'no build')
  .option('-b, --browser', 'build for browser')
  .option('-p, --production', 'build for prod')
  .option('-d, --development', 'build for dev')
  .option('-l, --log', 'log output')
  .option('-s, --silent', 'no log output @TODO')
  .option('-r, --rollup', 'rollup')
  .option('-f, --fusebox', 'fusebox')
  .option('-t, --ts', 'typescript')
  .action(function (name, options) {
	const { scope, log } = options;
	console.log({ scope, log, name });

	if (options.fusebox) {
		return infernoFuse(name);
	}

	try {
		flip.lerna.execWith({
			scope: name || scope,
			bin: 'tsc',
			log: log || 'info',
		});

		flip.lerna.execFrom({
			bin: 'rollup',
			envs: [ 'production', 'browser', 'development' ],
			log: log || 'info',
			options,
		});
	} catch (e) {
		console.log(`could not build -
    if you are trying to build only a couple packages
    without first building inferno,
    it will not work. Running the full build now.`);
		flip.execSync(' npm run build ');
	}
});

function checkboxPresets(name, apps, options) {
	const choices = {
		view: [
			new inquirer.Separator(' ==== Testing ==== '),
			new inquirer.Separator(' => Server (server with jsdom)'),
      // ...
			{
				name: 'chrome',
				value: 'test.browser.chrome',
				checked: true,
			},
			{
				name: 'firefox',
				value: 'test.browser.ff',
				checked: true,
			},
			{
				name: 'ie',
				value: 'test.browser.ie',
				checked: false,
			},
			{
				name: 'mocha (server)',
				value: 'test.mocha',
				checked: true,
			},
			// {
			// 	name: 'karma (runs all browsers)',
			// 	value: 'test.karma',
			// 	checked: false,
			// },
			new inquirer.Separator(' => Browser '),
			{
				name: 'dev server (webpack dev server)',
				value: 'test.browser.devserver',
				checked: false,
			},

			new inquirer.Separator(' = Envs = '),
			{
				name: 'production',
				value: 'env.production',
				checked: true,
			},
			{
				name: 'development',
				value: 'env.development',
				checked: true,
			},

			// {
			// 	name: 'karma (browsers with jsdom)',
			// 	value: 'karma',
			// 	checked: true,
			// },
			new inquirer.Separator(' = Bench = '),
      // @TODO: make this toggle automatically?
			{
				name: 'before tests',
				value: 'bench.before',
				checked: false,
				// disabled: true,
			},
			{
				name: 'after tests',
				value: 'bench.after',
				checked: true,
			},

      // @TODO: how best to add building true-false and also have env opts?
      // before each test? needs thought...
			new inquirer.Separator(' = Build (before tests) = '),
			{
				name: 'production',
				value: 'build.production',
				checked: false,
			},
			{
				name: 'development',
				value: 'build.development',
				checked: false,
			},
			{
				name: 'browser',
				value: 'build.browser',
				checked: false,
			},
			new inquirer.Separator(' = Cleaning (before tests) = '),
			{
				name: 'dists (clean built before tests)',
				value: 'clean.dist',
				checked: false,
			},
			{
				name: 'node_modules (warning -- careful)',
				value: 'clean.purge',
				checked: false,
			},
			{
				name: 'uninstall (all packages node_modules)',
				value: 'clean.uninstall',
				checked: false,
			},
			{
				name: 'reinstall',
				value: 'clean.reinstall',
				checked: false,

        // @TODO:
				when: (answers) => {
					answers['clean.uninstall'] !== false;
				},
			},

			new inquirer.Separator(' = Lint = '),
      // @TODO: make this toggle automatically?
			{
				name: 'js',
				value: 'lint.js',
				checked: false,
			},
			{
				name: 'ts',
				value: 'lint.ts',
				checked: false,
			},
		],
	};

	const steps = [
		{
			type: 'checkbox',
			name: 'presets',
			message: 'options:',
			choices: choices.view,
			default: false,
		},
	];
	inquirer.prompt(steps).then(answers => {
		answers.name = name;
		answers.apps = apps;
		flip.presets.add(answers, [ 'env', 'clean', 'build', 'test', 'bench' ]);
	});
}

function interactivePresets(name, options) {}

program
  .command('make-preset [name] [apps]')
  .option('-c, --checkbox', '(default) use checkbox mode')
  .option('-i, --interactive', 'use interactive mode')
  .action(function (name, apps, opts) {
	if (opts.interactive) {
		return interactivePresets(name, apps, opts);
	}
	checkboxPresets(name, apps, opts);
});


function infernoFuse(name) {
	const { FuseBox, UglifyJSPlugin, ReplacePlugin } = require('fuse-box');
	const isProd = process.argv.includes('--production');
	const fuse = FuseBox.init({
		src: 'packages',
		outFile: 'inferno.fused.js',
		plugins: [
			ReplacePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
			isProd && UglifyJSPlugin(),
		],
		rollup: {
			bundle: {
				moduleName: 'Inferno',
			},
			entry: 'packages/inferno/src/index.js',
		},
		debug: true,
		alias: { // this can be automatically assigned
			'inferno-compat': '~/packages/inferno-compat',
			'inferno-component': '~/packages/inferno-component/dist-es',
			'inferno-create-class': '~/packages/inferno-create-class/dist-es',
			'inferno-create-element': '~/packages/inferno-create-element/dist-es',
			'inferno-shared': '~/packages/inferno-shared/dist-es',
			'inferno-hyperscript': '~/packages/inferno-hyperscript/dist-es',
			'inferno-mobx': '~/packages/inferno-mobx/dist-es',
			'inferno-redux': '~/packages/inferno-redux/dist-es',
			'inferno-router': '~/packages/inferno-router/dist-es',
			'inferno-server': '~/packages/inferno-server/dist-es',
			inferno: '~/packages/inferno/dist-es',
		},
	});

	fuse.bundle('packages/inferno/src/index.ts');
}

process.argv = process.argv.map(argv => {
	if (argv && argv.includes && argv.includes('only')) {
		return '--only';
	}
	return argv;
});

program.parse(process.argv);
if (!program.args.length) {
	program.help();
}
