(function() {
	"use strict";
	var elem = document.getElementById('app');
	var t = Inferno.createVTemplate;
	var e = Inferno.createVElement;
	var c = Inferno.createVComponent;
	var f = Inferno.createVFragment;
	var text = Inferno.createVText;
	var ChildrenTypes = Inferno.ChildrenTypes;

	perfMonitor.startFPSMonitor();
	perfMonitor.startMemMonitor();
	perfMonitor.initProfiler('view update');

	//allows support in < IE9
	function map(func, array) {
		var newArray = new Array(array.length);
		for (var i = 0; i < array.length; i++) {
			newArray[i] = func(array[i]);
		}
		return newArray;
	}

	var queryTemplate = t(function (elapsedClassName, formatElapsed, query) {
		return e('td').props({ className: elapsedClassName }).children([
			e('span').children(text(formatElapsed)),
			e('div').props({ className: 'popover left' }).children(
				e('div').props({ className: 'popover-content' }).children(text(query)),
				e('div').props({ className: 'arrow' })
			)
		]);
	}, InfernoDOM);

	function query(query) {
		return queryTemplate(query.elapsedClassName, query.formatElapsed, query.query);
	}

	var databaseTpl = t(function (dbName, countClassName, nbQueries, queries) {
		return e('tr')
			.children([
				e('td').props({ className: 'dbname' }).children(dbName).childrenType(ChildrenTypes.STATIC_TEXT),
				e('td').props({ className: 'query-count' }).children(
					e('span').props({ className: countClassName }).children(text(nbQueries))
				),
				f(queries).childrenType(ChildrenTypes.NON_KEYED_LIST)
			]).childrenType(ChildrenTypes.NON_KEYED_LIST);
	}, InfernoDOM);

	function database(db) {
		var lastSample = db.lastSample;
		var queries = [];

		for (var i = 0; i < 5; i++) {
			queries.push(query(lastSample.topFiveQueries[i]))
		}
		return databaseTpl(db.dbname, lastSample.countClassName, lastSample.nbQueries, queries);
	}

	var tableTpl = t(function (children) {
		return e('table')
			.props({ className: 'table table-striped latest-data' })
			.children(
				e('tbody').children(children).childrenType(ChildrenTypes.NON_KEYED_LIST)
			);
	}, InfernoDOM);

	function render() {
		var dbs = ENV.generateData(false).toArray();
		perfMonitor.startProfile('view update');
		InfernoDOM.render(
			tableTpl((map(database, dbs))),
			elem
		);
		perfMonitor.endProfile('view update');
		setTimeout(render, ENV.timeout);
	}
	render();
})();
