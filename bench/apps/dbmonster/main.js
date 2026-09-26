// Port of docs/dbmonster/app.js: raw createVNode calls with explicit flags.
// The op renders one new frame; `startLoop()` drives sustained updates for
// frame-time statistics.
import { createVNode, render } from 'inferno';
import { createOpButton, installHarness } from '../shared/harness.js';
import { seedFromLocation } from '../shared/prng.js';
import { createEnv } from './env.js';

const elem = document.getElementById('app');
const params = new URLSearchParams(location.search);
const env = createEnv({
  seed: seedFromLocation(),
  rows: Number(params.get('rows') ?? 50),
  mutations: Number(params.get('mutations') ?? 0.5),
});

function renderBenchmark(dbs) {
  const length = dbs.length;
  const databases = [];

  for (let i = 0; i < length; i++) {
    const db = dbs[i];
    const lastSample = db.lastSample;
    const children = [
      createVNode(1, 'td', 'dbname', db.dbname, 16, null, null, null),
      createVNode(
        1,
        'td',
        'query-count',
        createVNode(1, 'span', lastSample.countClassName, lastSample.nbQueries, 16, null, null, null),
        2,
        null,
        null,
        null,
      ),
    ];

    for (let i2 = 0; i2 < 5; i2++) {
      const query = lastSample.topFiveQueries[i2];

      children.push(
        createVNode(
          1,
          'td',
          query.elapsedClassName,
          [
            createVNode(1, 'div', null, query.formatElapsed, 16, null, null, null),
            createVNode(
              1,
              'div',
              'popover left',
              [
                createVNode(1, 'div', 'popover-content', query.query, 16, null, null, null),
                createVNode(1, 'div', 'arrow', null, 1, null, null, null),
              ],
              4,
              null,
              null,
              null,
            ),
          ],
          4,
          null,
          null,
          null,
        ),
      );
    }
    databases.push(createVNode(1, 'tr', null, children, 4, null, null, null));
  }

  render(
    createVNode(1, 'table', 'table table-striped', createVNode(1, 'tbody', null, databases, 4, null, null, null), 2, null, null, null),
    elem,
  );
}

function frame() {
  renderBenchmark(env.generateData());
}

let looping = false;
function loop() {
  if (looping) {
    frame();
    requestAnimationFrame(loop);
  }
}

frame();

installHarness({
  root: () => elem,
  op: createOpButton(frame),
  extra: {
    startLoop() {
      looping = true;
      requestAnimationFrame(loop);
    },
    stopLoop() {
      looping = false;
    },
  },
});
