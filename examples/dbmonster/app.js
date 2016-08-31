(function() {
	"use strict";
	var elem = document.getElementById('app');
	var createVTemplateReducers = Inferno.createVTemplateReducers;
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

	var queryTemplate = createVTemplateReducers(function (elapsedClassName, formatElapsed, query) {
		return e('td', { className: elapsedClassName }, [
			e('span', null, text(formatElapsed), null, null, null),
			e('div', { className: 'popover left' }, [
				e('div', { className: 'popover-content' }, text(query), null, null, null),
				e('div', { className: 'arrow' }, null, null, null, null)
			], null, null, null)
		], null, null, null);
	}, InfernoDOM);

	function query(query) {
		return t(queryTemplate, null, query.elapsedClassName, [query.formatElapsed, query.query]);
	}

	var databaseTpl = createVTemplateReducers(function (dbName, countClassName, nbQueries, queries) {
		return e('tr', null, [
			e('td', { className: 'dbname' }, dbName, null, null, ChildrenTypes.STATIC_TEXT),
			e('td', { className: 'query-count' },
				e('span', { className: countClassName }, text(nbQueries), null, null, ChildrenTypes.NODE), null, null, null
			),
			f(queries, ChildrenTypes.NON_KEYED_LIST)
		], null, null, ChildrenTypes.NON_KEYED_LIST);
	}, InfernoDOM);

	function database(db) {
		var lastSample = db.lastSample;
		var queries = [];

		for (var i = 0; i < 5; i++) {
			queries.push(query(lastSample.topFiveQueries[i]));
		}
		return t(databaseTpl, null, db.dbname, [lastSample.countClassName, lastSample.nbQueries, queries]);
	}

	var tableTpl = createVTemplateReducers(function (children) {
		return e('table', { className: 'table table-striped latest-data' },
			e('tbody', null, children, null, null, ChildrenTypes.NON_KEYED_LIST), null, null, null
		);
	}, InfernoDOM);

	function render() {
		var dbs = ENV.generateData(false).toArray();
		perfMonitor.startProfile('view update');
		InfernoDOM.render(
			t(tableTpl, null, map(database, dbs), null),
			elem
		);
		perfMonitor.endProfile('view update');
		setTimeout(render, ENV.timeout);
	}
	render();
})();
