(function() {
	"use strict";
	var elem = document.getElementById('app');
	var createVTemplateReducers = Inferno.createVTemplateReducers;
	var t = Inferno.createVTemplate;
	var e = Inferno.createVElement;
	var f = Inferno.createVFragment;
	var text = Inferno.createVText;
	var TemplateValueTypes = Inferno.TemplateValueTypes;
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

	var bp1 = {
		static: {
			tag: 'td'
		},
		clone: null,
		v0: TemplateValueTypes.PROPS_CLASS_NAME,
		v1: TemplateValueTypes.CHILDREN_NON_KEYED,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};

	var bp2 = {
		static: {
			tag: 'span'
		},
		clone: null,
		v0: TemplateValueTypes.CHILDREN_NODE,
		v1: null,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};

	var bp3 = {
		static: {
			tag: 'div',
			props: {
				className: 'popover left'
			}
		},
		clone: null,
		v0: TemplateValueTypes.CHILDREN_NON_KEYED,
		v1: null,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};

	var bp4 = {
		static: {
			tag: 'div',
			props: {
				className: 'popover-content'
			}
		},
		clone: null,
		v0: TemplateValueTypes.CHILDREN_NODE,
		v1: null,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};

	var bp5 = {
		static: {
			tag: 'div',
			props: {
				className: 'arrow'
			}
		},
		clone: null,
		v0: null,
		v1: null,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};	

	var staticNode = {
		bp: bp5,
		dom: null,
		type: NodeTypes.TEMPLATE,
		v0: null,
		v1: null
	};

	function query(query) {
		return {
			bp: bp1,
			dom: null,
			type: NodeTypes.TEMPLATE,
			v0: query.elapsedClassName,
			v1: [
				{
					bp: bp2,
					dom: null,
					type: NodeTypes.TEMPLATE,
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
					type: NodeTypes.TEMPLATE,
					v0: [
						{
							bp: bp4,
							dom: null,
							type: NodeTypes.TEMPLATE,
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

	var bp6 = {
		static: {
			tag: 'tr',
		},
		clone: null,
		v0: TemplateValueTypes.CHILDREN_NON_KEYED,
		v1: null,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};

	var bp7 = {
		static: {
			tag: 'td',
			props: {
				className: 'dbname'
			}
		},
		clone: null,
		v0: TemplateValueTypes.CHILDREN_TEXT,
		v1: null,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};

	var bp8 = {
		static: {
			tag: 'td',
			props: {
				className: 'query-count'
			}
		},
		clone: null,
		v0: TemplateValueTypes.CHILDREN_NODE,
		v1: null,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};

	var bp9 = {
		static: {
			tag: 'span'
		},
		clone: null,
		v0: TemplateValueTypes.PROPS_CLASS_NAME,
		v1: TemplateValueTypes.CHILDREN_NODE,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};

	function database(db) {
		var lastSample = db.lastSample;
		var queries = [];

		for (var i = 0; i < 5; i++) {
			queries.push(query(lastSample.topFiveQueries[i]));
		}
		return {
			bp: bp6,
			dom: null,
			type: NodeTypes.TEMPLATE,
			v0: [
				{
					bp: bp7,
					dom: null,
					type: NodeTypes.TEMPLATE,
					v0: db.dbname,
					v1: null
				},
				{
					bp: bp8,
					dom: null,
					type: NodeTypes.TEMPLATE,
					v0: {
						bp: bp9,
						dom: null,
						type: NodeTypes.TEMPLATE,
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

	var bp10 = {
		static: {
			tag: 'table',
			props: {
				className: 'table table-striped latest-data'
			}
		},
		clone: null,
		v0: TemplateValueTypes.CHILDREN_NODE,
		v1: null,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};	

	var bp11 = {
		static: {
			tag: 'tbody'
		},
		clone: null,
		v0: TemplateValueTypes.CHILDREN_NON_KEYED,
		v1: null,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};

	function render() {
		var dbs = ENV.generateData(false).toArray();
		perfMonitor.startProfile('view update');
		InfernoDOM.render(
			{
				bp: bp10,
				dom: null,
				type: NodeTypes.TEMPLATE,
				v0: {
					bp: bp11,
					dom: null,
					type: NodeTypes.TEMPLATE,
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
