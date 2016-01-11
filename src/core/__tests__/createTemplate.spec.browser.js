import createTemplate, { addTreeConstructor  } from '../createTemplate';
import { render } from '../../DOM/rendering';

describe('Inferno.createTemplate()', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	})

	afterEach(() => {
		render(null, container);
	});

	it('should be a function ( createTemplate )', () => {
		expect(createTemplate).to.be.a.function;
	});

	it('should be a function ( createTemplate )', () => {
		expect(createTemplate({})).to.be.a.function;
	});

	it('should be a function ( addTreeConstructor )', () => {
		expect(addTreeConstructor).to.be.a.function;
	});

	it('should set default tree constructor', () => {
		addTreeConstructor('foo', () => {});
	});

	it('should be equal to itself', () => {
		let template = createTemplate(() => ({
			tag: 'div'
		}));
		expect(template).to.equal(template);
	});

	it('should be equal to itself', () => {
		let template = createTemplate(() => ({
			tag: '123div'
		}));
		expect(template).to.equal(template);
	});

	it('should return undefined if the template argument is not a function', () => {
		const invalidTemplates = [null, undefined, 0, 1, '', 'string',[], {} ];
		invalidTemplates.forEach(function (invalidTemplate) {
			expect(createTemplate(invalidTemplate)).to.be.undefined;
		});
	});
});
