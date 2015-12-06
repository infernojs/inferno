import get from '../../../tools/get';
import Inferno from '../../../../src';

export default function domElementsTestsNoJSX(describe, expect, container) {

	describe('should render a basic example', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(() => ({
				tag: 'div',
				text: 'Hello world'
			}));
			Inferno.render(template(), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world</div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(template(), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world</div>'
			);
		});
	});

	describe('should render a basic example #2', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(() => ({
				tag: 'ul',
				children: [
					{tag: 'li', text: 'Im a li-tag'},
					{tag: 'li', text: 'Im a li-tag'},
					{tag: 'li', text: 'Im a li-tag'}
				]
			}));

			Inferno.render(template(), container);
		});
		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				`<ul><li>Im a li-tag</li><li>Im a li-tag</li><li>Im a li-tag</li></ul>`
			);
		});
	});

	describe('should render a basic example #3', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(() => ({
				tag: 'ul',
				children: [
					{tag: 'li', children: {tag: 'span', text: 'Im a li-tag'}},
					{tag: 'li', children: {tag: 'span', text: 'Im a li-tag'}},
					{tag: 'li', children: {tag: 'span', text: 'Im a li-tag'}}
				]
			}));

			Inferno.render(template(), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				`<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>`
			);
		});
	});

	describe('should render "disabled" boolean attributes', () => {
		let template;

		it('Initial render (creation)', () => {
			template = Inferno.createTemplate(() => ({
				tag: 'div',
				attrs: { disabled: true }
			}));

			Inferno.render(template(), container);

			expect(container.firstChild.getAttribute('disabled')).to.eql('true');
			expect(
				container.innerHTML
			).to.equal(
				'<div disabled="true"></div>'
			);
		});

 		it('Second render (update)', () => {
			template = Inferno.createTemplate(() => ({
				tag: 'div',
				attrs: { disabled: false }
			}));

			Inferno.render(template(), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);
		});
	});

//	describe('should render "hidden" boolean attributes', () => {
//		let template;
//
//		it('Initial render (creation)', () => {
//
//			template = Inferno.createTemplate(createElement =>
//					createElement('div', { hidden: true })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//
//			expect(container.firstChild.getAttribute('hidden')).to.eql('true');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div hidden="true"></div>'
//			);
//		});
//
// 	it('Second render (update)', () => {
//
//			template = Inferno.createTemplate(createElement =>
//					createElement('div', { hidden: false })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//	});
//
//describe('should render "required" boolean attributes', () => {
//		let template;
//
//		it('Initial render (creation)', () => {
//
//			template = Inferno.createTemplate(createElement =>
//					createElement('div', { required: 'required' })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//
//			expect(container.firstChild.getAttribute('required')).to.eql('required');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div required="required"></div>'
//			);
//		});
//
// 	it('Second render (update)', () => {
//
//			template = Inferno.createTemplate(createElement =>
//					createElement('div', { hidden: 'NaN' })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div hidden="NaN"></div>'
//			);
//		});
//
//	});
//
//	describe('should render "itemScope" boolean attributes', () => {
//		let template;
//
//		it('Initial render (creation)', () => {
//
//			template = Inferno.createTemplate(createElement =>
//					createElement('div', { itemScope: 'itemScope' })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//
//			expect(container.firstChild.getAttribute('itemScope')).to.eql('itemScope');
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<div itemscope="itemScope"></div>'
//			);
//		});
//
// 	it('Second render (update)', () => {
//
//			template = Inferno.createTemplate(createElement =>
//					createElement('div', { allowFullScreen: false })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//	});
//
//describe('should render "autoPlay" boolean attributes', () => {
//		let template;
//
//		it('Initial render (creation)', () => {
//
//			template = Inferno.createTemplate(createElement =>
//					createElement('div', { autoPlay: [] })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//
//			expect(container.firstChild.getAttribute('autoPlay')).to.eql('');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div autoplay=""></div>'
//			);
//		});
//
// 	it('Second render (update)', () => {
//
//			template = Inferno.createTemplate(createElement =>
//					createElement('div', { controls: false })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//	});
//
//
//
//	describe('should render boolean attributes', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//					createElement('div', { autoFocus: 'true' })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//
//			expect(container.firstChild.getAttribute('autoFocus')).to.eql('true');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div autofocus="true"></div>'
//			);
//		});
//	});
//
//	describe('should render "className" attribute', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('div', { className: 'Dominic rocks!' })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(container.firstChild.getAttribute('class')).to.eql('Dominic rocks!');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div class="Dominic rocks!"></div>'
//			);
//		});
//	});
//
//	describe('shouldn\'t render null value', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { value: null })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//
//			expect( container.value ).to.be.undefined;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input>'
//			);
//		});
//	});
//
//	describe('should set values as properties by default', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { title: 'Tip!' })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input title="Tip!">'
//			);
//		});
//	});
//
//	describe('should render value multiple attribute', () => {
//		beforeEach(() => {
//			const template = Inferno.createTemplate(createElement =>
//				createElement('select', { multiple: true, value: 'foo' },
//					createElement('option', { value: 'foo' }, 'Im a li-tag'),
//					createElement('option', { value: 'bar' }, 'Im a li-tag')
//				)
//			);
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(get(container.firstChild)).to.eql(['foo']);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<select multiple=""><option value="foo">Im a li-tag</option><option value="bar">Im a li-tag</option></select>'
//			);
//			expect(container.querySelector("select").multiple).to.equal(true);
//		});
//	});
//
//	describe('should render value multiple attribute', () => {
//    let template;
//
//    beforeEach(() => {
//        template = Inferno.createTemplate(t =>
//            t('select', {
//                    multiple: true,
//                    value: ['bar', 'dominic']
//                },
//                t('optgroup', {
//                    label: 'foo-group'
//                }, t('option', {
//                    value: 'foo'
//                }, 'Im a li-tag')),
//                t('optgroup', {
//                    label: 'bar-group'
//                }, t('option', {
//                    value: 'bar'
//                }, 'Im a li-tag')),
//                t('optgroup', {
//                    label: 'dominic-group'
//                }, t('option', {
//                    value: 'dominic'
//                }, 'Im a li-tag'))
//            )
//        );
//        Inferno.render(Inferno.createFragment(null, template), container);
//    });
//
//    it('Initial render (creation)', () => {
//        expect(
//            container.innerHTML
//        ).to.equal(
//            '<select multiple=""><optgroup label="foo-group"><option value="foo">Im a li-tag</option></optgroup><optgroup label="bar-group"><option value="bar">Im a li-tag</option></optgroup><optgroup label="dominic-group"><option value="dominic">Im a li-tag</option></optgroup></select>'
//        );
//    });
//});
//
//
//
//	describe('should render a basic example with dynamic values', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate((createElement, createComponent, val1, val2) =>
//					createElement('div', null, 'Hello world - ', val1, ' ', val2)
//			);
//			Inferno.render(Inferno.createFragment(['Inferno', 'Owns'], template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div>Hello world - Inferno Owns</div>'
//			);
//		});
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(['Test', 'Works!'], template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div>Hello world - Test Works!</div>'
//			);
//		});
//	});
//
//	describe('should render a basic example with dynamic values and props', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate((createElement, createComponent, val1, val2) =>
//				createElement('div', {className: 'foo'},
//					createElement('span', {className: 'bar'}, val1),
//					createElement('span', {className: 'yar'}, val2)
//				)
//			);
//			Inferno.render(Inferno.createFragment(['Inferno', 'Rocks'], template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
//			);
//		});
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(['Rocks', 'Inferno'], template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				`<div class="foo"><span class="bar">Rocks</span><span class="yar">Inferno</span></div>`
//			);
//		});
//	});
//
//
//
//	//// Just to prove that we don't share the same issues as React - https://github.com/facebook/react/issues/4933
//	describe('should properly render "className" property on a custom element', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('custom-elem', { className: "Hello, world!" })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<custom-elem class="Hello, world!"></custom-elem>'
//			);
//		});
//		it('Second render (update)', () => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('custom-elem', { className: "Hello, Inferno!" })
//			);
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<custom-elem class="Hello, Inferno!"></custom-elem>'
//			);
//		});
//	});
//
//
//	describe('should properly render boolean attributes (HTML5)', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { checked: true, disabled: true})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(container.querySelector("input").checked).to.equal(true);
//			expect(container.querySelector("input").disabled).to.equal(true);
//		});
//		it('Second render (update)', () => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { checked: false, disabled: false})
//			);
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//			expect(container.querySelector("input").checked).to.equal(false);
//			expect(container.querySelector("input").disabled).to.equal(false);
//		});
//	});
//
//	describe('should properly render boolean attributes (truthy)', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { checked: true, disabled: true})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input disabled="true">'
//			);
//		});
//		it('Second render (update)', () => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { checked: false, disabled: true})
//			);
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input disabled="true">'
//			);
//		});
//	});
//
//	describe('should not render overloaded boolean attributes (falsy)', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('div', { checked: false, disabled: false})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//		it('Second render (update)', () => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('span', { checked: false, disabled: false})
//			);
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<span></span>'
//			);
//		});
//	});
//
//	describe('should properly render boolean attributes (falsy)', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { checked:"false", disabled:"false"})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<input disabled="false">'
//			);
//		});
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(null, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input disabled="false">'
//			);
//		});
//	});
//
//	describe('should render video / audio attributes', () => {
//		let template;
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', {type:'file', multiple:'true', capture:'true'})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//                '<input type="file" multiple="" capture="true">'
//			);
//		});
//	});
//
//
//	describe('shouldn\'t render undefined value', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { checked: undefined})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input>'
//			);
//		});
//	});
//
//	describe('should be rendered as custom attribute', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('div', { 'custom-attr': 123})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div custom-attr="123"></div>'
//			);
//		});
//	});
//
//	describe('should not render null properties', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('web-component', { className: null, id: null})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<web-component></web-component>'
//			);
//		});
//	});
//
//	describe('should properly render "id" property', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('web-component', { id: 123 })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<web-component id="123"></web-component>'
//			);
//		});
//	});
//
//	describe('should render overloaded boolean as a number value', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { download: 0 })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input>'
//			);
//		});
//	});
//
//	describe('should render download with boolean false value', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { href:"/images/xxx.jpg", download: false} )
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input href="/images/xxx.jpg">'
//			);
//		});
//	});
//
//	describe('should render download with boolean null value', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { href: "/images/xxx.jpg", download: null})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input href="/images/xxx.jpg">'
//			);
//		});
//		it('Second render (update)', () => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', {checked:true, disabled: true})
//			);
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input disabled="true">'
//			);
//		});
//	});
//
//	describe('should render "overloaded" boolean properties', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { href:"/images/xxx.jpg", download:"true" })
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input href="/images/xxx.jpg" download="true">'
//			);
//		});
//
//
//		it('Third render (update)', () => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { checked:true, disabled:true })
//			);
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input disabled="true">'
//			);
//		});
//	});
//
//		describe('should not render overloaded "allowFullScreen" boolean attributes', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { allowFullScreen: false})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input>'
//			);
//		});
//		it('Second render (update)', () => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', {checked:true, disabled: true})
//			);
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input disabled="true">'
//			);
//		});
//	});
//
//
//
//	describe('should not render "scoped" boolean attributes as "null"', () => {
//		let template;
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('input', { scoped: null})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input>'
//			);
//		});
//	});
//
//
//	describe('should properly render "muted" boolean property', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				muted: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(false, template), container);
//
//			expect(container.firstChild.muted).to.be.false;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Second render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//			expect(container.firstChild.muted).to.be.undefined;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(container.firstChild.muted).to.be.true;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//	});
//
//	describe('should properly render "required" boolean property', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				required: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(false, template), container);
//
//			expect(container.getAttribute('required')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Second render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//			expect(container.getAttribute('required')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div required="true"></div>'
//			);
//		});
//	});
//
//
//
//	describe('should properly render "hidden" boolean property', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				hidden: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(false, template), container);
//
//			expect(container.getAttribute('hidden')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Second render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//			expect(container.getAttribute('hidden')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div hidden="true"></div>'
//			);
//		});
//	});
//
//	describe('should properly render "draggable" boolean property', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				draggable: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(false, template), container);
//
//			expect(container.getAttribute('draggable')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div draggable="false"></div>'
//			);
//		});
//
//		it('Second render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//			expect(container.getAttribute('draggable')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div draggable="true"></div>'
//			);
//		});
//	});
//
//	describe('should properly render "formNoValidate" boolean property', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				formNoValidate: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(false, template), container);
//
//			expect(container.getAttribute('formNoValidate')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Second render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//			expect(container.getAttribute('formNoValidate')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div formnovalidate="true"></div>'
//			);
//		});
//	});
//
//	describe('should properly render "seamless" boolean property', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				seamless: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(false, template), container);
//
//			expect(container.getAttribute('seamless')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Second render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//			expect(container.getAttribute('seamless')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div seamless="true"></div>'
//			);
//		});
//	});
//
//	describe('should properly render numeric properties', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				start: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(123, template), container);
//
//			expect(container.getAttribute('seamless')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div start="123"></div>'
//			);
//		});
//
//		it('Second render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(-4, template), container);
//
//			expect(container.getAttribute('seamless')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div start="-4"></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(0, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div start="0"></div>'
//			);
//		});
//	});
//
//
//	describe('should properly render "title" attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				title: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(123, template), container);
//
//			expect(container.getAttribute('seamless')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div title="123"></div>'
//			);
//		});
//
//		it('Second render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('Hello', template), container);
//
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div title="Hello"></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment([], template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//	});
//
//
//
//	describe('should properly render "contentEditable" attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				contentEditable: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(123, template), container);
//
//			expect(container.getAttribute('seamless')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div contenteditable="123"></div>'
//			);
//		});
//
//		it('Second render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('Hello', template), container);
//
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<div contenteditable="Hello"></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment([], template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//	});
//
//	describe('should populate the `value` attribute on select multiple using groups', () => {
//	   let template;
//
//	   beforeEach(() => {
//		   template = Inferno.createTemplate((createElement, createComponent, val1, val2) =>
//			   	createElement('select', {multiple: true, value: ['foo', 'bar']},
//					createElement('optgroup', {label: 'foo-group'},
//						createElement('option', {value: 'bar'}, val1)
//					),
//					createElement('optgroup', {label: 'bar-group'},
//						createElement('option', {value: 'foo'}, val2)
//					)
//				)
//			);
//		   Inferno.render(Inferno.createFragment(['bar', 'foo'], template), container);
//	   });
//
//	   it('Initial render (creation)', () => {
//		   expect(
//			   container.innerHTML
//		   ).to.equal(
//			   `<select multiple=""><optgroup label="foo-group"><option>bar</option></optgroup><optgroup label="bar-group"><option>foo</option></optgroup></select>`
//		   );
//	   });
//	   it('Second render (update)', () => {
//		   Inferno.render(Inferno.createFragment(['Rocks', 'Inferno'], template), container);
//		   expect(
//			   container.innerHTML
//		   ).to.equal(
//			   `<select multiple=""><optgroup label="foo-group"><option>Rocks</option></optgroup><optgroup label="bar-group"><option>Inferno</option></optgroup></select>`
//		   );
//	   });
//	});
//
//	///**
//	// * Styles
//	// */
//
//	describe('should handle basic styles', () => {
//	   let template;
//	   const styleRule = { width:200, height:200 };
//
//	   beforeEach(() => {
//		   template = Inferno.createTemplate(createElement =>
//			   createElement('div', { style: styleRule })
//		   );
//		   Inferno.render(Inferno.createFragment(null, template), container);
//	   });
//
//	   it('Initial render (creation)', () => {
//		   expect(
//			   container.innerHTML
//		   ).to.equal(
//			   '<div style="width: 200px; height: 200px;"></div>'
//		   );
//	   });
//	});
//
//	describe('should update styles when "style" changes from null to object', () => {
//	   let template;
//	   const styles = {color: 'red'};
//
//	   beforeEach(() => {
//		   template = Inferno.createTemplate(createElement =>
//			   createElement('div', { style: {null} })
//		   );
//		   Inferno.render(Inferno.createFragment(null, template), container);
//	   });
//
//	   it('Initial render (creation)', () => {
//		   expect(
//			   container.innerHTML
//		   ).to.equal(
//			   '<div></div>'
//		   );
//	   });
//	   it('Second render (update)', () => {
//		   template = Inferno.createTemplate(createElement =>
//			   createElement('div', { style: styles })
//		   );
//		   Inferno.render(Inferno.createFragment(null, template), container);
//		   expect(
//			   container.innerHTML
//		   ).to.equal(
//			   '<div style="color: red;"></div>'
//		   );
//	   });
//	});
//
//	describe('should ignore null styles', () => {
//	   let template;
//	   const styleRule = { backgroundColor: null, display: 'none' };
//
//	   beforeEach(() => {
//		   template = Inferno.createTemplate(createElement =>
//			   createElement('div', { style: styleRule })
//		   );
//		   Inferno.render(Inferno.createFragment(null, template), container);
//	   });
//
//	   it('Initial render (creation)', () => {
//		   expect(
//			   container.innerHTML
//		   ).to.equal(
//			   '<div style="display: none;"></div>'
//		   );
//	   });
//	});
//
//	describe('should not set NaN value on styles', () => {
//	   let template;
//	   const styleRule = { 'font-size': parseFloat('zoo') } ;
//
//	   beforeEach(() => {
//		   template = Inferno.createTemplate(createElement =>
//			   createElement('div', { style: styleRule })
//		   );
//		   Inferno.render(Inferno.createFragment(null, template), container);
//	   });
//
//	   it('Initial render (creation)', () => {
//		   expect(
//			   container.innerHTML
//		   ).to.equal(
//			   '<div></div>'
//		   );
//	   });
//	});
//
//	describe('should trim values so `px` will be appended correctly', () => {
//	   let template;
//	   const styleRule = { margin: '16 ' };
//
//	   beforeEach(() => {
//		   template = Inferno.createTemplate(createElement =>
//			   createElement('div', { style: styleRule })
//		   );
//		   Inferno.render(Inferno.createFragment(null, template), container);
//	   });
//
//	   it('Initial render (creation)', () => {
//		   expect(
//			   container.innerHTML
//		   ).to.equal(
//			   '<div style="margin: 16px;"></div>'
//		   );
//	   });
//	});
//
//	describe('should support number values', () => {
//	   let template;
//	   const styleRule = { width: 7 };
//
//	   beforeEach(() => {
//		   template = Inferno.createTemplate(createElement =>
//			   createElement('div', { style: styleRule })
//		   );
//		   Inferno.render(Inferno.createFragment(null, template), container);
//	   });
//
//	   it('Initial render (creation)', () => {
//
//		   expect(
//			   container.innerHTML
//		   ).to.equal(
//			   '<div style="width: 7px;"></div>'
//		   );
//	   });
//	});
//
//	describe('should properly render input download attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, val1) =>
//			createElement('div', {
//				download: val1
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(false, template), container);
//
//			expect(container.firstChild.getAttribute('download')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div download="true"></div>'
//			);
//		});
//	});
//
//    describe('should properly render scope attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, val1) =>
//			createElement('div', {
//				scope: val1
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('scope', template), container);
//
//			expect(container.firstChild.getAttribute('scope')).to.eql('scope');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div scope="scope"></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div scope="true"></div>'
//			);
//		});
//	});
//
//
//
//    describe('should properly render HTMLL5 data-* attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, val1) =>
//			createElement('div', {
//				data: val1
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('val', template), container);
//
//			//expect(container.firstChild.getAttribute('scope')).to.eql('scope');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div data="val"></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div data="true"></div>'
//			);
//		});
//	});
//
//    describe('should properly render value property', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, val1) =>
//			createElement('div', {
//				value: val1
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('val', template), container);
//
//			expect(container.firstChild.value).to.eql('val');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(container.firstChild.value).to.eql(true);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//	});
//
//
//describe('should set boolean element property', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				'type': 'checkbox',
//				'checked': arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(['checked'], template), container);
//
//			expect(container.firstChild.checked).to.eql('checked');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div type="checkbox"></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//
//			expect(container.firstChild.checked).to.eql(true);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div type="checkbox"></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment([''], template), container);
//
//			expect(container.firstChild.checked).to.eql(false);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div type="checkbox"></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(['lala'], template), container);
//
//			expect(container.firstChild.checked).to.eql('lala');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div type="checkbox"></div>'
//			);
//		});
//
//		it('Fourth render (update)', () => {
//			Inferno.render(Inferno.createFragment(null, template), container);
//
//			expect(container.firstChild.checked).to.be.undefined;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div type="checkbox"></div>'
//			);
//		});
//
//		it('Fifth render (update)', () => {
//			Inferno.render(Inferno.createFragment([null], template), container);
//
//			expect(container.firstChild.checked).to.be.undefined;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div type="checkbox"></div>'
//			);
//		});
//	});
//
//
//
//
//
//	describe('should support number values', () => {
//		let template;
//		const styleRule = {
//			width: 7
//		};
//
//		beforeEach(() => {
//			template = Inferno.createTemplate(createElement =>
//				createElement('div', {
//					style: styleRule
//				})
//			);
//			Inferno.render(Inferno.createFragment(null, template), container);
//		});
//
//		it('Initial render (creation)', () => {
//
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div style="width: 7px;"></div>'
//			);
//		});
//	});
//
//	describe('should properly render name attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				name: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('simple', template), container);
//
//			expect(container.firstChild.getAttribute('name')).to.eql('simple');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div name="simple"></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div name="true"></div>'
//			);
//		});
//	});
//
//
//	describe('should properly render id attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				id: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('simple', template), container);
//
//			expect(container.firstChild.getAttribute('id')).to.eql('simple');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div id="simple"></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div id="true"></div>'
//			);
//		});
//	});
//
//
//   describe('should ignore falsy values', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				class: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(undefined, template), container);
//
//			expect(container.firstChild.getAttribute('class')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(null, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(false, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div class="false"></div>'
//			);
//		});
//	});
//
//	describe('should set truthy boolean values', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				disabled: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('', template), container);
//
//			expect(container.firstChild.getAttribute('disabled')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(container.firstChild.getAttribute('disabled')).to.equal('true');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div disabled="true"></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment('true', template), container);
//            expect(container.firstChild.getAttribute('disabled')).to.equal('true');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div disabled="true"></div>'
//			);
//		});
//	});
//
//   describe('should properly render class attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				class: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('muffins', template), container);
//
//			expect(container.firstChild.getAttribute('class')).to.eql('muffins');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div class="muffins"></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div class="true"></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment([], template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Fourth render (update)', () => {
//			Inferno.render(Inferno.createFragment({}, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div class="[object Object]"></div>'
//			);
//		});
//	});
//
//
//	  describe('should properly render className attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', {
//				className: arg
//			})
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('muffins', template), container);
//
//			expect(container.firstChild.getAttribute('class')).to.eql('muffins');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div class="muffins"></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(true, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div class="true"></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment([], template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div></div>'
//			);
//		});
//
//		it('Fourth render (update)', () => {
//			Inferno.render(Inferno.createFragment({}, template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div class="[object Object]"></div>'
//			);
//		});
//	});
//
//	describe('should properly render and update a radio button attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('input', { type:'radio', checked:arg })
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(true, template), container);
//
//			expect(container.firstChild.checked).to.equal(true);
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<input type="radio">'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(false, template), container);
//			expect(container.firstChild.checked).to.equal(false);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<input type="radio">'
//			);
//		});
//	});
//
//    describe('should properly render and update a checkbox attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', { type:'checkbox', checked:arg })
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(true, template), container);
//
//			expect(container.firstChild.checked).to.equal(true);
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<div type="checkbox"></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(false, template), container);
//			expect(container.firstChild.checked).to.equal(false);
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<div type="checkbox"></div>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(null, template), container);
//			expect(container.firstChild.checked).to.equal(undefined);
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<div type="checkbox"></div>'
//			);
//		});
//
//		it('Fourth render (update)', () => {
//			Inferno.render(Inferno.createFragment(undefined, template), container);
//			expect(container.firstChild.checked).to.equal(undefined);
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<div type="checkbox"></div>'
//			);
//		});
//
//		it('Fifth render (update)', () => {
//			Inferno.render(Inferno.createFragment([], template), container);
//			expect(container.firstChild.checked).to.equal(undefined);
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<div type="checkbox"></div>'
//			);
//		});
//
//		it('Sixth render (update)', () => {
//			Inferno.render(Inferno.createFragment({}, template), container);
//			expect(container.firstChild.checked).to.eql({});
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<div type="checkbox"></div>'
//			);
//		});
//	});
//
//	describe('should properly update from checkbox to radio button', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg, arg1) =>
//			createElement('div', { type:arg, checked:arg1 })
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(['checkbox', true], template), container);
//
//			expect(container.firstChild.checked).to.equal(true);
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<div type="checkbox"></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(['radio', true], template), container);
//			expect(container.firstChild.checked).to.equal(true);
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<div type="radio"></div>'
//			);
//		});
//	});
//
//	describe('should properly update from checkbox to radio button', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg, arg1) =>
//			createElement('input', { type:arg, checked:arg1 })
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(['checkbox', true], template), container);
//
//			expect(container.firstChild.checked).to.equal(true);
//			expect(
//				container.innerHTML
//			).to.equal(
//				  '<input type="checkbox">'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(['radio', true], template), container);
//			expect(container.firstChild.checked).to.equal(true);
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<input type="radio">'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(['radio', 'checked'], template), container);
//			expect(container.firstChild.checked).to.equal(true);
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<input type="radio">'
//			);
//		});
//
//		it('Fourth render (update)', () => {
//			Inferno.render(Inferno.createFragment(['radio', ''], template), container);
//			expect(container.firstChild.checked).to.equal(false);
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<input type="radio">'
//			);
//		});
//	});
//
//	describe('should render custom attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('div', { 'custom-attr' : arg })
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment([123], template), container);
//
//			expect(container.firstChild.getAttribute('custom-attr')).to.equal('123');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<div custom-attr="123"></div>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(['test.jpg', true], template), container);
//			expect(container.firstChild.getAttribute('custom-attr')).to.equal('test.jpg');
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<div custom-attr="test.jpg"></div>'
//			);
//		});
//	});
//
//	describe('should support "size" attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('label', { 'size' : arg })
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(123, template), container);
//
//			expect(container.firstChild.getAttribute('size')).to.equal('123');
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<label size="123"></label>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(['test.jpg'], template), container);
//			expect(container.firstChild.getAttribute('size')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<label></label>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(-444, template), container);
//			expect(container.firstChild.getAttribute('size')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<label></label>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(0, template), container);
//			expect(container.firstChild.getAttribute('size')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<label></label>'
//			);
//		});
//	});
//
//	describe('should support "rowspan" attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('label', { 'rowspan' : arg })
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(123, template), container);
//
//			expect(container.firstChild.getAttribute('rowspan')).to.equal('123');
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<label rowspan="123"></label>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(['test.jpg'], template), container);
//			expect(container.firstChild.getAttribute('rowspan')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<label></label>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(-444, template), container);
//			expect(container.firstChild.getAttribute('rowspan')).to.eql('-444');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<label rowspan="-444"></label>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(0, template), container);
//			expect(container.firstChild.getAttribute('rowspan')).to.eql('0');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<label rowspan="0"></label>'
//			);
//		});
//	});
//
//describe('should support "autocorrect" attribute', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('label', { 'autocorrect' : arg })
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(123, template), container);
//
//			expect(container.firstChild.getAttribute('autocorrect')).to.equal('123');
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<label autocorrect="123"></label>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(['autocorrect'], template), container);
//			expect(container.firstChild.getAttribute('autocorrect')).to.equal('autocorrect');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<label autocorrect="autocorrect"></label>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(-444, template), container);
//			expect(container.firstChild.getAttribute('autocorrect')).to.eql('-444');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<label autocorrect="-444"></label>'
//			);
//		});
//
//		it('Third render (update)', () => {
//			Inferno.render(Inferno.createFragment(0, template), container);
//			expect(container.firstChild.getAttribute('autocorrect')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<label></label>'
//			);
//		});
//	});
//
//describe('should bail out if attribute name shorter then 2', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('label', { 'a' : arg })
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment(123, template), container);
//
//			expect(container.firstChild.getAttribute('a')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<label></label>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(['world'], template), container);
//			expect(container.firstChild.getAttribute('a')).to.be.null;
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<label></label>'
//			);
//		});
//	});
//
//	describe('should support alternative names', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg) =>
//			createElement('label', { 'for' : arg })
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('c1', template), container);
//
//			expect(container.firstChild.getAttribute('for')).to.equal('c1');
//			expect(
//				container.innerHTML
//			).to.equal(
//				 '<label for="c1"></label>'
//			);
//		});
//
//		it('Second render (update)', () => {
//			Inferno.render(Inferno.createFragment(['test.jpg', true], template), container);
//			expect(container.firstChild.getAttribute('for')).to.equal('test.jpg');
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<label for="test.jpg"></label>'
//			);
//		});
//	});
//
//     describe('should support alternative names', () => {
//		let template = Inferno.createTemplate((createElement, createComponent, arg, arg1) =>
//			createElement('button', { disabled : true })
//		);
//
//		it('Initial render (creation)', () => {
//
//			Inferno.render(Inferno.createFragment('c1', template), container);
//			expect(
//				container.innerHTML
//			).to.equal(
//				'<button disabled="true"></button>'
//			);
//		});
//	});
}

