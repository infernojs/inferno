import { expect } from 'chai';
import renderToString from '../../server/renderToString';
import Component from 'inferno-component';
import {
	createContainerWithHTML,
	innerHTML,
	validateNodeTree
} from '../../tools/utils';
import Inferno, { render } from 'inferno';
Inferno; // suppress ts 'never used' error

function Comp1() {
	return <span>Worked!</span>;
}

function Comp2() {
	return <em>Worked 2!</em>;
}

class Comp3 extends Component<any, any> {
	render() {
		return <em>Works{ ' ' }<span>again</span>!</em>;
	}
}

function Comp4({ children }) {
	return <section>{children}</section>;
}

describe('SSR Hydration - (JSX)', () => {
	[
		{
			node: <div><span>Hello world</span></div>,
			expect1: '<div><span>Hello world</span></div>',
			expect2: '<div><span>Hello world</span></div>'
		},
		{
			node: <div><p>Hello world<sup><a>Foo</a></sup></p></div>,
			expect1: '<div><p>Hello world<sup><a>Foo</a></sup></p></div>',
			expect2: '<div><p>Hello world<sup><a>Foo</a></sup></p></div>'
		},
		{
			node: <div>{ <span>Hello world</span> }</div>,
			expect1: '<div><span>Hello world</span></div>',
			expect2: '<div><span>Hello world</span></div>'
		},
		{
			node: <div><span>{ <span>Hello world</span> }</span></div>,
			expect1: '<div><span><span>Hello world</span></span></div>',
			expect2: '<div><span><span>Hello world</span></span></div>'
		},
		{
			node: <div>Hello world</div>,
			expect1: '<div>Hello world</div>',
			expect2: '<div>Hello world</div>'
		},
		{
			node: <div>
				<svg className={(() => 'foo')()} viewBox="0 0 64 64"/>
			</div>,
			expect1: '<div><svg class="foo" viewBox="0 0 64 64"></svg></div>',
			expect2: '<div><svg class="foo" viewBox="0 0 64 64"></svg></div>'
		},
		{
			node: <Comp4><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></Comp4>,
			expect1: '<section><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></section>',
			expect2: '<section><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></section>'
		},
		{
			node: <div>Hello world, { 'Foo!' }</div>,
			expect1: '<div>Hello world, <!---->Foo!</div>',
			expect2: '<div>Hello world, Foo!</div>'
		},
		{
			node: <div>Hello world, { ['Foo!', 'Bar!'] }</div>,
			expect1: '<div>Hello world, <!---->Foo!<!---->Bar!</div>',
			expect2: '<div>Hello world, Foo!Bar!</div>'
		},
		{
			node: <div>Hello world!{ null }</div>,
			expect1: '<div>Hello world!</div>',
			expect2: '<div>Hello world!</div>'
		},
		{
			node: <div>Hello world, { '1' }2{ '3' }</div>,
			expect1: '<div>Hello world, <!---->1<!---->2<!---->3</div>',
			expect2: '<div>Hello world, 123</div>'
		},
		{
			node: <div id="1">
				<div id="2">
					<div id="3"></div>
				</div>
			</div>,
			expect1: '<div id="1"><div id="2"><div id="3"></div></div></div>',
			expect2: '<div id="1"><div id="2"><div id="3"></div></div></div>'
		},
		{
			node: <div><Comp1 /></div>,
			expect1: '<div><span>Worked!</span></div>',
			expect2: '<div><span>Worked!</span></div>'
		},
		{
			node: <div className='test'><Comp1 /></div>,
			expect1: '<div class="test"><span>Worked!</span></div>',
			expect2: '<div class="test"><span>Worked!</span></div>'
		},
		{
			node: <div><Comp1 /><Comp1 /><Comp1 /></div>,
			expect1: '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
			expect2: '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>'
		},
		{
			node: <div><Comp3 /></div>,
			expect1: '<div><em>Works<!----> <span>again</span><!---->!</em></div>',
			expect2: '<div><em>Works <span>again</span>!</em></div>'
		}
	].forEach(({ node, expect1, expect2 }, i) => {
		it(`Validate various structures #${ (i + 1) }`, () => {
			const html = renderToString(node);
			const container = createContainerWithHTML(html);

			expect(innerHTML(container.innerHTML)).to.equal(innerHTML(expect1));
			render(node, container);
			expect(validateNodeTree(node)).to.equal(true);
			expect(innerHTML(container.innerHTML)).to.equal(innerHTML(expect2));
			render(node, container);
			expect(innerHTML(container.innerHTML)).to.equal(innerHTML(expect2));
		});
	});
	[
		{
			node: <div>Hello world</div>,
			expect1: '<div>Hello world</div>',
			node2: <div>Hello world 2</div>,
			expect2: '<div>Hello world 2</div>',
			node3: <div>Hello world</div>,
			expect3: '<div>Hello world</div>'
		},
		{
			node: <div>Hello world, { 'Foo!' }</div>,
			expect1: '<div>Hello world, <!---->Foo!</div>',
			node2: <div>{ 'Start' } Hello world, { 'Foo!' }</div>,
			expect2: '<div>Start Hello world, Foo!</div>',
			node3: <div>Hello world, { 'Foo!' }</div>,
			expect3: '<div>Hello world, Foo!</div>'
		},
		{
			node: <div>Hello world, { '1' }2{ '3' }</div>,
			expect1: '<div>Hello world, <!---->1<!---->2<!---->3</div>',
			node2: <div>Hello world, { '3' }2{ '1' }</div>,
			expect2: '<div>Hello world, 321</div>',
			node3: <div>Hello world, { '1' }2{ '3' }</div>,
			expect3: '<div>Hello world, 123</div>'
		},
		{
			node: <div id="1">
				<div id="2">
					<div id="3"></div>
				</div>
			</div>,
			expect1: '<div id="1"><div id="2"><div id="3"></div></div></div>',
			node2: <div id="3">
				<div id="2">
					<div id="1"></div>
				</div>
			</div>,
			expect2: '<div id="3"><div id="2"><div id="1"></div></div></div>',
			node3: <div id="1">
				<div id="2">
					<div id="3"></div>
				</div>
			</div>,
			expect3: '<div id="1"><div id="2"><div id="3"></div></div></div>'
		},
		{
			node: <div><Comp1 /></div>,
			expect1: '<div><span>Worked!</span></div>',
			node2: <div></div>,
			expect2: '<div></div>',
			node3: <div><Comp1 /></div>,
			expect3: '<div><span>Worked!</span></div>'
		},
		{
			node: <div className='test'><Comp1 /></div>,
			expect1: '<div class="test"><span>Worked!</span></div>',
			node2: <div className='test'><Comp2 /></div>,
			expect2: '<div class="test"><em>Worked 2!</em></div>',
			node3: <div className='test'><Comp1 /></div>,
			expect3: '<div class="test"><span>Worked!</span></div>'
		},
		{
			node: <div><Comp1 /><Comp1 /><Comp1 /></div>,
			expect1: '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
			node2: <div><Comp2 /><Comp2 /><Comp2 /></div>,
			expect2: '<div><em>Worked 2!</em><em>Worked 2!</em><em>Worked 2!</em></div>',
			node3: <div><Comp1 /><Comp1 /><Comp1 /></div>,
			expect3: '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>'
		},
		{
			node: <div><Comp3 /></div>,
			expect1: '<div><em>Works<!----> <span>again</span><!---->!</em></div>',
			node2: <div><Comp1 /><Comp3 /></div>,
			expect2: '<div><span>Worked!</span><em>Works <span>again</span>!</em></div>',
			node3: <div><Comp3 /></div>,
			expect3: '<div><em>Works <span>again</span>!</em></div>'
		}
	].forEach(({ node, expect1, node2, node3, expect2, expect3 }, i) => {
		it(`Update various structures #${ (i + 1) }`, () => {
			const html = renderToString(node);
			const container = createContainerWithHTML(html);

			expect(container.innerHTML).to.equal(expect1);
			render(node, container);
			expect(validateNodeTree(node)).to.equal(true);
			render(node2, container);
			expect(validateNodeTree(node2)).to.equal(true);
			expect(container.innerHTML).to.equal(expect2);
			render(node3, container);
			expect(validateNodeTree(node3)).to.equal(true);
			expect(container.innerHTML).to.equal(expect3);
		});
	});
});
