import createHTMLTree from '../createTree';
import renderToString from '../renderToString';
import createTemplate from '../../core/createTemplate';
import Component from '../../component/Component';
import { addTreeConstructor } from '../../core/createTemplate';
import TemplateFactory from '../../core/TemplateFactory';

addTreeConstructor( 'html', createHTMLTree );

describe('SSR Elements', () => {

	it('Very basic example', () => {
		const template = createTemplate(() => ({
			tag: 'div'
		}));

		expect(
			renderToString(template())
		).to.equal(
			'<div data-ssr="."></div>'
		);
	});

});