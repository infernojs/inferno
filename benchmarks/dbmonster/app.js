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
	var OPT_ELEMENT = NodeTypes.OPT_ELEMENT;
	var TEXT = NodeTypes.TEXT;

	perfMonitor.startFPSMonitor();
	perfMonitor.startMemMonitor();
	perfMonitor.initProfiler('view update');

	var bp1 = bp(e('td'), ValueTypes.PROP_CLASS_NAME, null, ValueTypes.CHILDREN, ChildrenTypes.NON_KEYED, null, null);
	var bp2 = bp(e('span'), ValueTypes.CHILDREN, ChildrenTypes.NODE, null, null, null, null);
	var bp3 = bp(e('div', { className: 'popover left' }), ValueTypes.CHILDREN, ChildrenTypes.NON_KEYED, null, null, null, null);
	var bp4 = bp(e('div', { className: 'popover-content' }), ValueTypes.CHILDREN, ChildrenTypes.NODE, null, null, null, null);
	var bp5 = bp(e('div', { className: 'arrow' }), null, null, null, null, null);
	var bp6 = bp(e('tr'), ValueTypes.CHILDREN, ChildrenTypes.NON_KEYED, null, null, null, null);
	var bp7 = bp(e('td', { className: 'dbname' }), ValueTypes.CHILDREN, ChildrenTypes.TEXT, null, null, null, null);
	var bp8 = bp(e('td', { className: 'query-count' }), ValueTypes.CHILDREN, ChildrenTypes.NODE, null, null, null, null);
	var bp9 = bp(e('span'), ValueTypes.PROP_CLASS_NAME, null, ValueTypes.CHILDREN, ChildrenTypes.NODE, null, null);
	var bp10 = bp(e('table', { className: 'table table-striped latest-data' }), ValueTypes.CHILDREN, ChildrenTypes.NODE, null, null, null, null);
	var bp11 = bp(e('tbody'), ValueTypes.CHILDREN, ChildrenTypes.NON_KEYED, null, null, null, null);

	var staticNode = {
		bp: bp5,
		dom: null,
		type: NodeTypes.OPT_ELEMENT,
		v0: null,
		v1: null
	};

	function renderBenchmark(dbs) {
		var length = dbs.length;
		var databases = new Array(length);

		for (var i = 0; i < length; i++) {
			var db = dbs[i];
			var lastSample = db.lastSample;
			var children = new Array(7);

			children[0] = {
				bp: bp7,
				dom: null,
				type: OPT_ELEMENT,
				v0: db.dbname,
				v1: null
			};
			children[1] = {
				bp: bp8,
				dom: null,
				type: OPT_ELEMENT,
				v0: {
					bp: bp9,
					dom: null,
					type: OPT_ELEMENT,
					v0: lastSample.countClassName,
					v1: {
						dom: null,
						type: TEXT,
						text: db.nbQueries
					}
				},
				v1: null
			};

			for (var i2 = 0; i2 < 5; i2++) {
				var query = lastSample.topFiveQueries[i2];

				children[i2 + 2] = {
					bp: bp1,
					dom: null,
					type: OPT_ELEMENT,
					v0: query.elapsedClassName,
					v1: [
						{
							bp: bp2,
							dom: null,
							type: OPT_ELEMENT,
							v0: {
								dom: null,
								type: TEXT,
								text: query.formatElapsed
							},
							v1: null
						},
						{
							bp: bp3,
							dom: null,
							type: OPT_ELEMENT,
							v0: [
								{
									bp: bp4,
									dom: null,
									type: OPT_ELEMENT,
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
			databases[i] = {
				bp: bp6,
				dom: null,
				type: OPT_ELEMENT,
				v0: children,
				v1: null
			};
		}

		Inferno.render(
			{
				bp: bp10,
				dom: null,
				type: OPT_ELEMENT,
				v0: {
					bp: bp11,
					dom: null,
					type: OPT_ELEMENT,
					v0: databases,
					v1: null
				},
				v1: null
			},
			elem
		);
	}

	function render() {
		var dbs = ENV.generateData(false).toArray();
		perfMonitor.startProfile('view update');
		renderBenchmark(dbs);
		perfMonitor.endProfile('view update');
		setTimeout(render, ENV.timeout);
	}
	render();
})();
