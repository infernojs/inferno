import Inferno from '../../../../src';
import get from '../../../tools/get';

const {
	createElement
} = Inferno.TemplateFactory;

describe('DOM element tests (jsx)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		Inferno.render(null, container);
	});

   // took out the tests
	
});
