import createShallowTree from '../createTree';
import createRenderer from '../createRenderer';
import createTemplate from '../../core/createTemplate';
import Component from '../../component/Component';
import { addTreeConstructor } from '../../core/createTemplate';

const Inferno = { createTemplate };

addTreeConstructor('shallow', createShallowTree);

describe('Shallow Rendering', () => {
	it('Basic example should render', () => {
		const shallowRenderer = createRenderer();
		shallowRenderer.render(<div />);

		const output = shallowRenderer.getRenderOutput();
		expect(output.tag).to.equal('div');
	});
	it('Basic example should render #2', () => {
		const shallowRenderer = createRenderer();
		const value = 'Hello world!';
		shallowRenderer.render(<div><span>{ value }</span></div>);

		const output = shallowRenderer.getRenderOutput();
		expect(output.tag).to.equal('div');
		expect(output.children.tag).to.equal('span');
		expect(output.children.children).to.equal('Hello world!');
	});
	it('Basic example should render #3', () => {
		const shallowRenderer = createRenderer();
		const value = 'Hello world!';
		shallowRenderer.render(<div><span className="foo">{ value } and { value } again...</span></div>);

		const output = shallowRenderer.getRenderOutput();
		expect(output.tag).to.equal('div');
		expect(output.children.tag).to.equal('span');
		expect(output.children.attrs.className).to.equal('foo');
		expect(output.children.children[0]).to.equal('Hello world!');
		expect(output.children.children[1]).to.equal(' and ');
		expect(output.children.children[2]).to.equal('Hello world!');
		expect(output.children.children[3]).to.equal(' again...');
	});
	it('Basic example should render #4', () => {
		const shallowRenderer = createRenderer();
		const value = '123';
		const value2 = 'test';
		shallowRenderer.render(<custom-element foo={ value2 }>{ value }</custom-element>);

		const output = shallowRenderer.getRenderOutput();
		expect(output.tag).to.equal('custom-element');
		expect(output.attrs.foo).to.equal('test');
		expect(output.children).to.equal('123');
	});
});