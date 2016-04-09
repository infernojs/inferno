(function() {
	"use strict";

	uibench.init('Inferno', '0.6.5');

	var animBox1 = {
		dom: Inferno.universal.createElement('div', { className : 'AnimBox' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'div',
		className: 'AnimBox',
		isComponent: false,
		hasAttrs: true,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: true,
		childrenType: 0
	};

	var AnimBox = function (props) {
		var data = props.data;
		var time = data.time;
		var style =
			'border-radius:' + (time % 10).toString() + 'px;' +
			'background:rgba(0,0,0,' + (0.5 + ((time % 10) / 10)).toString() + ')';

		return {
			tpl: animBox1,
			style: style,
			attrs: { 'data-id': data.id }
		};
	};

	var anim1 = {
		dom: Inferno.universal.createElement('div', { className : 'Anim' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'div',
		className: 'Anim',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 4
	};

	var anim2 = {
		pools: {
			keyed: {},
			nonKeyed: []
		},
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	function createAnimNode(key, data) {
		return {
			tpl: anim2,
			tag: AnimBox,
			key: key,
			attrs: {
				data: data
			},
			hooks: {
				componentShouldUpdate: appUpdateCheck
			}
		};
	}

	var Anim = function (props) {
		var data = props.data;
		var items = data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push(createAnimNode(item.id, item));
		}

		return {
			tpl: anim1,
			children: children
		};
	};

	var tableCell1 = {
		dom: Inferno.universal.createElement('td', { className: 'TableCell' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'td',
		className: 'TableCell',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: true,
		hasClassName: false,
		hasStyle: false,
		childrenType: 1
	};

	function updateTableCell(domNode, lastProps, nextProps) {
		return lastProps.text !== nextProps.text;
	}

	function onClick(e) {
		console.log('Clicked' + e.target.xtag);
		e.stopPropagation();
	}

	var TableCell = function (props) {
		return {
			tpl: tableCell1,
			events: {
				onclick: onClick
			},
			attrs: {
				xtag: props.text
			},
			children: props.text
		};
	};

	var tableRow1 = {
		dom: Inferno.universal.createElement('tr'),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'tr',
		isComponent: false,
		hasAttrs: true,
		hasHooks: false,
		hasEvents: false,
		hasClassName: true,
		hasStyle: false,
		childrenType: 3
	};

	var tableRow2 = {
		pools: {
			keyed: {},
			nonKeyed: []
		},
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	function createTableCellNode(key, text) {
		return {
			tpl: tableRow2,
			tag: TableCell,
			key: key,
			attrs: { text: text },
			hooks: {
				componentShouldUpdate: updateTableCell
			}
		};
	}

	var TableRow = function (props) {
		var data = props.data;
		var classes = 'TableRow';
		if (data.active) {
			classes = 'TableRow active';
		}
		var cells = data.props;

		var children = [ createTableCellNode(-1, '#' + data.id) ];

		for (var i = 0; i < cells.length; i++) {
			children.push(
				createTableCellNode(i, cells[i])
			);
		}
		return {
			tpl: tableRow1,
			attrs: { 'data-id': data.id },
			className: classes,
			children: children
		};
	};

	var table1 = {
		dom: Inferno.universal.createElement('table', { className: 'Table' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'table',
		className: 'Table',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 2
	};

	var table2 = {
		dom: Inferno.universal.createElement('tbody'),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'tbody',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 4
	};

	var table3 = {
		pools: {
			keyed: {},
			nonKeyed: []
		},
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	function createTableRowNode(key, item) {
		return {
			tpl: table3,
			tag: TableRow,
			key: key,
			attrs: {
				data: item
			},
			hooks: {
				componentShouldUpdate: appUpdateCheck
			}
		};
	}

	var Table = function (props) {
		var items = props.data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push(createTableRowNode(item.id, item));
		}

		return {
			tpl: table1,
			children: {
				tpl: table2,
				children: children
			}
		};
	};

	var treeLeaf1 = {
		dom: Inferno.universal.createElement('li', { className: 'TreeLeaf' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'li',
		className: 'TreeLeaf',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 1
	};

	var TreeLeaf = function (props) {
		return {
			tpl: treeLeaf1,
			children: '' + props.data.id
		};
	};

	var treeNode1 = {
		dom: Inferno.universal.createElement('ul', { className: 'TreeNode' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'ul',
		className: 'TreeNode',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 4
	};

	var treeNode2 = {
		pools: {
			keyed: {},
			nonKeyed: []
		},
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	var treeNode3 = {
		pools: {
			keyed: {},
			nonKeyed: []
		},
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	function createTreeNode(tpl, tag, key, data) {
		return {
			tpl: tpl,
			tag: tag,
			key: key,
			attrs: {
				data: data
			},
			hooks: {
				componentShouldUpdate: appUpdateCheck
			}
		};
	}

	var TreeNode = function (props) {
		var data = props.data;
		var children = [];

		for (var i = 0; i < data.children.length; i++) {
			var n = data.children[i];
			if (n.container) {
				children.push(
					createTreeNode(treeNode2, TreeNode, n.id, n)
				);
			} else {
				children.push(
					createTreeNode(treeNode3, TreeLeaf, n.id, n)
				);
			}
		}

		return {
			tpl: treeNode1,
			children: children
		};
	};

	var tree1 = {
		dom: Inferno.universal.createElement('div', { className: 'Tree' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'div',
		className: 'Tree',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 2
	};

	var tree2 = {
		pools: {
			keyed: {},
			nonKeyed: []
		},
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	var Tree = function (props) {
		return {
			tpl: tree1,
			children: {
				tpl: tree2,
				tag: TreeNode,
				attrs: {
					data: props.data.root
				},
				hooks: {
					componentShouldUpdate: appUpdateCheck
				}
			}
		};
	};

	var main1 = {
		dom: Inferno.universal.createElement('div', { className: 'Main' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'div',
		className: 'Main',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 2
	};

	var main2 = {
		pools: {
			keyed: {},
			nonKeyed: []
		},
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	var main3 = {
		pools: {
			keyed: {},
			nonKeyed: []
		},
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	var main4 = {
		pools: {
			keyed: {},
			nonKeyed: []
		},
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	function createMainNode(tpl, tag, data) {
		return {
			tpl: tpl,
			tag: tag,
			attrs: {
				data: data
			},
			hooks: {
				componentShouldUpdate: appUpdateCheck
			}
		};
	}

	var Main = function (props) {
		var data = props.data;
		var location = data.location;

		var section;
		if (location === 'table') {
			section = createMainNode(main2, Table, data.table);
		} else if (location === 'anim') {
			section = createMainNode(main3, Anim, data.anim);
		} else if (location === 'tree') {
			section = createMainNode(main4, Tree, data.tree);
		}

		return {
			tpl: main1,
			children: section
		};
	};

	var app1 = {
		pools: {
			keyed: {},
			nonKeyed: []
		},
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	var app2 = {
		dom: Inferno.universal.createElement('pre'),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'pre',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 5
	};

	function appUpdateCheck(domNode, lastProps, nextProps) {
		return lastProps.data !== nextProps.data;
	}

	document.addEventListener('DOMContentLoaded', function(e) {
		var container = document.querySelector('#App');

		uibench.run(
			function(state) {
				InfernoDOM.render({
					tpl: app1,
					tag: Main,
					attrs: {
						data: state
					},
					hooks: {
						componentShouldUpdate: appUpdateCheck
					}
				}, container);
			},
			function(samples) {
				InfernoDOM.render({
					tpl: app2,
					children: JSON.stringify(samples, null, ' ')
				}, container);
			}
		);
	});

})();
