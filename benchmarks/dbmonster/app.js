(function() {
	"use strict";
	var elem = document.getElementById('app');

	perfMonitor.startFPSMonitor();
	perfMonitor.startMemMonitor();
	perfMonitor.initProfiler('view update');

	var createVNode = Inferno.createVNode;

	function renderBenchmark(dbs) {
		var length = dbs.length;
		var databases = new Array(length);

		for (var i = 0; i < length; i++) {
			var db = dbs[i];
			var lastSample = db.lastSample;
			var children = new Array(7);

			children[0] = createVNode(2, 'td', 'dbname', db.dbname, null, null, null);
			children[1] = createVNode(2, 'td', 'query-count',
				createVNode(2, 'span', lastSample.countClassName, lastSample.nbQueries, null, null, null),
			null, null, null);

			for (var i2 = 0; i2 < 5; i2++) {
				var query = lastSample.topFiveQueries[i2];

				children[i2 + 2] = createVNode(66, 'td', query.elapsedClassName, [
					createVNode(2, 'div', 'foo', query.formatElapsed, null, null, null),
					createVNode(66, 'div', 'popover left', [
						createVNode(2, 'div', 'popover-content', query.query, null, null, null),
						createVNode(2, 'div', 'arrow', null, null, null, null)
					], null, null, null)
				], null, null, null);
			}
			databases[i] = createVNode(66, 'tr', null, children, null, null, null);
		}

		Inferno.render(
			createVNode(2, 'table', 'table table-striped latest-data', createVNode(66, 'tbody', null, databases, null, null, null), null, null, null),
		elem);
	}

	function render() {
		var dbs = ENV.generateData(false).toArray();
		perfMonitor.startProfile('view update');
		renderBenchmark(dbs);
		perfMonitor.endProfile('view update');
		setTimeout(render, ENV.timeout);
	}
	render();
})();
