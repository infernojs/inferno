import template from '../../index';
import { render, renderToString } from '../../rendering';
import createTemplate from '../../../core/createTemplate';
import createDOMTree from '../../createTree';
import { addTreeConstructor } from '../../../core/createTemplate';


addTreeConstructor('dom', createDOMTree);

describe('rootVoidNode', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	it('should render a void div node', () => {

		const template = createTemplate(() => ({
			tag: 'div'
		}));
		render(template(), container);
		expect(container.firstChild.nodeName).to.equal('DIV');
	});

	it('should render a void span node', () => {

		const template = createTemplate(() => ({
			tag: 'span'
		}));
		render(template(), container);
		expect(container.firstChild.nodeName).to.equal('SPAN');
	});

	it('should render a void custom node', () => {

		const template = createTemplate(() => ({
			tag: 'inferno'
		}));
		render(template(), container);
		expect(container.firstChild.nodeName).to.equal('INFERNO');
	});


});
