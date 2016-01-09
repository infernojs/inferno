import createHTMLTree from '../createTree';
import renderToString from '../renderToString';
import createTemplate from '../../core/createTemplate';
import Component from '../../component/Component';
import { addTreeConstructor } from '../../core/createTemplate';
import TemplateFactory from '../../core/TemplateFactory';

addTreeConstructor( 'html', createHTMLTree );

describe('SSR Attributes', () => {
	let template;
/*
	it('should create markup for simple properties', () => {

		let template;

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { name: 'simple' }
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div name="simple" data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { name: 'false' }
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div name="false" data-inferno></div>'
		);
		template = createTemplate(() => ({
			tag: 'div',
			attrs: { name: null }
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div data-inferno></div>'
		);
	});

	it('should work with the id attribute', () => {

		let template = createTemplate(() => ({
			tag: 'div',
			attrs: { id: 'simple' }
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div id="simple" data-inferno></div>'
		);
	});

	it('should create markup for boolean properties', () => {

		let template;

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { checked: 'simple' }
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div checked="" data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { checked: true}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div checked="" data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { checked: false}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { scoped: true}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div scoped="" data-inferno></div>'
		);
	});
*/
	it('should create markup for booleanish properties', () => {

		let template;
/*
		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: 'simple' }
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div download="" data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: true}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div download="" data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: 'true'}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div download="" data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: false}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: 'false'}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: undefined}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: null }
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div data-inferno></div>'
		);
*/
		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: '0' }
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div data-inferno></div>'
		);

	});

});