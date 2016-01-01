import { insertOrAppend, remove, createVirtualList, updateNonKeyed } from '../domMutate';
import { render, renderToString } from '../../core/rendering';

describe('domMutate ( UT tests)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	})

	afterEach(() => {
		render(null, container);
	});

	describe('insertOrAppend()', () => {

		it ( 'should set id as attribute when not allowed to set as property', () => {
			const newNode = document.createElement('span');
			insertOrAppend(container, newNode, false);
			expect(container.childNodes[0].tagName).to.equal('SPAN');
			expect(container.childNodes.length).to.equal(1);
		});
	});



	describe('updateNonKeyed()', () => {
		it ( 'should be a function', () => {
			expect(updateNonKeyed).to.be.a.function;
		});

		it ( 'should be a function', () => {

			let oldItem = [1,2, 'Hello'];
			let newItem = [1, 2, 'Hello'];
			const nodeList = [
				document.createElement('span'),
				document.createElement('span')
			]

			// The items are equal, do nothing
			updateNonKeyed( oldItem, newItem, container)

			expect(nodeList[0].tagName).to.equal('SPAN');
			expect(nodeList[1].tagName).to.equal('SPAN');

			expect(nodeList[0].innerHTML).to.equal('');
			expect(nodeList[1].innerHTML).to.equal('');

			oldItem = [1, 2, 'Hello'];
			newItem = [1, 3, 'Hello'];

			// In this case, the nodeList elements are not attached to DOM, do nothing
			updateNonKeyed( oldItem, newItem, container)

			expect(nodeList[0].tagName).to.equal('SPAN');
			expect(nodeList[1].tagName).to.equal('SPAN');

			expect(nodeList[0].innerHTML).to.equal('');
			expect(nodeList[1].innerHTML).to.equal('');

			oldItem = [1, 2, 'Hello'];
			newItem = [1, 3, 'Hello'];

			// This should remove the nodes, but in this case, the
			// nodeList elements are not attached to DOM, do nothing
			updateNonKeyed( null, oldItem, container)

			expect(nodeList[0].tagName).to.equal('SPAN');
			expect(nodeList[1].tagName).to.equal('SPAN');

			expect(nodeList[0].innerHTML).to.equal('');
			expect(nodeList[1].innerHTML).to.equal('');

			/*
			* Various combos so we know this is not breaking
			**/

			updateNonKeyed( null, null, container)

			expect(nodeList[0].tagName).to.equal('SPAN');
			expect(nodeList[1].tagName).to.equal('SPAN');

			expect(nodeList[0].innerHTML).to.equal('');
			expect(nodeList[1].innerHTML).to.equal('');

			updateNonKeyed( undefined, undefined, container)

			expect(nodeList[0].tagName).to.equal('SPAN');
			expect(nodeList[1].tagName).to.equal('SPAN');

			expect(nodeList[0].innerHTML).to.equal('');
			expect(nodeList[1].innerHTML).to.equal('');

		});
	});



	describe('createVirtualList()', () => {
		it ( 'should be a function', () => {
			expect(createVirtualList).to.be.a.function;
		});
		// TODO
	});

	describe('remove()', () => {

		it ( 'should force innerHTML if node equal to rootNode', () => {

			container.innerHTML = 'Hello';

			const item = {
				rootNode: container,
				keyedPool: null

			}
			remove(item, container)
			expect(container.innerHTML).to.equal('');
		});

		it ( 'should force innerHTML if node equal to rootNode', () => {

			container.innerHTML = 'Hello';

			const item = {
				rootNode: container,
				keyedPool: null

			}
			remove(item, container)
			expect(container.innerHTML).to.equal('');
		});

		it ( 'should not remove the node if rootNode is not valid', () => {

			container.innerHTML = 'Hello, World!';

			const item = {
				rootNode: undefined,
				keyedPool: null
			};

			remove(item, container)
			expect(container.innerHTML).to.equal('Hello, World!');

			item.rootNode = undefined;

			remove(item, container)
			expect(container.innerHTML).to.equal('Hello, World!');

			item.rootNode = 123;

			remove(item, container)
			expect(container.innerHTML).to.equal('Hello, World!');

			item.rootNode = {};

			remove(item, container)
			expect(container.innerHTML).to.equal('Hello, World!');

			item.rootNode = [];

			remove(item, container)
			expect(container.innerHTML).to.equal('Hello, World!');

			item.rootNode = container;
			// valid.
			remove(item, container)
			expect(container.innerHTML).to.equal('');
		});
	});

});