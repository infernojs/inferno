import {startFPSMonitor, startMemMonitor, initProfiler, startProfile, endProfile} from 'perf-monitor';
import {createVNode, render} from 'inferno';

var elem = document.getElementById('app');

startFPSMonitor();
startMemMonitor();
initProfiler('view update');

function renderBenchmark(dbs) {
  var length = dbs.length;
  var databases = [];

  for (var i = 0; i < length; i++) {
    var db = dbs[i];
    var lastSample = db.lastSample;
    var children = [
      createVNode(1, 'td', 'dbname', db.dbname, 16),
      createVNode(1, 'td', 'query-count',
        createVNode(1, 'span', lastSample.countClassName, lastSample.nbQueries, 16),
        2)
    ];

    for (var i2 = 0; i2 < 5; i2++) {
      var query = lastSample.topFiveQueries[i2];

      children.push(createVNode(1, 'td', query.elapsedClassName, [
        createVNode(1, 'div', null, query.formatElapsed, 16),
        createVNode(1, 'div', 'popover left', [
          createVNode(1, 'div', 'popover-content', query.query, 16),
          createVNode(1, 'div', 'arrow')
        ], 4)
      ], 4));
    }
    databases.push(createVNode(1, 'tr', null, children, 4));
  }

  render(
    createVNode(1, 'table', 'table table-striped', createVNode(1, 'tbody', null, databases, 4), 2),
    elem);
}

function loop() {
  var dbs = ENV.generateData(false).toArray();
  startProfile('view update');
  renderBenchmark(dbs);
  endProfile('view update');
}

setInterval(loop, ENV.timeout);
