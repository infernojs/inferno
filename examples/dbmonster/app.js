(function() {
	"use strict";
	var elem = document.getElementById('app');

	//allows support in < IE9
	function map(func, array) {
		var newArray = new Array(array.length);
		for (var i = 0; i < array.length; i++) {
			newArray[i] = func(array[i]);
		}
		return newArray;
	}

	var queryTemplate1 = Inferno.createBlueprint({
		tag: 'td',
		className: {arg: 0},
		children: {arg: 1}
	}, 4);

	var queryTemplate2 = Inferno.createBlueprint({
		tag: 'span',
		className: 'foo',
		children: {arg: 0}
	}, 1);

	var queryTemplate3 = Inferno.createBlueprint({
		tag: 'div',
		className: 'popover left',
		children: {arg: 0}
	}, 4);

	var queryTemplate4 = Inferno.createBlueprint({
		tag: 'div',
		className: 'popover-content',
		children: {arg: 0}
	}, 1);

	var queryTemplate5 = Inferno.createBlueprint({
		tag: 'div',
		className: 'arrow'
	}, 0);

	function createQuery(query) {
		return queryTemplate1(query.elapsedClassName, [
			queryTemplate2(query.formatElapsed),
			queryTemplate3([
				queryTemplate4(query.query),
				queryTemplate5()
			])
		]);
	}

	var dbTemplate1 = Inferno.createBlueprint({
		tag: 'tr',
		children: {arg: 0}
	}, 4);

	var dbTemplate2 = Inferno.createBlueprint({
		tag: 'td',
		className: 'dbname',
		children: {arg: 0}
	}, 1);

	var dbTemplate3 = Inferno.createBlueprint({
		tag: 'td',
		className: 'query-count',
		children: {arg: 0}
	}, 2);

	var dbTemplate4 = Inferno.createBlueprint({
		tag: 'span',
		className: {arg: 0},
		children: {arg: 1}
	}, 1);

	function createDatabase(db) {
		var lastSample = db.lastSample;
		var children = [
			dbTemplate2(db.dbname),
			dbTemplate3(dbTemplate4(lastSample.countClassName, lastSample.nbQueries))
		];

		for (var i = 0; i < 5; i++) {
			children.push(createQuery(lastSample.topFiveQueries[i]))
		}

		return dbTemplate1(children);
	}

	var appTemplate1 = Inferno.createBlueprint({
		tag: 'table',
		className: 'table table-striped latest-data',
		children: {arg: 0}
	}, 2);

	var appTemplate2 = Inferno.createBlueprint({
		tag: 'tbody',
		children: {arg: 0}
	}, 4);

	function render() {
		var dbs = ENV.generateData().toArray();
		Monitoring.renderRate.ping();
		InfernoDOM.render(appTemplate1(appTemplate2(map(createDatabase, dbs))), elem);
		setTimeout(render, ENV.timeout);
	}
	render();
})();
