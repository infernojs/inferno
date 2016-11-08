(function() {
	"use strict";

	var createVNode = Inferno.createVNode;

	uibench.init('Inferno', '1.0.0-beta7 *dev*');

	var treeLeafProps = { className: 'TreeLeaf' };

	function TreeLeaf(id) {
		return createVNode('li', treeLeafProps, id + '', 1 << 1);
	}

	var shouldDataUpdate = {
		onComponentShouldUpdate: function (lastProps, nextProps) {
			return lastProps !== nextProps;
		}
	};
	var treeNodeProps = { className: 'TreeNode' };

	function TreeNode(data) {
		var length = data.children.length;
		var children = new Array(length);

		for (var i = 0; i < length; i++) {
			var n = data.children[i];

			if (n.container) {
				children[i] = createVNode(TreeNode, n, null, 1 << 3, n.id, shouldDataUpdate);
			} else {
				children[i] = createVNode(TreeLeaf, n.id, null, 1 << 3, n.id, shouldDataUpdate);
			}
		}
		return createVNode('ul', treeNodeProps, children, 1 << 1 | 1 << 4);
	}

	var treeProps = { className: 'Tree' };
	var lastTreeData;

	function tree(data) {
		if (data === lastTreeData) {
			return Inferno.NO_OP;
		}
		lastTreeData = data;
		return createVNode('div', treeProps, createVNode(TreeNode, data.root, null, 1 << 3, null, shouldDataUpdate), 1 << 1);
	}

	function AnimBox(data) {
		var time = data.time;
		var style = 'border-radius:' + (time % 10) + 'px;' +
			'background:rgba(0,0,0,' + (0.5 + ((time % 10) / 10)) + ')';

		return createVNode('div', { className: 'AnimBox', style: style, 'data-id': data.id }, null, 1 << 1);
	}

	var animProps = { className: 'Anim' };
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

			children[i] = createVNode(AnimBox, item, null, 1 << 3, item.id, shouldDataUpdate);
		}
		return createVNode('div', animProps, children, 1 << 1 | 1 << 4);
	}

	function onClick(e, c, p) {
		console.log('Clicked', p);
		e.stopPropagation();
	}

	document.addEventListener('click', onClick);
	var tableCellProps = { className: 'TableCell' };

	function TableCell(text) {
		return createVNode('td', tableCellProps, text, 1 << 1);
	}

	function TableRow(data) {
		var classes = 'TableRow';

		if (data.active) {
			classes = 'TableRow active';
		}
		var cells = data.props;
		var length = cells.length + 1;
		var children = new Array(length);

		children[0] = createVNode(TableCell, '#' + data.id, null, 1 << 3, -1, shouldDataUpdate);

		for (var i = 1; i < length; i++) {
			children[i] = createVNode(TableCell, cells[i - 1], null, 1 << 3, i, shouldDataUpdate);
		}
		return createVNode('tr', { className: classes, 'data-id': data.id }, children, 1 << 1 | 1 << 4);
	}

	var tableProps = { className: 'Table' };
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

			children[i] = createVNode(TableRow, item, null, 1 << 3, item.id, shouldDataUpdate);
		}
		return createVNode('table', tableProps, children, 1 << 1 | 1 << 4);
	}

	var mainProps = { className: 'Main' };
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
		return createVNode('div', mainProps, section, 1 << 1);
	}

	document.addEventListener('DOMContentLoaded', function(e) {
		var container = document.querySelector('#App');

		uibench.run(
			function(state) {
				Inferno.render(main(state), container);
			},
			function(samples) {
				Inferno.render(
					createVNode('pre', null, JSON.stringify(samples, null, ' '), 1 << 1), container
				);
			}
		);
	});
})();
