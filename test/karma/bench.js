const fs = require('fs');
const path = require('path');
Object.entries = Object.entries || require('object.entries');

let testOutput;
try {
  testOutput = require('./data/result.json');
} catch (e) {
  process.exit(1);
}

let baseline;
try {
  baseline = require('./data/baseline.json');
} catch (e) {
  if (!!baseline) {
    const newbaselines = JSON.stringify(baseline);
    fs.writeFile( path.join(__dirname, 'data/baseline.json'), newbaselines, (err) => {
      if (err) {
        process.exit(1);
      }
      process.exit(0);
    });
  }

  process.exit(1);
}

const baselineTests = Object.entries(baseline);
if (baselineTests.length !== Object.keys(testOutput).length) {
  process.exit(1);
}

let failed = false;
for (let i = 0; i < baselineTests.length; i += 1) {
  const [ testName, baselineResult ] = baselineTests[i];
  const testResult = testOutput[ testName ];
  const testResultOps = parseInt( 1 / testResult.time, 10 );
  const baselineResultOps = parseInt( 1 / baselineResult.time, 10 );
  const testResultStatus = (baselineResultOps <= testResultOps) || Math.abs(baselineResultOps - testResultOps) <= baselineResultOps * 0.1;
  if ( !testResultStatus ) {
    failed = true;
  }
  const testResultMessage = testResultStatus ? "PASSED" : "FAILED";
  console.log(testResultMessage, ': ', testName, 'performs', testResultOps, ' operations/s. Baseline: ', baselineResultOps, ' operations/s');
}

if (failed) {
  process.exit(1);
}

process.exit(0);