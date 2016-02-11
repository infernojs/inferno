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
		key: null,
		attrs: null,
		children: null,
		nextItem: null,
		className: 'table table-striped latest-data'
	};

	var appTemplate2 = {
		dom: Inferno.staticCompiler.createElement('tbody'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tbody',
		key: null,
		attrs: null,
		children: null,
		nextItem: null,
		className: null
	};

	var dbTemplate1 = {
		dom: Inferno.staticCompiler.createElement('tr'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tr',
		key: null,
		attrs: null,
		children: null,
		nextItem: null,
		className: null
	};

	var dbTemplate2 = {
		dom: Inferno.staticCompiler.createElement('td', { className: 'dbname' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		key: null,
		attrs: null,
		children: null,
		nextItem: null,
		className: 'dbname'
	};

	var dbTemplate3 = {
		dom: Inferno.staticCompiler.createElement('td', { className: 'query-count' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		key: null,
		attrs: null,
		children: null,
		nextItem: null,
		className: 'query-count'
	};

	var dbTemplate4 = {
		dom: Inferno.staticCompiler.createElement('span'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'span',
		key: null,
		attrs: null,
		children: null,
		nextItem: null,
		className: null
	};

	var queryTemplate1 = {
		dom: Inferno.staticCompiler.createElement('td'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		key: null,
		attrs: null,
		children: null,
		nextItem: null,
		className: null
	};

	var queryTemplate2 = {
		dom: Inferno.staticCompiler.createElement('span', { className: 'foo' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'span',
		key: null,
		attrs: { className: 'foo' },
		children: null,
		nextItem: null,
		className: 'foo'
	};

	var queryTemplate3 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'popover left' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		key: null,
		attrs: null,
		children: null,
		nextItem: null,
		className: 'popover left'
	};

	var queryTemplate4 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'popover-content' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		key: null,
		attrs: null,
		children: null,
		nextItem: null,
		className: 'popover-content'
	};

	var queryTemplate5 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'arrow' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		key: null,
		attrs: null,
		children: null,
		nextItem: null,
		className: 'arrow'
	};

	function createQuery(query) {
		return {
			dom: null,
			static: queryTemplate1,
			tag: null,
			key: null,
			attrs: null,
			children: [
				{
					dom: null,
					static: queryTemplate2,
					tag: null,
					key: null,
					attrs: null,
					children: query.formatElapsed,
					nextItem: null,
					className: null
				},
				{
					dom: null,
					static: queryTemplate3,
					tag: null,
					key: null,
					attrs: null,
					children: [
						{
							dom: null,
							static: queryTemplate4,
							tag: null,
							key: null,
							attrs: null,
							children: query.query,
							nextItem: null,
							className: null
						},
						{
							dom: null,
							static: queryTemplate5,
							tag: null,
							key: null,
							attrs: null,
							children: null,
							nextItem: null,
							className: null
						}
					],
					nextItem: null,
					className: null
				}
			],
			nextItem: null,
			className: 'Query ' + query.elapsedClassName
		};
	}

	function createDatabase(db) {
		return {
			dom: null,
			static: dbTemplate1,
			tag: null,
			key: null,
			attrs: null,
			children: [
				{
					dom: null,
					static: dbTemplate2,
					tag: null,
					key: null,
					attrs: null,
					children: db.dbname,
					nextItem: null,
					className: null
				},
				{
					dom: null,
					static: dbTemplate3,
					tag: null,
					key: null,
					attrs: null,
					children: {
						dom: null,
						static: dbTemplate4,
						tag: null,
						key: null,
						attrs: null,
						children: db.lastSample.nbQueries,
						nextItem: null,
						className: db.lastSample.countClassName
					},
					nextItem: null,
					className: null
				}
			].concat(map(createQuery, db.lastSample.topFiveQueries)),
			nextItem: null,
			className: null
		};
	}

	function render() {
		var dbs = ENV.generateData(false).toArray();
		Monitoring.renderRate.ping();
		InfernoDOM.render({
			dom: null,
			static: appTemplate1,
			tag: null,
			key: null,
			attrs: null,
			children: {
				dom: null,
				static: appTemplate2,
				tag: null,
				key: null,
				attrs: null,
				children: map(createDatabase, dbs),
				nextItem: null,
				className: null
			},
			nextItem: null,
			className: null
		}, elem);
		setTimeout(render, ENV.timeout);
	}
	render();
})();
