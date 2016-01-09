import createHTMLTree from '../createTree';
import renderToString from '../renderToString';
import createTemplate from '../../core/createTemplate';
import Component from '../../component/Component';
import { addTreeConstructor } from '../../core/createTemplate';
import TemplateFactory from '../../core/TemplateFactory';

addTreeConstructor( 'html', createHTMLTree );

describe('SSR Attributes', () => {
	let template;


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
			'<div checked="simple" data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { checked: true}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div checked="true" data-inferno></div>'
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
			'<div scoped="true" data-inferno></div>'
		);
	});

	it('should create markup for booleanish properties', () => {

		let template;

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: 'simple' }
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div download="simple" data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: true}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div download="true" data-inferno></div>'
		);

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: 'true'}
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div download="true" data-inferno></div>'
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

		template = createTemplate(() => ({
			tag: 'div',
			attrs: { download: '0' }
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div download="0" data-inferno></div>'
		);
	});

	it('should work with select multiple ( numbers)', () => {

		let template = createTemplate(() => ({
			tag: 'select',
			attrs: { multiple: true, value: [1, 2] },
			children: [
				{tag: 'option', attrs: {value:1}, text:'1'},
				{tag: 'option', attrs: {value:2}, text:'2'}
			]
		}));
		expect(
			renderToString(template())
		).to.equal(

			'<select multiple="true" data-inferno><option value="1" selected="selected">1</option><option value="2" selected="selected">2</option></select>'
		);
	});

	it('should work with select multiple ( letters)', () => {

		let template = createTemplate(() => ({
			tag: 'select',
			attrs: { multiple: true, value: ['a', 'b'] },
			children: [
				{tag: 'option', attrs: {value:'a'}, text:'a'},
				{tag: 'option', attrs: {value:'b'}, text:'b'}
			]
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<select multiple="true" data-inferno><option value="a" selected="selected">a</option><option value="b" selected="selected">b</option></select>'
		);
	});


	it('should stringify a select multiple tag using groups and children', () => {

		let template = createTemplate(() => ({
			tag: 'select',
			attrs: { multiple: true, value: ["foo", "bar"]  },
			children: [

				{tag: 'optgroup', attrs: { label: 'foo-group' }, children: {tag: 'option', attrs: {value:'foo'}, text:'foo'}},
				{tag: 'optgroup', attrs: { label: 'bar-group' }, children: {tag: 'option', attrs: {value:'bar'}, text:'bar'}},
			]
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<select multiple="true" data-inferno><optgroup label="foo-group"><option value="foo">foo</option></optgroup><optgroup label="bar-group"><option value="bar">bar</option></optgroup></select>'
		);
	});

	it('should ignore textarea value attribute', () => {

		let template = createTemplate(() => ({
			tag: 'textarea',
			attrs: { value: 'Hello, World' },
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<textarea data-inferno>Hello, World</textarea>'
		);
	});

	it('should ignore contenteditable value attribute', () => {

		let template = createTemplate(() => ({
			tag: 'div',
			attrs: { contenteditable: '"true', value: 'blablabla'  },
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<div contenteditable="&quot;true" data-inferno>blablabla</div>'
		);
	});

	it('should convert properties to attributes', () => {

		let template = createTemplate(() => ({
			tag: 'form',
			attrs: { className: 'login',  acceptCharset: 'ISO-8859-1', accessKey: 'h' },
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<form class="login" accept-charset="ISO-8859-1" accesskey="h" data-inferno></form>'
		);
	});

	it('should not stringify null properties', () => {

		let template = createTemplate(() => ({
			tag: 'web-component',
			attrs: { className: null, id: null },
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<web-component data-inferno></web-component>'
		);
	});

	it('should not stringify `innerHTML` for attributes', () => {

		let template = createTemplate(() => ({
			tag: 'web-component',
			attrs: { innerHTML: '<span>hello, terrible world!!</span>' },
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<web-component><span>hello, terrible world!!</span></web-component>'
		);
	});

	it('should render input value', () => {

		let template = createTemplate(() => ({
			tag: 'input',
			attrs: { type: "submit", value: "add" },
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<input type="submit" value="add" data-inferno />'
		);
	});

	it('should render namespace attributes', () => {

		let template = createTemplate(() => ({
			tag: 'image',
			attrs: { xmlns: "http://www.w3.org/2000/svg", "xlink:href": "test.jpg"},
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<image xmlns="http://www.w3.org/2000/svg" xlink:href="test.jpg" data-inferno></image>'
		);
	});

	it('should render svg with attributes in non-default namespace', () => {

		let template = createTemplate(() => ({
			tag: 'use',
			attrs: { "xlink:href": "/abc.jpg" }
		}));
		expect(
			renderToString(template())
		).to.equal(
			'<use xlink:href="/abc.jpg" data-inferno />'
		);
	});

});