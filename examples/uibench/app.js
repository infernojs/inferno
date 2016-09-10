(function() {
	"use strict";

	var bp = Inferno.createOptBlueprint;
	var e = Inferno.createStaticVElement;
	var ChildrenTypes = Inferno.ChildrenTypes;
	var ValueTypes = Inferno.ValueTypes;
	var NodeTypes = Inferno.NodeTypes;

	uibench.init('Inferno', '1.0.0-alpha5');

	var treeLeafBp = bp(e('li', { className: 'TreeLeaf' }), ValueTypes.CHILDREN, ChildrenTypes.TEXT, null, null, null, null, null, null);
	var treeNodeBp = bp(e('ul', { className: 'TreeNode' }), ValueTypes.CHILDREN, ChildrenTypes.KEYED, null, null, null, null, null, null);

	function TreeLeaf(id) {
		return {
			bp: treeLeafBp,
			dom: null,
			key: null,
			type: NodeTypes.OPT_ELEMENT,
			v0: id,
			v1: null,
			v2: null
		};
	}

	function TreeNode(data) {
		var length = data.children.length;
		var children = new Array(length);

		for (var i = 0; i < length; i++) {
			var n = data.children[i];

			if (n.container) {
				children[i] = {
					component: TreeNode,
					dom: null,
					hooks: shouldDataUpdate,
					key: n.id,
					props: n,
					ref: null,
					type: NodeTypes.COMPONENT
				};
			} else {
				children[i] = {
					component: TreeLeaf,
					dom: null,
					hooks: shouldDataUpdate,
					key: n.id,
					props: n.id,
					ref: null,
					type: NodeTypes.COMPONENT
				};
			}
		}
		return {
			bp: treeNodeBp,
			dom: null,
			key: null,
			type: NodeTypes.OPT_ELEMENT,
			v0: children,
			v1: null,
			v2: null
		};
	}

	var treeBp = bp(e('div', { className: 'Tree' }), ValueTypes.CHILDREN, ChildrenTypes.NODE, null, null, null, null, null, null);
	var lastTreeData;

	function tree(data) {
		if (data === lastTreeData) {
			return Inferno.NO_OP;
		}
		lastTreeData = data;
		return {
			bp: treeBp,
			dom: null,
			key: null,
			type: NodeTypes.OPT_ELEMENT,
			v0: {
				component: TreeNode,
				dom: null,
				hooks: shouldDataUpdate,
				key: null,
				props: data.root,
				ref: null,
				type: NodeTypes.COMPONENT
			},
			v1: null,
			v2: null
		};			
	}

	var animBoxBp = bp(e('div', { className: 'AnimBox' }), ValueTypes.PROP_STYLE, null, ValueTypes.PROP_DATA, 'id', null, null, null, null);

	function AnimBox(data) {
		var time = data.time;
		var style = 'border-radius:' + (time % 10) + 'px;' +
			'background:rgba(0,0,0,' + (0.5 + ((time % 10) / 10)) + ')';

		return {
			bp: animBoxBp,
			dom: null,
			key: null,
			type: NodeTypes.OPT_ELEMENT,
			v0: style,
			v1: data.id,
			v2: null
		};		
	}

	var animBp = bp(e('div', { className: 'Anim' }), ValueTypes.CHILDREN, ChildrenTypes.KEYED, null, null, null, null, null, null);
	var lastAnimData;

	function anim(data) {
		if (data === lastAnimData) {
			return Inferno.NO_OP;
		}
		lastAnimData = data;
		var items = data.items;
		var length = items.length;
		var children = new Array(length);

		for (var i = 0; i < length; i++) {
			var item = items[i];

			children[i] = {
				component: AnimBox,
				dom: null,
				hooks: shouldDataUpdate,
				key: item.id,
				props: item,
				ref: null,
				type: NodeTypes.COMPONENT
			};
		}
		return {
			bp: animBp,
			dom: null,
			key: null,
			type: NodeTypes.OPT_ELEMENT,
			v0: children,
			v1: null,
			v2: null
		};
	}

	function onClick(e) {
		console.log('Clicked ' + e.target.value);
		e.stopPropagation();
	}

	document.addEventListener('click', onClick);

	var tableCellBp = bp(e('td', { className: 'TableCell' }), ValueTypes.CHILDREN, ChildrenTypes.TEXT, null, null, null, null, null, null);
	var tableRowBp = bp(e('tr'), ValueTypes.PROP_CLASS_NAME, null, ValueTypes.PROP_DATA, 'id', ValueTypes.CHILDREN, ChildrenTypes.KEYED, null, null);

	function TableCell(text) {
		return {
			bp: tableCellBp,
			dom: null,
			key: null,
			type: NodeTypes.OPT_ELEMENT,
			v0: text,
			v1: null,
			v2: null
		};
	}

	function TableRow(data) {
		var classes = 'TableRow';

		if (data.active) {
			classes = 'TableRow active';
		}
		var cells = data.props;
		var length = cells.length + 1;
		var children = new Array(length);

		children[0] = {
			component: TableCell,
			dom: null,
			hooks: shouldDataUpdate,
			key: -1,
			props: '#' + data.id,
			ref: null,
			type: NodeTypes.COMPONENT
		};

		for (var i = 1; i < length; i++) {
			children[i] = {
				component: TableCell,
				dom: null,
				hooks: shouldDataUpdate,
				key: i,
				props: cells[i - 1],
				ref: null,
				type: NodeTypes.COMPONENT
			};
		}
		return {
			bp: tableRowBp,
			dom: null,
			key: null,
			type: NodeTypes.OPT_ELEMENT,
			v0: classes,
			v1: data.id,
			v2: children
		};
	}

	var tableBp = bp(e('table', { className: 'Table' }), ValueTypes.CHILDREN, ChildrenTypes.KEYED, null, null, null, null, null, null);
	var lastTableData;

	function table(data) {
		if (data === lastTableData) {
			return Inferno.NO_OP;
		}
		lastTableData = data;
		var items = data.items;
		var length = items.length;
		var children = new Array(length);

		for (var i = 0; i < length; i++) {
			var item = items[i];

			children[i] = {
				component: TableRow,
				dom: null,
				hooks: shouldDataUpdate,
				key: item.id,
				props: item,
				ref: null,
				type: NodeTypes.COMPONENT
			};
		}
		return {
			bp: tableBp,
			dom: null,
			key: null,
			type: NodeTypes.OPT_ELEMENT,
			v0: children,
			v1: null,
			v2: null
		};
	}

	var mainBp = bp(e('div', { className: 'Main' }), ValueTypes.CHILDREN, ChildrenTypes.NODE, null, null, null, null, null, null);
	var lastMainData;

	function main(data) {
		if (data === lastMainData) {
			return Inferno.NO_OP;
		}
		lastMainData = data;
		var location = data.location;
		var section;

		if (location === 'table') {
			section = table(data.table);
		} else if (location === 'anim') {
			section = anim(data.anim);
		} else if (location === 'tree') {
			section = tree(data.tree);
		}
		return {
			bp: mainBp,
			dom: null,
			key: null,
			type: NodeTypes.OPT_ELEMENT,
			v0: section,
			v1: null,
			v2: null
		};
	}

	var preBp = bp(e('pre'), ValueTypes.CHILDREN, ChildrenTypes.TEXT, null, null, null, null, null, null);

	var shouldDataUpdate = {
		onComponentShouldUpdate: function(lastProps, nextProps) {
			return lastProps !== nextProps;
		}
	};

	document.addEventListener('DOMContentLoaded', function(e) {
		var container = document.querySelector('#App');

		uibench.run(
			function(state) {
				InfernoDOM.render(main(state), container);
			},
			function(samples) {
				InfernoDOM.render({
					bp: preBp,
					dom: null,
					key: null,
					type: NodeTypes.OPT_ELEMENT,
					v0: JSON.stringify(samples, null, ' '),
					v1: null,
					v2: null
				}, container);
			}
		);
	});
})();
