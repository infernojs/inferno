import createTemplate from '../../core/createTemplate';
import { addTreeConstructor } from '../../core/createTemplate';
import { render } from '../../DOM/rendering';
import createDOMTree from '../../DOM/createTree';
import createRef from '../../DOM/createRef';

addTreeConstructor('dom', createDOMTree);

describe('createRef()', () => {

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

		render(template(null), container);

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

		expect(() => render(template('123'), container)).to.throw;
		expect(() => render(template(123), container)).to.throw;

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