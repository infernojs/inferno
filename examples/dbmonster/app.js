(function() {
	"use strict";
	var elem = document.getElementById('app');
	var e = Inferno.createStaticVElement;
	var f = Inferno.createVFragment;
	var bp = Inferno.createOptBlueprint;
	var text = Inferno.createVText;
	var ValueTypes = Inferno.ValueTypes;
	var ChildrenTypes = Inferno.ChildrenTypes;
	var NodeTypes = Inferno.NodeTypes;

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

	var bp1 = bp(e('td'), ValueTypes.PROPS_CLASS_NAME, ValueTypes.CHILDREN_NON_KEYED, null);
	var bp2 = bp(e('span'), ValueTypes.CHILDREN_NODE, null, null);
	var bp3 = bp(e('div', { className: 'popover left' }), ValueTypes.CHILDREN_NON_KEYED, null, null);
	var bp4 = bp(e('div', { className: 'popover-content' }), ValueTypes.CHILDREN_NODE, null, null);
	var bp5 = bp(e('div', { className: 'arrow' }), null, null, null);

	var staticNode = {
		bp: bp5,
		dom: null,
		type: NodeTypes.OPT_ELEMENT,
		v0: null,
		v1: null
	};

	function query(query) {
		return {
			bp: bp1,
			dom: null,
			type: NodeTypes.OPT_ELEMENT,
			v0: query.elapsedClassName,
			v1: [
				{
					bp: bp2,
					dom: null,
					type: NodeTypes.OPT_ELEMENT,
					v0: {
						dom: null,
						type: NodeTypes.TEXT,
						text: query.formatElapsed
					},
					v1: null
				},
				{
					bp: bp3,
					dom: null,
					type: NodeTypes.OPT_ELEMENT,
					v0: [
						{
							bp: bp4,
							dom: null,
							type: NodeTypes.OPT_ELEMENT,
							v0: {
								dom: null,
								type: NodeTypes.TEXT,
								text: query.query
							},
							v1: null
						},
						staticNode
					],
					v1: null
				}
			]
		};
	}

	var bp6 = bp(e('tr'), ValueTypes.CHILDREN_NON_KEYED, null, null);
	var bp7 = bp(e('td', { className: 'dbname' }), ValueTypes.CHILDREN_TEXT, null, null);
	var bp8 = bp(e('td', { className: 'query-count' }), ValueTypes.CHILDREN_NODE, null, null);
	var bp9 = bp(e('span'), ValueTypes.PROPS_CLASS_NAME, ValueTypes.CHILDREN_NODE, null);

	function database(db) {
		var lastSample = db.lastSample;
		var queries = [];

		for (var i = 0; i < 5; i++) {
			queries.push(query(lastSample.topFiveQueries[i]));
		}
		return {
			bp: bp6,
			dom: null,
			type: NodeTypes.OPT_ELEMENT,
			v0: [
				{
					bp: bp7,
					dom: null,
					type: NodeTypes.OPT_ELEMENT,
					v0: db.dbname,
					v1: null
				},
				{
					bp: bp8,
					dom: null,
					type: NodeTypes.OPT_ELEMENT,
					v0: {
						bp: bp9,
						dom: null,
						type: NodeTypes.OPT_ELEMENT,
						v0: lastSample.countClassName,
						v1: {
							dom: null,
							type: NodeTypes.TEXT,
							text: db.nbQueries
						}
					},
					v1: null
				},
				{
					dom: null,
					type: NodeTypes.FRAGMENT,
					children: queries,
					childrenType: ChildrenTypes.NON_KEYED,
					pointer: null
				}
			],
			v1: null
		};
	}

	var bp10 = bp(e('table', { className: 'table table-striped latest-data' }), ValueTypes.CHILDREN_NODE, null, null);
	var bp11 = bp(e('tbody'), ValueTypes.CHILDREN_NON_KEYED, null, null);

	function render() {
		var dbs = ENV.generateData(false).toArray();
		perfMonitor.startProfile('view update');
		InfernoDOM.render(
			{
				bp: bp10,
				dom: null,
				type: NodeTypes.OPT_ELEMENT,
				v0: {
					bp: bp11,
					dom: null,
					type: NodeTypes.OPT_ELEMENT,
					v0: map(database, dbs),
					v1: null
				},
				v1: null
			},
			elem
		);
		perfMonitor.endProfile('view update');
		setTimeout(render, ENV.timeout);
	}
	render();
})();
