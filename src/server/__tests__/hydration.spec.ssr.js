import createHTMLTree from '../createTree';
import renderToString from '../renderToString';
import { render } from '../../DOM/rendering';
import createTemplate from '../../core/createTemplate';
import Component from '../../component/Component';
import { addTreeConstructor } from '../../core/createTemplate';
import TemplateFactory from '../../core/TemplateFactory';

addTreeConstructor('html', createHTMLTree);

describe('SSR Hydration', () => {
	let template;
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
		container = null;
	});

	describe('should not change DOM when hydrated content matches container', () => {
		it('very basic example #1', () => {
			template = createTemplate(() => ({
				tag: 'div'
			}));
			container.innerHTML = renderToString(template());
			const keepNode = container.firstChild;

			render(template(), container);

			const hydratedNode = container.firstChild;
			expect(keepNode).to.equal(hydratedNode);
		});

		it('very basic example #2', () => {
			template = createTemplate(() => ({
				tag: 'span',
				text: 'Hello world!'
			}));
			container.innerHTML = renderToString(template());
			const keepNode = container.firstChild;

			render(template(), container);

			const hydratedNode = container.firstChild;
			expect(keepNode).to.equal(hydratedNode);
		});
	});
});