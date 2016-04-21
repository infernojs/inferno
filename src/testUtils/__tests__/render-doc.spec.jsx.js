//import createTestTree from './../createTree';
//import renderIntoDocument from './../renderIntoDocument';
//import createTemplate from './../../core/createTemplate';
//import Component from './../../component/Component';
//import { addTreeConstructor } from './../../core/createTemplate';
//
//const Inferno = { createTemplate };
//
//addTreeConstructor('test', createTestTree);
//
//describe('TestUtils - renderIntoDocument', () => {
//
//	it('Basic example should render of elements', () => {
//		const output = renderIntoDocument(<div />);
//
//		if (output !== null){
//			expect(output.tagName).to.equal('DIV');
//		}
//	});
//
//	it('Basic example should render of elements #2', () => {
//		const value = 'Hello world!';
//		const output = renderIntoDocument(<span><div><div>{ value }</div></div></span>);
//		if (output !== null){
//			expect(output.tagName).to.equal('SPAN');
//			expect(output.firstChild.firstChild.firstChild.textContent).to.equal('Hello world!');
//		}
//	});
//
//	it('should render various elements with text', () => {
//		const output = renderIntoDocument(<span><div><div>Hello, World!!</div></div></span>);
//
//		if (output !== null){
//			expect(output.tagName).to.equal('SPAN');
//			expect(output.firstChild.firstChild.tagName).to.equal('DIV');
//			expect(output.firstChild.firstChild.textContent).to.equal('Hello, World!!');
//		}
//	});
//
//	it('should render a element with two child nodes', () => {
//		const output = renderIntoDocument(<span><div></div><div></div></span>);
//
//		if (output !== null){
//			expect(output.tagName).to.equal('SPAN');
//			expect(output.childNodes.length).to.equal(2);
//			expect(output.childNodes[0].tagName).to.equal('DIV');
//			expect(output.childNodes[1].tagName).to.equal('DIV');
//		}
//	});
//
//	it('should render a element with static attributes', () => {
//		const output = renderIntoDocument(<div class='Hello, World!'></div>);
//
//		if (output !== null){
//			expect(output.tagName).to.equal('DIV');
//			expect(output.hasAttribute('class')).to.equal(true);
//		}
//	});
//
//	it('should render a element with static attribute on child node', () => {
//		const output = renderIntoDocument(<div><div class='Hello, World!'></div></div>);
//
//		if (output !== null){
//			expect(output.tagName).to.equal('DIV');
//			expect(output.firstChild.hasAttribute('class')).to.equal(true);
//		}
//	});
//
//	it('should render a element with static attribute on root and child node', () => {
//		const output = renderIntoDocument(<div class="foo"><div class='Hello, World!'></div></div>);
//
//		if (output !== null){
//			expect(output.tagName).to.equal('DIV');
//			expect(output.hasAttribute('class')).to.equal(true);
//			expect(output.getAttribute('class')).to.equal('foo');
//			expect(output.firstChild.hasAttribute('class')).to.equal(true);
//			expect(output.firstChild.getAttribute('class')).to.equal('Hello, World!');
//		}
//	});
//
//	it('should render a element with dynamic attributes', () => {
//		const attr = 'Inferno Rocks!';
//		const output = renderIntoDocument(<div class={attr}></div>);
//
//		if (output !== null){
//			expect(output.tagName).to.equal('DIV');
//			expect(output.hasAttribute('class')).to.equal(true);
//			expect(output.getAttribute('class')).to.equal(attr);
//		}
//	});
//
//});
