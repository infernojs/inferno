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
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onWillDetach) => ({
				tag: 'div',
				attrs: {
					onCreated,
					onAttached,
					onWillUpdate,
					onDidUpdate,
					onWillDetach
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
		it('"onWillDetach" hook should fire', () => {
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
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onWillDetach) => ({
				tag: 'div',
				children: {
					tag: 'div',
					attrs: {
						onCreated,
						onAttached,
						onWillUpdate,
						onDidUpdate,
						onWillDetach
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
		it('"onWillDetach" hook should fire', () => {
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
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onWillDetach, text) => ({
				tag: 'div',
				attrs: {
					onCreated,
					onAttached,
					onWillUpdate,
					onDidUpdate,
					onWillDetach
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
		it('"onWillDetach" hook should fire', () => {
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
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onWillDetach, text) => ({
				tag: 'div',
				children: {
					tag: 'div',
					attrs: {
						onCreated,
						onAttached,
						onWillUpdate,
						onDidUpdate,
						onWillDetach
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
		it('"onWillDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('rootNodeWithStaticChild', () => {
		let template;

		beforeEach(() => {
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onWillDetach) => ({
				tag: 'div',
				attrs: {
					onCreated,
					onAttached,
					onWillUpdate,
					onDidUpdate,
					onWillDetach
				},
				text: 'Hello world!'
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
		it('"onWillDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('nodeWithStaticChild', () => {
		let template;

		beforeEach(() => {
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onWillDetach) => ({
				tag: 'div',
				children: {
					attrs: {
						onCreated,
						onAttached,
						onWillUpdate,
						onDidUpdate,
						onWillDetach
					},
					tag: 'div',
					text: 'Hello world!'
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
		it('"onWillDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('rootNodeWithDynamicChild', () => {
		let template;

		beforeEach(() => {
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onWillDetach, child) => ({
				tag: 'div',
				attrs: {
					onCreated,
					onAttached,
					onWillUpdate,
					onDidUpdate,
					onWillDetach
				},
				children: child
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
		it('"onWillDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('nodeWithDynamicChild', () => {
		let template;

		beforeEach(() => {
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onWillDetach, child) => ({
				tag: 'div',
				children: {
					tag: 'div',
					attrs: {
						onCreated,
						onAttached,
						onWillUpdate,
						onDidUpdate,
						onWillDetach
					},
					children: child
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
		it('"onWillDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('rootNodeWithDynamicSubTreeForChildren', () => {
		let template;

		beforeEach(() => {
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onWillDetach, child) => ({
				tag: 'div',
				attrs: {
					onCreated,
					onAttached,
					onWillUpdate,
					onDidUpdate,
					onWillDetach
				},
				children: [
					{
						tag: 'div'
					},
					child,
					{
						tag: 'div'
					}
				]
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
		it('"onWillDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('nodeWithDynamicSubTreeForChildren', () => {
		let template;

		beforeEach(() => {
			template = createTemplate((onCreated, onAttached, onWillUpdate, onDidUpdate, onWillDetach, child) => ({
				tag: 'div',
				children: {
					tag: 'div',
					attrs: {
						onCreated,
						onAttached,
						onWillUpdate,
						onDidUpdate,
						onWillDetach
					},
					children: [
						{
							tag: 'div'
						},
						child,
						{
							tag: 'div'
						}
					]
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
		it('"onWillDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('rootNodeWithComponent - stateless component', () => {
		let template;

		function StatelessComponent() {
			const template = createTemplate(() => ({
				tag: 'div',
				text: 'Hello world!'
			}));
			return template();
		}

		beforeEach(() => {
			template = createTemplate((onComponentWillMount, onComponentDidMount, onComponentWillUnmount, onComponentWillUpdate, onComponentDidUpdate, onComponentShouldUpdate, StatelessComponent) => ({
				tag: StatelessComponent,
				attrs: {
					onComponentWillMount,
					onComponentDidMount,
					onComponentWillUnmount,
					onComponentWillUpdate,
					onComponentDidUpdate,
					onComponentShouldUpdate
				}
			}));
		});

		it('"onComponentWillMount" hook should fire', () => {
			let onComponentWillMount;
			render(template(props => onComponentWillMount = true, null, null, null, null, null, StatelessComponent), container);
			expect(onComponentWillMount).to.equal(true);
		});
		it('"onComponentDidMount" hook should fire', () => {
			let onComponentDidMountNode;
			render(template(null, domNode => onComponentDidMountNode = domNode, null, null, null, null, StatelessComponent), container);
			const expectedDomNode = container.firstChild;
			expect(onComponentDidMountNode).to.equal(expectedDomNode);
		});
		it('"onComponentWillUnmount" hook should fire', () => {
			let onComponentWillUnmountDomNode;
			render(template(null, null, domNode => onComponentWillUnmountDomNode = domNode, null, null, null, StatelessComponent), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(onComponentWillUnmountDomNode).to.equal(expectedDomNode);
		});
		it('"onComponentWillUpdate" hook should fire', () => {
			let onComponentWillUpdateDomNode;
			render(template(null, null, null, domNode => onComponentWillUpdateDomNode = domNode, null, null, StatelessComponent), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, null, domNode => onComponentWillUpdateDomNode = domNode, null, null, StatelessComponent), container);
			expect(onComponentWillUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onComponentDidUpdate" hook should fire', () => {
			let onComponentDidUpdateDomNode;
			render(template(null, null, null, null, domNode => onComponentDidUpdateDomNode = domNode, null, StatelessComponent), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, null, null, domNode => onComponentDidUpdateDomNode = domNode, null, StatelessComponent), container);
			expect(onComponentDidUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onComponentShouldUpdate" hook should fire', () => {
			let onComponentShouldUpdateDomNode;
			render(template(null, null, null, null, null, domNode => onComponentShouldUpdateDomNode = domNode, StatelessComponent), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, null, null, null, domNode => onComponentShouldUpdateDomNode = domNode, StatelessComponent), container);
			expect(onComponentShouldUpdateDomNode).to.equal(expectedDomNode);
		});
	});

	describe('nodeWithComponent - stateless component', () => {
		let template;

		function StatelessComponent() {
			const template = createTemplate(() => ({
				tag: 'div',
				text: 'Hello world!'
			}));
			return template();
		}

		beforeEach(() => {
			template = createTemplate((onComponentWillMount, onComponentDidMount, onComponentWillUnmount, onComponentWillUpdate, onComponentDidUpdate, onComponentShouldUpdate, StatelessComponent) => ({
				tag: 'div',
				children: {
					tag: StatelessComponent,
					attrs: {
						onComponentWillMount,
						onComponentDidMount,
						onComponentWillUnmount,
						onComponentWillUpdate,
						onComponentDidUpdate,
						onComponentShouldUpdate
					}
				}
			}));
		});

		it('"onComponentWillMount" hook should fire', () => {
			let onComponentWillMount;
			render(template(props => onComponentWillMount = true, null, null, null, null, null, StatelessComponent), container);
			expect(onComponentWillMount).to.equal(true);
		});
		it('"onComponentDidMount" hook should fire', () => {
			let onComponentDidMountNode;
			render(template(null, domNode => onComponentDidMountNode = domNode, null, null, null, null, StatelessComponent), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(onComponentDidMountNode).to.equal(expectedDomNode);
		});
		it('"onComponentWillUnmount" hook should fire', () => {
			let onComponentWillUnmountDomNode;
			render(template(null, null, domNode => onComponentWillUnmountDomNode = domNode, null, null, null, StatelessComponent), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(onComponentWillUnmountDomNode).to.equal(expectedDomNode);
		});
		it('"onComponentWillUpdate" hook should fire', () => {
			let onComponentWillUpdateDomNode;
			render(template(null, null, null, domNode => onComponentWillUpdateDomNode = domNode, null, null, StatelessComponent), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, null, domNode => onComponentWillUpdateDomNode = domNode, null, null, StatelessComponent), container);
			expect(onComponentWillUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onComponentDidUpdate" hook should fire', () => {
			let onComponentDidUpdateDomNode;
			render(template(null, null, null, null, domNode => onComponentDidUpdateDomNode = domNode, null, StatelessComponent), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, null, null, domNode => onComponentDidUpdateDomNode = domNode, null, StatelessComponent), container);
			expect(onComponentDidUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"onComponentShouldUpdate" hook should fire', () => {
			let onComponentShouldUpdateDomNode;
			render(template(null, null, null, null, null, domNode => onComponentShouldUpdateDomNode = domNode, StatelessComponent), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, null, null, null, domNode => onComponentShouldUpdateDomNode = domNode, StatelessComponent), container);
			expect(onComponentShouldUpdateDomNode).to.equal(expectedDomNode);
		});
	});
});