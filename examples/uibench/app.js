(function() {
	"use strict";

	uibench.init('Inferno', '0.6.0');

	var animBox1 = {
		dom: Inferno.staticCompiler.createElement('div', { className : 'AnimBox' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'AnimBox'
	};

	var AnimBox = function (props) {
		var data = props.data;
		var time = data.time;
		var style =
			'border-radius:' + (time % 10).toString() + 'px;' +
			'background:rgba(0,0,0,' + (0.5 + ((time % 10) / 10)).toString() + ')';

		return {
			dom: null,
			static: animBox1,
			attrs: { style: style, 'data-id': value.id }
		};
	};

	var anim1 = {
		dom: Inferno.staticCompiler.createElement('div', { className : 'Anim' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'Anim'
	};

	var anim2 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		}
	};

	var Anim = function (props) {
		var data = props.data;
		var items = data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push({
				dom: null,
				static: anim2,
				tag: AnimBox,
				key: item.id,
				attrs: {
					data: item
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				instance: null
			});
		}

		return {
			dom: null,
			static: anim1,
			children: children
		};
	}

	var tableCell1 = {
		dom: Inferno.staticCompiler.createElement('td', { className: 'TableCell' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		className: 'TableCell'
	};

	function updateTableCell(domNode, lastProps, nextProps) {
		return lastProps.text !== nextProps.text;
	}

	var TableCell = function (props) {
		return {
			dom: null,
			static: tableCell1,
			events: { click: (e) => {
				console.log('Clicked' + props.text);
				e.stopPropagation();
			} },
			children: props.text
		};
	};

	var tableRow1 = {
		dom: Inferno.staticCompiler.createElement('tr'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tr'
	};

	var tableRow2 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		}
	};

	var TableRow = function (props) {
		var data = props.data;
		var classes = 'TableRow';
		if (data.active) {
			classes = 'TableRow active';
		}
		var cells = data.props;

		var children = [({
			dom: null,
			static: tableRow2,
			tag: TableCell,
			key: -1,
			attrs: { text: '#' + data.id },
			events: {
				componentShouldUpdate: updateTableCell
			},
			instance: null
		})];
		for (var i = 0; i < cells.length; i++) {
			children.push({
				dom: null,
				static: tableRow2,
				tag: TableCell,
				key: i,
				attrs: { text: cells[i] },
				events: {
					componentShouldUpdate: updateTableCell
				},
				instance: null
			});
		}
		return {
			dom: null,
			static: tableRow1,
			attrs: { 'data-id': data.id },
			className: classes,
			children: children
		};
	}

	var table1 = {
		dom: Inferno.staticCompiler.createElement('table', { className: 'Table' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'table',
		className: 'Table'
	};

	var table2 = {
		dom: Inferno.staticCompiler.createElement('tbody'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tbody'
	};

	var table3 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		}
	};

	var Table = function (props) {
		var items = props.data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push({
				dom: null,
				static: table3,
				tag: TableRow,
				attrs: {
					key: item.id,
					data: item
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				instance: null
			});
		}

		return {
			dom: null,
			static: table1,
			children: {
				dom: null,
				static: table2,
				children: children
			}
		};
	};

	var treeLeaf1 = {
		dom: Inferno.staticCompiler.createElement('li', { className: 'TreeLeaf' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'li',
		className: 'TreeLeaf'
	};

	var TreeLeaf = function (props) {
		return {
			dom: null,
			static: treeLeaf1,
			events: {
				componentShouldUpdate: appUpdateCheck
			},
			children: '' + props.data.id
		};
	};

	var treeNode1 = {
		dom: Inferno.staticCompiler.createElement('ul', { className: 'TreeNode' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'ul',
		className: 'TreeNode'
	};

	var treeNode2 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		}
	};

	var treeNode3 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		}
	};

	var TreeNode = function (props) {
		var data = props.data;
		var children = [];

		for (var i = 0; i < data.children.length; i++) {
			var n = data.children[i];
			if (n.container) {
				children.push({
					dom: null,
					static: treeNode2,
					tag: TreeNode,
					key: n.id,
					attrs: {
						data: n
					},
					events: {
						componentShouldUpdate: appUpdateCheck
					},
					instance: null
				});
			} else {
				children.push({
					dom: null,
					static: treeNode3,
					tag: TreeLeaf,
					key: n.id,
					attrs: {
						data: n
					},
					events: {
						componentShouldUpdate: appUpdateCheck
					},
					instance: null
				});
			}
		}

		return {
			dom: null,
			static: treeNode1,
			children: children
		};
	};

	var tree1 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'Tree' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'Tree'
	};

	var tree2 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		}
	};

	var Tree = function (props) {
		return {
			dom: null,
			static: tree1,
			children: {
				dom: null,
				static: tree2,
				tag: TreeNode,
				attrs: {
					data: props.data.root
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				instance: null
			}
		};
	};

	var main1 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'Main' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		className: 'Main'
	};

	var main2 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		}
	};

	var main3 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		}
	};

	var main4 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		}
	};

	var Main = function (props) {
		var data = props.data;
		var location = data.location;

		var section;
		if (location === 'table') {
			section = {
				dom: null,
				static: main2,
				tag: Table,
				attrs: {
					data: data.table
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				instance: null
			};
		} else if (location === 'anim') {
			section = {
				dom: null,
				static: main3,
				tag: Anim,
				attrs: {
					data: data.anim
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				instance: null
			};
		} else if (location === 'tree') {
			section = {
				dom: null,
				static: main4,
				tag: Tree,
				attrs: {
					data: data.tree
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				instance: null
			};
		}

		return {
			dom: null,
			static: main1,
			children: section
		};
	};

	var app1 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		}
	};

	var app2 = {
		dom: Inferno.staticCompiler.createElement('pre'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'pre'
	};

	function appUpdateCheck(domNode, lastProps, nextProps) {
		return lastProps.data !== nextProps.data;
	}

	document.addEventListener('DOMContentLoaded', function(e) {
		var container = document.querySelector('#App');

		uibench.run(
			function(state) {
				InfernoDOM.render({
					dom: null,
					static: app1,
					tag: Main,
					attrs: {
						data: state
					},
					events: {
						componentShouldUpdate: appUpdateCheck
					},
					instance: null
				}, container);
			},
			function(samples) {
				InfernoDOM.render({
					dom: null,
					static: app2,
					children: JSON.stringify(samples, null, ' ')
				}, container);
			}
		);
	});

})();