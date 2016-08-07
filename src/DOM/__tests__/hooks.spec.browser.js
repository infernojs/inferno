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

	describe('stateless component', () => {
		let template;

		function StatelessComponent() {
			return createElement('div', null, 'Hello world!');
		}

		beforeEach(() => {
			template = (onComponentWillMount, onComponentDidMount, onComponentWillUnmount, onComponentWillUpdate, onComponentDidUpdate, onComponentShouldUpdate, StatelessComponent) =>
			createElement(StatelessComponent, {
				onComponentWillMount,
				onComponentDidMount,
				onComponentWillUnmount,
				onComponentWillUpdate,
				onComponentDidUpdate,
				onComponentShouldUpdate
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

	describe('stateless component #2', () => {
		let template;

		function StatelessComponent() {
			return createElement('div', null, 'Hello world!');
		}

		beforeEach(() => {
			template = (onComponentWillMount, onComponentDidMount, onComponentWillUnmount, onComponentWillUpdate, onComponentDidUpdate, onComponentShouldUpdate, StatelessComponent) =>
			createElement('div', null,
				createElement(StatelessComponent, {
					onComponentWillMount,
					onComponentDidMount,
					onComponentWillUnmount,
					onComponentWillUpdate,
					onComponentDidUpdate,
					onComponentShouldUpdate
				})
			);
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
