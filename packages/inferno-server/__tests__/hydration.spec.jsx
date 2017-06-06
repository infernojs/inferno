import { createVNode, render } from 'inferno';
import Component from 'inferno-component';
import { renderToString } from 'inferno-server';
import { createContainerWithHTML, innerHTML, validateNodeTree } from 'inferno-utils';

function Comp1() {
	return <span>Worked!</span>;
}

function Comp2() {
	return <em>Worked 2!</em>;
}

class Comp3 extends Component {
	render() {
		return <em>Works{' '}<span>again</span>!</em>;
	}
}

function Comp4({ children }) {
	return <section>{children}</section>;
}

class Comp5 extends Component {
	render() {
		return null;
	}
}

describe('SSR Hydration - (JSX)', () => {
	[
		{
			node: <div><span>Hello world</span></div>,
			expect1: '<div><span>Hello world</span></div>',
			expect2: '<div><span>Hello world</span></div>',
		},
		{
			node: <div><p>Hello world<sup><a>Foo</a></sup></p></div>,
			expect1: '<div><p>Hello world<sup><a>Foo</a></sup></p></div>',
			expect2: '<div><p>Hello world<sup><a>Foo</a></sup></p></div>',
		},
		{
			node: <div>{<span>Hello world</span>}</div>,
			expect1: '<div><span>Hello world</span></div>',
			expect2: '<div><span>Hello world</span></div>',
		},
		{
			node: <div><span>{<span>Hello world</span>}</span></div>,
			expect1: '<div><span><span>Hello world</span></span></div>',
			expect2: '<div><span><span>Hello world</span></span></div>',
		},
		{
			node: <div>Hello world</div>,
			expect1: '<div>Hello world</div>',
			expect2: '<div>Hello world</div>',
		},
		{
			node: (
				<div>
					<svg className={(() => 'foo')()} viewBox="0 0 64 64" />
				</div>
			),
			expect1: '<div><svg class="foo" viewBox="0 0 64 64"></svg></div>',
			expect2: '<div><svg class="foo" viewBox="0 0 64 64"></svg></div>',
		},
		{
			node: <Comp4><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></Comp4>,
			expect1: '<section><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></section>',
			expect2: '<section><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></section>',
		},
		{
			node: <div>Hello world, {'Foo!'}</div>,
			expect1: '<div>Hello world, <!---->Foo!</div>',
			expect2: '<div>Hello world, Foo!</div>',
		},
		{
			node: <div>Hello world, {['Foo!', 'Bar!']}</div>,
			expect1: '<div>Hello world, <!---->Foo!<!---->Bar!</div>',
			expect2: '<div>Hello world, Foo!Bar!</div>',
		},
		{
			node: <div>Hello world!{null}</div>,
			expect1: '<div>Hello world!</div>',
			expect2: '<div>Hello world!</div>',
		},
		{
			node: <div>Hello world, {'1'}2{'3'}</div>,
			expect1: '<div>Hello world, <!---->1<!---->2<!---->3</div>',
			expect2: '<div>Hello world, 123</div>',
		},
		{
			node: (
				<div id="1">
					<div id="2">
						<div id="3" />
					</div>
				</div>
			),
			expect1: '<div id="1"><div id="2"><div id="3"></div></div></div>',
			expect2: '<div id="1"><div id="2"><div id="3"></div></div></div>',
		},
		{
			node: <div><Comp1 /></div>,
			expect1: '<div><span>Worked!</span></div>',
			expect2: '<div><span>Worked!</span></div>',
		},
		{
			node: <div className="test"><Comp1 /></div>,
			expect1: '<div class="test"><span>Worked!</span></div>',
			expect2: '<div class="test"><span>Worked!</span></div>',
		},
		{
			node: <div><Comp1 /><Comp1 /><Comp1 /></div>,
			expect1: '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
			expect2: '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
		},
		{
			node: <div><Comp3 /></div>,
			expect1: '<div><em>Works<!----> <span>again</span><!---->!</em></div>',
			expect2: '<div><em>Works <span>again</span>!</em></div>',
		},
	].forEach(({ node, expect1, expect2 }, i) => {
		it(`Validate various structures #${i + 1}`, () => {
			const html = renderToString(node);
			const container = createContainerWithHTML(html);

			expect(innerHTML(container.innerHTML)).toBe(innerHTML(expect1));
			render(node, container);
			expect(validateNodeTree(node)).toBe(true);
			expect(innerHTML(container.innerHTML)).toBe(innerHTML(expect2));
			render(node, container);
			expect(innerHTML(container.innerHTML)).toBe(innerHTML(expect2));
		});
	});

	[
		{
			node: <div>Hello world</div>,
			expect1: '<div>Hello world</div>',
			node2: <div>Hello world 2</div>,
			expect2: '<div>Hello world 2</div>',
			node3: <div>Hello world</div>,
			expect3: '<div>Hello world</div>',
		},
		{
			node: <div>Hello world, {'Foo!'}</div>,
			expect1: '<div>Hello world, <!---->Foo!</div>',
			node2: <div>{'Start'} Hello world, {'Foo!'}</div>,
			expect2: '<div>Start Hello world, Foo!</div>',
			node3: <div>Hello world, {'Foo!'}</div>,
			expect3: '<div>Hello world, Foo!</div>',
		},
		{
			node: <div>Hello world, {'1'}2{'3'}</div>,
			expect1: '<div>Hello world, <!---->1<!---->2<!---->3</div>',
			node2: <div>Hello world, {'3'}2{'1'}</div>,
			expect2: '<div>Hello world, 321</div>',
			node3: <div>Hello world, {'1'}2{'3'}</div>,
			expect3: '<div>Hello world, 123</div>',
		},
		{
			node: (
				<div id="1">
					<div id="2">
						<div id="3" />
					</div>
				</div>
			),
			expect1: '<div id="1"><div id="2"><div id="3"></div></div></div>',
			node2: (
				<div id="3">
					<div id="2">
						<div id="1" />
					</div>
				</div>
			),
			expect2: '<div id="3"><div id="2"><div id="1"></div></div></div>',
			node3: (
				<div id="1">
					<div id="2">
						<div id="3" />
					</div>
				</div>
			),
			expect3: '<div id="1"><div id="2"><div id="3"></div></div></div>',
		},
		{
			node: <div><Comp1 /></div>,
			expect1: '<div><span>Worked!</span></div>',
			node2: <div />,
			expect2: '<div></div>',
			node3: <div><Comp1 /></div>,
			expect3: '<div><span>Worked!</span></div>',
		},
		{
			node: <div className="test"><Comp1 /></div>,
			expect1: '<div class="test"><span>Worked!</span></div>',
			node2: <div className="test"><Comp2 /></div>,
			expect2: '<div class="test"><em>Worked 2!</em></div>',
			node3: <div className="test"><Comp1 /></div>,
			expect3: '<div class="test"><span>Worked!</span></div>',
		},
		{
			node: <div><Comp1 /><Comp1 /><Comp1 /></div>,
			expect1: '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
			node2: <div><Comp2 /><Comp2 /><Comp2 /></div>,
			expect2: '<div><em>Worked 2!</em><em>Worked 2!</em><em>Worked 2!</em></div>',
			node3: <div><Comp1 /><Comp1 /><Comp1 /></div>,
			expect3: '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
		},
		{
			node: <div><Comp3 /></div>,
			expect1: '<div><em>Works<!----> <span>again</span><!---->!</em></div>',
			node2: <div><Comp1 /><Comp3 /></div>,
			expect2: '<div><span>Worked!</span><em>Works <span>again</span>!</em></div>',
			node3: <div><Comp3 /></div>,
			expect3: '<div><em>Works <span>again</span>!</em></div>',
		},
		{
			node: <div><Comp5 /></div>,
			expect1: '<div><!--!--></div>',
			node2: <div><Comp5 /><Comp3 /><Comp5 /></div>,
			expect2: '<div><em>Works <span>again</span>!</em></div>',
			node3: <div><Comp5 /></div>,
			expect3: '<div></div>',
		},
	].forEach(({ node, expect1, node2, node3, expect2, expect3 }, i) => {
		it(`Update various structures #${i + 1}`, () => {
			const html = renderToString(node);
			const container = createContainerWithHTML(html);

			expect(container.innerHTML).toBe(expect1);
			render(node, container);
			expect(validateNodeTree(node)).toBe(true);
			render(node2, container);
			expect(validateNodeTree(node2)).toBe(true);
			expect(container.innerHTML).toBe(expect2);
			render(node3, container);
			expect(validateNodeTree(node3)).toBe(true);
			expect(container.innerHTML).toBe(expect3);
		});
	});

	it('should rebuild and patch from existing DOM content', () => {
		const container = document.createElement('div');
		const vNode = createVNode(2, 'div', 'example', 'Hello world!');

		container.innerHTML = '<h1><div>Existing DOM content</div></h1>';
		render(vNode, container);
		expect(container.innerHTML).toBe(innerHTML('<div class="example">Hello world!</div>'));
	});

	it('should rebuild and patch from existing DOM content (whitespace) ', () => {
		const container = document.createElement('div');
		const vNode = createVNode(2, 'div', 'example', 'Hello world!');

		container.appendChild(document.createTextNode(''));
		container.appendChild(document.createElement('h1'));
		container.appendChild(document.createTextNode(''));
		render(vNode, container);
		expect(container.innerHTML).toBe(innerHTML('<div class="example">Hello world!</div>'));
	});

	it('should rebuild and patch from existing DOM content #2', () => {
		const container = document.createElement('div');
		const vNode = createVNode(2, 'div', 'example', [
			createVNode(2, 'div', null, 'Item 1'),
			createVNode(2, 'div', null, 'Item 2'),
		]);

		container.innerHTML =
			'<h1><div>Existing DOM content</div><div>Existing DOM content</div><div>Existing DOM content</div></h1><div>Existing DOM content</div>';
		render(vNode, container);
		expect(container.innerHTML).toBe(innerHTML('<div class="example"><div>Item 1</div><div>Item 2</div></div>'));
	});

	it('should rebuild and patch from existing DOM content #3', () => {
		const container = document.createElement('div');
		const vNode = createVNode(2, 'div', 'example', [
			createVNode(2, 'div', null, 'Item 1'),
			createVNode(2, 'div', null, 'Item 2'),
		]);

		container.innerHTML =
			'<div><div>Existing DOM content</div><div>Existing DOM content</div><div>Existing DOM content</div></div>';
		render(vNode, container);
		expect(container.innerHTML).toBe(innerHTML('<div class="example"><div>Item 1</div><div>Item 2</div></div>'));
	});

	it('Should work with setState', () => {
		class Comp3 extends Component {
			constructor(props, context) {
				super(props, context);

				this.state = {
					i: 0,
				};

				this.clicker = this.clicker.bind(this);
			}

			componentWillMount() {
				this.setState({
					i: ++this.state.i,
				});
			}

			clicker() {
				this.setState({
					i: ++this.state.i,
				});
			}

			render() {
				return (
					<div>
						{this.state.i}
						<span onClick={this.clicker}>1</span>
					</div>
				);
			}
		}

		const container = document.createElement('div');

		document.body.appendChild(container);
		container.innerHTML = '<div>1<span>1</span></div>';
		render(<Comp3 />, container);
		expect(container.innerHTML).toBe(innerHTML('<div>1<span>1</span></div>'));

		container.querySelector('span').click();

		expect(container.innerHTML).toBe(innerHTML('<div>2<span>1</span></div>'));

		container.querySelector('span').click();

		expect(container.innerHTML).toBe(innerHTML('<div>3<span>1</span></div>'));

		document.body.removeChild(container);
	});

	describe('Hydration SSR - CSR mismatches', () => {
		[
			{
				SSR: <div><span>Hello world</span></div>,
				SSR_expected: '<div><span>Hello world</span></div>',
				CSR: <div><em>Hello world</em></div>,
				CSR_expected: '<div><em>Hello world</em></div>',
			},
			{
				SSR: <div><p>Hello world<sup><a>Foo</a></sup></p></div>,
				SSR_expected: '<div><p>Hello world<sup><a>Foo</a></sup></p></div>',
				CSR: <div><p>Hello bar<span><em>Foo</em></span></p></div>,
				CSR_expected: '<div><p>Hello bar<span><em>Foo</em></span></p></div>',
			},
			{
				SSR: <div>{<span>Hello world</span>}</div>,
				SSR_expected: '<div><span>Hello world</span></div>',
				CSR: <em>{<span>Hello 11</span>}</em>,
				CSR_expected: '<em><span>Hello 11</span></em>',
			},
			{
				SSR: <div><span>{<span>Hello world</span>}</span></div>,
				SSR_expected: '<div><span><span>Hello world</span></span></div>',
				CSR: <em>{<span>Hello 11</span>}</em>,
				CSR_expected: '<em><span>Hello 11</span></em>',
			},
			{
				SSR: <div>Hello world</div>,
				SSR_expected: '<div>Hello world</div>',
				CSR: <div><p>Hello bar<span><em>Foo</em></span></p></div>,
				CSR_expected: '<div><p>Hello bar<span><em>Foo</em></span></p></div>',
			},
			{
				SSR: (
					<div>
						<svg className={(() => 'foo')()} viewBox="0 0 64 64" />
					</div>
				),
				SSR_expected: '<div><svg class="foo" viewBox="0 0 64 64"></svg></div>',
				CSR: (
					<div>
						<svg className={(() => 'bar1')()} viewBox="0 0 64 11" />
					</div>
				),
				CSR_expected: '<div><svg class="bar1" viewBox="0 0 64 11"></svg></div>',
			},
			{
				SSR: <Comp4><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></Comp4>,
				SSR_expected: '<section><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></section>',
				CSR: <Comp4><h1>Hello world again!</h1><p><em>{[1, 2, 3]}</em></p><p>{null}</p><p><em>Foo</em></p></Comp4>,
				CSR_expected: '<section><h1>Hello world again!</h1><p><em>123</em></p><p></p><p><em>Foo</em></p></section>',
			},
			{
				SSR: <div>Hello world, {'Foo!'}</div>,
				SSR_expected: '<div>Hello world, <!---->Foo!</div>',
				CSR: <Comp4><h1>Hello world again!</h1><p><em>{[1, 2, 3]}</em></p><p>{null}</p><p><em>Foo</em></p></Comp4>,
				CSR_expected: '<section><h1>Hello world again!</h1><p><em>123</em></p><p></p><p><em>Foo</em></p></section>',
			},
			{
				SSR: <div>Hello world, {'Foo!'}</div>,
				SSR_expected: '<div>Hello world, <!---->Foo!</div>',
				CSR: <div>Hello world, {'BarBar!'}</div>,
				CSR_expected: '<div>Hello world, BarBar!</div>',
			},
			{
				SSR: <div>Hello world, {['Foo!', 'Bar!']}</div>,
				SSR_expected: '<div>Hello world, <!---->Foo!<!---->Bar!</div>',
				CSR: <div>Hello world, {['Foo!', 'Bar!']}</div>,
				CSR_expected: '<div>Hello world, Foo!Bar!</div>',
			},
			{
				SSR: <div>Hello world!{null}</div>,
				SSR_expected: '<div>Hello world!</div>',
				CSR: <div>Hello world!{false}</div>,
				CSR_expected: '<div>Hello world!</div>',
			},
			{
				SSR: <div>Hello world, {'1'}2{'3'}</div>,
				SSR_expected: '<div>Hello world, <!---->1<!---->2<!---->3</div>',
				CSR: <div>Hello world, {'1'}2{[3, 4, 5, [6, 7]]}</div>,
				CSR_expected: '<div>Hello world, 1234567</div>',
			},
			{
				SSR: (
					<div id="1">
						<div id="2">
							<div id="3" />
						</div>
					</div>
				),
				SSR_expected: '<div id="1"><div id="2"><div id="3"></div></div></div>',
				CSR: (
					<div id="1">
						{[null, false, true, undefined]}
						<i id="2">
							<em>1</em>
							<span id="3" />
						</i>
					</div>
				),
				CSR_expected: '<div id="1"><i id="2"><em>1</em><span id="3"></div></i></div>',
			},
			{
				SSR: <div><Comp1 /></div>,
				SSR_expected: '<div><span>Worked!</span></div>',
				CSR: (
					<div id="1">
						{[null, false, true, undefined]}
						<i id="2">
							<em>1</em>
							<span id="3" />
						</i>
					</div>
				),
				CSR_expected: '<div id="1"><i id="2"><em>1</em><span id="3"></div></i></div>',
			},
			{
				SSR: <div className="test"><Comp1 /></div>,
				SSR_expected: '<div class="test"><span>Worked!</span></div>',
				CSR: <div><Comp1 /><Comp1 /><Comp1 /></div>,
				CSR_expected: '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
			},
			{
				SSR: <div><Comp1 /><Comp1 /><Comp1 /></div>,
				SSR_expected: '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
				CSR: <div className="test"><Comp1 /></div>,
				CSR_expected: '<div class="test"><span>Worked!</span></div>',
			},
		].forEach(({ SSR, CSR, SSR_expected, CSR_expected }, i) => {
			it(`Validate various structures #${i + 1}`, () => {
				const ssrString = renderToString(SSR);
				const SsrContainer = createContainerWithHTML(ssrString);

				expect(innerHTML(SsrContainer.innerHTML)).toBe(innerHTML(SSR_expected));
				render(CSR, SsrContainer); // Mount

				expect(innerHTML(SsrContainer.innerHTML)).toBe(innerHTML(CSR_expected));
				render(CSR, SsrContainer); // patch
				expect(innerHTML(SsrContainer.innerHTML)).toBe(innerHTML(CSR_expected));
			});
		});
	});
});
