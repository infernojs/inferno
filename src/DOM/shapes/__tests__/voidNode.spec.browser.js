import template from '../../index';
import { render, renderToString } from '../../rendering';
import createTemplate from '../../../core/createTemplate';
import createDOMTree from '../../createTree';
import { addTreeConstructor } from '../../../core/createTemplate';

addTreeConstructor('dom', createDOMTree);

describe('voidNode', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	it('should render a root node with a void node', () => {

		const template = createTemplate(() => ({
			tag: 'div',
			children: { tag: 'span' }
		}));
		render(template(), container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
	});
});
