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
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'table',
		className: 'table table-striped latest-data'
	};

	var appTemplate2 = {
		dom: Inferno.staticCompiler.createElement('tbody'),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tbody'
	};

	var dbTemplate1 = {
		dom: Inferno.staticCompiler.createElement('tr'),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tr'
	};

	var dbTemplate2 = {
		dom: Inferno.staticCompiler.createElement('td', { className: 'dbname' }),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		className: 'dbname'
	};

	var dbTemplate3 = {
		dom: Inferno.staticCompiler.createElement('td', { className: 'query-count' }),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		className: 'query-count'
	};

	var dbTemplate4 = {
		dom: Inferno.staticCompiler.createElement('span'),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'span'
	};

	var queryTemplate1 = {
		dom: Inferno.staticCompiler.createElement('td'),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td'
	};

	var queryTemplate2 = {
		dom: Inferno.staticCompiler.createElement('span', {className: 'foo'}),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'span',
		className: 'foo'
	};

	var queryTemplate3 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'popover left' }),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'popover left'
	};

	var queryTemplate4 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'popover-content' }),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'popover-content'
	};

	var queryTemplate5 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'arrow' }),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'arrow'
	};

	function createQuery(query) {
		return {
			tpl: queryTemplate1,
			dom: null,
			children: [
				{
					tpl: queryTemplate2,
					dom: null,
					children: query.formatElapsed
				},
				{
					tpl: queryTemplate3,
					dom: null,
					children: [
						{
							tpl: queryTemplate4,
							dom: null,
							children: query.query
						},
						{
							tpl: queryTemplate5,
							dom: null
						}
					]
				}
			],
			className: query.elapsedClassName
		};
	}

	function createDatabase(db) {
		return {
			tpl: dbTemplate1,
			dom: null,
			children: [
				{
					tpl: dbTemplate2,
					dom: null,
					children: db.dbname
				},
				{
					tpl: dbTemplate3,
					dom: null,
					children: {
						tpl: dbTemplate4,
						dom: null,
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
			tpl: appTemplate1,
			dom: null,
			children: {
				tpl: appTemplate2,
				dom: null,
				children: map(createDatabase, dbs)
			}
		}, elem);
		setTimeout(render, ENV.timeout);
	}
	render();
})();
