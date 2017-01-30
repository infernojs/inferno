import { expect } from 'chai';
import { render } from 'inferno';
import Component from 'inferno-component';
import { isNullOrUndef } from 'inferno-helpers';
import { spy } from 'sinon';

describe('Columns like tests - (JSX)', () => {
	let container;

	beforeEach(function() {
		container = document.createElement('div');
	});

	afterEach(function() {
		container.innerHTML = '';
	});

	describe('Column-like tests', () => {
		function buildTestCases(Row, Item, suffix) {
			return [
				{
					name: 'add one column -' + suffix,
					initial: [
						Row(1, Item(1, 1), Item(2, 2)),
						Row(2, Item(3, 3), Item(4, 4))
					],
					update: [
						Row(1, Item(1, 1), Item(2, 2)),
						Row(2, Item(3, 3), Item(4, 4)),
						Row(3, Item(5, 5))
					]
				},
				{
					name: 'add one item -' + suffix,
					initial: [
						Row(1, Item(1, 1), Item(2, 2)),
						Row(2, Item(3, 3), Item(4, 4))
					],
					update: [
						Row(1, Item(1, 1), Item(2, 2), Item(5, 5)),
						Row(2, Item(3, 3), Item(4, 4))
					]
				},
				{
					name: 'add one column and item -' + suffix,
					initial: [
						Row(1, Item(1, 1), Item(2, 2)),
						Row(2, Item(3, 3), Item(4, 4))
					],
					update: [
						Row(1, Item(1, 1), Item(2, 2)),
						Row(2, Item(3, 3), Item(4, 4), Item(6, 6)),
						Row(3, Item(5, 5))
					]
				},
				{
					name: 'swap all items -' + suffix,
					initial: [
						Row(1, Item(1, 1), Item(2, 2)),
						Row(2, Item(3, 3), Item(4, 4))
					],
					update: [
						Row(1, Item(2, 2), Item(1, 1)),
						Row(2, Item(4, 4), Item(3, 3))
					]
				},
				{
					name: 'remove first item -' + suffix,
					initial: [
						Row(1, Item(1, 1), Item(2, 2)),
						Row(2, Item(3, 3), Item(4, 4))
					],
					update: [
						Row(1, Item(2, 2)),
						Row(2, Item(4, 4))
					]
				},
				{
					name: 'remove last item -' + suffix,
					initial: [
						Row(1, Item(1, 1), Item(2, 2)),
						Row(2, Item(3, 3), Item(4, 4))
					],
					update: [
						Row(1, Item(1, 1)),
						Row(2, Item(3, 3))
					]
				},
				{
					name: 'remove all items-' + suffix,
					initial: [
						Row(1, Item(1, 1), Item(2, 2)),
						Row(2, Item(3, 3), Item(4, 4))
					],
					update: [
						Row(1),
						Row(2)
					]
				},
				{
					name: 'remove all columns-' + suffix,
					initial: [
						Row(1, Item(1, 1), Item(2, 2)),
						Row(2, Item(3, 3), Item(4, 4))
					],
					update: []
				}
			];
		}

		function filterPlaceholders(_nodes) {
			const nodes = [].slice.apply(_nodes);
			let len = nodes.length, i = 0;

			while (i < len) {
				const node = nodes[i];

				if (node.nodeType === 3 && node.nodeValue === '') {
					nodes.splice(i, 1);
					len--;
				}
				i++;
			}
			return nodes;
		}

		function verifyRenderResult(columns, _container) {
			// Verify root
			const root = _container.firstChild;
			const rootChildNodes = filterPlaceholders(root.childNodes);

			expect(rootChildNodes.length).to.equal(columns.length);
			// Verify columns
			for (let i = 0; i < rootChildNodes.length; i++) {
				const columnRoot = rootChildNodes[i];
				const columnChildNodes = filterPlaceholders(columnRoot.childNodes);

				expect(columnChildNodes.length).to.equal(columns[i].items.length + 1, `Column data: ${JSON.stringify(columns[i].items)} Rendered: ${columnRoot.innerHTML}`);
				expect(columnRoot.firstChild.innerHTML).to.equal('column', 'Column first child check');

				// Verify items
				// Skip first - its hardcoded
				for (let j = 1; j < columnChildNodes.length; j++) {
					const itemRoot = columnChildNodes[j];
					expect(itemRoot.innerHTML).to.equal(columns[i].items[j - 1].text.toString(), 'item content check');
				}
			}
		}

		function getDifferentObjects(arr1, arr2) {
			return arr1.filter(function(obj) {
				return !arr2.some(function(obj2) {
					return obj._testKey === obj2._testKey;
				});
			});
		}

		function getSameObjects(arr1, arr2) {
			return arr1.filter(function(obj) {
				return arr2.some(function(obj2) {
					return obj._testKey === obj2._testKey;
				});
			});
		}

		describe('columns KEYED', () => {
			// Item Keyed
			function BuildItemKeyed(key, text) {
				return { _testKey: key, id: key, text };
			}

			// Row Keyed
			function BuildRowKeyed(key, ...items) {
				return { _testKey: key, id: key, items };
			}

			const keyedTests = buildTestCases(BuildRowKeyed, BuildItemKeyed, 'KEYED');

			class ItemKeyed extends Component<any, any> {
				constructor(props) {
					super(props);
				}

				componentWillUnmount() {}

				render() {
					return (
						<div>
							{this.props.text}
						</div>
					);
				}
			}

			class ColumnKeyed extends Component<any, any> {
				constructor(props) {
					super(props);
				}

				componentWillUnmount() {}

				render() {
					const items = this.props.items;

					return (
						<div>
							<span key="column">column</span>
							{items.map((item) => <ItemKeyed key={item.id} text={item.text}/>)}
						</div>
					);
				}
			}

			const ViewKeyed = ({ columns }) => (
				<div>
					{columns.map((column) => <ColumnKeyed key={column.id} items={column.items}/>)}
				</div>
			);

			let mountedColumnSpy = null;
			let unmountColumnSpy = null;
			let updateColumnSpy = null;
			let mountedItemSpy = null;
			let unmountItemSpy = null;
			let updateItemSpy = null;

			beforeEach(() => {
				mountedColumnSpy = spy(ColumnKeyed.prototype, 'componentWillMount');
				unmountColumnSpy = spy(ColumnKeyed.prototype, 'componentWillUnmount');
				updateColumnSpy = spy(ColumnKeyed.prototype, 'componentWillUpdate');
				mountedItemSpy = spy(ItemKeyed.prototype, 'componentWillMount');
				unmountItemSpy = spy(ItemKeyed.prototype, 'componentWillUnmount');
				updateItemSpy = spy(ItemKeyed.prototype, 'componentWillUpdate');
			});

			afterEach(() => {
				mountedColumnSpy.restore();
				unmountColumnSpy.restore();
				updateColumnSpy.restore();
				mountedItemSpy.restore();
				unmountItemSpy.restore();
				updateItemSpy.restore();
			});

			keyedTests.forEach((testCase) => {
				it('Should ' + testCase.name, () => {
					const columnsToBeAdded = getDifferentObjects(testCase.update, testCase.initial);
					const columnsToUpdate = getSameObjects(testCase.update, testCase.initial);
					const columnsToRemove = getDifferentObjects(testCase.initial, testCase.update);

					let itemsToBeAdded = [];
					let itemsToUpdate = [];
					let itemsToRemove = [];
					let initialItemsCount = 0;

					for (let i = 0; i < testCase.update.length || i < testCase.initial.length; i++) {
						const updateColumns = testCase.update[i];
						const intialColumns = testCase.initial[i];

						if (!isNullOrUndef(updateColumns)) {
							if (!isNullOrUndef(intialColumns)) {
								itemsToBeAdded = itemsToBeAdded.concat(getDifferentObjects(updateColumns.items, intialColumns.items));
								itemsToRemove = itemsToRemove.concat(getDifferentObjects(intialColumns.items, updateColumns.items));
								itemsToUpdate = itemsToUpdate.concat(getSameObjects(updateColumns.items, intialColumns.items));
								initialItemsCount += intialColumns.items.length;
							} else {
								itemsToBeAdded = itemsToBeAdded.concat(updateColumns.items);
							}
						} else {
							if (!isNullOrUndef(intialColumns)) {
								initialItemsCount += intialColumns.items.length;
								itemsToRemove = itemsToRemove.concat(intialColumns.items);
							} else {
								// Do nothing
							}
						}
					}

					// Do initial render
					render(<ViewKeyed columns={testCase.initial}/>, container);
					verifyRenderResult(testCase.initial, container);
					expect(mountedColumnSpy.callCount).to.equal(testCase.initial.length, 'Column Initial MOUNT'); // Initial all mounted
					expect(unmountColumnSpy.callCount).to.equal(0, 'Column Initial unMount'); // Initial render none unmounted
					expect(updateColumnSpy.callCount).to.equal(0, 'Column Initial update'); // Initial render none to update

					expect(mountedItemSpy.callCount).to.equal(initialItemsCount, 'Item Initial Mount'); // Initial render - mount all items once
					expect(updateItemSpy.callCount).to.equal(0, 'Item initial update'); // Initial render none to update
					expect(unmountItemSpy.callCount).to.equal(0, 'Item initial unmount'); // Initial render none unmounted

					// reset call counts
					mountedColumnSpy.reset();
					unmountColumnSpy.reset();
					updateColumnSpy.reset();
					mountedItemSpy.reset();
					updateItemSpy.reset();
					unmountItemSpy.reset();

					// Do update
					render(<ViewKeyed columns={testCase.update}/>, container);
					verifyRenderResult(testCase.update, container);

					expect(mountedColumnSpy.callCount).to.equal(columnsToBeAdded.length); // mount count should equal to added count
					expect(unmountColumnSpy.callCount).to.equal(columnsToRemove.length); // Initial render none unmounted
					expect(updateColumnSpy.callCount).to.equal(columnsToUpdate.length); // Initial render none unmounted
					expect(mountedItemSpy.callCount).to.equal(itemsToBeAdded.length, `itemsToBeAdded ${JSON.stringify(itemsToBeAdded)} componentWillMount called: ${mountedItemSpy.callCount} times.`); // Initial render - mount all items once
					expect(updateItemSpy.callCount).to.equal(itemsToUpdate.length, 'item update callback count'); // Initial render none to update
					expect(unmountItemSpy.callCount).to.equal(itemsToRemove.length, 'item unmount callback count'); // Initial render none unmounted
				});
			});
		});

		describe('columns NON-KEYED', () => {
			// Item Keyed
			function BuildItem(key, text) {
				return { _testKey: key, text };
			}

			// Row Keyed
			function BuildRow(key, ...items) {
				return { _testKey: key, items };
			}

			const nonKeyedTestCases = buildTestCases(BuildRow, BuildItem, 'NON-KEYED');

			class Item extends Component<any, any> {
				constructor(props) {
					super(props);
				}

				componentWillUnmount() {}

				render() {
					return (
						<div>
							{this.props.text}
						</div>
					);
				}
			}

			class Column extends Component<any, any> {
				constructor(props) {
					super(props);
				}

				componentWillUnmount() {}

				render() {
					const items = this.props.items;

					return (
						<div>
							<span>column</span>
							{items.map((item) => <Item text={item.text}/>)}
						</div>
					);
				}
			}

			const View = ({ columns }) => (
				<div>
					{columns.map((column) => <Column items={column.items}/>)}
				</div>
			);

			let mountedColumnSpy = null;
			let unmountColumnSpy = null;
			let updateColumnSpy = null;
			let mountedItemSpy = null;
			let unmountItemSpy = null;
			let updateItemSpy = null;

			beforeEach(() => {
				mountedColumnSpy = spy(Column.prototype, 'componentWillMount');
				unmountColumnSpy = spy(Column.prototype, 'componentWillUnmount');
				updateColumnSpy = spy(Column.prototype, 'componentWillUpdate');
				mountedItemSpy = spy(Item.prototype, 'componentWillMount');
				unmountItemSpy = spy(Item.prototype, 'componentWillUnmount');
				updateItemSpy = spy(Item.prototype, 'componentWillUpdate');
			});

			afterEach(() => {
				mountedColumnSpy.restore();
				unmountColumnSpy.restore();
				updateColumnSpy.restore();
				mountedItemSpy.restore();
				unmountItemSpy.restore();
				updateItemSpy.restore();
			});

			nonKeyedTestCases.forEach((testCase) => {
				it('Should ' + testCase.name, () => {
					const columnsToBeAdded = getDifferentObjects(testCase.update, testCase.initial);
					const columnsToUpdate = getSameObjects(testCase.update, testCase.initial);
					const columnsToRemove = getDifferentObjects(testCase.initial, testCase.update);

					let itemsToBeAdded = [];
					let itemsToUpdate = [];
					let itemsToRemove = [];
					let initialItemsCount = 0;

					for (let i = 0; i < testCase.update.length || i < testCase.initial.length; i++) {
						const updateColumns = testCase.update[i];
						const intialColumns = testCase.initial[i];

						if (!isNullOrUndef(updateColumns)) {
							if (!isNullOrUndef(intialColumns)) {
								itemsToBeAdded = itemsToBeAdded.concat(getDifferentObjects(updateColumns.items, intialColumns.items));
								itemsToRemove = itemsToRemove.concat(getDifferentObjects(intialColumns.items, updateColumns.items));
								itemsToUpdate = itemsToUpdate.concat(getSameObjects(updateColumns.items, intialColumns.items));
								initialItemsCount += intialColumns.items.length;
							} else {
								itemsToBeAdded = itemsToBeAdded.concat(updateColumns.items);
							}
						} else {
							if (!isNullOrUndef(intialColumns)) {
								initialItemsCount += intialColumns.items.length;
								itemsToRemove = itemsToRemove.concat(intialColumns.items);
							} else {
								// Do nothing
							}
						}
					}

					// Do initial render
					render(<View columns={testCase.initial}/>, container);
					verifyRenderResult(testCase.initial, container);
					expect(mountedColumnSpy.callCount).to.equal(testCase.initial.length, 'Column Initial MOUNT'); // Initial all mounted
					expect(unmountColumnSpy.callCount).to.equal(0, 'Column Initial unMount'); // Initial render none unmounted
					expect(updateColumnSpy.callCount).to.equal(0, 'Column Initial update'); // Initial render none to update

					expect(mountedItemSpy.callCount).to.equal(initialItemsCount, 'Item Initial Mount'); // Initial render - mount all items once
					expect(updateItemSpy.callCount).to.equal(0, 'Item initial update'); // Initial render none to update
					expect(unmountItemSpy.callCount).to.equal(0, 'Item initial unmount'); // Initial render none unmounted

					// reset call counts
					mountedColumnSpy.reset();
					unmountColumnSpy.reset();
					updateColumnSpy.reset();
					mountedItemSpy.reset();
					updateItemSpy.reset();
					unmountItemSpy.reset();

					// Do update
					render(<View columns={testCase.update}/>, container);
					verifyRenderResult(testCase.update, container);

					expect(mountedColumnSpy.callCount).to.equal(columnsToBeAdded.length); // mount count should equal to added count
					expect(unmountColumnSpy.callCount).to.equal(columnsToRemove.length); // Initial render none unmounted
					expect(updateColumnSpy.callCount).to.equal(columnsToUpdate.length); // Initial render none unmounted
					expect(mountedItemSpy.callCount).to.equal(itemsToBeAdded.length, `itemsToBeAdded ${JSON.stringify(itemsToBeAdded)} componentWillMount called: ${mountedItemSpy.callCount} times.`); // Initial render - mount all items once
					expect(updateItemSpy.callCount).to.equal(itemsToUpdate.length, 'item update callback count'); // Initial render none to update
					expect(unmountItemSpy.callCount).to.equal(itemsToRemove.length, 'item unmount callback count'); // Initial render none unmounted
				});
			});
		});
	});
});
