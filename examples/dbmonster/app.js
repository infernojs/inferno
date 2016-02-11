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
		events: null,
		className: 'table table-striped latest-data',
		style: null,
		children: null,
		nextNode: null,
		instance: null
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
		events: null,
		className: null,
		style: null,
		children: null,
		nextNode: null,
		instance: null
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
		events: null,
		className: null,
		style: null,
		children: null,
		nextNode: null,
		instance: null
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
		events: null,
		className: 'dbname',
		style: null,
		children: null,
		nextNode: null,
		instance: null
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
		events: null,
		className: 'query-count',
		style: null,
		children: null,
		nextNode: null,
		instance: null
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
		events: null,
		children: null,
		nextNode: null,
		instance: null
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
		events: null,
		className: null,
		style: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var queryTemplate2 = {
		dom: Inferno.staticCompiler.createElement('span', { className: 'foo' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'span',
		key: null,
		attrs: null,
		events: null,
		className: 'foo',
		style: null,
		children: null,
		nextNode: null,
		instance: null
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
		events: null,
		className: 'popover left',
		style: null,
		children: null,
		nextNode: null,
		instance: null
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
		events: null,
		className: 'popover-content',
		style: null,
		children: null,
		nextNode: null,
		instance: null
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
		events: null,
		className: 'arrow',
		style: null,
		children: null,
		nextNode: null,
		instance: null
	};

	function createQuery(query) {
		return {
			dom: null,
			static: queryTemplate1,
			tag: null,
			key: null,
			attrs: null,
			events: null,
			className: query.elapsedClassName,
			style: null,
			children: [
				{
					dom: null,
					static: queryTemplate2,
					tag: null,
					key: null,
					attrs: null,
					events: null,
					className: null,
					style: null,
					children: query.formatElapsed,
					nextNode: null,
					instance: null
				},
				{
					dom: null,
					static: queryTemplate3,
					tag: null,
					key: null,
					attrs: null,
					events: null,
					className: null,
					style: null,
					children: [
						{
							dom: null,
							static: queryTemplate4,
							tag: null,
							key: null,
							attrs: null,
							events: null,
							className: null,
							style: null,
							children: query.query,
							nextNode: null,
							instance: null
						},
						{
							dom: null,
							static: queryTemplate5,
							tag: null,
							key: null,
							attrs: null,
							events: null,
							className: null,
							style: null,
							children: null,
							nextNode: null,
							instance: null
						}
					],
					nextNode: null,
					instance: null
				}
			],
			nextNode: null,
			instance: null
		};
	}

	function createDatabase(db) {
		var children = new Array(7);
		children[0] = {
			dom: null,
			static: dbTemplate2,
			tag: null,
			key: null,
			attrs: null,
			events: null,
			className: null,
			style: null,
			children: db.dbname,
			nextNode: null,
			instance: null
		};
		children[1] = {
			dom: null,
			static: dbTemplate3,
			tag: null,
			key: null,
			attrs: null,
			events: null,
			className: null,
			style: null,
			children: {
				dom: null,
				static: dbTemplate4,
				tag: null,
				key: null,
				attrs: null,
				events: null,
				className: db.lastSample.countClassName,
				style: null,
				children: db.lastSample.nbQueries,
				nextNode: null,
				instance: null
			},
			nextNode: null,
			instance: null
		};
		for (var i = 0; i < 5; i++) {
			children[i + 2] = (createQuery(db.lastSample.topFiveQueries[i]));
		}
		return {
			dom: null,
			static: dbTemplate1,
			tag: null,
			key: null,
			attrs: null,
			events: null,
			className: null,
			style: null,
			children: children,
			nextNode: null,
			instance: null
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
			events: null,
			className: null,
			style: null,
			children: {
				dom: null,
				static: appTemplate2,
				tag: null,
				key: null,
				attrs: null,
				events: null,
				className: null,
				style: null,
				children: map(createDatabase, dbs),
				nextNode: null,
				instance: null
			},
			nextNode: null,
			instance: null
		}, elem);
		setTimeout(render, ENV.timeout);
	}
	render();
})();
