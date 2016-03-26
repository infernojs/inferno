(function() {
	"use strict";

	uibench.init('Inferno', '0.6.0');

	var animBox1 = {
		dom: Inferno.staticCompiler.createElement('div', { className : 'AnimBox' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'div',
		className: 'AnimBox'
	};

	var AnimBox = function (props) {
		var data = props.data;
		var time = data.time;
		var style =
			'border-radius:' + (time % 10).toString() + 'px;' +
			'background:rgba(0,0,0,' + (0.5 + ((time % 10) / 10)).toString() + ')';

		return {
			tpl: animBox1,
			style: style,
			attrs: { 'data-id': data.id }
		};
	};

	var anim1 = {
		dom: Inferno.staticCompiler.createElement('div', { className : 'Anim' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'div',
		className: 'Anim'
	};

	var anim2 = {
		pools: {
			keyed: {},
			nonKeyed: []
		}
	};

	var Anim = function (props) {
		var data = props.data;
		var items = data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push({
				tpl: anim2,
				tag: AnimBox,
				key: item.id,
				attrs: {
					data: item
				},
				hooks: {
					componentShouldUpdate: appUpdateCheck
				}
			});
		}

		return {
			tpl: anim1,
			children: children
		};
	};

	var tableCell1 = {
		dom: Inferno.staticCompiler.createElement('td', { className: 'TableCell' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'td',
		className: 'TableCell'
	};

	function updateTableCell(domNode, lastProps, nextProps) {
		return lastProps.text !== nextProps.text;
	}

	var TableCell = function (props) {
		return {
			tpl: tableCell1,
			events: { click: (e) => {
				console.log('Clicked' + props.text);
				e.stopPropagation();
			} },
			children: props.text
		};
	};

	var tableRow1 = {
		dom: Inferno.staticCompiler.createElement('tr'),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'tr'
	};

	var tableRow2 = {
		pools: {
			keyed: {},
			nonKeyed: []
		}
	};

	var TableRow = function (props) {
		var data = props.data;
		var classes = 'TableRow';
		if (data.active) {
			classes = 'TableRow active';
		}
		var cells = data.props;

		var children = [({
			tpl: tableRow2,
			tag: TableCell,
			key: -1,
			attrs: { text: '#' + data.id },
			hooks: {
				componentShouldUpdate: updateTableCell
			},
		})];
		for (var i = 0; i < cells.length; i++) {
			children.push({
				tpl: tableRow2,
				tag: TableCell,
				key: i,
				attrs: { text: cells[i] },
				hooks: {
					componentShouldUpdate: updateTableCell
				}
			});
		}
		return {
			tpl: tableRow1,
			attrs: { 'data-id': data.id },
			className: classes,
			children: children
		};
	}

	var table1 = {
		dom: Inferno.staticCompiler.createElement('table', { className: 'Table' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'table',
		className: 'Table'
	};

	var table2 = {
		dom: Inferno.staticCompiler.createElement('tbody'),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'tbody'
	};

	var table3 = {
		pools: {
			keyed: {},
			nonKeyed: []
		}
	};

	var Table = function (props) {
		var items = props.data.items;

		var children = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			children.push({
				tpl: table3,
				tag: TableRow,
				key: item.id,
				attrs: {
					data: item
				},
				hooks: {
					componentShouldUpdate: appUpdateCheck
				}
			});
		}

		return {
			tpl: table1,
			children: {
				tpl: table2,
				children: children
			}
		};
	};

	var treeLeaf1 = {
		dom: Inferno.staticCompiler.createElement('li', { className: 'TreeLeaf' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'li',
		className: 'TreeLeaf'
	};

	var TreeLeaf = function (props) {
		return {
			tpl: treeLeaf1,
			hooks: {
				componentShouldUpdate: appUpdateCheck
			},
			children: '' + props.data.id
		};
	};

	var treeNode1 = {
		dom: Inferno.staticCompiler.createElement('ul', { className: 'TreeNode' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'ul',
		className: 'TreeNode'
	};

	var treeNode2 = {
		pools: {
			keyed: {},
			nonKeyed: []
		}
	};

	var treeNode3 = {
		pools: {
			keyed: {},
			nonKeyed: []
		}
	};

	var TreeNode = function (props) {
		var data = props.data;
		var children = [];

		for (var i = 0; i < data.children.length; i++) {
			var n = data.children[i];
			if (n.container) {
				children.push({
					tpl: treeNode2,
					tag: TreeNode,
					key: n.id,
					attrs: {
						data: n
					},
					hooks: {
						componentShouldUpdate: appUpdateCheck
					}
				});
			} else {
				children.push({
					tpl: treeNode3,
					tag: TreeLeaf,
					key: n.id,
					attrs: {
						data: n
					},
					hooks: {
						componentShouldUpdate: appUpdateCheck
					}
				});
			}
		}

		return {
			tpl: treeNode1,
			children: children
		};
	};

	var tree1 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'Tree' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'div',
		className: 'Tree'
	};

	var tree2 = {
		pools: {
			keyed: {},
			nonKeyed: []
		}
	};

	var Tree = function (props) {
		return {
			tpl: tree1,
			children: {
				tpl: tree2,
				tag: TreeNode,
				attrs: {
					data: props.data.root
				},
				hooks: {
					componentShouldUpdate: appUpdateCheck
				}
			}
		};
	};

	var main1 = {
		dom: Inferno.staticCompiler.createElement('div', { className: 'Main' }),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'div',
		className: 'Main'
	};

	var main2 = {
		pools: {
			keyed: {},
			nonKeyed: []
		}
	};

	var main3 = {
		pools: {
			keyed: {},
			nonKeyed: []
		}
	};

	var main4 = {
		pools: {
			keyed: {},
			nonKeyed: []
		}
	};

	var Main = function (props) {
		var data = props.data;
		var location = data.location;

		var section;
		if (location === 'table') {
			section = {
				tpl: main2,
				tag: Table,
				attrs: {
					data: data.table
				},
				hooks: {
					componentShouldUpdate: appUpdateCheck
				}
			};
		} else if (location === 'anim') {
			section = {
				tpl: main3,
				tag: Anim,
				attrs: {
					data: data.anim
				},
				hooks: {
					componentShouldUpdate: appUpdateCheck
				}
			};
		} else if (location === 'tree') {
			section = {
				tpl: main4,
				tag: Tree,
				attrs: {
					data: data.tree
				},
				hooks: {
					componentShouldUpdate: appUpdateCheck
				}
			};
		}

		return {
			tpl: main1,
			children: section
		};
	};

	var app1 = {
		pools: {
			keyed: {},
			nonKeyed: []
		}
	};

	var app2 = {
		dom: Inferno.staticCompiler.createElement('pre'),
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: 'pre'
	};

	function appUpdateCheck(domNode, lastProps, nextProps) {
		return lastProps.data !== nextProps.data;
	}

	document.addEventListener('DOMContentLoaded', function(e) {
		var container = document.querySelector('#App');

		uibench.run(
			function(state) {
				InfernoDOM.render({
					tpl: app1,
					tag: Main,
					attrs: {
						data: state
					},
					hooks: {
						componentShouldUpdate: appUpdateCheck
					}
				}, container);
			},
			function(samples) {
				InfernoDOM.render({
					tpl: app2,
					children: JSON.stringify(samples, null, ' ')
				}, container);
			}
		);
	});

})();
