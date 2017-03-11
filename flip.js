const pkg = require('./package.json')
const {
  envrmts,
  program,
  inquirer,
  FlipHubCli,
} = require('fliphub-cli-inferno')

const flip = new FlipHubCli(__dirname, '*')

function infernoFuse(name) {
  const {FuseBox, UglifyJSPlugin, ReplacePlugin} = require('fsbx')
  const isProd = process.argv.includes('--production')
  const fuse = FuseBox.init({
    src: 'packages',
    outFile: 'inferno.fused.js',
    plugins: [
      ReplacePlugin({'process.env.NODE_ENV': JSON.stringify('production')}),
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
  })

  fuse.bundle('packages/inferno/src/index.ts')
}

function runner(apps, opts) {
  console.log('using nameless functions')
}

function addSameOpts(prgrm) {
}

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
  .action(runner)


// @TODO: extract flags elsewhere?
program
  .command('clean [apps]')
  .option('-p, --purge', 'removes node modules')
  .option('-r, --reinstall', 'reinstall')
  .option('-d, --dist', 'remove coverage/ and dist files (default)')
  .option('-l, --lerna', 'use lerna clean')
  .action(function(apps, options) {
    flip.runScriptFor('rimraf', 'coverage/ packages/*/dist*/')
    if (options.lerna) {
      flip.runScriptFor('lerna', 'clean')
    }
    if (options.purge) {
      flip.runScriptFor('rimraf', 'node_modules')
    }
    if (options.reinstall) {
      flip.execSync('npm i')
    }
  })

program
.command('bench [apps]')
.option('-l, --log', 'logLevel')
.action(function(apps, options) {
  const globScoped = flip.globScope(apps) || '*'
  const flag = `BENCHMARK_GLOB="packages/${globScoped}/__benchmarks__/**/*.js*"`
  return flip.execSync(flag + ' npm run test:bench ')
})

program
  .command('test [apps]')
  .option('-a, --all', 'all tests')
  .option('-b, --browsers', 'browser')
  .option('-C, --chrome', 'karma.Chrome')
  .option('-I, --ie', 'karma.IE')
  .option('-F, --ff', 'karma.firefox')
  .option('-k, --karma', 'karma')
  .option('-q, --quick', 'test quick')
  .option('-f, --filter, --apps', 'filter / apps to use')
  .option('-s, --server, --server', 'use the server tests')
  .option('-c, --coverage, --publish, --coveralls', 'test the coverage for publish with coveralls')
  .option('-p, --production', 'for prod')
  .option('-d, --development', 'for dev')
  .action(function(apps, options) {
    const {karma, chrome, ie, ff, quick, filter, server, coverage} = options
    let browsers = options.browsers
    const hasBrowsers = (ff || chrome || ie)
    if (!browsers && hasBrowsers) {
      browsers = ``
      if (ff) browsers += 'Firefox,'
      if (ie) browsers += 'IE,'
      if (chrome) browsers += 'Chrome,'
      browsers = browsers.slice(0, browsers.length - 1)
    }
    const scoped = flip.envScope('PKG_FILTER', apps)

    if (browsers) {
      browsers.split(',').forEach(browser => {
        // flip.execSync(scoped + 'npm run karma:' + browser.toLowerCase())
        flip.runScriptForBin('karma', 'start test/karma/karma.unit.conf.js --browsers=' + browsers + ' ' + scoped)
      })
    }
    else if (!karma && !quick && !server && !coverage) {
      flip.execSync(' npm run karma:chrome ' + scoped)
      flip.execSync(' npm run karma:firefox ' + scoped)
      flip.execSync(' npm run karma:ie ' + scoped)
      flip.execSync(' npm run test:server ' + scoped)
    }
    else if (karma) {
      flip.execSync(' npm run karma:chrome ' + scoped)
      flip.execSync(' npm run karma:ff ' + scoped)
      flip.execSync(' npm run karma:ie ' + scoped)
    }
    if (quick) {
      flip.execSync(' npm run test:quick ' + scoped)
    }
    if (server) {
      flip.execSync(' npm run test:server ' + scoped)
    }
    if (coverage) {
      flip.execSync(' npm run test:publish ' + scoped)
    }
  })

program
.command('browser [apps]')
.action(function(apps, options) {
  flip.runScriptFor('webpack-dev-server', '--config config/webpack.dev.conf.js')
})

program
.command('lint [apps]')
.option('-j, --js', 'lint js')
.option('-t, --ts', 'lint ts')
.action(function(options) {
  const {js, ts} = options
  if (js)
    flip.execSync('npm run lint:js')
  if (ts)
    flip.execSync('npm run lint:ts')
})

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
  .action(function(name, options) {
    const {scope, log} = options
    console.log({scope, log, name})

    if (options.fusebox) {
      return infernoFuse(name)
    }
    flip.lerna.execWith({
      scope: name || scope,
      bin: 'tsc',
      log: log || 'info',
    })

    flip.lerna.execFrom({
      bin: 'rollup',
      envs: ['production', 'browser', 'development'],
      log: log || 'info',
      options,
    })
  })

function checkboxPresets(name, apps, options) {
  const choices = {
    view: [
      new inquirer.Separator(' ==== Testing ==== '),
      new inquirer.Separator(' => Server (server with jsdom)'),
      // ...
      {
        name: 'mocha',
        value: 'test.mocha',
        checked: true,
      },
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
        checked: true,
      },
      new inquirer.Separator(' => Browser '),
      {
        name: 'dev server (webpack dev server)',
        value: 'test.browser.devserver',
        checked: false,
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

      // before each test? needs thought...
      new inquirer.Separator(' = Build (before tests) = '),
      {
        name: 'production',
        value: 'build.production',
        checked: true,
      },
      {
        name: 'development',
        value: 'build.development',
        checked: true,
      },
      {
        name: 'browser',
        value: 'build.browser',
        checked: true,
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
          answers['clean.uninstall'] !== false
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
  }

  const steps = [
    {
      type: 'checkbox',
      name: 'presets',
      message: 'options:',
      choices: choices.view,
      default: false,
    },
  ]
  inquirer.prompt(steps).then(answers => {
    answers.name = name
    answers.apps = apps
    flip.presets.add(answers, ['clean', 'build', 'test', 'bench'])
  })
}

function interactivePresets(name, options) {}

program
  .command('make-preset [name] [apps]')
  .option('-c, --checkbox', '(default) use checkbox mode')
  .option('-i, --interactive', 'use interactive mode')
  .action(function(name, apps, opts) {
    if (opts.interactive) {
      return interactivePresets(name, apps, opts)
    }
    checkboxPresets(name, apps, opts)
  })

program.parse(process.argv)
