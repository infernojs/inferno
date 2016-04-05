(function() {
	"use strict";

	uibench.init('Inferno', '0.7');

	function Node(tpl) {
		this.tpl = tpl;
		this.dom = null;
		this.instance = null;
		this.tag = null;
		this.children = null;
		this.style = null;
		this.className = null;
		this.attrs = null;
		this.events = null;
		this.hooks = null;
		this.key = null;
	}

	Node.prototype.setAttrs = function(attrs) {
		this.attrs = attrs;
		return this;
	};

	Node.prototype.setTag = function(tag) {
		this.tag = tag;
		return this;
	};

	Node.prototype.setStyle = function(style) {
		this.style = style;
		return this;
	};

	Node.prototype.setClassName = function(className) {
		this.className = className;
		return this;
	};

	Node.prototype.setChildren = function(children) {
		this.children = children;
		return this;
	};

	Node.prototype.setHooks = function(hooks) {
		this.hooks = hooks;
		return this;
	};

	Node.prototype.setEvents = function(events) {
		this.events = events;
		return this;
	};

	Node.prototype.setKey = function(key) {
		this.key = key;
		return this;
	};

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

		return new Node(animBox1)
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
		childrenType: 3
	};

	var anim2 = {
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: null,
		className: null,
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
				new Node(anim2)
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
		return new Node(anim1).setChildren(children);
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

	var TableCell = function (props) {
		return new Node(tableCell1).setChildren(props.text).setEvents({
			onclick: (e) => {
				console.log('Clicked' + props.text);
				e.stopPropagation();
			}
		});
	};

	var tableRow1 = {
		dom: Inferno.universal.createElement('tr'),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'tr',
		className: null,
		isComponent: false,
		hasAttrs: true,
		hasHooks: false,
		hasEvents: false,
		hasClassName: true,
		hasStyle: false,
		childrenType: 3
	};

	var tableRow2 = {
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: null,
		className: null,
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
			new Node(tableRow2).setTag(TableCell).setAttrs({ text: '#' + data.id }).setKey(-1).setHooks({
				componentShouldUpdate: updateTableCell
			})
		];

		for (var i = 0; i < cells.length; i++) {
			children.push(
				new Node(tableRow2).setTag(TableCell).setAttrs({ text: cells[i] }).setKey(i).setHooks({
					componentShouldUpdate: updateTableCell
				})
			);
		}

		return new Node(tableRow1).setChildren(children).setClassName(classes).setAttrs({ 'data-id': data.id });
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
		className: null,
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 3
	};

	var table3 = {
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: null,
		className: null,
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
				new Node(table3).setTag(TableRow).setAttrs({
					data: item
				}).setHooks({
					componentShouldUpdate: appUpdateCheck
				}).setKey(item.id)
			);
		}

		return new Node(table1).setChildren(
			new Node(table2).setChildren(children)
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
		return new Node(treeLeaf1).setChildren(props.data.id);
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
		childrenType: 3
	};

	var treeNode2 = {
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: null,
		className: null,
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	var treeNode3 = {
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: null,
		className: null,
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
					new Node(treeNode2).setTag(TreeNode).setAttrs({
						data: n
					}).setHooks({
						componentShouldUpdate: appUpdateCheck
					}).setKey(n.id)
				);
			} else {
				children.push(
					new Node(treeNode3).setTag(TreeLeaf).setAttrs({
						data: n
					}).setHooks({
						componentShouldUpdate: appUpdateCheck
					}).setKey(n.id)
				);
			}
		}

		return new Node(treeNode1).setChildren(children);
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
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: null,
		className: null,
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	var Tree = function (props) {
		return new Node(tree1).setChildren(
			new Node(tree2).setTag(TreeNode).setAttrs({
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
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: null,
		className: null,
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	var main3 = {
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: null,
		className: null,
		isComponent: true,
		hasAttrs: false,
		hasHooks: true,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 0
	};

	var main4 = {
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: null,
		className: null,
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
			section = new Node(main2).setTag(Table).setAttrs({
				data: data.table
			}).setHooks({
				componentShouldUpdate: appUpdateCheck
			});
		} else if (location === 'anim') {
			section = new Node(main3).setTag(Anim).setAttrs({
				data: data.anim
			}).setHooks({
				componentShouldUpdate: appUpdateCheck
			});
		} else if (location === 'tree') {
			section = new Node(main4).setTag(Tree).setAttrs({
				data: data.tree
			}).setHooks({
				componentShouldUpdate: appUpdateCheck
			});
		}

		return new Node(main1).setChildren(section);
	};

	var app1 = {
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: null,
		className: null,
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
		className: null,
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 4
	};

	function appUpdateCheck(domNode, lastProps, nextProps) {
		return lastProps.data !== nextProps.data;
	}

	document.addEventListener('DOMContentLoaded', function(e) {
		var container = document.querySelector('#App');

		uibench.run(
			function(state) {
				InfernoDOM.render(
					new Node(app1).setTag(Main).setAttrs({
						data: state
					}).setHooks({
						componentShouldUpdate: appUpdateCheck
					})
				, container);
			},
			function(samples) {
				InfernoDOM.render(
					new Node(app2).setChildren(JSON.stringify(samples, null, ' '))
				, container);
			}
		);
	});

})();
