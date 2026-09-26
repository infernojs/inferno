// Runs the browser tests locally for every JSX plugin, with and without inferno-compat, minified and not,
// in Firefox and Chromium. The tests import the packages from dist, so build Inferno first.
// usage: node run-transformers.mjs [babel] [ts] [swc], without arguments all plugins are tested
import fs from 'node:fs';
import path from 'node:path';
import jasmineBrowser from 'jasmine-browser-runner';
import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import build from './build-tests.js';
import config from './jasmine-browser.mjs';

const allVariants = ['babel', 'ts', 'swc'];
const browsers = ['firefox', 'chromium'];

const requestedVariants = process.argv.slice(2);
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

  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    for (const name of ['chromium', 'chromium-browser']) {
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
    builder.forBrowser('chrome');

    if (chromiumBinary) {
      builder.setChromeOptions(
        new chrome.Options().setChromeBinaryPath(chromiumBinary),
      );
    }
  } else {
    builder.forBrowser(browser);
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

for (const variant of variants) {
  for (const compat of [false, true]) {
    for (const minimize of [false, true]) {
      const label = [variant, compat && 'compat', minimize && 'minified']
        .filter(Boolean)
        .join(' ');

      results[label] = {};

      try {
        await build(variant, { compat, minimize });
      } catch (err) {
        console.error(`${label}: build failed: ${err.message}`);

        for (const browser of browsers) {
          results[label][browser] = 'build failed';
        }

        continue;
      }

      for (const browser of browsers) {
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
