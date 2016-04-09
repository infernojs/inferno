(function() {
	"use strict";

	uibench.init('Inferno', '0.9');

	var createVNode = Inferno.createVNode;

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

		return createVNode(animBox1)
			.setStyle(style)
			.setAttrs({ 'data-id': data.id });
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

	var Anim = function (props) {
		var data = props.data;
		var items = data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push(
				createVNode(anim2)
					.setTag(AnimBox)
					.setAttrs({
						data: item
					})
					.setHooks({
						componentShouldUpdate: appUpdateCheck
					})
					.setKey(item.id)
			)
		}
		return createVNode(anim1).setChildren(children);
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
		return createVNode(tableCell1).setChildren(props.text).setEvents({
			onclick: onClick
		}).setAttrs({
			xtag: props.text
		});
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
		childrenType: 4
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

	var TableRow = function (props) {
		var data = props.data;
		var classes = 'TableRow';
		if (data.active) {
			classes = 'TableRow active';
		}
		var cells = data.props;
		var children = [
			createVNode(tableRow2).setTag(TableCell).setAttrs({ text: '#' + data.id }).setKey(-1).setHooks({
				componentShouldUpdate: updateTableCell
			})
		];

		for (var i = 0; i < cells.length; i++) {
			children.push(
				createVNode(tableRow2).setTag(TableCell).setAttrs({ text: cells[i] }).setKey(i).setHooks({
					componentShouldUpdate: updateTableCell
				})
			);
		}

		return createVNode(tableRow1).setChildren(children).setClassName(classes).setAttrs({ 'data-id': data.id });
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

	var Table = function (props) {
		var items = props.data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push(
				createVNode(table3).setTag(TableRow).setAttrs({
					data: item
				}).setHooks({
					componentShouldUpdate: appUpdateCheck
				}).setKey(item.id)
			);
		}

		return createVNode(table1).setChildren(
			createVNode(table2).setChildren(children)
		);
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
		return createVNode(treeLeaf1).setChildren(props.data.id);
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

	var TreeNode = function (props) {
		var data = props.data;
		var children = [];

		for (var i = 0; i < data.children.length; i++) {
			var n = data.children[i];
			if (n.container) {
				children.push(
					createVNode(treeNode2).setTag(TreeNode).setAttrs({
						data: n
					}).setHooks({
						componentShouldUpdate: appUpdateCheck
					}).setKey(n.id)
				);
			} else {
				children.push(
					createVNode(treeNode3).setTag(TreeLeaf).setAttrs({
						data: n
					}).setHooks({
						componentShouldUpdate: appUpdateCheck
					}).setKey(n.id)
				);
			}
		}

		return createVNode(treeNode1).setChildren(children);
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
		return createVNode(tree1).setChildren(
			createVNode(tree2).setTag(TreeNode).setAttrs({
				data: props.data.root
			}).setHooks({
				componentShouldUpdate: appUpdateCheck
			})
		);
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

	var Main = function (props) {
		var data = props.data;
		var location = data.location;

		var section;
		if (location === 'table') {
			section = createVNode(main2).setTag(Table).setAttrs({
				data: data.table
			}).setHooks({
				componentShouldUpdate: appUpdateCheck
			});
		} else if (location === 'anim') {
			section = createVNode(main3).setTag(Anim).setAttrs({
				data: data.anim
			}).setHooks({
				componentShouldUpdate: appUpdateCheck
			});
		} else if (location === 'tree') {
			section = createVNode(main4).setTag(Tree).setAttrs({
				data: data.tree
			}).setHooks({
				componentShouldUpdate: appUpdateCheck
			});
		}

		return createVNode(main1).setChildren(section);
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
				InfernoDOM.render(
					createVNode(app1).setTag(Main).setAttrs({
						data: state
					}).setHooks({
						componentShouldUpdate: appUpdateCheck
					})
					, container);
			},
			function(samples) {
				InfernoDOM.render(
					createVNode(app2).setChildren(JSON.stringify(samples, null, ' '))
					, container);
			}
		);
	});

})();
