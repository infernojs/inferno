// Port of docs/dbmonster/ENV.js (keepIdentity=false path) as an ES module.
// Math.random is replaced with a seeded PRNG so every run renders the same frames,
// and the mutation-ratio slider UI is replaced by the `mutations` option.
import { createRandom } from '../shared/prng.js';

function formatElapsed(value) {
  if (value > 60) {
    const comps = (value % 60).toFixed(2).split('.');
    return Math.floor(value / 60) + ':' + comps[0].padStart(2, '0') + '.' + comps[1];
  }
  return parseFloat(value).toFixed(2);
}

function getElapsedClassName(elapsed) {
  let className = 'Query elapsed';
  if (elapsed >= 10.0) {
    className += ' warn_long';
  } else if (elapsed >= 1.0) {
    className += ' warn';
  } else {
    className += ' short';
  }
  return className;
}

function countClassName(queries) {
  let className = 'label';
  if (queries >= 20) {
    className += ' label-important';
  } else if (queries >= 10) {
    className += ' label-warning';
  } else {
    className += ' label-success';
  }
  return className;
}

function cleanQuery() {
  return { query: '***', formatElapsed: '', elapsedClassName: '' };
}

export function createEnv({ seed = 1, rows = 50, mutations = 0.5 } = {}) {
  const random = createRandom(seed);
  let counter = 0;
  let data;

  function updateQuery(object) {
    const elapsed = random() * 15;
    object.elapsed = elapsed;
    object.formatElapsed = formatElapsed(elapsed);
    object.elapsedClassName = getElapsedClassName(elapsed);
    object.query = 'SELECT blah FROM something';
    object.waiting = random() < 0.5;
    if (random() < 0.2) {
      object.query = '<IDLE> in transaction';
    }
    if (random() < 0.1) {
      object.query = 'vacuum';
    }
    return object;
  }

  function generateRow(object) {
    const nbQueries = Math.floor(random() * 10 + 1);
    object.lastMutationId = counter;
    object.nbQueries = nbQueries;
    object.lastSample = { topFiveQueries: [], queries: [] };
    for (let j = 0; j < 12; j++) {
      object.lastSample.queries.push(j < nbQueries ? updateQuery(cleanQuery()) : cleanQuery());
    }
    for (let i = 0; i < 5; i++) {
      object.lastSample.topFiveQueries[i] = object.lastSample.queries[i];
    }
    object.lastSample.nbQueries = nbQueries;
    object.lastSample.countClassName = countClassName(nbQueries);
    return object;
  }

  function generateData() {
    const oldData = data;
    data = [];
    for (let i = 1; i <= rows; i++) {
      data.push({ dbname: 'cluster' + i, query: '', formatElapsed: '', elapsedClassName: '' });
      data.push({ dbname: 'cluster' + i + ' replica', query: '', formatElapsed: '', elapsedClassName: '' });
    }
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (oldData && oldData[i]) {
        row.lastSample = oldData[i].lastSample;
      }
      if (!row.lastSample || random() < mutations) {
        counter = counter + 1;
        generateRow(row);
      } else {
        data[i] = oldData[i];
      }
    }
    return data;
  }

  return { generateData };
}
