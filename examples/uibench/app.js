(function() {
	"use strict";

	uibench.init('Inferno', '0.7');

	var defaultAppUpdateCheck = {
		componentShouldUpdate: appUpdateCheck
	};

	var defaultUpdateTableCell = {
		componentShouldUpdate: updateTableCell
	};

	var animBox1 = Inferno.createBlueprint({
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

	var anim1 = Inferno.createBlueprint({
		tag: 'div',
		className: 'Anim',
		children: { arg: 0 }
	}, 4);

	var anim2 = Inferno.createBlueprint({
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
			children.push(anim2(AnimBox, { data: item }, defaultAppUpdateCheck, item.id));
		}
		return anim1(children);
	};

	var tableCell1 = Inferno.createBlueprint({
		tag: 'td',
		className: 'TableCell',
		children: { arg: 0 },
		events: { arg: 1 },
		attrs: { arg: 2 }
	}, 1);

	function updateTableCell(domNode, lastProps, nextProps) {
		return lastProps.text !== nextProps.text;
	}

	function onClick(e) {
		console.log('Clicked' + e.xtag);
		e.stopPropagation();
	}

	var TableCell = function (props) {
		return tableCell1(props.text, {
			onclick: onClick
		}, {
			xtag: props.text
		});
	};

	var tableRow1 = Inferno.createBlueprint({
		tag: 'tr',
		children: { arg: 0 },
		className: { arg: 1 },
		attrs: { arg: 2 }
	}, 4);

	var tableRow2 = Inferno.createBlueprint({
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
			tableRow2(TableCell, { text: '#' + data.id }, defaultUpdateTableCell, -1)
		];

		for (var i = 0; i < cells.length; i++) {
			children.push(
				tableRow2(TableCell, { text: cells[i] }, defaultUpdateTableCell, i)
			);
		}

		return tableRow1(children, classes, { 'data-id': data.id });
	};

	var table1 = Inferno.createBlueprint({
		tag: 'table',
		className: 'Table',
		children: { arg: 0 }
	}, 2);

	var table2 = Inferno.createBlueprint({
		tag: 'tbody',
		children: { arg: 0 }
	}, 4);

	var table3 = Inferno.createBlueprint({
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
				table3(TableRow, { data: item }, defaultAppUpdateCheck, item.id)
			);
		}

		return table1(table2(children));
	};

	var treeLeaf1 = Inferno.createBlueprint({
		tag: 'li',
		className: 'TreeLeaf',
		children: { arg: 0 }
	}, 1);

	var TreeLeaf = function (props) {
		return treeLeaf1(props.data.id);
	};

	var treeNode1 = Inferno.createBlueprint({
		tag: 'ul',
		className: 'TreeNode',
		children: { arg: 0 }
	}, 4);

	var treeNode2 = Inferno.createBlueprint({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 },
		key: { arg: 3 }
	});

	var treeNode3 = Inferno.createBlueprint({
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
					}, defaultAppUpdateCheck, n.id)
				);
			} else {
				children.push(
					treeNode3(TreeLeaf, {
						data: n
					}, defaultAppUpdateCheck, n.id)
				);
			}
		}

		return treeNode1(children);
	};

	var tree1 = Inferno.createBlueprint({
		tag: 'div',
		className: 'Tree',
		children: { arg: 0 }
	}, 2);

	var tree2 = Inferno.createBlueprint({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 }
	});

	var Tree = function (props) {
		return tree1(
			tree2(TreeNode, {
				data: props.data.root
			}, defaultAppUpdateCheck)
		);
	};

	var main1 = Inferno.createBlueprint({
		tag: 'div',
		className: 'Main',
		children: { arg: 0 }
	}, 2);

	var main2 = Inferno.createBlueprint({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 }
	});

	var main3 = Inferno.createBlueprint({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 }
	});

	var main4 = Inferno.createBlueprint({
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
			}, defaultAppUpdateCheck);
		} else if (location === 'anim') {
			section = main3(Anim, {
				data: data.anim
			}, defaultAppUpdateCheck);
		} else if (location === 'tree') {
			section = main4(Tree, {
				data: data.tree
			}, defaultAppUpdateCheck);
		}

		return new main1(section);
	};

	var app1 = Inferno.createBlueprint({
		tag: { arg: 0 },
		attrs: { arg: 1 },
		hooks: { arg: 2 }
	});

	var app2 = Inferno.createBlueprint({
		tag: 'pre',
		children: { arg: 0 }
	}, 5);

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
					}, defaultAppUpdateCheck)
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
