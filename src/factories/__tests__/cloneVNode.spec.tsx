import { expect } from 'chai';
import { render } from '../../DOM/rendering';
import cloneVNode from '../cloneVNode';
import * as Inferno from '../../testUtils/inferno';
Inferno; // suppress ts 'never used' error

describe('cloneVNode (JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	it('should clone a basic element with different children and props', () => {
		const node1 = <div>Hello world</div>;

		render(node1, container);
		expect(container.innerHTML).to.equal('<div>Hello world</div>');
		const node2 = cloneVNode(node1, null, 'Hello world 2!');

		render(node2, container);
		expect(container.innerHTML).to.equal('<div>Hello world 2!</div>');
		const node3 = cloneVNode(node2, { className: 'foo' }, 'Hello world 2!');

		render(node3, container);
		expect(container.innerHTML).to.equal('<div class="foo">Hello world 2!</div>');
		const node4 = cloneVNode(node1, { className: 'foo' }, 'Hello world 3!');

		render(node4, container);
		expect(container.innerHTML).to.equal('<div class="foo">Hello world 3!</div>');
	});

	function StatelessComponent(props) {
		return <div { ...props } />;
	}

	it('should clone a basic stateless component with different children and props', () => {
		const node1 = <StatelessComponent children="Hello world" />;

		render(node1, container);
		expect(container.innerHTML).to.equal('<div>Hello world</div>');
		const node2 = cloneVNode(node1, { children: 'Hello world 2!' });

		render(node2, container);
		expect(container.innerHTML).to.equal('<div>Hello world 2!</div>');
		const node3 = cloneVNode(node1, { children: 'Hello world 3!', className: 'yo' });

		render(node3, container);
		expect(container.innerHTML).to.equal('<div class="yo">Hello world 3!</div>');
	});
});
