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
		dom: Inferno.universal.createElement('table', { className: 'table table-striped latest-data' }),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'table',
		className: 'table table-striped latest-data',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 2
	};

	var appTemplate2 = {
		dom: Inferno.universal.createElement('tbody'),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tbody',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 3
	};

	var dbTemplate1 = {
		dom: Inferno.universal.createElement('tr'),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tr',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 3
	};

	var dbTemplate2 = {
		dom: Inferno.universal.createElement('td', { className: 'dbname' }),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		className: 'dbname',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 1
	};

	var dbTemplate3 = {
		dom: Inferno.universal.createElement('td', { className: 'query-count' }),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		className: 'query-count',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 2
	};

	var dbTemplate4 = {
		dom: Inferno.universal.createElement('span'),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'span',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: true,
		hasStyle: false,
		childrenType: 1
	};

	var queryTemplate1 = {
		dom: Inferno.universal.createElement('td'),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: true,
		hasStyle: false,
		childrenType: 3
	};

	var queryTemplate2 = {
		dom: Inferno.universal.createElement('span', {className: 'foo'}),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'span',
		className: 'foo',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 1
	};

	var queryTemplate3 = {
		dom: Inferno.universal.createElement('div', { className: 'popover left' }),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'popover left',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 3
	};

	var queryTemplate4 = {
		dom: Inferno.universal.createElement('div', { className: 'popover-content' }),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'popover-content',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 1
	};

	var queryTemplate5 = {
		dom: Inferno.universal.createElement('div', { className: 'arrow' }),
		pools: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'arrow',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	function createQuery(query) {
		return {
			bp: queryTemplate1,
			dom: null,
			children: [
				{
					bp: queryTemplate2,
					dom: null,
					children: query.formatElapsed
				},
				{
					bp: queryTemplate3,
					dom: null,
					children: [
						{
							bp: queryTemplate4,
							dom: null,
							children: query.query
						},
						{
							bp: queryTemplate5,
							dom: null
						}
					]
				}
			],
			className: query.elapsedClassName
		};
	}

	function createDatabase(db) {
		var lastSample = db.lastSample;

		return {
			bp: dbTemplate1,
			dom: null,
			children: [
				{
					bp: dbTemplate2,
					dom: null,
					children: db.dbname
				},
				{
					bp: dbTemplate3,
					dom: null,
					children: {
						bp: dbTemplate4,
						dom: null,
						children: lastSample.nbQueries,
						className: lastSample.countClassName
					}
				}
			].concat(map(createQuery, lastSample.topFiveQueries))
		};
	}

	function render() {
		var dbs = ENV.generateData().toArray();
		Monitoring.renderRate.ping();
		InfernoDOM.render({
			bp: appTemplate1,
			dom: null,
			children: {
				bp: appTemplate2,
				dom: null,
				children: map(createDatabase, dbs)
			}
		}, elem);
		setTimeout(render, ENV.timeout);
	}
	render();
})();
