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

	describe('rootVoidNode', () => {
		let template;

		beforeEach(() => {
			template = createTemplate((created, attached, detached) => ({
				tag: 'div',
				attrs: {
					hooks: { created, attached, detached }
				}
			}));
		});

		it('"created" hook should fire', () => {
			let createdDomNode;
			render(template(domNode => createdDomNode = domNode, null, null), container);
			const expectedDomNode = container.firstChild;
			expect(createdDomNode).to.equal(expectedDomNode);
		});
		it('"attached" hook should fire', () => {
			let attachedDomNode;
			render(template(null, domNode => attachedDomNode = domNode, null), container);
			const expectedDomNode = container.firstChild;
			expect(attachedDomNode).to.equal(expectedDomNode);
		});
		it('"detached" hook should fire', () => {
			let detacheddDomNode;
			render(template(null, null, domNode => detacheddDomNode = domNode), container);
			const expectedDomNode = container.firstChild;
			render(null, container);
			expect(detacheddDomNode).to.equal(expectedDomNode);
		});
	});
});