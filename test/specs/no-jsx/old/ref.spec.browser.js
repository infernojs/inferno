import Inferno from '../../../../packages/inferno/src/';
import InfernoDOM from '../../../../packages/inferno-dom/src/';

// WHY would we need this??

import { addTreeConstructor } from '../../../../src/core/createTemplate';
import createDOMTree from '../../../../src/DOM/createTree';
addTreeConstructor( 'dom', createDOMTree );

const { createElement } = Inferno.TemplateFactory;

describe( 'Inferno.createRef() - (non-JSX)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	it('should support ref', () => {

		const divRef = InfernoDOM.createRef();

		let template = Inferno.createTemplate((divRef) => ({
			tag: 'div',
			attrs: {
				ref: divRef
			}
		}));

		InfernoDOM.render(template(divRef), container);
		expect(container.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.innerHTML).to.equal('');
		expect(
			divRef.element
		).to.equal(
			container.firstChild
		);

		InfernoDOM.render(template(divRef), container);
		expect(container.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.innerHTML).to.equal('');
		expect(
			divRef.element
		).to.equal(
			container.firstChild
		);
	});
});