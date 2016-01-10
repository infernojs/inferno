(function() {
	"use strict";
	var elem = document.getElementById('app');

	var queryTemplate = Inferno.createTemplate(function(elapsedClassName, formatElapsed, query) {
		return {
			tag: 'td',
			attrs: { className: elapsedClassName },
			children: [
				{
					tag: 'span',
					className: 'foo',
					text: formatElapsed
				},
				{
					tag: 'div',
					attrs: { className: 'popover left' },
					children: [
						{
							tag: 'div',
							attrs: { className: 'popover-content' },
							text: query
						},
						{
							tag: 'div',
							attrs: { className: 'arrow' }
						}
					]
				}
			]
		};
	});
	var databaseTemplate = Inferno.createTemplate(function(name, queriesCount, className, queries) {
		return {
			key: name,
			tag: 'tr',
			children: [
				{
					tag: 'td',
					className: 'dbname',
					text: name
				},
				{
					tag: 'td',
					className: 'query-count',
					children: {
						tag: 'span',
						attrs: { className: className },
						text: queriesCount
					}
				},
				queries
			]
		};
	});
	var appTemplate = Inferno.createTemplate(function(databases) {
		return {
			tag: 'div',
			children: {
				tag: 'table',
				attrs: {
					className: 'table table-striped latest-data'
				},
				children: {
					tag: 'tbody',
					children: databases
				}
			}
		};
	});

	//allows support in < IE9
	function map(func, array) {
		var newArray = new Array(array.length);
		for (var i = 0; i < array.length; i++) {
			newArray[i] = func(array[i]);
		}
		return newArray;
	}

	function createQuery(query) {
		return queryTemplate('Query ' + query.elapsedClassName, query.formatElapsed, query.query);
	}

	function createDatabase(db) {
		return databaseTemplate(db.dbname, db.lastSample.nbQueries, db.lastSample.countClassName, map(createQuery, db.lastSample.topFiveQueries));
	}

	function render() {
		var dbs = ENV.generateData().toArray();

		InfernoDOM.render(appTemplate(map(createDatabase, dbs)), elem);

		Monitoring.renderRate.ping();
		setTimeout(render, ENV.timeout);
	}
	render();
})();
