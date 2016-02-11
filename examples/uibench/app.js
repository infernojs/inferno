(function() {
	"use strict";

	uibench.init('Inferno', '0.6.0');

	var animBox1 = {
		dom: Inferno.staticCompiler.createElement('div', { className : 'AnimBox' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		key: null,
		attrs: [{ name: 'className', value: 'AnimBox' }],
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var AnimBox = function (props) {
		var data = props.data;
		var time = data.time;
		var style =
			'border-radius:' + (time % 10).toString() + 'px;' +
			'background:rgba(0,0,0,' + (0.5 + ((time % 10) / 10)).toString() + ')';

		return {
			dom: null,
			static: animBox1,
			tag: null,
			key: null,
			attrs: [
				{ name: 'style', value: style },
				{ name: 'data-id', value: data.id }
			],
			events: null,
			children: null,
			nextNode: null,
			instance: null
		};
	}

	var anim1 = {
		dom: Inferno.staticCompiler.createElement('div', { className : 'Anim' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		key: null,
		attrs: [{ name: 'className', value: 'Anim' }],
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var anim2 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: null,
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var Anim = function (props) {
		var data = props.data;
		var items = data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push({
				dom: null,
				static: anim2,
				tag: AnimBox,
				key: item.id,
				attrs: {
					data: item
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				nextNode: null,
				instance: null
			});
		}

		return {
			dom: null,
			static: anim1,
			tag: null,
			key: null,
			attrs: null,
			events: null,
			children: children,
			nextNode: null,
			instance: null
		};
	}

	var tableCell1 = {
		dom: Inferno.staticCompiler.createElement('td', { className: 'TableCell' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'td',
		key: null,
		attrs: [{ name: 'className', value: 'TableCell' }],
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	function updateTableCell(domNode, lastProps, nextProps) {
		return lastProps.text !== nextProps.text;
	}

	var TableCell = function (props) {
		return {
			dom: null,
			static: tableCell1,
			tag: null,
			key: null,
			attrs: null,
			events: { click: (e) => {
				console.log('Clicked' + props.text);
				e.stopPropagation();
			} },
			children: props.text,
			nextNode: null,
			instance: null
		};
	};

	var tableRow1 = {
		dom: Inferno.staticCompiler.createElement('tr'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tr',
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var tableRow2 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: null,
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var TableRow = function (props) {
		var data = props.data;
		var classes = 'TableRow';
		if (data.active) {
			classes = 'TableRow active';
		}
		var cells = data.props;

		var children = [({
			dom: null,
			static: tableRow2,
			tag: TableCell,
			key: -1,
			attrs: { text: '#' + data.id },
			events: {
				componentShouldUpdate: updateTableCell
			},
			children: null,
			nextNode: null,
			instance: null
		})];
		for (var i = 0; i < cells.length; i++) {
			children.push({
				dom: null,
				static: tableRow2,
				tag: TableCell,
				key: i,
				attrs: { text: cells[i] },
				events: {
					componentShouldUpdate: updateTableCell
				},
				children: null,
				nextNode: null,
				instance: null
			});
		}
		return {
			dom: null,
			static: tableRow1,
			tag: null,
			key: null,
			attrs: [{ name: 'className', value: classes }, { name: 'data-id', value: data.id }],
			events: null,
			children: children,
			nextNode: null,
			instance: null
		};
	}

	var table1 = {
		dom: Inferno.staticCompiler.createElement('table', { className: 'Table' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'table',
		key: null,
		attrs: [{ name: 'className', value: 'Table' }],
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var table2 = {
		dom: Inferno.staticCompiler.createElement('tbody'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'tbody',
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var table3 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: null,
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var Table = function (props) {
		var items = props.data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push({
				dom: null,
				static: table3,
				tag: TableRow,
				key: null,
				attrs: {
					key: item.id,
					data: item
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				children: null,
				nextNode: null,
				instance: null
			});
		}

		return {
			dom: null,
			static: table1,
			tag: null,
			key: null,
			attrs: null,
			events: null,
			children: {
				dom: null,
				static: table2,
				tag: null,
				key: null,
				attrs: null,
				events: null,
				children: children,
				nextNode: null,
				instance: null
			},
			nextNode: null,
			instance: null
		};
	};

	var treeLeaf1 = {
		dom: Inferno.staticCompiler.createElement('li', { className: 'TreeLeaf' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'li',
		key: null,
		attrs: [{name: 'className', value: 'TreeLeaf' }],
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var TreeLeaf = function (props) {
		return {
			dom: null,
			static: treeLeaf1,
			tag: null,
			key: null,
			attrs: null,
			events: {
				componentShouldUpdate: appUpdateCheck
			},
			children: '' + props.data.id,
			nextNode: null,
			instance: null
		};
	};

	var treeNode1 = {
		dom: Inferno.staticCompiler.createElement('ul', { className: 'TreeNode' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'ul',
		key: null,
		attrs: [{name: 'className', value: 'TreeNode' }],
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var treeNode2 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: null,
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var treeNode3 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: null,
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var TreeNode = function (props) {
		var data = props.data;
		var children = [];

		for (var i = 0; i < data.children.length; i++) {
			var n = data.children[i];
			if (n.container) {
				children.push({
					dom: null,
					static: treeNode2,
					tag: TreeNode,
					key: n.id,
					attrs: {
						data: n
					},
					events: {
						componentShouldUpdate: appUpdateCheck
					},
					children: null,
					nextNode: null,
					instance: null
				});
			} else {
				children.push({
					dom: null,
					static: treeNode3,
					tag: TreeLeaf,
					key: n.id,
					attrs: {
						data: n
					},
					events: {
						componentShouldUpdate: appUpdateCheck
					},
					children: null,
					nextNode: null,
					instance: null
				});
			}
		}

		return {
			dom: null,
			static: treeNode1,
			tag: null,
			key: null,
			attrs: null,
			events: null,
			children: children,
			nextNode: null,
			instance: null
		};
	}

	var tree1 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'Tree' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		key: null,
		attrs: [{name: 'className', value: 'Tree'}],
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var tree2 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: null,
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var Tree = function (props) {
		return {
			dom: null,
			static: tree1,
			tag: null,
			key: null,
			attrs: null,
			events: null,
			children: {
				dom: null,
				static: tree2,
				tag: TreeNode,
				key: null,
				attrs: {
					data: props.data.root
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				children: null,
				nextNode: null,
				instance: null
			},
			nextNode: null,
			instance: null
		};
	}

	var main1 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'Main' }),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'div',
		key: null,
		attrs: [{name: 'className', value: 'Main'}],
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var main2 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: null,
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var main3 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: null,
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var main4 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: null,
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var Main = function (props) {
		var data = props.data;
		var location = data.location;

		var section;
		if (location === 'table') {
			section = {
				dom: null,
				static: main2,
				tag: Table,
				key: null,
				attrs: {
					data: data.table
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				children: null,
				nextNode: null,
				instance: null
			};
		} else if (location === 'anim') {
			section = {
				dom: null,
				static: main3,
				tag: Anim,
				key: null,
				attrs: {
					data: data.anim
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				children: null,
				nextNode: null,
				instance: null
			};
		} else if (location === 'tree') {
			section = {
				dom: null,
				static: main4,
				tag: Tree,
				key: null,
				attrs: {
					data: data.tree
				},
				events: {
					componentShouldUpdate: appUpdateCheck
				},
				children: null,
				nextNode: null,
				instance: null
			};
		}

		return {
			dom: null,
			static: main1,
			tag: null,
			key: null,
			attrs: null,
			events: null,
			children: section,
			nextNode: null,
			instance: null
		};
	}

	var app1 = {
		dom: null,
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: null,
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	var app2 = {
		dom: Inferno.staticCompiler.createElement('pre'),
		static: {
			keyed: [],
			nonKeyed: []
		},
		tag: 'pre',
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	function appUpdateCheck(domNode, lastProps, nextProps) {
		return lastProps.data !== nextProps.data;
	}

	document.addEventListener('DOMContentLoaded', function(e) {
		var container = document.querySelector('#App');

		uibench.run(
			function(state) {
				InfernoDOM.render({
					dom: null,
					static: app1,
					tag: Main,
					key: null,
					attrs: {
						data: state
					},
					events: {
						componentShouldUpdate: appUpdateCheck
					},
					children: null,
					nextNode: null,
					instance: null
				}, container)
			},
			function(samples) {
				InfernoDOM.render({
					dom: null,
					static: app2,
					tag: null,
					key: null,
					attrs: null,
					events: null,
					children: JSON.stringify(samples, null, ' '),
					nextNode: null,
					instance: null
				}, container);
			}
		);
	});

})();