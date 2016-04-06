(function() {
	"use strict";

	uibench.init('Inferno', '0.7');

	function InfernoVNode(tpl) {
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

	function VNode(shape, childrenType) {
		var tag = shape.tag || null;
		var tagIsDynamic = tag && tag.arg !== undefined ? true : false;

		var children = shape.children != null ? shape.children : null;
		var childrenIsDynamic = children && children.arg !== undefined ? true : false;

		var attrs = shape.attrs || null;
		var attrsIsDynamic = attrs && attrs.arg !== undefined ? true : false;

		var hooks = shape.hooks || null;
		var hooksIsDynamic = hooks && hooks.arg !== undefined ? true : false;

		var events = shape.events || null;
		var eventsIsDynamic = events && events.arg !== undefined ? true : false;

		var key = shape.key != null ? shape.key : null;
		var keyIsDynamic = key != null && key.arg !== undefined ? true : false;

		var style = shape.style  || null;
		var styleIsDynamic = style && style.arg !== undefined ? true : false;

		var className = shape.className !== undefined ? shape.className : null;
		var classNameIsDynamic = className && className.arg !== undefined ? true : false;

		var dom = null;

		if (typeof tag === 'string') {
			var newAttrs = Object.assign({}, className ? {className: className} : {}, shape.attrs || {});
			dom =  Inferno.universal.createElement(tag, newAttrs)
		}

		var tpl = {
			dom: dom,
			pools: {
				keyed: {},
				nonKeyed: []
			},
			tag: !tagIsDynamic ? tag : null,
			isComponent: tagIsDynamic,
			hasAttrs: attrsIsDynamic,
			hasHooks: hooksIsDynamic,
			hasEvents: eventsIsDynamic,
			hasStyle: styleIsDynamic,
			hasClassName: classNameIsDynamic,
			childrenType: childrenType === undefined ? (children ? 4 : 0) : childrenType
		};

		return function() {
			var vNode = new InfernoVNode(tpl);

			if (tagIsDynamic === true) {
				vNode.tag = arguments[tag.arg];
			}
			if (childrenIsDynamic === true) {
				vNode.children = arguments[children.arg];
			}
			if (attrsIsDynamic === true) {
				vNode.attrs = arguments[attrs.arg];
			}
			if (hooksIsDynamic === true) {
				vNode.hooks = arguments[hooks.arg];
			}
			if (eventsIsDynamic === true) {
				vNode.events = arguments[events.arg];
			}
			if (keyIsDynamic === true) {
				vNode.key = arguments[key.arg];
			}
			if (styleIsDynamic === true) {
				vNode.style = arguments[style.arg];
			}
			if (classNameIsDynamic === true) {
				vNode.className = arguments[className.arg];
			}

			return vNode;
		};
	}

	var animBox1 = VNode({
		tag: 'div',
		className: 'AnimBox',
		attrs: { arg: 0 },
		style: { arg: 1 }
	});

	var AnimBox = function (props) {
		var data = props.data;
		var time = data.time;
		var style =
			'border-radius:' + (time % 10).toString() + 'px;' +
			'background:rgba(0,0,0,' + (0.5 + ((time % 10) / 10)).toString() + ')';

		return animBox1({ 'data-id': data.id }, style)
	};

	var anim1 = VNode({
		tag: 'div',
		className: 'Anim',
		children: { arg: 0 }
	}, 3);

	var anim2 = VNode({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 },
		key: { arg: 3 }
	});

	var Anim = function (props) {
		var data = props.data;
		var items = data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push(anim2(AnimBox, { data: item }, { componentShouldUpdate: appUpdateCheck }, item.id));
		}
		return anim1(children);
	};

	var tableCell1 = VNode({
		tag: 'td',
		className: 'TableCell',
		children: { arg: 0 },
		events: { arg: 1 }
	}, 1);

	function updateTableCell(domNode, lastProps, nextProps) {
		return lastProps.text !== nextProps.text;
	}

	var TableCell = function (props) {
		return tableCell1(props.text, {
			onclick: (e) => {
				console.log('Clicked' + props.text);
				e.stopPropagation();
			}
		});
	};

	var tableRow1 = VNode({
		tag: 'tr',
		children: { arg: 0 },
		className: { arg: 1 },
		attrs: { arg: 2 }
	}, 3);

	var tableRow2 = VNode({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 },
		key: { arg: 3 }
	});

	var TableRow = function (props) {
		var data = props.data;
		var classes = 'TableRow';
		if (data.active) {
			classes = 'TableRow active';
		}
		var cells = data.props;
		var children = [
			tableRow2(TableCell, { text: '#' + data.id }, {
				componentShouldUpdate: updateTableCell
			}, -1)
		];

		for (var i = 0; i < cells.length; i++) {
			children.push(
				tableRow2(TableCell, { text: cells[i] }, {
					componentShouldUpdate: updateTableCell
				}, i)
			);
		}

		return tableRow1(children, classes, { 'data-id': data.id });
	};

	var table1 = VNode({
		tag: 'table',
		className: 'Table',
		children: { arg: 0 }
	}, 2);

	var table2 = VNode({
		tag: 'tbody',
		children: { arg: 0 }
	}, 3);

	var table3 = VNode({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 },
		key: { arg: 3 }
	});

	var Table = function (props) {
		var items = props.data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push(
				table3(TableRow, { data: item }, { componentShouldUpdate: appUpdateCheck }, item.id)
			);
		}

		return table1(table2(children));
	};

	var treeLeaf1 = VNode({
		tag: 'li',
		className: 'TreeLeaf',
		children: { arg: 0 }
	}, 1);

	var TreeLeaf = function (props) {
		return treeLeaf1(props.data.id);
	};

	var treeNode1 = VNode({
		tag: 'ul',
		className: 'TreeNode',
		children: { arg: 0 }
	}, 3);

	var treeNode2 = VNode({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 },
		key: { arg: 3 }
	});

	var treeNode3 = VNode({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 },
		key: { arg: 3 }
	});

	var TreeNode = function (props) {
		var data = props.data;
		var children = [];

		for (var i = 0; i < data.children.length; i++) {
			var n = data.children[i];
			if (n.container) {
				children.push(
					treeNode2(TreeNode, {
						data: n
					}, {
						componentShouldUpdate: appUpdateCheck
					}, n.id)
				);
			} else {
				children.push(
					treeNode3(TreeLeaf, {
						data: n
					}, {
						componentShouldUpdate: appUpdateCheck
					}, n.id)
				);
			}
		}

		return treeNode1(children);
	};

	var tree1 = VNode({
		tag: 'div',
		className: 'Tree',
		children: { arg: 0 }
	}, 2);

	var tree2 = VNode({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 }
	});

	var Tree = function (props) {
		return tree1(
			tree2(TreeNode, {
				data: props.data.root
			}, {
				componentShouldUpdate: appUpdateCheck
			})
		);
	};

	var main1 = VNode({
		tag: 'div',
		className: 'Main',
		children: { arg: 0 }
	}, 2);

	var main2 = VNode({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 }
	});

	var main3 = VNode({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 }
	});

	var main4 = VNode({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 }
	});

	var Main = function (props) {
		var data = props.data;
		var location = data.location;

		var section;
		if (location === 'table') {
			section = main2(Table, {
				data: data.table
			}, {
				componentShouldUpdate: appUpdateCheck
			});
		} else if (location === 'anim') {
			section = main3(Anim, {
				data: data.anim
			}, {
				componentShouldUpdate: appUpdateCheck
			});
		} else if (location === 'tree') {
			section = main4(Tree, {
				data: data.tree
			}, {
				componentShouldUpdate: appUpdateCheck
			});
		}

		return new main1(section);
	};

	var app1 = VNode({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 }
	});

	var app2 = VNode({
		tag: 'pre',
		children: { arg: 0 }
	}, 4);

	function appUpdateCheck(domNode, lastProps, nextProps) {
		return lastProps.data !== nextProps.data;
	}

	document.addEventListener('DOMContentLoaded', function(e) {
		var container = document.querySelector('#App');

		uibench.run(
			function(state) {
				InfernoDOM.render(
					app1(Main, {
						data: state
					}, {
						componentShouldUpdate: appUpdateCheck
					})
				, container);
			},
			function(samples) {
				InfernoDOM.render(
					app2(JSON.stringify(samples, null, ' '))
				, container);
			}
		);
	});

})();
