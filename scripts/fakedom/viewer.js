import { BarChart, LineChart } from 'chartist';
import { readFileSync } from 'fs';
import Table from 'cli-table';

const baseLineStr = readFileSync('./scripts/fakedom/results/inferno_base_line.json').toString();
const baseLineJson = JSON.parse(baseLineStr);

function buildChartData(stats, name) {
  let labels = [];
  for (let i = 0; i < stats.length; i++) {
    labels.push(`${name} R:${i}`)
  }

  const table = new Table(head);

  for (let r = 0; r  < stats.length; r++) {
    const statsRow = stats[r];
    const tr = [`Round ${r}`]

    for (const testStat of statsRow) {
      tr.push(testStat.cpu)
    }

    table.push(tr);
  }

  console.log(table.toString());
}

buildChartData(baseLineJson, 'base');

new LineChart('.ct-chart', {
  labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  series: [
    [12, 9, 7, 8, 5],
    [2, 1, 3.5, 7, 3],
    [1, 3, 4, 5, 6]
  ]
}, {
  fullWidth: true,
  chartPadding: {
    right: 40
  }
});
