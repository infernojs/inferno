(function() {
	"use strict";

	var t = Inferno.createVTemplate;
	var e = Inferno.createVElement;
	var ChildrenTypes = Inferno.ChildrenTypes;

	uibench.init('Inferno', '0.8.0-alpha4');

	var treeLeafTpl = t(function (id) {
		return e('li', { className: 'TreeLeaf' }, id, id, ChildrenTypes.TEXT);
	}, InfernoDOM);

	var treeNodeTpl = t(function (children, key) {
		return e('ul', { className: 'TreeNode' }, children, key, null, ChildrenTypes.KEYED_LIST);
	}, InfernoDOM);

	function treeNode(data) {
		var length = data.children.length;
		var children = new Array(length);

		for (var i = 0; i < length; i++) {
			var n = data.children[i];

			if (n.container) {
				children[i] = treeNode(n);
			} else {
				children[i] = treeLeafTpl(n.id);
			}
		}
		return treeNodeTpl(children, data.id);
	}

	var treeTpl = t(function (root) {
		return e('div', { className: 'Tree' }, root, null, null, ChildrenTypes.NODE);
	}, InfernoDOM);

	function tree(data) {
		return treeTpl(treeNode(data.root));
	}

	var animBoxTpl = t(function (id, style) {
		return e('div', { className: 'AnimBox', style: style, 'data-id': id }, null, id, null, null);
	}, InfernoDOM);

	function animBox(data) {
		var time = data.time;
		var style = 'border-radius: ' + (time % 10) + 'px;' +
			'background: rgba(0,0,0,' + (0.5 + ((time % 10) / 10)) + ')';
		return animBoxTpl(data.id, style);
	}

	var animTpl = t(function (children) {
		return e('div', { className: 'Anim' }, children, null, null, ChildrenTypes.KEYED_LIST);
	}, InfernoDOM);

	function anim(data) {
		var items = data.items;
		var length = items.length;
		var children = new Array(length);

		for (var i = 0; i < length; i++) {
			var item = items[i];

			children[i] = animBox(item);
		}
		return animTpl(children);
	}

	function onClick(e) {
		console.log('Clicked' + e.target.xtag);
		e.stopPropagation();
	}

	var tableCellTpl = t(function (text, key) {
		return e('td', { 
			className: 'TableCell',
			'xtag': text,
			onclick: onClick
		}, text, key, null, ChildrenTypes.TEXT);
	}, InfernoDOM);

	var tableRowTpl = t(function (classes, id, children) {
		return e('tr', { className: classes, 'data-id': id }, children, id, null, ChildrenTypes.KEYED_LIST);
	}, InfernoDOM);

	function tableRow(data) {
		var classes = 'TableRow';

		if (data.active) {
			classes = 'TableRow active';
		}
		var cells = data.props;
		var length = cells.length + 1;
		var children = new Array(length);

		children[0] = tableCellTpl('#' + data.id, -1);

		for (var i = 1; i < length; i++) {
			children[i] = tableCellTpl(cells[i - 1], i);
		}
		return tableRowTpl(classes, data.id, children);
	}

	var tableTpl = t(function (children) {
		return e('table', { className: 'Table' }, children, null, null, ChildrenTypes.KEYED_LIST);
	}, InfernoDOM);

	function table(data) {
		var items = data.items;
		var length = items.length;
		var children = new Array(length);

		for (var i = 0; i < length; i++) {
			var item = items[i];

			children[i] = tableRow(item);
		}
		return tableTpl(children);
	}

	var mainTpl = t(function (section) {
		return e('div').props({ className: 'Main' }).children(section).childrenType(ChildrenTypes.NODE);
	}, InfernoDOM);

	function main(data) {
		var location = data.location;
		var section;

		if (location === 'table') {
			section = table(data.table);
		} else if (location === 'anim') {
			section = anim(data.anim);
		} else if (location === 'tree') {
			section = tree(data.tree);
		}
		return mainTpl(section);
	}

	var preTpl = t(function (text) {
		return e('pre').children(text).childrenType(ChildrenTypes.TEXT);
	}, InfernoDOM);

	document.addEventListener('DOMContentLoaded', function(e) {
		var container = document.querySelector('#App');

		uibench.run(
			function(state) {
				InfernoDOM.render(main(state), container);
			},
			function(samples) {
				InfernoDOM.render(preTpl(JSON.stringify(samples, null, ' ')), container);
			}
		);
	});
})();
