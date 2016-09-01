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
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};	

	var staticNode = t(bp5, null);

	function query(query) {
		return t(bp1, null, query.elapsedClassName, [
			t(bp2, null, text(query.formatElapsed)),
			t(bp3, null, [
				t(bp4, null, text(query.query)),
				staticNode
			])
		]);
	}

	var bp6 = {
		static: {
			tag: 'tr',
		},
		clone: null,
		v0: TemplateValueTypes.CHILDREN_NON_KEYED,
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
		return t(bp6, null, [
			t(bp7, null, db.dbname),
			t(bp8, null,
				t(bp9, null, lastSample.countClassName, text(db.nbQueries))
			),
			f(queries, ChildrenTypes.NON_KEYED)
		]);
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
		pools: {
			nonKeyed: [],
			keyed: new Map()
		}
	};

	function render() {
		var dbs = ENV.generateData(false).toArray();
		perfMonitor.startProfile('view update');
		InfernoDOM.render(
			t(bp10, null, t(bp11, null, map(database, dbs))),
			elem
		);
		perfMonitor.endProfile('view update');
		setTimeout(render, ENV.timeout);
	}
	render();
})();
