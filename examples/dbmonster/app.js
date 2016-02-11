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

	var appTemplate1 = {
		dom: Inferno.staticCompiler.createElement('table', { className: 'table table-striped latest-data' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'table',
		className: 'table table-striped latest-data'
	};

	var appTemplate2 = {
		dom: Inferno.staticCompiler.createElement('tbody'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tbody'
	};

	var dbTemplate1 = {
		dom: Inferno.staticCompiler.createElement('tr'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tr'
	};

	var dbTemplate2 = {
		dom: Inferno.staticCompiler.createElement('td', { className: 'dbname' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		className: 'dbname'
	};

	var dbTemplate3 = {
		dom: Inferno.staticCompiler.createElement('td', { className: 'query-count' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		className: 'query-count'
	};

	var dbTemplate4 = {
		dom: Inferno.staticCompiler.createElement('span'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'span'
	};

	var queryTemplate1 = {
		dom: Inferno.staticCompiler.createElement('td'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td'
	};

	var queryTemplate2 = {
		dom: Inferno.staticCompiler.createElement('span', { className: 'foo' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'span',
		className: 'foo'
	};

	var queryTemplate3 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'popover left' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'popover left'
	};

	var queryTemplate4 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'popover-content' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'popover-content'
	};

	var queryTemplate5 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'arrow' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'arrow'
	};

	function createQuery(query) {
		return {
			dom: null,
			static: queryTemplate1,
			children: [
				{
					dom: null,
					static: queryTemplate2,
					children: query.formatElapsed
				},
				{
					dom: null,
					static: queryTemplate3,
					children: [
						{
							dom: null,
							static: queryTemplate4,
							children: query.query
						},
						{
							dom: null,
							static: queryTemplate5
						}
					]
				}
			],
			className: 'Query ' + query.elapsedClassName
		};
	}

	function createDatabase(db) {
		return {
			dom: null,
			static: dbTemplate1,
			children: [
				{
					dom: null,
					static: dbTemplate2,
					children: db.dbname
				},
				{
					dom: null,
					static: dbTemplate3,
					children: {
						dom: null,
						static: dbTemplate4,
						children: db.lastSample.nbQueries,
						className: db.lastSample.countClassName
					}
				}
			].concat(map(createQuery, db.lastSample.topFiveQueries))
		};
	}

	function render() {
		var dbs = ENV.generateData(false).toArray();
		Monitoring.renderRate.ping();
		InfernoDOM.render({
			dom: null,
			static: appTemplate1,
			children: {
				dom: null,
				static: appTemplate2,
				children: map(createDatabase, dbs),
			}
		}, elem);
		setTimeout(render, ENV.timeout);
	}
	render();
})();
