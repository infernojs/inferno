import Inferno from '../../../src';

const { createElement } = Inferno.TemplateFactory;

describe( 'Inferno.createRed - (non-JSX)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	it('should support ref', () => {

		const divRef = Inferno.createRef();

		let template = Inferno.createTemplate((divRef) => ({
			tag: 'div',
			attrs: {
				ref: divRef
			}
		}));

		Inferno.render(template(divRef), container);
		expect(container.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.innerHTML).to.equal('');
		expect(
			divRef.element
		).to.equal(
			container.firstChild
		);

		Inferno.render(template(divRef), container);
		expect(container.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.innerHTML).to.equal('');
		expect(
			divRef.element
		).to.equal(
			container.firstChild
		);
	});
});