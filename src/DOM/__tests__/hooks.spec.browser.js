import createTemplate from '../../core/createTemplate';
import { addTreeConstructor } from '../../core/createTemplate';
import { render } from '../../DOM/rendering';
import createDOMTree from '../../DOM/createTree';

addTreeConstructor('dom', createDOMTree);

describe('lifecycle hooks', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	describe('rootVoidNode', () => {
		let template;

		beforeEach(() => {
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onDetached) => ({
				tag: 'div',
				attrs: {
					onCreated,
					onAttached,
					onWillUpdate,
					onDidUpdate,
					onDetached
				}
			}));
		});

		it('"onCreated" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null), container);
			const expectedDomNode = container.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"onAttached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null), container);
			const expectedDomNode = container.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"onWillUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onDidUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onDetached" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('voidNode', () => {
		let template;

		beforeEach(() => {
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onDetached) => ({
				tag: 'div',
				children: {
					tag: 'div',
					attrs: {
						onCreated,
						onAttached,
						onWillUpdate,
						onDidUpdate,
						onDetached
					}
				}
			}));
		});

		it('"onCreated" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"onAttached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"onWillUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onDidUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onDetached" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('rootNodeWithDynamicText', () => {
		let template;

		beforeEach(() => {
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onDetached, text) => ({
				tag: 'div',
				attrs: {
					onCreated,
					onAttached,
					onWillUpdate,
					onDidUpdate,
					onDetached
				},
				text: text
			}));
		});

		it('"onCreated" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"onAttached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"onWillUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onDidUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onDetached" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('nodeWithDynamicText', () => {
		let template;

		beforeEach(() => {
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onDetached, text) => ({
				tag: 'div',
				children: {
					tag: 'div',
					attrs: {
						onCreated,
						onAttached,
						onWillUpdate,
						onDidUpdate,
						onDetached
					},
					text: text
				}
			}));
		});

		it('"onCreated" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"onAttached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"onWillUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onDidUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onDetached" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});
});