/*
import createTestTree from './../createTree';
import deepRender from './../deepRender';
import createTemplate from './../../core/createTemplate';
import Component from './../../component/Component';
import { addTreeConstructor } from './../../core/createTemplate';

const Inferno = { createTemplate };

addTreeConstructor('test', createTestTree);

describe('TestUtils - Deep Rendering', () => {
	it('Basic example should render of elements', () => {
		const output = deepRender(<div />);
		expect(output.tag).to.equal('div');
	});

	it('Basic example should render of elements #2', () => {
		const value = 'Hello world!';
		const output = deepRender(<span><div><div>{ value }</div></div></span>);

		expect(output.tag).to.equal('span');
		expect(output.children.children.children).to.equal('Hello world!');
	});
});
*/
