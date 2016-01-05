import createTemplate from '../createTemplate';
import { addTreeConstructor } from '../createTemplate';
import { render, renderToString } from '../../DOM/rendering';
import createDOMTree from '../../DOM/createTree';
import createRef from '../createRef';

addTreeConstructor( 'dom', createDOMTree );

describe( 'createRef()', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	it('should support ref', () => {

		const divRef = createRef();

		let template = createTemplate((divRef) => ({
			tag: 'div',
			attrs: {
				ref: divRef
			}
		}));

		render(template(), container);

		render(template(divRef), container);

		expect(container.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.innerHTML).to.equal('');
		expect(
			divRef.element
		).to.equal(
			container.firstChild
		);

		expect(
			() => render(template(null), container)
		).to.throw;

		render(template(divRef), container);
		expect(container.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.innerHTML).to.equal('');
		expect(
			divRef.element
		).to.equal(
			container.firstChild
		);

		expect(
			() => render(template(null), container)
		).to.throw;

		expect(
			() => render(template(undefined), container)
		).to.throw;

		expect(
			() => render(template([]), container)
		).to.throw;

	});
});