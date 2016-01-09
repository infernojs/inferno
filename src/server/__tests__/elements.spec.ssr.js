import createHTMLTree from '../createTree';
import renderToString from '../renderToString';
import createTemplate from '../../core/createTemplate';
import Component from '../../component/Component';
import { addTreeConstructor } from '../../core/createTemplate';
import TemplateFactory from '../../core/TemplateFactory';

addTreeConstructor( 'html', createHTMLTree );

describe('SSR Elements', () => {
	let template;

	it('should not stringify end tags for void elements', () => {

		template = createTemplate(() => ({
			tag: 'input'
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<input data-inferno />'
		);
	});

	it('Very basic examples', () => {
		template = createTemplate(() => ({
			tag: 'div'
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'span',
			text: 'Hello world!'
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<span data-inferno>Hello world!</span>'
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
			'<span data-inferno>1<!---->2<!---->3</span>'
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
			'<span data-inferno>Hello<!----> <!---->world!</span>'
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
			'<div class="foo" data-inferno></div>'
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
			'<span class="foo" data-inferno>Hello world!</span>'
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
			'<span class="foo" data-inferno>1<!---->2<!---->3</span>'
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
			'<span class="foo" data-inferno>Hello<!----> <!---->world!</span>'
		);
	});
});