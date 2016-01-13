import createTemplate from '../../core/createTemplate';
import { addTreeConstructor } from '../../core/createTemplate';
import { render } from '../../DOM/rendering';
import createDOMTree from '../../DOM/createTree';

addTreeConstructor('dom', createDOMTree);

describe('lifecycle hooks', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	it('hooks - created/attached callbacks should return node', () => {
		let createdDomNode;
		let attacheddDomNode;
		let template = createTemplate((created, attached) => ({
			tag: 'div',
			attrs: {
				hooks: { created, attached }
			}
		}));
		render(template(domNode => createdDomNode = domNode, domNode => attacheddDomNode = domNode), container);
		const expectedDomNode = container.firstChild;

		expect(createdDomNode).to.equal(createdDomNode);
		expect(attacheddDomNode).to.equal(createdDomNode);
	});
});