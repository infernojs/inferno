(function() {
	"use strict";

	/* (flags, type, props, children, key, ref, noNormalise) */
	Inferno.options.recyclingEnabled = true; // Advanced optimisation
	var createVNode = Inferno.createVNode;

	uibench.init('Inferno', Inferno.version + ' non-keyed');

	var treeLeafProps = { className: 'TreeLeaf' };

	function TreeLeaf(id) {
		return createVNode(2, 'li', treeLeafProps, id + '', null, null, true);
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
				children[i] = createVNode(8, TreeNode, n, null, null, shouldDataUpdate, true);
			} else {
				children[i] = createVNode(8, TreeLeaf, n.id, null, null, shouldDataUpdate, true);
			}
		}
		return createVNode(66, 'ul', treeNodeProps, children, null, null, true);
	}

	var treeProps = { className: 'Tree' };
	var lastTreeData;

	function tree(data) {
		if (data === lastTreeData) {
			return Inferno.NO_OP;
		}
		lastTreeData = data;
		return createVNode(2, 'div', treeProps, createVNode(8, TreeNode, data.root, null, null, shouldDataUpdate, true), null, null, true);
	}

	function AnimBox(data) {
		var time = data.time;
		var style = 'border-radius:' + (time % 10) + 'px;' +
			'background:rgba(0,0,0,' + (0.5 + ((time % 10) / 10)) + ')';

		return createVNode(2, 'div', { className: 'AnimBox', style: style, 'data-id': data.id }, null, null, null, true);
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

			children[i] = createVNode(8, AnimBox, item, null, null, shouldDataUpdate, true);
		}
		return createVNode(66, 'div', animProps, children, null, null, true);
	}

	function onClick(e, c, p) {
		console.log('Clicked', p);
		e.stopPropagation();
	}

	document.addEventListener('click', onClick);
	var tableCellProps = { className: 'TableCell' };

	function TableCell(text) {
		return createVNode(2, 'td', tableCellProps, text, null, null, true);
	}

	function TableRow(data) {
		var classes = 'TableRow';

		if (data.active) {
			classes = 'TableRow active';
		}
		var cells = data.props;
		var length = cells.length + 1;
		var children = new Array(length);

		children[0] = createVNode(8, TableCell, '#' + data.id, null, null, shouldDataUpdate, true);

		for (var i = 1; i < length; i++) {
			children[i] = createVNode(8, TableCell, cells[i - 1], null, null, shouldDataUpdate, true);
		}
		return createVNode(66, 'tr', { className: classes, 'data-id': data.id }, children, null, null, true);
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

			children[i] = createVNode(8, TableRow, item, null, null, shouldDataUpdate, true);
		}
		return createVNode(66, 'table', tableProps, children, null, null, true);
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
		return createVNode(2, 'div', mainProps, section, null, null, true);
	}

	document.addEventListener('DOMContentLoaded', function(e) {
		var container = document.querySelector('#App');

		uibench.run(
			function(state) {
				Inferno.render(main(state), container);
			},
			function(samples) {
				Inferno.render(
					createVNode(2, 'pre', null, JSON.stringify(samples, null, ' '), null, null, true), container
				);
			}
		);
	});
})();
