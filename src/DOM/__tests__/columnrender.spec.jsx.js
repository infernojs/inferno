import { render } from './../rendering';
import Component from './../../component/es2015';
import { createBlueprint } from './../../core/createBlueprint';

const Inferno = {
	createBlueprint
};

describe('Children - (JSX)', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
	});

	afterEach(function () {
		container.innerHTML = '';
	});

	describe('Column-like tests', () => {

		// Item Keyed
		function BuildItemKeyed(text, key) {
			return {text: text, key: key}
		}

		// Row Keyed
		function BuildRowKeyed(key, ...items) {
			return {key: key, items: items}
		}

		function BuildItem(k, text) {
			return {text: text}
		}

		function BuildRow(k,...items) {
			return {items: items}
		}


		function buildTestCases(Row, Item, suffix) {
			return [
				{
					name: 'add one column -' + suffix,
					initial: [
						Row(1, Item(1,1), Item(2,2)),
						Row(2, Item(3,3), Item(4,4))
					],
					update: [
						Row(1, Item(1,1), Item(2,2)),
						Row(2, Item(3,3), Item(4,4)),
						Row(3, Item(5,5))
					]
				},
				{
					name: 'add one item -' + suffix,
					initial: [
						Row(1, Item(1,1), Item(2,2)),
						Row(2, Item(3,3), Item(4,4))
					],
					update: [
						Row(1, Item(1,1), Item(2,2), Item(5,5)),
						Row(2, Item(3,3), Item(4,4))
					]
				},
				{
					name: 'add one column and item -' + suffix,
					initial: [
						Row(1, Item(1,1), Item(2,2)),
						Row(2, Item(3,3), Item(4,4))
					],
					update: [
						Row(1, Item(1,1), Item(2,2)),
						Row(2, Item(3,3), Item(4,4), Item(6,6)),
						Row(3, Item(5,5))
					]
				},
				{
					name: 'swap all items -' + suffix,
					initial: [
						Row(1, Item(1,1), Item(2,2)),
						Row(2, Item(3,3), Item(4,4))
					],
					update: [
						Row(1, Item(2,2), Item(1,1)),
						Row(2, Item(4,4), Item(3,3))
					]
				},
				{
					name: 'remove first item -' + suffix, // TODO: Somehow verify willDetach / componentWillUnmount here
					initial: [
						Row(1, Item(1,1), Item(2,2)),
						Row(2, Item(3,3), Item(4,4))
					],
					update: [
						Row(1, Item(2,2)),
						Row(2, Item(4,4))
					]
				},
				{
					name: 'remove last item -' + suffix, // TODO: Somehow verify willDetach / componentWillUnmount here
					initial: [
						Row(1, Item(1,1), Item(2,2)),
						Row(2, Item(3,3), Item(4,4))
					],
					update: [
						Row(1, Item(1,1)),
						Row(2, Item(3,3))
					]
				},
				{
					name: 'remove all items-' + suffix, // TODO: Somehow verify willDetach / componentWillUnmount here
					initial: [
						Row(1, Item(1,1), Item(2,2)),
						Row(2, Item(3,3), Item(4,4))
					],
					update: [
						Row(1),
						Row(2)
					]
				},
				{
					name: 'remove all columns-' + suffix, // TODO: Somehow verify willDetach / componentWillUnmount here
					initial: [
						Row(1, Item(1,1), Item(2,2)),
						Row(2, Item(3,3), Item(4,4))
					],
					update: [
					]
				}
			];
		}

		function verifyRenderResult(columns, container) {
			// Verify root
			const root = container.firstChild;
			expect(root.childNodes.length).to.equal(columns.length);

			// Verify columns
			for (let i = 0; i < root.childNodes.length; i++) {
				const columnRoot = root.childNodes[i];
				expect(columnRoot.childNodes.length).to.equal(columns[i].items.length + 1, `Column data: ${JSON.stringify(columns[i].items)} Rendered: ${columnRoot.innerHTML}`);
				expect(columnRoot.firstChild.innerText).to.equal('column', 'Column first child check');

				// Verify items
				// Skip first - its hardcoded
				for (let j = 1; j < columnRoot.childNodes.length; j++) {
					let itemRoot = columnRoot.childNodes[j];
					expect(itemRoot.innerText).to.equal(columns[i].items[j-1].text.toString(), 'item content check');
				}
			}
		}

		const keyedTestCases = buildTestCases(BuildRowKeyed, BuildItemKeyed, 'KEYED');

		const ItemKeyed =({text}) => (
			<span>{text}</span>
		);

		const ColumnKeyed = ({items}) => (
			<div>
				<span key="-1">column</span>
				{items.map((item) => <ItemKeyed text={item.text} key={item.key} />)}
			</div>

		);

		const ViewKeyed = ({columns}) => (
			<div>
				{columns.map((column) => <ColumnKeyed items={column.items} key={column.key} />)}
			</div>
		);

		keyedTestCases.forEach((testCase) => {
			it('Should ' + testCase.name, () => {
				render(<ViewKeyed columns={testCase.initial} />, container);
				verifyRenderResult(testCase.initial, container);
				render(<ViewKeyed columns={testCase.update} />, container);
				verifyRenderResult(testCase.update, container);
			});
		});

		const nonKeyedTestCases = buildTestCases(BuildRow, BuildItem, 'NON-KEYED');

		const Item =({text}) => (
			<span>{text}</span>
		);

		const Column = ({items}) => (
			<div>
				<span>column</span>
				{items.map((item) => <Item text={item.text} />)}
			</div>

		);

		const View = ({columns}) => (
			<div>
				{columns.map((column) => <ColumnKeyed items={column.items} />)}
			</div>
		);

		nonKeyedTestCases.forEach((testCase) => {
			it('Should ' + testCase.name, () => {
				render(<View columns={testCase.initial} />, container);
				verifyRenderResult(testCase.initial, container);
				render(<View columns={testCase.update} />, container);
				verifyRenderResult(testCase.update, container);
			});
		});
	});
});
