import { expect } from 'chai';
import { render } from './../rendering';
import Component from './../../component/es2015';
import * as Inferno from '../../testUtils/inferno';
Inferno; // suppress ts 'never used' error

import sinon from 'sinon';

describe('Children - (JSX)', () => {
	let container;

	beforeEach(function() {
		container = document.createElement('div');
	});

	afterEach(function() {
		container.innerHTML = '';
	});

	describe('keyed - children', function() {
		beforeEach(() => {
			container = document.createElement('div');
			document.body.appendChild(container);
		});

		afterEach(() => {
			document.body.removeChild(container);
			container.innerHTML = '';
		});

		it('Should push to correct location when it keyed list has siblings', function() {
			const _tabs = [{ title: "Item A" }, { title: "Item B" }];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div
						id={id}
						key={key}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							key={ "Item " + i }
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
						<Tab onSelect={create} id="add" title="Add"/>
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div id="add">Add</div></div>');
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div id="add">Add</div></div>');
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>');
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div>New 5</div><div id="add">Add</div></div>');
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div
						id={id}
						key={key}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							key={ "Item " + i }
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
						<Tab onSelect={create} id="add" title="Add"/>
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div id="add">Add</div></div>');
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 0</div><div id="add">Add</div></div>');
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div></div>');
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div
						id={id}
						key={key}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">
						<Tab onSelect={create} id="add" title="Add"/>{tabs.map((tab, i) => (
						<Tab
							key={ "Item " + i }
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div id="add">Add</div></div>');
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div id="add">Add</div><div>New 0</div></div>');
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div id="add">Add</div><div>New 0</div><div>New 1</div></div>');
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div
						id={id}
						key={key}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							key={ "Item " + i }
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
						<Tab onSelect={create} id="add" title="Add"/>{tabs.map((tab, i) => (
							<Tab
								key={ "Item " + i }
								title={ tab.title }
								onSelect={ () => undefined }/>
						))}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group"><div id="add">Add</div></div>');
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 0</div><div id="add">Add</div><div>New 0</div></div>');
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div><div>New 0</div><div>New 1</div></div>');
		});

		it('Should appendx3 to correct location when it keyed list has siblings', function() {
			const _tabs = [{ title: "Item A" }, { title: "Item B" }];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div
						id={id}
						key={key}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: "New " + tabs.length });
					tabs.push({ title: "New " + tabs.length });
					tabs.push({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							key={ "Item " + i }
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
						<Tab onSelect={create} id="add" title="Add"/>
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
			const addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>');
		});

		it('Should unshiftx3 to correct location when it keyed list has siblings', function() {
			const _tabs = [{ title: "Item A" }, { title: "Item B" }];

			function Tab({ title, onSelect, key, id }) {
				return (
					<div
						id={id}
						key={key}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.unshift({ title: "New " + tabs.length });
					tabs.unshift({ title: "New " + tabs.length });
					tabs.unshift({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							key={ "Item " + i }
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
						<Tab onSelect={create} id="add" title="Add"/>
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
			const addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 4</div><div>New 3</div><div>New 2</div><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
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
					<div class="tab-group">inlineText{tabs.map((tab, i) => (
						<Tab
							key={ "Item " + i }
							title={ tab.title }/>
					))}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group">inlineText</div>');

			_tabs.push({ title: "New " + _tabs.length });
			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group">inlineText<div>New 0</div></div>');
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
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							key={ "Item " + i }
							title={ tab.title }/>
					))}inlineText
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group">inlineText</div>');

			_tabs.push({ title: "New " + _tabs.length });
			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 0</div>inlineText</div>');
		});
	});

	describe('nonKeyed - children', function() {

		beforeEach(() => {
			container = document.createElement('div');
			document.body.appendChild(container);
		});

		afterEach(() => {
			document.body.removeChild(container);
			container.innerHTML = '';
		});

		it('Should push to correct location when it keyed list has siblings', function() {
			const _tabs = [{ title: "Item A" }, { title: "Item B" }];

			function Tab({ title, onSelect, id }) {
				return (
					<div
						id={id}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
						<Tab onSelect={create} id="add" title="Add"/>
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}></TabGroup>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div id="add">Add</div></div>');
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div id="add">Add</div></div>');
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>');
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div>New 5</div><div id="add">Add</div></div>');
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, id }) {
				return (
					<div
						id={id}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
						<Tab onSelect={create} id="add" title="Add"/>
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div id="add">Add</div></div>');
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 0</div><div id="add">Add</div></div>');
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div></div>');
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, id }) {
				return (
					<div
						id={id}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">
						<Tab onSelect={create} id="add" title="Add"/>{tabs.map((tab, i) => (
						<Tab
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group"><div id="add">Add</div></div>');
			const addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div id="add">Add</div><div>New 0</div></div>');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div id="add">Add</div><div>New 0</div><div>New 1</div></div>');
		});

		it('Should append child node to correct location when its empty at the beginning ', function() {
			const _tabs = [];

			function Tab({ title, onSelect, id }) {
				return (
					<div
						id={id}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
						<Tab onSelect={create} id="add" title="Add"/>{tabs.map((tab, i) => (
							<Tab
								title={ tab.title }
								onSelect={ () => undefined }/>
						))}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group"><div id="add">Add</div></div>');
			let addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 0</div><div id="add">Add</div><div>New 0</div></div>');
			addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div><div>New 0</div><div>New 1</div></div>');
		});

		it('Should appendx3 to correct location when it list has siblings', function() {
			const _tabs = [{ title: "Item A" }, { title: "Item B" }];

			function Tab({ title, onSelect, id }) {
				return (
					<div
						id={id}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.push({ title: "New " + tabs.length });
					tabs.push({ title: "New " + tabs.length });
					tabs.push({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
						<Tab onSelect={create} id="add" title="Add"/>
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
			const addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>');
		});

		it('Should unshiftx3 to correct location when it list has siblings', function() {
			const _tabs = [{ title: "Item A" }, { title: "Item B" }];

			function Tab({ title, onSelect, id }) {
				return (
					<div
						id={id}
						onClick={onSelect}>
						{title}
					</div>
				);
			}

			function TabGroup({ tabs }) {
				function create() {
					tabs.unshift({ title: "New " + tabs.length });
					tabs.unshift({ title: "New " + tabs.length });
					tabs.unshift({ title: "New " + tabs.length });
					renderIt();
				}

				return (
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							title={ tab.title }
							onSelect={ () => undefined }/>
					))}
						<Tab onSelect={create} id="add" title="Add"/>
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
			const addTab = container.querySelector('#add');
			addTab.click();
			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 4</div><div>New 3</div><div>New 2</div><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
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
					<div class="tab-group">inlineText{tabs.map((tab, i) => (
						<Tab
							title={ tab.title }/>
					))}
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group">inlineText</div>');

			_tabs.push({ title: "New " + _tabs.length });
			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group">inlineText<div>New 0</div></div>');
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
					<div class="tab-group">{tabs.map((tab, i) => (
						<Tab
							title={ tab.title }/>
					))}inlineText
					</div>
				);
			}

			function renderIt() {
				render(<TabGroup tabs={_tabs}/>, container);
			}

			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group">inlineText</div>');

			_tabs.push({ title: "New " + _tabs.length });
			renderIt();

			expect(container.innerHTML).to.equal('<div class="tab-group"><div>New 0</div>inlineText</div>');
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
					<div class="c">
						{visibleStatic ? <Loop text="static"/> : null}
						{collectionOne.map((text) => (
							<Loop
								text={ text }/>
						))}
					</div>
				);
			}

			function renderIt() {
				render(<Looper collectionOne={activeOne} visibleStatic={visible}/>, container);
			}

			visible = true;
			activeOne = items;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p></div>');

			visible = false;
			activeOne = items3;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>v</p><p>a</p></div>');

			visible = true;
			activeOne = items3;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>static</p><p>v</p><p>a</p></div>');

			visible = true;
			activeOne = emptyArray;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>static</p></div>');
		});

		it('NONKEYED - should remove children from correct location when there is 2 dynamic static items and 2 lists', function() {
			let items = ['a', 'b', 'c'];
			let emptyArray = [];
			let items3 = ['v', 'a'];

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
					<div class="c">
						{visibleStaticOne ? <Loop text="static"/> : null}
						{collectionOne.map((text) => (
							<Loop
								text={ text }/>
						))}
						{visibleStaticTwo ? <Loop text="static"/> : null}
						{collectionTwo.map((text) => (
							<Loop
								text={ text }/>
						))}
					</div>
				);
			}

			function renderIt() {
				render(<Looper collectionOne={activeOne} visibleStaticOne={visibleOne} collectionTwo={activeTwo} visibleStaticTwo={visibleTwo}/>, container);
			}

			visibleOne = true;
			activeOne = items;
			visibleTwo = false;
			activeTwo = emptyArray;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p></div>');

			visibleOne = true;
			activeOne = emptyArray;
			visibleTwo = true;
			activeTwo = items;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>static</p><p>static</p><p>a</p><p>b</p><p>c</p></div>');

			visibleOne = false;
			activeOne = items3;
			visibleTwo = false;
			activeTwo = emptyArray;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>v</p><p>a</p></div>');

			visibleOne = true;
			activeOne = items;
			visibleTwo = true;
			activeTwo = emptyArray;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p><p>static</p></div>');
		});

		it('KEYED - should remove children from correct location when there is dynamic static item', function() {
			let items = ['a', 'b', 'c'];
			let emptyArray = [];
			let items3 = ['v', 'a'];
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
					<div class="c">
						{visibleStatic ? <Loop i={-1} text="static"/> : null}
						{collectionOne.map((text, i) => (
							<Loop key={i}
										text={ text }/>
						))}
					</div>
				);
			}

			function renderIt() {
				render(<Looper collectionOne={activeOne} visibleStatic={visible}/>, container);
			}

			visible = true;
			activeOne = items;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p></div>');

			visible = false;
			activeOne = items3;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>v</p><p>a</p></div>');

			visible = true;
			activeOne = items3;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>static</p><p>v</p><p>a</p></div>');

			visible = true;
			activeOne = emptyArray;
			renderIt();
			expect(container.innerHTML).to.equal('<div class="c"><p>static</p></div>');
		});
	});

	describe('Functions non keyed', () => {
		it('Should render correctly functions and nodes mixed', () => {
			// references for the sake of test case
			let updaterFirst = null;
			let updaterSecond = null;

			class A extends Component<any, any> {
				constructor(props) {
					super(props);

					this.state = {
						first: true,
						second: true
					};

					updaterFirst = () => this.setState({ first: !this.state.first });
					updaterSecond = () => this.setState({ second: !this.state.second });
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
			expect(container.innerHTML).to.equal('<div><p>1</p><span>abc</span><p>2</p><span>def</span><p>3</p></div>');
			updaterFirst();
			expect(container.innerHTML).to.equal('<div><p>1</p><p>2</p><span>def</span><p>3</p></div>');
			updaterSecond();
			expect(container.innerHTML).to.equal('<div><p>1</p><p>2</p><p>3</p></div>');
			updaterSecond();
			expect(container.innerHTML).to.equal('<div><p>1</p><p>2</p><span>def</span><p>3</p></div>');
			updaterFirst();
			expect(container.innerHTML).to.equal('<div><p>1</p><span>abc</span><p>2</p><span>def</span><p>3</p></div>');
		});
	});

	describe('JSX plugin', () => {
		it('Should not have undefined properties', () => {
			class A extends Component<any, any> {
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

			class B extends Component<any, any> {
				constructor(props) {
					super(props);
				}

				callback() {
				}

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
			class A extends Component<any, any> {
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

			class B extends Component<any, any> {
				constructor(props) {
					super(props);
				}

				componentWillUnmount() {
				}

				render() {
					return (
						<p>B</p>
					);
				}
			}

			const unmountSpy = sinon.spy(B.prototype, 'componentWillUnmount');
			render(<A test={<B />}/>, container);
			expect(container.innerHTML).to.equal('<div><p>B</p></div>');
			render(<A test={null}/>, container);
			expect(container.innerHTML).to.equal('<div></div>');
			expect(unmountSpy.callCount).to.equal(1);
		});
	});

	describe('VFragment within other nodes', () => {
		it('Should not clear nodes when non keyed', () => {
			const Nodes = ({items}) => (
				<div>
					<div>test</div>
					{items.map((item) => <span>{item}</span>)}
					<div>end</div>
				</div>
			);

			render(<Nodes items={[1,2,3]} />, container);
			expect(container.innerHTML).to.equal('<div><div>test</div><span>1</span><span>2</span><span>3</span><div>end</div></div>');

			render(<Nodes items={[3,2,1]} />, container);
			expect(container.innerHTML).to.equal('<div><div>test</div><span>3</span><span>2</span><span>1</span><div>end</div></div>');

			render(<Nodes items={[9,8,7]} />, container);
			expect(container.innerHTML).to.equal('<div><div>test</div><span>9</span><span>8</span><span>7</span><div>end</div></div>');

			render(<Nodes items={[]} />, container);
			expect(container.innerHTML).to.equal('<div><div>test</div><div>end</div></div>');
		});

		it('Should not clear nodes when keyed inside vFragment', () => {
			const Nodes = ({items}) => (
				<div>
					<div>test</div>
					{items.map((item) => <span key={item}>{item}</span>)}
					<div>end</div>
				</div>
			);

			render(<Nodes items={[1,2,3]} />, container);
			expect(container.innerHTML).to.equal('<div><div>test</div><span>1</span><span>2</span><span>3</span><div>end</div></div>');

			render(<Nodes items={[3,2,1]} />, container);
			expect(container.innerHTML).to.equal('<div><div>test</div><span>3</span><span>2</span><span>1</span><div>end</div></div>');

			render(<Nodes items={[9,8,7]} />, container);
			expect(container.innerHTML).to.equal('<div><div>test</div><span>9</span><span>8</span><span>7</span><div>end</div></div>');

			render(<Nodes items={[]} />, container);
			expect(container.innerHTML).to.equal('<div><div>test</div><div>end</div></div>');
		});

		it('Should not clear nodes when keyed inside vFragment #2', () => {
			const Nodes = ({items}) => (
				<div>
					<div>test</div>
					{items.map((item) => <span key={item}>{item}</span>)}
					<div>end</div>
				</div>
			);

			render(<Nodes items={[1]} />, container);
			expect(container.innerHTML).to.equal('<div><div>test</div><span>1</span><div>end</div></div>');

			render(<Nodes items={[]} />, container);
			expect(container.innerHTML).to.equal('<div><div>test</div><div>end</div></div>');

			render(null, container);
			expect(container.innerHTML).to.equal('');

			render(<Nodes items={[1, 2, 3]} />, container);
			expect(container.innerHTML).to.equal('<div><div>test</div><span>1</span><span>2</span><span>3</span><div>end</div></div>');
		});

		it('Should not crash when changing vragment to node', () => {
			class Nodes extends Component<any, any> {
				constructor(props) {
					super(props);
				}

				render() {
					return [
						<div>test</div>,
						this.props.children,
						<div>end</div>
					];
				}
			}

			class NodesB extends Component<any, any> {
				constructor(props) {
					super(props);
				}

				render() {
					return [
						<div>test</div>,
						this.props.children,
						<div>end</div>
					];
				}
			}

			let items = [1];
			render(<Nodes>{items.map((item) => <span key={item}>{item}</span>)}</Nodes>, container);
			expect(container.innerHTML).to.equal('<div>test</div><span>1</span><div>end</div>');

			items = [];
			render(<NodesB>{items.map((item) => <span key={item}>{item}</span>)}</NodesB>, container);
			expect(container.innerHTML).to.equal('<div>test</div><div>end</div>');

			items = [1,2,3];
			render(<Nodes>{items.map((item) => <span key={item}>{item}</span>)}</Nodes>, container);
			expect(container.innerHTML).to.equal('<div>test</div><span>1</span><span>2</span><span>3</span><div>end</div>');

			items = <div>foobar</div>;
			render(<NodesB>{items}</NodesB>, container);
			expect(container.innerHTML).to.equal('<div>test</div><div>foobar</div><div>end</div>');
		});
	});
});
