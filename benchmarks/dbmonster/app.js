(function() {
	"use strict";
	var elem = document.getElementById('app');
	Inferno.options.recyclingEnabled = true; // Advanced optimisation

	perfMonitor.startFPSMonitor();
	perfMonitor.startMemMonitor();
	perfMonitor.initProfiler('view update');

	var createVNode = Inferno.createVNode;
	var tableProps = {
		className: 'table table-striped latest-data'
	};
	var dbName = {
		className: 'dbname'
	};
	var dbQueryCount = {
		className: 'query-count'
	};
	var foo = {
		className: 'foo'
	};
	var popoverLeft = {
		className: 'popover left'
	};
	var popoverContent = {
		className: 'popover-content'
	};

	function renderBenchmark(dbs) {
		var length = dbs.length;
		var databases = new Array(length);

		for (var i = 0; i < length; i++) {
			var db = dbs[i];
			var lastSample = db.lastSample;
			var children = new Array(7);

			children[0] = createVNode(2, 'td', dbName, db.dbname, null, null, null, true);
			children[1] = createVNode(2, 'td', dbQueryCount, createVNode(2, 'span', {
				className: lastSample.countClassName
			}, lastSample.nbQueries, null, null, null, true), null, null, null, true);

			for (var i2 = 0; i2 < 5; i2++) {
				var query = lastSample.topFiveQueries[i2];

				children[i2 + 2] = createVNode(66, 'td', {
					className: query.elapsedClassName
				}, [
					createVNode(2, 'div', foo, query.formatElapsed, null, null, null, true),
					createVNode(66, 'div', popoverLeft, [
						createVNode(2, 'div', popoverContent, query.query, null, null, null, true),
						createVNode(2, 'div', { className: 'arrow' }, null, null, null, null, true)
					], null, null, null, true)
				], null, null, null, true);
			}
			databases[i] = createVNode(66, 'tr', null, children, null, null, null, true);
		}

		Inferno.render(
			createVNode(2, 'table', tableProps, createVNode(66, 'tbody', null, databases, null, null, null, true), null, null, null, true),
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
