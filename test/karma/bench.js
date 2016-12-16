const fs = require('fs');
const path = require('path');
Object.entries = Object.entries || require('object.entries');

function loadResult(file, cb) {
  try {
    const result = require(path.join(__dirname, '../data/', file));
    cb(null, result);
  } catch (e) {
    cb(e, null);
  }
}

function calculateResult(testName, resultOps, baselineOps) {
  const testFailure = (baselineOps <= resultOps) || Math.abs(baselineOps - resultOps) <= baselineOps * 0.1;
  const testResultMessage = testFailure ? 'PASSED' : 'FAILED';
  console.log(testResultMessage, ': ', testName, 'performs', resultOps, ' operations/s. Baseline: ', baselineOps, ' operations/s');
  return testFailure;
}

loadResult('baseline.json', (baselineErr, baseline) => {
  loadResult('result.json', (testResultErr, testResult) => {
    if ((!testResult || testResultErr) && baselineErr) {
      throw new Error(baselineErr);
    }

    if ((!baseline || baselineErr) && testResult) {
      const newbaselines = JSON.stringify(baseline);
      fs.writeFile( path.join(__dirname, 'data/baseline.json'), newbaselines, (err) => {
        if (err) {
          throw new Error(err);
        }
        console.log('New baseline written');
        process.exit(0);
      });
    }

    const baselineTests = Object.entries(baseline);
    if (baselineTests.length !== Object.keys(testResult).length) {
      throw new Error('Inconsistent number of tests, please regenerate baseline');
    }

    let failed = false;
    if (failed) {
      process.exit(1);
    }

    for (let i = 0; i < baselineTests.length; i += 1) {
      const [ testName, baselineResult ] = baselineTests[i];
      const resultMeta = testResult[ testName ];
      const result = calculateResult( testName, parseInt( 1 / resultMeta.time , 10), parseInt( 1 / baselineResult.time , 10))
      
      if (!result) {
        failed = true;
      }
    }

    process.exit(0);
  });
});