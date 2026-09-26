// js-framework-benchmark operations on the exact app components used in the
// browser (apps/jfb-*/app.jsx), driven by clicks dispatched through the shim so
// Inferno's delegated event handling and linkEvent paths are included.
import { render } from 'inferno';
import { Main as KeyedMain } from '../../apps/jfb-keyed/app.jsx';
import { Main as NonKeyedMain } from '../../apps/jfb-nonkeyed/app.jsx';
import { byClass, byId, children, click, defineCase, newContainer } from './common.js';

function jfbCases(prefix, Main) {
  let container = null;
  let tbody = null;

  const mount = () => {
    if (container === null) {
      container = newContainer();
      render(<Main />, container);
      tbody = byClass(container, 'test-data').childNodes[0];
    }
  };
  const button = (id) => byId(container, id);
  const rows = () => children(tbody);
  const ensureRows = (n) => {
    if (rows().length !== n) {
      click(button(n === 10000 ? 'runlots' : 'run'));
    }
  };
  // Row i -> <tr><td/><td><a label/></td><td><a delete/></td>...
  const labelAnchor = (i) => children(children(rows()[i])[1])[0];
  const deleteAnchor = (i) => children(children(rows()[i])[2])[0];

  // Targets are resolved in prepare so lookups never land in the measured window.
  let target = null;
  const base = { setup: mount, root: () => container, op: () => click(target) };
  const clickCase = (def, prepare) => defineCase({ ...base, ...def, prepare });
  return {
    [`${prefix}/01_run1k`]: clickCase({ iterations: 60, warmup: 10 }, () => {
      click(button('clear'));
      target = button('run');
    }),
    [`${prefix}/02_replace1k`]: clickCase({ iterations: 60, warmup: 10 }, () => {
      ensureRows(1000);
      target = button('run');
    }),
    [`${prefix}/03_update10th1k`]: clickCase({ iterations: 200 }, () => {
      ensureRows(1000);
      target = button('update');
    }),
    // Alternate rows so every op changes the selection.
    [`${prefix}/04_select1k`]: clickCase({ iterations: 400 }, (i) => {
      ensureRows(1000);
      target = labelAnchor(i % 2 === 0 ? 1 : 4);
    }),
    [`${prefix}/05_swap1k`]: clickCase({ iterations: 400 }, () => {
      ensureRows(1000);
      target = button('swaprows');
    }),
    [`${prefix}/06_remove-one-1k`]: clickCase({ iterations: 400 }, () => {
      if (rows().length < 990) {
        click(button('run'));
      }
      target = deleteAnchor(3);
    }),
    [`${prefix}/07_create10k`]: clickCase({ iterations: 8, warmup: 2 }, () => {
      click(button('clear'));
      target = button('runlots');
    }),
    [`${prefix}/08_create1k-after1k`]: clickCase({ iterations: 40, warmup: 8 }, () => {
      click(button('run'));
      target = button('add');
    }),
    [`${prefix}/09_clear1k`]: clickCase({ iterations: 60, warmup: 10 }, () => {
      click(button('run'));
      target = button('clear');
    }),
  };
}

export const cases = {
  ...jfbCases('jfb/keyed', KeyedMain),
  ...jfbCases('jfb/nonkeyed', NonKeyedMain),
};
