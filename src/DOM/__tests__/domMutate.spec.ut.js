import { insertOrAppend, remove } from '../domMutate';
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