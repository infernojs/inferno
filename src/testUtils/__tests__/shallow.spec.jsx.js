//import createTestTree from './../createTree';
//import shallowRender from './../shallowRender';
//import createTemplate from './../../core/createTemplate';
//import Component from './../../component/Component';
//import { addTreeConstructor } from './../../core/createTemplate';
//
//const Inferno = { createTemplate };
//
//addTreeConstructor('test', createTestTree);
//
//describe('TestUtils - Shallow Rendering', () => {
//	it('Basic example should render of elements', () => {
//		const output = shallowRender(<div />);
//		expect(output.tag).to.equal('div');
//	});
//	it('Basic example should render of elements #2', () => {
//		const value = 'Hello world!';
//		const output = shallowRender(<span>{ value }</span>);
//
//		expect(output.tag).to.equal('span');
//		expect(output.children).to.equal('Hello world!');
//	});
//	it('Basic example should render of elements #3', () => {
//		const value = 'Hello world!';
//		const output = shallowRender(<span className="foo">{ value } and { value } again...</span>);
//
//		expect(output.tag).to.equal('span');
//		expect(output.attrs.className).to.equal('foo');
//		expect(output.children[0]).to.equal('Hello world!');
//		expect(output.children[1]).to.equal(' and ');
//		expect(output.children[2]).to.equal('Hello world!');
//		expect(output.children[3]).to.equal(' again...');
//	});
//	it('Basic example should render of elements #4', () => {
//		const value = '123';
//		const value2 = 'test';
//		const output = shallowRender(<custom-element foo={ value2 }>{ value }</custom-element>);
//
//		expect(output.tag).to.equal('custom-element');
//		expect(output.attrs.foo).to.equal('test');
//		expect(output.children).to.equal('123');
//	});
//	it('Basic example should render of stateless component', () => {
//		function StatelessComponent() {
//			return <div>Hello world!</div>;
//		}
//		const output = shallowRender(<StatelessComponent />);
//
//		expect(output.tag).to.equal('div');
//		expect(output.children).to.equal('Hello world!');
//	});
//	it('Basic example should render of stateful component', () => {
//		class StatefulComponent extends Component {
//			render() {
//				return <div>Hello world!</div>;
//			}
//		}
//		const output = shallowRender(<StatefulComponent />);
//
//		expect(output.tag).to.equal('div');
//		expect(output.children).to.equal('Hello world!');
//	});
//});
