import { render } from 'inferno';
import Component from 'inferno-component';
import { assert, spy } from 'sinon';
import { innerHTML } from 'inferno-utils';

describe('Children - (JSX)', () => {
	let container;

	beforeEach(function() {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function() {
		render(null, container);
		container.innerHTML = '';
		document.body.removeChild(container);
	});

	describe('keyed - children', function() {
		it('Should push to correct location when it keyed list has siblings', function() {
			const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div id={id} key={key} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />)}
						<Tab onSelect={create} id="add" title="Add" />
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>'),
			);
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div id="add">Add</div></div>',
				),
			);
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div id="add">Add</div></div>',
				),
			);
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>',
				),
			);
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div>New 5</div><div id="add">Add</div></div>',
				),
			);
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div id={id} key={key} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />)}
						<Tab onSelect={create} id="add" title="Add" />
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group"><div id="add">Add</div></div>'));
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>New 0</div><div id="add">Add</div></div>'),
			);
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div></div>'),
			);
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div id={id} key={key} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						<Tab onSelect={create} id="add" title="Add" />
						{tabs.map((tab, i) => <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />)}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group"><div id="add">Add</div></div>'));
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div id="add">Add</div><div>New 0</div></div>'),
			);
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div id="add">Add</div><div>New 0</div><div>New 1</div></div>'),
			);
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div id={id} key={key} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />)}
						<Tab onSelect={create} id="add" title="Add" />
						{tabs.map((tab, i) => <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />)}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group"><div id="add">Add</div></div>'));
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>New 0</div><div id="add">Add</div><div>New 0</div></div>'),
			);
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div><div>New 0</div><div>New 1</div></div>',
				),
			);
		});

		it('Should appendx3 to correct location when it keyed list has siblings', function() {
			const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div id={id} key={key} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: 'New ' + tabs.length });
					tabs.push({ title: 'New ' + tabs.length });
					tabs.push({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />)}
						<Tab onSelect={create} id="add" title="Add" />
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>'),
			);
			const addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>',
				),
			);
		});

		it('Should unshiftx3 to correct location when it keyed list has siblings', function() {
			const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div id={id} key={key} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.unshift({ title: 'New ' + tabs.length });
					tabs.unshift({ title: 'New ' + tabs.length });
					tabs.unshift({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />)}
						<Tab onSelect={create} id="add" title="Add" />
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>'),
			);
			const addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>New 4</div><div>New 3</div><div>New 2</div><div>Item A</div><div>Item B</div><div id="add">Add</div></div>',
				),
			);
		});

		it('Inline text element before array list', function() {
			const _tabs = [];

			function Tab({ title, key }) {
				return (
					<div key={key}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				return (
					<div className="tab-group">
						inlineText{tabs.map((tab, i) => <Tab key={'Item ' + i} title={tab.title} />)}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group">inlineText</div>'));

			_tabs.push({ title: 'New ' + _tabs.length });
			renderIt();

			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group">inlineText<div>New 0</div></div>'));
		});

		it('Inline text element after array list', function() {
			const _tabs = [];

			function Tab({ title, key }) {
				return (
					<div key={key}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab key={'Item ' + i} title={tab.title} />)}inlineText
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group">inlineText</div>'));

			_tabs.push({ title: 'New ' + _tabs.length });
			renderIt();

			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group"><div>New 0</div>inlineText</div>'));
		});
	});

	describe('nonKeyed - children', function() {
		it('Should push to correct location when it keyed list has siblings', function() {
			const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];

			function Tab({ title, onSelect, id }) {
				return (
					<div id={id} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab title={tab.title} onSelect={() => undefined} />)}
						<Tab onSelect={create} id="add" title="Add" />
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>'),
			);
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div id="add">Add</div></div>',
				),
			);
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div id="add">Add</div></div>',
				),
			);
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>',
				),
			);
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div>New 5</div><div id="add">Add</div></div>',
				),
			);
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, id }) {
				return (
					<div id={id} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab title={tab.title} onSelect={() => undefined} />)}
						<Tab onSelect={create} id="add" title="Add" />
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group"><div id="add">Add</div></div>'));
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>New 0</div><div id="add">Add</div></div>'),
			);
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div></div>'),
			);
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, id }) {
				return (
					<div id={id} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						<Tab onSelect={create} id="add" title="Add" />
						{tabs.map((tab, i) => <Tab title={tab.title} onSelect={() => undefined} />)}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group"><div id="add">Add</div></div>'));
			const addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div id="add">Add</div><div>New 0</div></div>'),
			);
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div id="add">Add</div><div>New 0</div><div>New 1</div></div>'),
			);
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, id }) {
				return (
					<div id={id} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab title={tab.title} onSelect={() => undefined} />)}
						<Tab onSelect={create} id="add" title="Add" />
						{tabs.map((tab, i) => <Tab title={tab.title} onSelect={() => undefined} />)}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group"><div id="add">Add</div></div>'));
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>New 0</div><div id="add">Add</div><div>New 0</div></div>'),
			);
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div><div>New 0</div><div>New 1</div></div>',
				),
			);
		});

		it('Should appendx3 to correct location when it list has siblings', function() {
			const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];

			function Tab({ title, onSelect, id }) {
				return (
					<div id={id} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: 'New ' + tabs.length });
					tabs.push({ title: 'New ' + tabs.length });
					tabs.push({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab title={tab.title} onSelect={() => undefined} />)}
						<Tab onSelect={create} id="add" title="Add" />
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>'),
			);
			const addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>',
				),
			);
		});

		it('Should unshiftx3 to correct location when it list has siblings', function() {
			const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];

			function Tab({ title, onSelect, id }) {
				return (
					<div id={id} onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.unshift({ title: 'New ' + tabs.length });
					tabs.unshift({ title: 'New ' + tabs.length });
					tabs.unshift({ title: 'New ' + tabs.length });
					renderIt();
				}

				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab title={tab.title} onSelect={() => undefined} />)}
						<Tab onSelect={create} id="add" title="Add" />
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(
				innerHTML('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>'),
			);
			const addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="tab-group"><div>New 4</div><div>New 3</div><div>New 2</div><div>Item A</div><div>Item B</div><div id="add">Add</div></div>',
				),
			);
		});

		it('Inline text element before array list', function() {
			const _tabs = [];

			function Tab({ title }) {
				return (
					<div>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				return (
					<div className="tab-group">
						inlineText{tabs.map((tab, i) => <Tab title={tab.title} />)}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group">inlineText</div>'));

			_tabs.push({ title: 'New ' + _tabs.length });
			renderIt();

			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group">inlineText<div>New 0</div></div>'));
		});

		it('Inline text element after array list', function() {
			const _tabs = [];

			function Tab({ title }) {
				return (
					<div>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				return (
					<div className="tab-group">
						{tabs.map((tab, i) => <Tab title={tab.title} />)}inlineText
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs} />, container);
			}

			renderIt();

			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group">inlineText</div>'));

			_tabs.push({ title: 'New ' + _tabs.length });
			renderIt();

			expect(container.innerHTML).toBe(innerHTML('<div class="tab-group"><div>New 0</div>inlineText</div>'));
		});
	});

	describe('mixed children edge cases', function() {
		it('NONKEYED - should remove children from correct location when there is dynamic static item', function() {
			const items = ['a', 'b', 'c'];
			const emptyArray = [];
			const items3 = ['v', 'a'];
			let visible = false;
			let activeOne;

			function Loop({ text }) {
				return (
					<p>
						{text}
					</p>
				);
			}

			function Looper({ collectionOne, visibleStatic }) {
				return (
					<div className="c">
						{visibleStatic ? <Loop text="static" /> : null}
						{collectionOne.map(text => <Loop text={text} />)}
					</div>
				);
			}

			function renderIt() {
				render(<Looper collectionOne={activeOne} visibleStatic={visible} />, container);
			}

			visible = true;
			activeOne = items;
			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p></div>'));

			visible = false;
			activeOne = items3;
			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="c"><p>v</p><p>a</p></div>'));

			visible = true;
			activeOne = items3;
			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="c"><p>static</p><p>v</p><p>a</p></div>'));

			visible = true;
			activeOne = emptyArray;
			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="c"><p>static</p></div>'));
		});

		it('NONKEYED - should remove children from correct location when there is 2 dynamic static items and 2 lists', function() {
			const items = ['a', 'b', 'c'];
			const emptyArray = [];
			const items3 = ['v', 'a'];

			let activeOne;
			let activeTwo;
			let visibleOne = false;
			let visibleTwo = false;

			function Loop({ text }) {
				return (
					<p>
						{text}
					</p>
				);
			}

			function Looper({ collectionOne, visibleStaticOne, collectionTwo, visibleStaticTwo }) {
				return (
					<div className="c">
						{visibleStaticOne ? <Loop text="static" /> : null}
						{collectionOne.map(text => <Loop text={text} />)}
						{visibleStaticTwo ? <Loop text="static" /> : null}
						{collectionTwo.map(text => <Loop text={text} />)}
					</div>
				);
			}

			function renderIt() {
				render(
					<Looper
						collectionOne={activeOne}
						visibleStaticOne={visibleOne}
						collectionTwo={activeTwo}
						visibleStaticTwo={visibleTwo}
					/>,
					container,
				);
			}

			visibleOne = true;
			activeOne = items;
			visibleTwo = false;
			activeTwo = emptyArray;
			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p></div>'));

			visibleOne = true;
			activeOne = emptyArray;
			visibleTwo = true;
			activeTwo = items;
			renderIt();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="c"><p>static</p><p>static</p><p>a</p><p>b</p><p>c</p></div>'),
			);

			visibleOne = false;
			activeOne = items3;
			visibleTwo = false;
			activeTwo = emptyArray;
			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="c"><p>v</p><p>a</p></div>'));

			visibleOne = true;
			activeOne = items;
			visibleTwo = true;
			activeTwo = emptyArray;
			renderIt();
			expect(container.innerHTML).toBe(
				innerHTML('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p><p>static</p></div>'),
			);
		});

		it('KEYED - should remove children from correct location when there is dynamic static item', function() {
			const items = ['a', 'b', 'c'];
			const emptyArray = [];
			const items3 = ['v', 'a'];
			let visible = false;

			let activeOne;

			function Loop({ text }) {
				return (
					<p>
						{text}
					</p>
				);
			}

			function Looper({ collectionOne, visibleStatic }) {
				return (
					<div className="c">
						{visibleStatic ? <Loop i={-1} text="static" /> : null}
						{collectionOne.map((text, i) => <Loop key={i} text={text} />)}
					</div>
				);
			}

			function renderIt() {
				render(<Looper collectionOne={activeOne} visibleStatic={visible} />, container);
			}

			visible = true;
			activeOne = items;
			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p></div>'));

			visible = false;
			activeOne = items3;
			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="c"><p>v</p><p>a</p></div>'));

			visible = true;
			activeOne = items3;
			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="c"><p>static</p><p>v</p><p>a</p></div>'));

			visible = true;
			activeOne = emptyArray;
			renderIt();
			expect(container.innerHTML).toBe(innerHTML('<div class="c"><p>static</p></div>'));
		});
	});

	describe('Functions non keyed', () => {
		it('Should render correctly functions and nodes mixed', () => {
			// references for the sake of test case
			let updaterFirst = null;
			let updaterSecond = null;

			class A extends Component {
				constructor(props) {
					super(props);

					this.state = {
						first: true,
						second: true,
					};

					updaterFirst = () => this.setStateSync({ first: !this.state.first });
					updaterSecond = () => this.setStateSync({ second: !this.state.second });
				}

				render() {
					return (
						<div>
							<p>1</p>
							{function() {
								if (this.state.first) {
									return <span>abc</span>;
								}
								return null;
							}.call(this)}
							<p>2</p>
							{function() {
								if (this.state.second) {
									return <span>def</span>;
								}
								return null;
							}.call(this)}
							<p>3</p>
						</div>
					);
				}
			}

			render(<A />, container);
			expect(container.innerHTML).toBe(
				innerHTML('<div><p>1</p><span>abc</span><p>2</p><span>def</span><p>3</p></div>'),
			);
			updaterFirst();
			expect(container.innerHTML).toBe(innerHTML('<div><p>1</p><p>2</p><span>def</span><p>3</p></div>'));
			updaterSecond();
			expect(container.innerHTML).toBe(innerHTML('<div><p>1</p><p>2</p><p>3</p></div>'));
			updaterSecond();
			expect(container.innerHTML).toBe(innerHTML('<div><p>1</p><p>2</p><span>def</span><p>3</p></div>'));
			updaterFirst();
			expect(container.innerHTML).toBe(
				innerHTML('<div><p>1</p><span>abc</span><p>2</p><span>def</span><p>3</p></div>'),
			);
		});
	});

	describe('JSX plugin', () => {
		it('Should not have undefined properties', () => {
			class A extends Component {
				constructor(props) {
					super(props);
				}

				render() {
					return (
						<div>
							{this.props.children}
						</div>
					);
				}
			}

			class B extends Component {
				constructor(props) {
					super(props);
				}

				callback() {}

				render() {
					return (
						<A>
							<div onclick={this.callback}>B</div>
						</A>
					);
				}
			}

			render(<B />, container);
		});
	});

	describe('Rendering null on child node', () => {
		it('Should trigger unmount', () => {
			class A extends Component {
				constructor(props) {
					super(props);
				}

				render() {
					return (
						<div>
							{this.props.test}
						</div>
					);
				}
			}

			class B extends Component {
				constructor(props) {
					super(props);
				}

				componentWillUnmount() {}

				render() {
					return <p>B</p>;
				}
			}

			const unmountSpy = spy(B.prototype, 'componentWillUnmount');
			render(<A test={<B />} />, container);
			expect(container.innerHTML).toBe(innerHTML('<div><p>B</p></div>'));
			render(<A test={null} />, container);
			expect(container.innerHTML).toBe(innerHTML('<div></div>'));
			expect(unmountSpy.callCount).toBe(1);
		});
	});

	describe('VFragment within other nodes', () => {
		it('Should not clear nodes when non keyed', () => {
			const Nodes = ({ items }) =>
				<div>
					<div>test</div>
					{items.map(item => <span>{item}</span>)}
					<div>end</div>
				</div>;

			render(<Nodes items={[1, 2, 3]} />, container);
			expect(container.innerHTML).toBe(
				innerHTML('<div><div>test</div><span>1</span><span>2</span><span>3</span><div>end</div></div>'),
			);

			render(<Nodes items={[3, 2, 1]} />, container);
			expect(container.innerHTML).toBe(
				innerHTML('<div><div>test</div><span>3</span><span>2</span><span>1</span><div>end</div></div>'),
			);

			render(<Nodes items={[9, 8, 7]} />, container);
			expect(container.innerHTML).toBe(
				innerHTML('<div><div>test</div><span>9</span><span>8</span><span>7</span><div>end</div></div>'),
			);

			render(<Nodes items={[]} />, container);
			expect(container.innerHTML).toBe(innerHTML('<div><div>test</div><div>end</div></div>'));
		});

		it('Should not clear nodes when keyed inside vFragment', () => {
			const Nodes = ({ items }) =>
				<div>
					<div>test</div>
					{items.map(item => <span key={item}>{item}</span>)}
					<div>end</div>
				</div>;

			render(<Nodes items={[1, 2, 3]} />, container);
			expect(container.innerHTML).toBe(
				innerHTML('<div><div>test</div><span>1</span><span>2</span><span>3</span><div>end</div></div>'),
			);

			render(<Nodes items={[3, 2, 1]} />, container);
			expect(container.innerHTML).toBe(
				innerHTML('<div><div>test</div><span>3</span><span>2</span><span>1</span><div>end</div></div>'),
			);

			render(<Nodes items={[9, 8, 7]} />, container);
			expect(container.innerHTML).toBe(
				innerHTML('<div><div>test</div><span>9</span><span>8</span><span>7</span><div>end</div></div>'),
			);

			render(<Nodes items={[]} />, container);
			expect(container.innerHTML).toBe(innerHTML('<div><div>test</div><div>end</div></div>'));
		});

		it('Should not clear nodes when keyed inside vFragment #2', () => {
			const Nodes = ({ items }) =>
				<div>
					<div>test</div>
					{items.map(item => <span key={item}>{item}</span>)}
					<div>end</div>
				</div>;

			render(<Nodes items={[1]} />, container);
			expect(container.innerHTML).toBe(innerHTML('<div><div>test</div><span>1</span><div>end</div></div>'));

			render(<Nodes items={[]} />, container);
			expect(container.innerHTML).toBe(innerHTML('<div><div>test</div><div>end</div></div>'));

			render(null, container);
			expect(container.innerHTML).toBe('');

			render(<Nodes items={[1, 2, 3]} />, container);
			expect(container.innerHTML).toBe(
				innerHTML('<div><div>test</div><span>1</span><span>2</span><span>3</span><div>end</div></div>'),
			);
		});
	});

	describe('Forced keyed children', () => {
		it('Should always go keyed algorithm when parent has hasKeyedChildren', () => {
			const Collection = ({ children }) =>
				<div hasKeyedChildren>
					{children}
				</div>;

			render(
				<Collection>
					<div key="1">1</div>
					<div key="2">2</div>
					<div key="3">3</div>
				</Collection>,
				container,
			);

			expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div><div>3</div></div>');

			render(
				<Collection>
					<div key="3">3</div>
					<div key="2">2</div>
					<div key="1">1</div>
				</Collection>,
				container,
			);

			expect(container.innerHTML).toEqual('<div><div>3</div><div>2</div><div>1</div></div>');

			render(
				<Collection>
					<div key="3">3</div>
					<div key="2">2</div>
					<div key="11">11</div>
				</Collection>,
				container,
			);

			expect(container.innerHTML).toEqual('<div><div>3</div><div>2</div><div>11</div></div>');
		});

		it('Should be able to swap from keyed to nonkeyed when nextNode no longer is keyed', () => {
			const CollectionKeyed = ({ children }) =>
				<div hasKeyedChildren>
					{children}
				</div>;

			const CollectionNonKeyed = ({ children }) =>
				<div hasNonKeyedChildren>
					{children}
				</div>;

			render(
				<CollectionKeyed>
					<div key="1">1</div>
					<div key="2">2</div>
					<div key="3">3</div>
				</CollectionKeyed>,
				container,
			);

			expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div><div>3</div></div>');

			render(
				<CollectionNonKeyed>
					<div>3</div>
					<div>2</div>
				</CollectionNonKeyed>,
				container,
			);

			expect(container.innerHTML).toEqual('<div><div>3</div><div>2</div></div>');

			render(
				<CollectionKeyed>
					<div key="3">3</div>
					<div key="2">2</div>
					<div key="11">11</div>
				</CollectionKeyed>,
				container,
			);

			expect(container.innerHTML).toEqual('<div><div>3</div><div>2</div><div>11</div></div>');
		});

		it('Should handle previous being empty array', () => {
			const CollectionKeyed = ({ children }) =>
				<div hasKeyedChildren>
					{children}
				</div>;

			const child = [];
			render(
				<CollectionKeyed>
					{child}
				</CollectionKeyed>,
				container,
			);

			expect(container.innerHTML).toEqual('<div></div>');

			render(
				<CollectionKeyed>
					<div key="1">1</div>
					<div key="2">2</div>
					<div key="3">3</div>
				</CollectionKeyed>,
				container,
			);

			expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div><div>3</div></div>');
		});

		it('Should handle next being empty array', () => {
			const CollectionKeyed = ({ children }) =>
				<div hasKeyedChildren>
					{children}
				</div>;

			render(
				<CollectionKeyed>
					<div key="1">1</div>
					<div key="2">2</div>
					<div key="3">3</div>
				</CollectionKeyed>,
				container,
			);

			expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div><div>3</div></div>');

			const child = [];
			render(
				<CollectionKeyed>
					{child}
				</CollectionKeyed>,
				container,
			);

			expect(container.innerHTML).toEqual('<div></div>');
		});

		it('Should handle last/next being empty', () => {
			const CollectionKeyed = ({ children }) =>
				<div hasKeyedChildren>
					{children}
				</div>;

			const child = [];
			render(
				<CollectionKeyed>
					{child}
				</CollectionKeyed>,
				container,
			);

			expect(container.innerHTML).toEqual('<div></div>');

			const childB = [];

			render(
				<CollectionKeyed>
					{childB}
				</CollectionKeyed>,
				container,
			);

			expect(container.innerHTML).toEqual('<div></div>');
		});
	});

	describe('Unmount behavior in lists', () => {
		it('Should not call unmount when changing list length', () => {
			class UnMountTest extends Component {
				componentWillUnmount() {
					// Should not be here
				}

				render() {
					return <span>1</span>;
				}
			}

			class Parent extends Component {
				render() {
					let firstClassCitizen = null;
					if (this.props.firstClassCitizenIsBack) {
						firstClassCitizen = <div>b</div>;
					}

					// variable for debugging
					const node = (
						<div>
							<div>a</div>
							{firstClassCitizen}
							<UnMountTest />
							<div>C</div>
						</div>
					);

					return node;
				}
			}

			const spyUnmount = spy(UnMountTest.prototype, 'componentWillUnmount');
			const notCalled = assert.notCalled;

			render(<Parent firstClassCitizenIsBack={false} />, container); // initial render
			expect(container.innerHTML).toEqual('<div><div>a</div><span>1</span><div>C</div></div>');
			notCalled(spyUnmount);

			render(<Parent firstClassCitizenIsBack={true} />, container);
			expect(container.innerHTML).toEqual('<div><div>a</div><div>b</div><span>1</span><div>C</div></div>');
			notCalled(spyUnmount);
		});
	});

	describe('Children lifecycle with fastUnmount', () => {
		it('Should call componentWillUnmount for children', done => {
			let toggle;

			class Wrapper extends Component {
				constructor(props) {
					super(props);

					this.state = {
						bool: true,
					};

					toggle = () => {
						this.setState({
							bool: !this.state.bool,
						});
					};
				}

				render() {
					return (
						<div>
							<span>foobar</span>
							{this.state.bool ? <FooBar /> : null}
						</div>
					);
				}
			}

			class FooBar extends Component {
				constructor(props) {
					super(props);

					this.state = {
						text: 'initial',
					};
				}

				componentWillUnmount() {}

				componentWillMount() {}

				render() {
					return (
						<span>
							{this.state.text}
						</span>
					);
				}
			}

			render(<Wrapper />, container);

			const unMountSpy = spy(FooBar.prototype, 'componentWillUnmount');
			const mountSpy = spy(FooBar.prototype, 'componentWillMount');

			const calledOnce = assert.calledOnce;
			const notCalled = assert.notCalled;

			expect(container.innerHTML).toEqual('<div><span>foobar</span><span>initial</span></div>');

			mountSpy.reset();
			unMountSpy.reset();

			toggle(); // Unmount child component
			setTimeout(() => {
				expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');

				calledOnce(unMountSpy);
				notCalled(mountSpy);
				done();
			}, 10);
		});

		it('Should call componentWillUnmount for nested children', done => {
			let toggle;

			class Wrapper extends Component {
				constructor(props) {
					super(props);

					this.state = {
						bool: true,
					};

					toggle = () => {
						this.setState({
							bool: !this.state.bool,
						});
					};
				}

				render() {
					return (
						<div>
							<span>foobar</span>
							{this.state.bool ? <FooBar /> : null}
						</div>
					);
				}
			}

			class FooBar extends Component {
				render() {
					return (
						<span>
							<Test />
						</span>
					);
				}
			}

			class Test extends Component {
				componentWillUnmount() {}

				componentWillMount() {}

				render() {
					return <em>f</em>;
				}
			}

			render(<Wrapper />, container);

			const unMountSpy = spy(Test.prototype, 'componentWillUnmount');
			const mountSpy = spy(Test.prototype, 'componentWillMount');

			const calledOnce = assert.calledOnce;
			const notCalled = assert.notCalled;

			expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em></span></div>');

			mountSpy.reset();
			unMountSpy.reset();

			toggle(); // Unmount child component
			setTimeout(() => {
				expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');

				calledOnce(unMountSpy);
				notCalled(mountSpy);
				done();
			}, 10);
		});

		it('Should call componentWillUnmount for nested children #2', done => {
			let toggle;

			class Wrapper extends Component {
				constructor(props) {
					super(props);

					this.state = {
						bool: true,
					};

					toggle = () => {
						this.setState({
							bool: !this.state.bool,
						});
					};
				}

				render() {
					return (
						<div>
							<span>foobar</span>
							{this.state.bool ? <FooBar /> : null}
						</div>
					);
				}
			}

			class FooBar extends Component {
				render() {
					return (
						<span>
							<Test />
							<Foo />
						</span>
					);
				}
			}

			class Test extends Component {
				componentWillUnmount() {}

				render() {
					return <em>f</em>;
				}
			}

			class Foo extends Component {
				componentWillUnmount() {}

				render() {
					return <em>f</em>;
				}
			}

			render(<Wrapper />, container);

			const unMountSpy = spy(Test.prototype, 'componentWillUnmount');
			const unMountSpy2 = spy(Foo.prototype, 'componentWillUnmount');

			const calledOnce = assert.calledOnce;

			expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em><em>f</em></span></div>');

			unMountSpy2.reset();
			unMountSpy.reset();

			toggle(); // Unmount child component
			setTimeout(() => {
				expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');
				calledOnce(unMountSpy2);
				calledOnce(unMountSpy);
				done();
			}, 10);
		});

		it('Should call componentWillUnmount for deeply nested children', done => {
			let toggle;

			class Wrapper extends Component {
				constructor(props) {
					super(props);

					this.state = {
						bool: true,
					};

					toggle = () => {
						this.setState({
							bool: !this.state.bool,
						});
					};
				}

				render() {
					return (
						<div>
							<span>foobar</span>
							{this.state.bool ? <FooBar /> : null}
						</div>
					);
				}
			}

			class FooBar extends Component {
				render() {
					return (
						<span>
							<span>
								<span>
									<span>
										<Test />
									</span>
								</span>
							</span>
						</span>
					);
				}
			}

			class Test extends Component {
				render() {
					return <Test2 />;
				}
			}

			class Test2 extends Component {
				render() {
					return <Test4 />;
				}
			}

			class Test4 extends Component {
				render() {
					return (
						<div>
							<span />
							<Test5 />
							<span />
						</div>
					);
				}
			}

			class Test5 extends Component {
				componentWillUnmount() {}

				render() {
					return <h1>ShouldUnMountMe</h1>;
				}
			}

			render(<Wrapper />, container);

			const unMountSpy = spy(Test5.prototype, 'componentWillUnmount');

			const calledOnce = assert.calledOnce;

			expect(container.innerHTML).toEqual(
				'<div><span>foobar</span><span><span><span><span><div><span></span><h1>ShouldUnMountMe</h1><span></span></div></span></span></span></span></div>',
			);

			unMountSpy.reset();

			toggle(); // Unmount child component
			setTimeout(() => {
				expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');
				calledOnce(unMountSpy);
				done();
			});
		});

		it('Should call componentWillUnmount for parent when children dont have componentWIllUnmount', done => {
			class Wrapper extends Component {
				constructor(props) {
					super(props);
				}

				componentWillUnmount() {}

				render() {
					return (
						<div>
							<span>foobar</span>
							<FooBar />
						</div>
					);
				}
			}

			class FooBar extends Component {
				componentWillUnmount() {}

				render() {
					return (
						<span>
							<Test />
						</span>
					);
				}
			}

			class Test extends Component {
				render() {
					return <em>f</em>;
				}
			}

			render(<Wrapper />, container);

			const unMountSpy = spy(Wrapper.prototype, 'componentWillUnmount');
			const unMountSpy2 = spy(FooBar.prototype, 'componentWillUnmount');

			const calledOnce = assert.calledOnce;

			expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em></span></div>');

			unMountSpy.reset();
			unMountSpy2.reset();

			render(null, container);
			setTimeout(() => {
				expect(container.innerHTML).toEqual('');

				calledOnce(unMountSpy);
				calledOnce(unMountSpy2);
				done();
			}, 10);
		});

		it('Should fastUnmount child component when only parent has unmount callback', done => {
			class Wrapper extends Component {
				constructor(props) {
					super(props);
				}

				componentWillUnmount() {}

				render() {
					return (
						<div>
							<span>foobar</span>
							<FooBar kill={this.props.kill} />
						</div>
					);
				}
			}

			class FooBar extends Component {
				componentWillUnmount() {}

				render() {
					return (
						<span>
							{!this.props.kill ? <Test /> : null}
						</span>
					);
				}
			}

			class Test extends Component {
				render() {
					return (
						<em>
							<FastUnMountThis />
						</em>
					);
				}
			}

			let dirtyReference = null;
			let updateFastUnmountedComponent = null;

			class FastUnMountThis extends Component {
				constructor(props) {
					super(props);

					this.state = {
						text: 'aa',
					};

					dirtyReference = this;
					updateFastUnmountedComponent = () => {
						this.changeText();
					};
				}

				changeText() {
					this.setStateSync({
						text: 'foo',
					});
				}

				render() {
					return <pre onclick={function() {}}>{this.state.text}</pre>;
				}
			}

			render(<Wrapper kill={false} />, container);

			const unMountSpy = spy(Wrapper.prototype, 'componentWillUnmount');
			const unMountSpy2 = spy(FooBar.prototype, 'componentWillUnmount');

			const notCalled = assert.notCalled;

			expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em><pre>aa</pre></em></span></div>');

			render(<Wrapper kill={true} />, container);

			setTimeout(() => {
				expect(container.innerHTML).toEqual('<div><span>foobar</span><span></span></div>');

				notCalled(unMountSpy);
				notCalled(unMountSpy2);

				// This component is actually unmounted but fastUnmount skips unmount loop so unmounted remains false
				expect(dirtyReference._unmounted).toEqual(true);
				// Try to do setState and verify it doesn't fail
				updateFastUnmountedComponent();

				setTimeout(() => {
					expect(dirtyReference._unmounted).toEqual(true);
					expect(container.innerHTML).toEqual('<div><span>foobar</span><span></span></div>');

					done();
				}, 10);
			}, 10);
		});

		it('Should render call componentWillUnmount for children when later sibling has no lifecycle', () => {
			class Parent extends Component {
				constructor(props) {
					super(props);
				}

				componentWillUnmount() {}

				render() {
					return (
						<div>
							<HasLife />
							<NoLife />
						</div>
					);
				}
			}

			// This should be able to fastUnmount
			class NoLife extends Component {
				render() {
					return <span>nolife</span>;
				}
			}

			// This should have fastUnmount false
			class HasLife extends Component {
				componentWillUnmount() {}

				render() {
					return <span>haslife</span>;
				}
			}

			const unMountSpy = spy(Parent.prototype, 'componentWillUnmount');
			const unMountSpy2 = spy(HasLife.prototype, 'componentWillUnmount');

			const notCalled = assert.notCalled;
			const calledOnce = assert.calledOnce;

			render(<Parent />, container);

			notCalled(unMountSpy);
			notCalled(unMountSpy2);

			expect(container.innerHTML).toEqual('<div><span>haslife</span><span>nolife</span></div>');

			render(null, container);

			calledOnce(unMountSpy);
			calledOnce(unMountSpy2);
		});
	});

	describe('Children lifecycle with fastUnmount Functional Components', () => {
		it('Should call componentWillUnmount for children', () => {
			let mountCalls = 0;
			let unMountCalls = 0;
			const foobarLifecycle = {
				componentWillUnmount: () => {
					unMountCalls++;
				},
				componentWillMount: () => {
					mountCalls++;
				},
			};

			function Wrapper({ bool }) {
				return (
					<div>
						<span>foobar</span>
						{bool
							? <FooBar
									onComponentWillMount={foobarLifecycle.componentWillMount}
									onComponentWillUnmount={foobarLifecycle.componentWillUnmount}
								/>
							: null}
					</div>
				);
			}

			function FooBar() {
				return (
					<span>
						initial
					</span>
				);
			}

			render(<Wrapper bool={true} />, container);

			expect(container.innerHTML).toEqual('<div><span>foobar</span><span>initial</span></div>');

			expect(mountCalls).toEqual(1);
			expect(unMountCalls).toBeCloseTo(0);

			render(<Wrapper bool={false} />, container); // Unmount child component
			expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');

			expect(mountCalls).toEqual(1);
			expect(unMountCalls).toEqual(1);
		});

		it('Should call componentWillUnmount for nested children', () => {
			let unMountCalls = 0,
				mountCalls = 0;

			const testLifeCycle = {
				componentWillUnmount: () => {
					unMountCalls++;
				},
				componentWillMount: () => {
					mountCalls++;
				},
			};

			function Wrapper({ bool }) {
				return (
					<div>
						<span>foobar</span>
						{bool ? <FooBar /> : null}
					</div>
				);
			}

			function FooBar() {
				return (
					<span>
						<Test
							onComponentWillMount={testLifeCycle.componentWillMount}
							onComponentWillUnmount={testLifeCycle.componentWillUnmount}
						/>
					</span>
				);
			}

			function Test() {
				return <em>f</em>;
			}

			render(<Wrapper bool={true} />, container);

			expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em></span></div>');

			expect(mountCalls).toEqual(1);
			expect(unMountCalls).toBeCloseTo(0);

			render(<Wrapper bool={false} />, container); // Unmount child component
			expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');

			expect(mountCalls).toEqual(1);
			expect(unMountCalls).toEqual(1);
		});

		it('Should call componentWillUnmount for nested children #2', () => {
			let unMountTest = 0,
				unMountFoo = 0;

			const testLifeCycle = {
				componentWillUnmount: () => {
					unMountTest++;
				},
			};

			const fooLifecycle = {
				componentWillUnmount: () => {
					unMountFoo++;
				},
			};

			function Wrapper({ bool }) {
				return (
					<div>
						<span>foobar</span>
						{bool ? <FooBar /> : null}
					</div>
				);
			}

			function FooBar() {
				return (
					<span>
						<Test onComponentWillUnmount={testLifeCycle.componentWillUnmount} />
						<Foo onComponentWillUnmount={fooLifecycle.componentWillUnmount} />
					</span>
				);
			}

			function Test() {
				return <em>f</em>;
			}

			function Foo() {
				return <em>f</em>;
			}

			render(<Wrapper bool={true} />, container);

			expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em><em>f</em></span></div>');

			render(<Wrapper bool={false} />, container);
			expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');
			expect(unMountTest).toEqual(1);
			expect(unMountFoo).toEqual(1);
		});

		it('Should call componentWillUnmount for deeply nested children', () => {
			let unMountTest = 0;

			const testLifecycle = {
				componentWillUnmount: () => {
					unMountTest++;
				},
			};

			function Wrapper({ bool }) {
				return (
					<div>
						<span>foobar</span>
						{bool ? <FooBar /> : null}
					</div>
				);
			}

			function FooBar() {
				return (
					<span>
						<span>
							<span>
								<span>
									<Test />
								</span>
							</span>
						</span>
					</span>
				);
			}

			function Test() {
				return <Test2 />;
			}

			function Test2() {
				return <Test4 />;
			}

			function Test4() {
				return (
					<div>
						<span />
						<Test5 onComponentWillUnmount={testLifecycle.componentWillUnmount} />
						<span />
					</div>
				);
			}

			function Test5() {
				return <h1>ShouldUnMountMe</h1>;
			}

			render(<Wrapper bool={true} />, container);

			expect(container.innerHTML).toEqual(
				'<div><span>foobar</span><span><span><span><span><div><span></span><h1>ShouldUnMountMe</h1><span></span></div></span></span></span></span></div>',
			);

			render(<Wrapper bool={false} />, container);
			expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');

			expect(unMountTest).toEqual(1);
		});

		it('Should call componentWillUnmount for parent when children dont have componentWIllUnmount', done => {
			let unMountTest = 0,
				unMountTwoTest = 0;

			const testLifecycle = {
				componentWillUnmount: () => {
					unMountTest++;
				},
				componentWillUnmountTwo: () => {
					unMountTwoTest++;
				},
			};

			function Wrapper() {
				return (
					<div>
						<span>foobar</span>
						<FooBar onComponentWillUnmount={testLifecycle.componentWillUnmountTwo} />
					</div>
				);
			}

			function FooBar() {
				return (
					<span>
						<Test />
					</span>
				);
			}

			function Test() {
				return <em>f</em>;
			}

			render(<Wrapper onComponentWillUnmount={testLifecycle.componentWillUnmount} />, container);

			expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em></span></div>');

			render(null, container);
			setTimeout(() => {
				expect(container.innerHTML).toEqual('');

				expect(unMountTest).toEqual(1);
				expect(unMountTwoTest).toEqual(1);
				done();
			}, 10);
		});
	});
});
