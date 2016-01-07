(function() {
	"use strict";
	var I = 0;
	var N = 100;
	var elem = document.getElementById('app');

	function getCountClassName(db) {
		var count = db.queries.length;
		var className = 'label';
		if (count >= 20) {
			className += ' label-important';
		} else if (count >= 10) {
			className += ' label-warning';
		} else {
			className += ' label-success';
		}
		return className;
	}

	function elapsedClassName(elapsed) {
		var className = 'Query elapsed';
		if (elapsed >= 10.0) {
			className += ' warn_long';
		} else if (elapsed >= 1.0) {
			className += ' warn';
		} else {
			className += ' short';
		}
		return className;
	}

	function formatElapsed(value) {
		if (!value) return '';
		var str = parseFloat(value).toFixed(2);
		if (value > 60) {
			var minutes = Math.floor(value / 60);
			var comps = (value % 60).toFixed(2).split('.');
			var seconds = comps[0].lpad('0', 2);
			var ms = comps[1];
			str = minutes + ":" + seconds + "." + ms;
		}
		return str;
	}

	var query = Inferno.createTemplate(function(elapsedClassName, formatElapsed, query) {
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
	var database = Inferno.createTemplate(function(name, queriesCount, className, queries) {
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
	var dbmon = Inferno.createTemplate(function(databases) {
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

	function createDatabase(db) {
		var queries = [];
		var topFiveQueries = db.getTopFiveQueries();

		for (var i = 0; i < topFiveQueries.length; i++) {
			var topFiveQuery = topFiveQueries[i];

			queries.push(
				query('Query ' + elapsedClassName(topFiveQuery.elapsed), formatElapsed(topFiveQuery.elapsed), topFiveQuery.query)
			);
		}

		return database(db.name, db.queries.length, getCountClassName(db), queries);
	}

	function render() {
		var databases = [];

		for (var i = 0; i < N; i++) {
			databases.push(createDatabase(new Database('cluster' + i)));
			databases.push(createDatabase(new Database('cluster' + i + 'slave')));
		}

		InfernoDOM.render(dbmon(databases), elem);
		Monitoring.renderRate.ping();
		setTimeout(render, 0);
	}
	render();
})();
