import createTemplate from '../createTemplate';
import { render, renderToString } from '../../DOM/rendering';

describe('createTemplate  ( UT tests)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	})

	afterEach(() => {
		render(null, container);
	});

	it('should be a function', () => {
		expect(createTemplate).to.be.a.function;
	});

	it('should be equal to itself', () => {
		let template = createTemplate(() => ({
			tag: 'div'
		}));
		expect(template).to.equal(template);
	});

	it('should return undefined fi the template argument is not a function', () => {
		const invalidTemplates = [null, undefined, 0, 1, '', 'string',[] ];
		invalidTemplates.forEach(function (invalidTemplate) {
			expect(createTemplate(invalidTemplate)).to.be.undefined;
		});
	});
});
