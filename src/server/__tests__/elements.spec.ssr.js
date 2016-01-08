import createHTMLTree from '../createTree';
import renderToString from '../renderToString';
import createTemplate from '../../core/createTemplate';
import Component from '../../component/Component';
import { addTreeConstructor } from '../../core/createTemplate';
import TemplateFactory from '../../core/TemplateFactory';

addTreeConstructor( 'html', createHTMLTree );

describe('SSR Elements', () => {
	let template;

	it('Very basic examples', () => {
		template = createTemplate(() => ({
			tag: 'div'
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div></div>'
		);

		template = createTemplate(() => ({
			tag: 'span',
			text: 'Hello world!'
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<span>Hello world!</span>'
		);

		template = createTemplate(() => ({
			tag: 'span',
			children: [
				1, 2, 3
			]
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<span>1<!---->2<!---->3</span>'
		);

		template = createTemplate(() => ({
			tag: 'span',
			children: [
				'Hello', ' ', 'world!'
			]
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<span>Hello<!----> <!---->world!</span>'
		);
	});

	it('Very basic examples with attributes', () => {
		template = createTemplate(() => ({
			tag: 'div',
			attrs: {
				class: 'foo'
			}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div class="foo"></div>'
		);

		template = createTemplate(() => ({
			tag: 'span',
			text: 'Hello world!',
			attrs: {
				class: 'foo'
			}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<span class="foo">Hello world!</span>'
		);

		template = createTemplate(() => ({
			tag: 'span',
			children: [
				1, 2, 3
			],
			attrs: {
				class: 'foo'
			}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<span class="foo">1<!---->2<!---->3</span>'
		);

		template = createTemplate(() => ({
			tag: 'span',
			children: [
				'Hello', ' ', 'world!'
			],
			attrs: {
				class: 'foo'
			}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<span class="foo">Hello<!----> <!---->world!</span>'
		);
	});
});