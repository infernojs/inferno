// Server rendering: renderToString of the jfb table and uibench states.
import { renderToString } from 'inferno-server';
import { Main } from '../../apps/uibench/components.jsx';
import { config } from '../../apps/uibench/lib.js';
import { defineCase } from './common.js';

let sink = '';

const ROWS = Array.from({ length: 1000 }, (_, i) => ({ id: i + 1, label: `pretty red table ${i}` }));

function JfbRow({ id, label, selected }) {
  return (
    <tr className={selected ? 'danger' : null}>
      <td className="col-md-1" $HasTextChildren>
        {id}
      </td>
      <td className="col-md-4">
        <a $HasTextChildren>{label}</a>
      </td>
      <td className="col-md-1">
        <a>
          <span className="glyphicon glyphicon-remove" aria-hidden="true" />
        </a>
      </td>
      <td className="col-md-6" />
    </tr>
  );
}

function JfbTable() {
  const rows = [];
  for (let i = 0; i < ROWS.length; i++) {
    rows.push(<JfbRow key={ROWS[i].id} id={ROWS[i].id} label={ROWS[i].label} selected={i === 5} />);
  }
  return (
    <table className="table table-hover table-striped test-data">
      <tbody $HasKeyedChildren>{rows}</tbody>
    </table>
  );
}

export const cases = {
  'ssr/jfb-table-1k': defineCase({
    iterations: 100,
    warmup: 20,
    op: () => (sink = renderToString(<JfbTable />)),
    root: () => null,
    output: () => sink,
  }),
};

// uibench cases are registered by uibench.jsx; reuse its initialized config.
for (const name of ['table/[100,4]/render', 'tree/[10,10,10,10]/no_change', 'anim/100/32']) {
  const test = config.tests.find((t) => t.name === name);
  if (test) {
    cases[`ssr/uibench/${name}`] = defineCase({
      iterations: 100,
      warmup: 20,
      op: () => (sink = renderToString(<Main data={test.to} />)),
      root: () => null,
      output: () => sink,
    });
  }
}
