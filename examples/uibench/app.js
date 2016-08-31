(function() {
	"use strict";

	var t = Inferno.createVTemplate;
	var createVTemplateReducers = Inferno.createVTemplateReducers;
	var c = Inferno.createVComponent;
	var e = Inferno.createVElement;
	var ChildrenTypes = Inferno.ChildrenTypes;

	uibench.init('Inferno', '0.8.0-alpha6');

	var treeLeafTpl = createVTemplateReducers(function (id) {
		return e('li', { className: 'TreeLeaf' }, id, null, null, ChildrenTypes.TEXT);
	}, InfernoDOM);

	var treeNodeTpl = createVTemplateReducers(function (children) {
		return e('ul', { className: 'TreeNode' }, children, null, null, ChildrenTypes.KEYED_LIST);
	}, InfernoDOM);

	function TreeLeaf(id) {
		return t(treeLeafTpl, null, id, null);
	}

	function TreeNode(data) {
		var length = data.children.length;
		var children = new Array(length);

		for (var i = 0; i < length; i++) {
			var n = data.children[i];

			if (n.container) {
				children[i] = c(TreeNode, n, n.id, shouldDataUpdate, null);
			} else {
				children[i] = c(TreeLeaf, n.id, n.id, shouldDataUpdate, null);
			}
		}
		return t(treeNodeTpl, null, children, null);
	}

	var treeTpl = createVTemplateReducers(function (root) {
		return e('div', { className: 'Tree' }, root, null, null, ChildrenTypes.NODE);
	}, InfernoDOM);

	var lastTreeData;

	function tree(data) {
		if (data === lastTreeData) {
			return Inferno.NO_OP;
		}
		lastTreeData = data;
		return t(treeTpl, null, c(TreeNode, data.root, null, shouldDataUpdate, null), null);
	}

	var animBoxTpl = createVTemplateReducers(function (id, style) {
		return e('div', { className: 'AnimBox', style: style, 'data-id': id }, null, null, null, null);
	}, InfernoDOM);

	function AnimBox(data) {
		var time = data.time;
		var style = 'border-radius: ' + (time % 10) + 'px;' +
			'background: rgba(0,0,0,' + (0.5 + ((time % 10) / 10)) + ')';
		return t(animBoxTpl, null, data.id, [style]);
	}

	var animTpl = createVTemplateReducers(function (children) {
		return e('div', { className: 'Anim' }, children, null, null, ChildrenTypes.KEYED_LIST);
	}, InfernoDOM);

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

			children[i] = c(AnimBox, item, item.id, shouldDataUpdate, null);
		}
		return t(animTpl, null, children, null);
	}

	function onClick(e) {
		console.log('Clicked ' + e.target.value);
		e.stopPropagation();
	}

	document.addEventListener('click', onClick);

	var tableCellTpl = createVTemplateReducers(function (text) {
		return e('td', { 
			className: 'TableCell',
			value: text
		}, text, null, null, ChildrenTypes.TEXT);
	}, InfernoDOM);

	var tableRowTpl = createVTemplateReducers(function (classes, id, children) {
		return e('tr', { className: classes, 'data-id': id }, children, null, null, ChildrenTypes.KEYED_LIST);
	}, InfernoDOM);

	function TableCell(text) {
		return t(tableCellTpl, null, text, null);
	}

	function TableRow(data) {
		var classes = 'TableRow';

		if (data.active) {
			classes = 'TableRow active';
		}
		var cells = data.props;
		var length = cells.length + 1;
		var children = new Array(length);

		children[0] = c(TableCell, '#' + data.id, -1, shouldDataUpdate, null);

		for (var i = 1; i < length; i++) {
			children[i] = c(TableCell, cells[i - 1], i, shouldDataUpdate, null);
		}
		return t(tableRowTpl, null, classes, [data.id, children]);
	}

	var tableTpl = createVTemplateReducers(function (children) {
		return e('table', { className: 'Table' }, children, null, null, ChildrenTypes.KEYED_LIST);
	}, InfernoDOM);

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

			children[i] = c(TableRow, item, item.id, shouldDataUpdate, null);
		}
		return t(tableTpl, null, children, null);
	}

	var mainTpl = createVTemplateReducers(function (section) {
		return e('div', { className: 'Main' }, section, null, null, ChildrenTypes.NODE);
	}, InfernoDOM);

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
		return t(mainTpl, null, section, null);
	}

	var preTpl = createVTemplateReducers(function (text) {
		return e('pre', null, text, null, null, ChildrenTypes.TEXT);
	}, InfernoDOM);

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
				InfernoDOM.render(t(preTpl, null, JSON.stringify(samples, null, ' '), null), container);
			}
		);
	});
})();
