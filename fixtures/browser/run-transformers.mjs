// Runs the browser tests locally for every JSX plugin, with and without inferno-compat, minified and not,
// in Firefox and Chromium. The tests import the packages from dist, so build Inferno first.
// usage: node run-transformers.mjs [babel] [ts] [swc] [--headed], without plugins all plugins are tested
// The browsers run headless: a visible window gets few or no animation frames while it is minimized,
// covered or on another workspace, which fails the animation specs. --headed shows the windows.
import fs from 'node:fs';
import path from 'node:path';
import jasmineBrowser from 'jasmine-browser-runner';
import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import build from './build-tests.js';
import config from './jasmine-browser.mjs';

const allVariants = ['babel', 'ts', 'swc'];
const browsers = ['firefox', 'chromium'];

const headed = process.argv.includes('--headed');
const requestedVariants = process.argv
  .slice(2)
  .filter((arg) => arg !== '--headed');
const unknownVariants = requestedVariants.filter(
  (variant) => !allVariants.includes(variant),
);

if (unknownVariants.length > 0) {
  console.error(
    `Unknown plugin "${unknownVariants.join('", "')}", expected one of: ${allVariants.join(', ')}`,
  );
  process.exit(1);
}

const variants = requestedVariants.length > 0 ? requestedVariants : allVariants;

// Selenium looks for Google Chrome and downloads Chrome for Testing when it is missing,
// so point it to the installed Chromium instead. CHROME_BIN overrides the lookup.
function findChromium() {
  if (process.env.CHROME_BIN) {
    return process.env.CHROME_BIN;
  }

  const dirs = (process.env.PATH || '').split(path.delimiter);
  const names = ['chromium', 'chromium-browser'];
  for (let i = 0, len = dirs.length; i < len; ++i) {
    const dir = dirs[i];
    for (let j = 0, len2 = names.length; j < len2; ++j) {
      const name = names[j];
      const binary = path.join(dir, name);

      if (fs.existsSync(binary)) {
        return binary;
      }
    }
  }

  return null;
}

const chromiumBinary = findChromium();

if (!chromiumBinary) {
  console.warn('Chromium not found, set CHROME_BIN. Falling back to Chrome.');
}

function buildWebdriver(browser) {
  const builder = new Builder();

  if (browser === 'chromium') {
    const options = new chrome.Options();

    builder.forBrowser('chrome');

    if (chromiumBinary) {
      options.setChromeBinaryPath(chromiumBinary);
    }
    if (!headed) {
      options.addArguments('--headless=new', '--window-size=1024,768');
    }
    builder.setChromeOptions(options);
  } else {
    builder.forBrowser(browser);

    if (!headed) {
      builder.setFirefoxOptions(
        new firefox.Options().addArguments(
          '--headless',
          '--width=1024',
          '--height=768',
        ),
      );
    }
  }

  const driver = builder.build();

  // When the session fails to start, selenium-webdriver would otherwise leave a rejected promise
  // unhandled and crash the whole run. The error still reaches runSpecs through the first webdriver command.
  driver.catch(() => {});

  return driver;
}

async function runBrowser(label, browser) {
  console.info(`\n*** ${label}: ${browser} ***`);

  let driver;

  try {
    const result = await jasmineBrowser.runSpecs(
      { ...config, browser },
      {
        buildWebdriver() {
          driver = buildWebdriver(browser);

          return driver;
        },
      },
    );

    return result.overallStatus;
  } catch (err) {
    console.error(`${label}: ${browser} failed to run: ${err.message}`);

    return 'errored';
  } finally {
    // runSpecs only closes the window, quit also stops the driver process
    await driver?.quit().catch(() => {});
  }
}

const results = {};

const compatModes = [false, true];
const minimizeModes = [false, true];

for (let i = 0, len = variants.length; i < len; ++i) {
  const variant = variants[i];
  for (let j = 0, len2 = compatModes.length; j < len2; ++j) {
    const compat = compatModes[j];
    for (let k = 0, len3 = minimizeModes.length; k < len3; ++k) {
      const minimize = minimizeModes[k];
      const label = [variant, compat && 'compat', minimize && 'minified']
        .filter(Boolean)
        .join(' ');

      results[label] = {};

      try {
        await build(variant, { compat, minimize });
      } catch (err) {
        console.error(`${label}: build failed: ${err.message}`);

        for (let m = 0, len4 = browsers.length; m < len4; ++m) {
          const browser = browsers[m];
          results[label][browser] = 'build failed';
        }

        continue;
      }

      for (let m = 0, len4 = browsers.length; m < len4; ++m) {
        const browser = browsers[m];
        results[label][browser] = await runBrowser(label, browser);
      }
    }
  }
}

console.info('\n*** Transformer results ***');
console.table(results);

// runSpecs sets process.exitCode per run, so set it once from all results
process.exitCode = Object.values(results).every((row) =>
  Object.values(row).every((status) => status === 'passed'),
)
  ? 0
  : 1;
