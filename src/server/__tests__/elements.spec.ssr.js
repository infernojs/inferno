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
			'<div data-ssr="!0"></div>'
		);

		template = createTemplate(() => ({
			tag: 'span',
			text: 'Hello world!'
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<span data-ssr="!1">Hello world!</span>'
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
			'<span data-ssr="!3">123</span>'
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
			'<span data-ssr="!3">Hello world!</span>'
		);
	});

	it('Very basic examples with attributes', () => {
		template = createTemplate(() => ({
			tag: 'div',
			attrs: {
				className: 'foo'
			}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div class="foo" data-ssr="!0"></div>'
		);

		template = createTemplate(() => ({
			tag: 'span',
			text: 'Hello world!',
			attrs: {
				className: 'foo'
			}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<span class="foo" data-ssr="!1">Hello world!</span>'
		);

		template = createTemplate(() => ({
			tag: 'span',
			children: [
				1, 2, 3
			],
			attrs: {
				className: 'foo'
			}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<span class="foo" data-ssr="!3">123</span>'
		);

		template = createTemplate(() => ({
			tag: 'span',
			children: [
				'Hello', ' ', 'world!'
			],
			attrs: {
				className: 'foo'
			}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<span class="foo" data-ssr="!3">Hello world!</span>'
		);
	});
});