import { expect } from 'chai';
import { cloneVNode, render } from 'inferno';
import { innerHTML } from '../../tools/utils';

describe('cloneVNode (JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	it('should clone a tag', () => {
		const node = cloneVNode(<a/>, null);
		render(node, container);
		expect(container.innerHTML).to.equal(innerHTML('<a></a>'));
	});

	it('should clone with third argument array', () => {
		const node = cloneVNode(<div/>, null, [<span/>]);
		render(node, container);
		expect(container.innerHTML).to.equal(innerHTML('<div><span></span></div>'));
	});

	it('should clone with third argument array + props children array', () => {
		const node = cloneVNode(<div/>, { children: 'x' }, [<a/>]);
		render(node, container);
		expect(container.innerHTML).to.equal(innerHTML('<div>x<a></a></div>'));
	});

	it('should clone OPT_ELEMENT', () => {
		const noop = () => {};
		const node = cloneVNode(<div
			onComponentWillMount={ noop }
			onComponentDidMount={ noop }
			onComponentWillUnmount={ noop }
			onComponentShouldUpdate={ noop }
			onComponentWillUpdate={ noop }
		/>, { children: [<span/>] });
		render(node, container);
		expect(container.innerHTML).to.equal(innerHTML('<div><span></span></div>'));
	});

	it('should clone a basic element with array children', () => {
		const node = cloneVNode(<div/>, { children: [<span/>] });
		render(node, container);
		expect(container.innerHTML).to.equal(innerHTML('<div><span></span></div>'));
	});

	it('should clone a basic element with children in props and as third argument', () => {
		const node1 = cloneVNode(<div/>, { children: <span>arr1a</span> }, <span>arr2b</span>);
		render(node1, container);
		expect(container.innerHTML).to.equal(innerHTML('<div><span>arr1a</span><span>arr2b</span></div>'));

		const node2 = cloneVNode(<div/>, { children: [<span>arr2a</span>] }, <span>arr2b</span>);
		render(node2, container);
		expect(container.innerHTML).to.equal(innerHTML('<div><span>arr2a</span><span>arr2b</span></div>'));

		const node3 = cloneVNode(<div/>, { children: [<span>arr3a</span>] }, [<span>arr3b</span>]);
		render(node3, container);
		expect(container.innerHTML).to.equal(innerHTML('<div><span>arr3a</span><span>arr3b</span></div>'));
	});

	it('should clone a basic element with null children', () => {
		const node = cloneVNode(<div/>, { children: null });
		render(node, container);
		expect(container.innerHTML).to.equal(innerHTML('<div></div>'));
	});

	it('should clone a basic element with key and ref', () => {
		const ref = () => {};
		const node = cloneVNode(<div/>, { key: 'foo', ref });

		expect(node.key).to.equal('foo');
		expect(node.ref).to.equal(ref);
	});

	it('should clone a basic element with different children and props', () => {
		const node1 = <div>Hello world</div>;
		render(node1, container);
		expect(container.innerHTML).to.equal(innerHTML('<div>Hello world</div>'));

		const node2 = cloneVNode(node1, null, 'Hello world 2!');
		render(node2, container);
		expect(container.innerHTML).to.equal(innerHTML('<div>Hello world 2!</div>'));

		const node3 = cloneVNode(node2, { className: 'foo' }, 'Hello world 2!');
		render(node3, container);
		expect(container.innerHTML).to.equal(innerHTML('<div class="foo">Hello world 2!</div>'));

		const node4 = cloneVNode(node1, { className: 'foo' }, 'Hello world 3!');
		render(node4, container);
		expect(container.innerHTML).to.equal(innerHTML('<div class="foo">Hello world 3!</div>'));
	});

	function StatelessComponent(props) {
		return <div { ...props } />;
	}

	it('should clone a basic stateless component with different children and props', () => {
		const node1 = <StatelessComponent children="Hello world" />;

		render(node1, container);
		expect(container.innerHTML).to.equal(innerHTML('<div>Hello world</div>'));
		const node2 = cloneVNode(node1, { children: 'Hello world 2!' });

		render(node2, container);
		expect(container.innerHTML).to.equal(innerHTML('<div>Hello world 2!</div>'));
		const node3 = cloneVNode(node1, { children: 'Hello world 3!', className: 'yo' });

		render(node3, container);
		expect(container.innerHTML).to.equal(innerHTML('<div class="yo">Hello world 3!</div>'));
	});
});
