import createTestTree from '../createTree';
import renderIntoDocument from '../renderIntoDocument';
import createTemplate from '../../core/createTemplate';
import Component from '../../component/Component';
import { addTreeConstructor } from '../../core/createTemplate';

const Inferno = { createTemplate };

addTreeConstructor('test', createTestTree);

describe('TestUtils - renderIntoDocument', () => {

	it('Basic example should render of elements', () => {
		const output = renderIntoDocument(<div />);

		if (output !== null){
			expect(output.tagName).to.equal('DIV');
		}
	});

	it('Basic example should render of elements #2', () => {
		const value = 'Hello world!';
		const output = renderIntoDocument(<span><div><div>{ value }</div></div></span>);
		if ( output !== null){
			expect(output.tagName).to.equal('SPAN');
			expect(output.firstChild.firstChild.firstChild.textContent).to.equal('Hello world!');
		}
		});

});
