// Runs the browser tests on Sauce Labs through a Sauce Connect tunnel, one browser at a time.
// Requires SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables.
import jasmineBrowser from 'jasmine-browser-runner';
import saucelabs from 'saucelabs';
import { Builder } from 'selenium-webdriver';
import build from './build-tests.js';
import config from './jasmine-browser.mjs';

const SauceLabs = saucelabs.default;

const browsers = {
  slChrome: {
    browserName: 'chrome',
    browserVersion: 'latest',
    platformName: 'Windows 11',
  },
  slSafari14: {
    browserName: 'safari',
    browserVersion: '16',
    platformName: 'macOS 12',
  },
  slSafari15: {
    browserName: 'safari',
    browserVersion: 'latest',
    platformName: 'macOS 13',
  },
  slEdge: {
    browserName: 'MicrosoftEdge',
    browserVersion: 'latest',
    platformName: 'Windows 11',
  },
  sl_mac_chrome: {
    browserName: 'chrome',
    browserVersion: 'latest',
    platformName: 'macOS 12',
  },
  slFirefox: {
    browserName: 'firefox',
    browserVersion: 'latest',
    platformName: 'Windows 10',
  },
  slFirefox119: {
    browserName: 'firefox',
    browserVersion: '119',
    platformName: 'Linux',
    'sauce:options': {
      geckodriverVersion: '0.33.0',
    },
  },
};

const username = process.env.SAUCE_USERNAME;
const accessKey = process.env.SAUCE_ACCESS_KEY;

if (!username || !accessKey) {
  console.error(
    'SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are required.',
  );
  process.exit(1);
}

const tunnelName = `inferno-${Date.now()}`;

function browserConfig({ browserName, ...capabilities }) {
  return {
    name: browserName,
    useRemoteSeleniumGrid: true,
    remoteSeleniumGrid: {
      url: 'https://ondemand.us-west-1.saucelabs.com/wd/hub',
      ...capabilities,
      'sauce:options': {
        username,
        accessKey,
        tunnelName,
        name: 'InfernoJS',
        public: 'public',
        recordVideo: false,
        recordScreenshots: false,
        maxDuration: 1800,
        commandTimeout: 400,
        idleTimeout: 90,
        ...capabilities['sauce:options'],
      },
    },
  };
}

// Same as jasmine-browser-runner's remote webdriver, but when the session fails to start,
// selenium-webdriver would otherwise leave a rejected promise unhandled and crash the whole run.
// The error still reaches runSpecs through the first webdriver command.
function buildWebdriver({
  name,
  remoteSeleniumGrid: { url, ...capabilities },
}) {
  const driver = new Builder()
    .withCapabilities({ ...capabilities, browserName: name })
    .usingServer(url)
    .build();

  driver.catch(() => {});

  return driver;
}

async function runBrowser(id, capabilities) {
  // Retry once when the session itself fails (e.g. no VM available), not when specs fail
  for (let attempt = 1; attempt <= 2; attempt++) {
    console.info(
      `\n*** ${id}: ${capabilities.browserName} ${capabilities.browserVersion} on ${capabilities.platformName} ***`,
    );

    try {
      const result = await jasmineBrowser.runSpecs(
        {
          ...config,
          browser: browserConfig(capabilities),
        },
        { buildWebdriver },
      );

      return result.overallStatus;
    } catch (err) {
      console.error(`${id} failed to run (attempt ${attempt}): ${err.message}`);
    }
  }

  return 'errored';
}

// Minified, so Sauce also covers what minifiers do to the code (reproduce locally with test:swc:minified)
await build('swc', { compat: true, minimize: true });

const sauceConnect = await new SauceLabs({
  user: username,
  key: accessKey,
  region: 'us',
}).startSauceConnect({
  tunnelName,
  logger: (output) => process.stdout.write(output),
});

const results = {};

try {
  for (const [id, capabilities] of Object.entries(browsers)) {
    results[id] = await runBrowser(id, capabilities);
  }
} finally {
  await sauceConnect.close();
}

console.info('\n*** Sauce Labs results ***');
console.table(results);

// runSpecs sets process.exitCode per browser, so set it once from all results
process.exitCode = Object.values(results).every((status) => status === 'passed')
  ? 0
  : 1;
