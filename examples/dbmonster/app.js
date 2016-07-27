(function() {
	"use strict";
	var elem = document.getElementById('app');
	var t = Inferno.createVTemplate;
	var c = Inferno.createVComponent;

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

	// var queryTemplate1 = Inferno.createBlueprint({
	// 	tag: 'td',
	// 	className: {arg: 0},
	// 	children: {arg: 1}
	// }, 4);

	// var queryTemplate2 = Inferno.createBlueprint({
	// 	tag: 'span',
	// 	className: 'foo',
	// 	children: {arg: 0}
	// }, 1);

	// var queryTemplate3 = Inferno.createBlueprint({
	// 	tag: 'div',
	// 	className: 'popover left',
	// 	children: {arg: 0}
	// }, 4);

	// var queryTemplate4 = Inferno.createBlueprint({
	// 	tag: 'div',
	// 	className: 'popover-content',
	// 	children: {arg: 0}
	// }, 1);

	// var queryTemplate5 = Inferno.createBlueprint({
	// 	tag: 'div',
	// 	className: 'arrow'
	// }, 0);

	// var queryTemplate6 = Inferno.createBlueprint({
	// 	tag: { arg: 0 },
	// 	attrs: { arg: 1 },
	// 	hooks: { arg: 2 }
	// }, 0);

	function Query(props) {
		var query = props.query;
		return e('td').props({ className: query.elapsedClassName }).children([
			e('span').children(query.formatElapsed),
			e('div').props({ className: 'popover left' }).children(
				e('div').props({ className: 'popover-content' }).children(query.query),
				e('div').props({ className: 'arrow' })
			)
		]);
	}

	var queryHooks = {
		componentShouldUpdate: function(domNode, lastProps, nextProps) {
			return lastProps.query !== nextProps.query || lastProps.elapsed !== nextProps.elapsed;
		}
	};

	function renderQuery(query) {
		return c(Query).props({ query: query, elapsed: query.elapsed }).hooks(queryHooks);
	}

	function Database(props) {
		var db = props.db;
		var lastSample = db.lastSample;
		var children = [
			e('td').props({ className: 'dbname' }).children(db.dbname),
			e('td').props({ className: 'query-count' }).children(
				e('span').props({ className: lastSample.countClassName }).children(lastSample.nbQueries)
			)
		];

		for (var i = 0; i < 5; i++) {
			children.push(renderQuery(lastSample.topFiveQueries[i]))
		}
		return e('tr').children(children)
	}

	var databaseHooks = {
		componentShouldUpdate: function(domNode, lastProps, nextProps) {
			return lastProps.lastMutationId !== nextProps.lastMutationId;
		}
	};

	function createDatabase(db) {
		return c(Database).props({ db: db, lastMutationId: db.lastMutationId }).hooks(databaseHooks);
	}

	function render() {
		var dbs = ENV.generateData(true).toArray();
		perfMonitor.startProfile('view update');
		InfernoDOM.render(
			e('table')
				.props({ className: 'table table-striped latest-data' })
				.children(
					e('tbody').children((map(createDatabase, dbs)))
				),
			elem
		);
		perfMonitor.endProfile('view update');
		setTimeout(render, ENV.timeout);
	}
	render();
})();
