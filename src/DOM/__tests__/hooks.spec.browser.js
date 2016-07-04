import { render } from './../../DOM/rendering';
import createElement from './../../core/createElement';

describe('lifecycle hooks', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	describe('node shape #1', () => {
		let template;

		beforeEach(() => {
			template = (created, attached, willUpdate, didUpdate, willDetach) => ({
				tag: 'div',
				hooks: {
					created,
					attached,
					willUpdate,
					didUpdate,
					willDetach
				}
			});
		});

		it('"created" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null), container);
			const expectedDomNode = container.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"attached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null), container);
			const expectedDomNode = container.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"willUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"didUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"willDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('node shape #2', () => {
		let template;

		beforeEach(() => {
			template = (created, attached, willUpdate, didUpdate, willDetach) => ({
				tag: 'div',
				children: {
					tag: 'div',
					hooks: {
						created,
						attached,
						willUpdate,
						didUpdate,
						willDetach
					}
				}
			});
		});

		it('"created" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"attached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"willUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"didUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"willDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('node shape #3', () => {
		let template;

		beforeEach(() => {
			template = (created, attached, willUpdate, didUpdate, willDetach, children) => ({
				tag: 'div',
				hooks: {
					created,
					attached,
					willUpdate,
					didUpdate,
					willDetach
				},
				children
			});
		});

		it('"created" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"attached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"willUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"didUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"willDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('node shape #4', () => {
		let template;

		beforeEach(() => {
			template = (created, attached, willUpdate, didUpdate, willDetach, text) => ({
				tag: 'div',
				children: {
					tag: 'div',
					hooks: {
						created,
						attached,
						willUpdate,
						didUpdate,
						willDetach
					},
					children: text
				}
			});
		});

		it('"created" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"attached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"willUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"didUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"willDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('node shape #5', () => {
		let template;

		beforeEach(() => {
			template = (created, attached, willUpdate, didUpdate, willDetach) => ({
				tag: 'div',
				hooks: {
					created,
					attached,
					willUpdate,
					didUpdate,
					willDetach
				},
				children: 'Hello world!'
			});
		});

		it('"created" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null), container);
			const expectedDomNode = container.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"attached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null), container);
			const expectedDomNode = container.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"willUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"didUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"willDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('node shape #6', () => {
		let template;

		beforeEach(() => {
			template = (created, attached, willUpdate, didUpdate, willDetach) => ({
				tag: 'div',
				children: {
					hooks: {
						created,
						attached,
						willUpdate,
						didUpdate,
						willDetach
					},
					tag: 'div',
					children: 'Hello world!'
				}
			});
		});

		it('"created" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"attached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"willUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"didUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"willDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('node shape #7', () => {
		let template;

		beforeEach(() => {
			template = (created, attached, willUpdate, didUpdate, willDetach, child) => ({
				tag: 'div',
				hooks: {
					created,
					attached,
					willUpdate,
					didUpdate,
					willDetach
				},
				children: child
			});
		});

		it('"created" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"attached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"willUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"didUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"willDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('node shape #8', () => {
		let template;

		beforeEach(() => {
			template = (created, attached, willUpdate, didUpdate, willDetach, child) => ({
				tag: 'div',
				children: {
					tag: 'div',
					hooks: {
						created,
						attached,
						willUpdate,
						didUpdate,
						willDetach
					},
					children: child
				}
			});
		});

		it('"created" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"attached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"willUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"didUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"willDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('node shape #9', () => {
		let template;

		beforeEach(() => {
			template = (created, attached, willUpdate, didUpdate, willDetach, child) => ({
				tag: 'div',
				hooks: {
					created,
					attached,
					willUpdate,
					didUpdate,
					willDetach
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
			});
		});

		it('"created" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"attached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"willUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"didUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"willDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('node shape #10', () => {
		let template;

		beforeEach(() => {
			template = (created, attached, willUpdate, didUpdate, willDetach, child) => ({
				tag: 'div',
				children: {
					tag: 'div',
					hooks: {
						created,
						attached,
						willUpdate,
						didUpdate,
						willDetach
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
			});
		});

		it('"created" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"attached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"willUpdate" hook should fire', () => {
			let willUpdateDomNode;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, domNode => willUpdateDomNode = domNode, null, null, 'Hello world!'), container);
			expect(willUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"didUpdate" hook should fire', () => {
			let didUpdateDomNode;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(template(null, null, null, domNode => didUpdateDomNode = domNode, null, 'Hello world!'), container);
			expect(didUpdateDomNode).to.equal(expectedDomNode);
		});
		it('"willDetach" hook should fire', () => {
			let detachedDomNode;
			render(template(null, null, null, null, domNode => detachedDomNode = domNode, 'Hello world!'), container);
			const expectedDomNode = container.firstChild.firstChild;
			render(null, container);
			expect(detachedDomNode).to.equal(expectedDomNode);
		});
	});

	describe('node shape #11 - stateless component', () => {
		let template;

		function StatelessComponent() {
			const template = () => ({
				tag: 'div',
				text: 'Hello world!'
			});
			return template();
		}

		beforeEach(() => {
			template = (componentWillMount, componentDidMount, componentWillUnmount, componentWillUpdate, componentDidUpdate, componentShouldUpdate, StatelessComponent) => ({
				tag: StatelessComponent,
				hooks: {
					componentWillMount,
					componentDidMount,
					componentWillUnmount,
					componentWillUpdate,
					componentDidUpdate,
					componentShouldUpdate
				}
			});
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

	describe('node shape #12 - stateless component', () => {
		let template;

		function StatelessComponent() {
			const template = () => ({
				tag: 'div',
				text: 'Hello world!'
			});
			return template();
		}

		beforeEach(() => {
			template = (componentWillMount, componentDidMount, componentWillUnmount, componentWillUpdate, componentDidUpdate, componentShouldUpdate, StatelessComponent) => ({
				tag: 'div',
				children: {
					tag: StatelessComponent,
					hooks: {
						componentWillMount,
						componentDidMount,
						componentWillUnmount,
						componentWillUpdate,
						componentDidUpdate,
						componentShouldUpdate
					}
				}
			});
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
	
	describe('github issue with willDetach', () => {

		it('should raise willDetach', () => {

			let didAttach = false,
				didCreate = false,
				didDetach = false;

			function addElement() {
				var el = createElement(function(v0, v1, v2) {
					return {
						tag: 'h1',
						attrs: {
							class: 'something'
						},
						hooks: {
							attached: function() {
								didAttach = true;
							},
							created: function() {
								didCreate = true;
							},
							willDetach: function() {
								didDetach = true;
							}
						},
						children: 'Hi there!'
					};
				});

				render(
					el,
					container
				);
			}

			function removeElement() {
				render(
					null,
					container
				);
			}

			addElement();
			removeElement();

			expect(didAttach).to.equal(true);
			expect(didCreate).to.equal(true);
			expect(didDetach).to.equal(true);


		});

		it('should raise willDetach', () => {

			let didDetach = false;

			function addElement() {
				var el = createElement(function(v0, v1, v2) {
					return {
						tag: 'h1',
						attrs: {
							class: 'something'
						},
						hooks: {
							willDetach: function() {
								didDetach = true;
							}
						},
						children: 'Hi there!'
					};
				});

				render(
					el,
					container
				);
			}

			function addElementTwo() {
				var el = createElement(function(v0, v1, v2) {
					return {
						tag: 'h2',
						attrs: {
							class: 'something'
						},
						children: 'Another!'
					};
				});

				render(
					el,
					container
				);
			}

			addElement();
			addElementTwo();
			expect(didDetach).to.equal(true);
		});
	});
});
