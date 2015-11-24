import get from '../../../tools/get';
import Inferno from '../../../../src';

export default function domElementsTestsFunctional(describe, expect, container) {


	describe('should render a basic example', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement => createElement('div', null, 'Hello world'));
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world</div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment(null, template), container);
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
			template = Inferno.createTemplate(createElement =>
					createElement('ul', null,
						createElement('li', null, 'Im a li-tag'),
						createElement('li', null, 'Im a li-tag'),
						createElement('li', null, 'Im a li-tag')
					)
			);
			Inferno.render(Inferno.createFragment(null, template), container);
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
			template = Inferno.createTemplate(createElement =>
					createElement('ul', null,
						createElement('li', null, createElement('span', null, 'Im a li-tag')),
						createElement('li', null, createElement('span', null, 'Im a li-tag')),
						createElement('li', null, createElement('span', null, 'Im a li-tag'))
					)
			);
			Inferno.render(Inferno.createFragment(null, template), container);
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

			template = Inferno.createTemplate(createElement =>
					createElement('div', { disabled: true })
			);
			Inferno.render(Inferno.createFragment(null, template), container);


			expect(container.firstChild.getAttribute('disabled')).to.eql('true');
			expect(
				container.innerHTML
			).to.equal(
				'<div disabled="true"></div>'
			);
		});
	
 	it('Second render (update)', () => {

			template = Inferno.createTemplate(createElement =>
					createElement('div', { disabled: false })
			);
			Inferno.render(Inferno.createFragment(null, template), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);
		});  
	});
	
	describe('should render "hidden" boolean attributes', () => {
		let template;

		it('Initial render (creation)', () => {

			template = Inferno.createTemplate(createElement =>
					createElement('div', { hidden: true })
			);
			Inferno.render(Inferno.createFragment(null, template), container);


			expect(container.firstChild.getAttribute('hidden')).to.eql('true');
			expect(
				container.innerHTML
			).to.equal(
				'<div hidden="true"></div>'
			);
		});
	
 	it('Second render (update)', () => {

			template = Inferno.createTemplate(createElement =>
					createElement('div', { hidden: false })
			);
			Inferno.render(Inferno.createFragment(null, template), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);
		});  

	});
	
describe('should render "required" boolean attributes', () => {
		let template;

		it('Initial render (creation)', () => {

			template = Inferno.createTemplate(createElement =>
					createElement('div', { required: 'required' })
			);
			Inferno.render(Inferno.createFragment(null, template), container);


			expect(container.firstChild.getAttribute('required')).to.eql('required');
			expect(
				container.innerHTML
			).to.equal(
				'<div required="required"></div>'
			);
		});
	
 	it('Second render (update)', () => {

			template = Inferno.createTemplate(createElement =>
					createElement('div', { hidden: 'NaN' })
			);
			Inferno.render(Inferno.createFragment(null, template), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div hidden="NaN"></div>'
			);
		});  

	});	
	
	describe('should render "itemScope" boolean attributes', () => {
		let template;

		it('Initial render (creation)', () => {

			template = Inferno.createTemplate(createElement =>
					createElement('div', { itemScope: 'itemScope' })
			);
			Inferno.render(Inferno.createFragment(null, template), container);


			expect(container.firstChild.getAttribute('itemScope')).to.eql('itemScope');
			expect(
				container.innerHTML
			).to.equal(
				 '<div itemscope="itemScope"></div>'
			);
		});
	
 	it('Second render (update)', () => {

			template = Inferno.createTemplate(createElement =>
					createElement('div', { allowFullScreen: false })
			);
			Inferno.render(Inferno.createFragment(null, template), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);
		});  

	});	

describe('should render "autoPlay" boolean attributes', () => {
		let template;

		it('Initial render (creation)', () => {

			template = Inferno.createTemplate(createElement =>
					createElement('div', { autoPlay: [] })
			);
			Inferno.render(Inferno.createFragment(null, template), container);


			expect(container.firstChild.getAttribute('autoPlay')).to.eql('');
			expect(
				container.innerHTML
			).to.equal(
				'<div autoplay=""></div>' 
			);
		});
	
 	it('Second render (update)', () => {

			template = Inferno.createTemplate(createElement =>
					createElement('div', { controls: false })
			);
			Inferno.render(Inferno.createFragment(null, template), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);
		});  

	});	
	
	
	describe('should render "height" attributes', () => {
		let template;

		it('Initial render (creation)', () => {

			template = Inferno.createTemplate(createElement =>
					createElement('div', { height: '44%' })
			);
			Inferno.render(Inferno.createFragment(null, template), container);


			expect(container.firstChild.getAttribute('height')).to.eql('44%');
			expect(
				container.innerHTML
			).to.equal(
				'<div height="44%"></div>' 
			);
		});
	
 	it('Second render (update)', () => {

			template = Inferno.createTemplate(createElement =>
					createElement('div', { contenteditable: false })
			);
			Inferno.render(Inferno.createFragment(null, template), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div contenteditable="false"></div>'
			);
		});  

	});	
	
	describe('should render boolean attributes', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
					createElement('div', { autoFocus: 'true' })
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {

			expect(container.firstChild.getAttribute('autoFocus')).to.eql('true');
			expect(
				container.innerHTML
			).to.equal(
				'<div autofocus="true"></div>'
			);
		});
	});

	describe('should render "className" attribute', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('div', { className: 'Dominic rocks!' })
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(container.firstChild.getAttribute('class')).to.eql('Dominic rocks!');
			expect(
				container.innerHTML
			).to.equal(
				'<div class="Dominic rocks!"></div>'
			);
		});
	});

	describe('shouldn\'t render null value', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { value: null })
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {

			expect( container.value ).to.be.undefined;
			expect(
				container.innerHTML
			).to.equal(
				'<input>'
			);
		});
	});

	describe('should set values as properties by default', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { title: 'Tip!' })
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
			expect(
				container.innerHTML
			).to.equal(
				'<input title="Tip!">'
			);
		});
	});

	describe('should render value multiple attribute', () => {
		beforeEach(() => {
			const template = Inferno.createTemplate(createElement =>
				createElement('select', { multiple: true, value: 'foo' },
					createElement('option', { value: 'foo' }, `I'm a li-tag`),
					createElement('option', { value: 'bar' }, `I'm a li-tag`)
				)
			);

			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(get(container.firstChild)).to.eql(['foo']);
			expect(
				container.innerHTML
			).to.equal(
				`<select multiple=""><option value="foo">I'm a li-tag</option><option value="bar">I'm a li-tag</option></select>`
			);
			expect(container.querySelector("select").multiple).to.equal(true);
		});
	});
	
	describe('should render value multiple attribute', () => {
    let template;

    beforeEach(() => {
        template = Inferno.createTemplate(t =>
            t('select', {
                    multiple: true,
                    value: ['bar', 'dominic']
                },
                t('optgroup', {
                    label: 'foo-group'
                }, t('option', {
                    value: 'foo'
                }, 'Im a li-tag')),
                t('optgroup', {
                    label: 'bar-group'
                }, t('option', {
                    value: 'bar'
                }, 'Im a li-tag')),
                t('optgroup', {
                    label: 'dominic-group'
                }, t('option', {
                    value: 'dominic'
                }, 'Im a li-tag'))
            )
        );
        Inferno.render(Inferno.createFragment(null, template), container);
    });

    it('Initial render (creation)', () => {
        expect(
            container.innerHTML
        ).to.equal(
            '<select multiple=""><optgroup label="foo-group"><option value="foo">Im a li-tag</option></optgroup><optgroup label="bar-group"><option value="bar">Im a li-tag</option></optgroup><optgroup label="dominic-group"><option value="dominic">Im a li-tag</option></optgroup></select>'
        );
    });
});
	
	

	describe('should render a basic example with dynamic values', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, val1, val2) =>
					createElement('div', null, 'Hello world - ', val1, ' ', val2)
			);
			Inferno.render(Inferno.createFragment(['Inferno', 'Owns'], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world - Inferno Owns</div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment(['Test', 'Works!'], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world - Test Works!</div>'
			);
		});
	});

	describe('should render a basic example with dynamic values and props', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, val1, val2) =>
				createElement('div', {className: 'foo'},
					createElement('span', {className: 'bar'}, val1),
					createElement('span', {className: 'yar'}, val2)
				)
			);
			Inferno.render(Inferno.createFragment(['Inferno', 'Rocks'], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment(['Rocks', 'Inferno'], template), container);
			expect(
				container.innerHTML
			).to.equal(
				`<div class="foo"><span class="bar">Rocks</span><span class="yar">Inferno</span></div>`
			);
		});
	});


	describe('should properly render "className" property', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { className: "Hello, world!" })
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<input class="Hello, world!">'
			);
		});
		// Ensure className={false} turns into string 'false' on update
		it('Second render (update)', () => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { className: false })
			);

			Inferno.render(Inferno.createFragment(null, template), container);

			expect(
				container.innerHTML
			).to.equal(
				'<input class="false">'
			);
		});
	});

	//// Just to prove that we don't share the same issues as React - https://github.com/facebook/react/issues/4933
	describe('should properly render "className" property on a custom element', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('custom-elem', { className: "Hello, world!" })
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<custom-elem class="Hello, world!"></custom-elem>'
			);
		});
		it('Second render (update)', () => {
			template = Inferno.createTemplate(createElement =>
				createElement('custom-elem', { className: "Hello, Inferno!" })
			);

			Inferno.render(Inferno.createFragment(null, template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<custom-elem class="Hello, Inferno!"></custom-elem>'
			);
		});
	});

	describe('should properly render "width" and "height" attributes', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('img', { src: "", alt: "Smiley face", height: 42, width: 42} )
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<img src="" alt="Smiley face" height="42" width="42">'
			);
		});
		it('Second render (update)', () => {
			template = Inferno.createTemplate(createElement =>
				createElement('img', { src:"", alt:"Smiley face", height: 14, width:42})
			);

			Inferno.render(Inferno.createFragment(null, template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<img src="" alt="Smiley face" height="14" width="42">'
			);
		});
	});

	describe('should properly render boolean attributes (HTML5)', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { checked: true, disabled: true})
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(container.querySelector("input").checked).to.equal(true);
			expect(container.querySelector("input").disabled).to.equal(true);
		});
		it('Second render (update)', () => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { checked: false, disabled: false})
			);

			Inferno.render(Inferno.createFragment(null, template), container);
			expect(container.querySelector("input").checked).to.equal(false);
			expect(container.querySelector("input").disabled).to.equal(false);
		});
	});

	describe('should properly render boolean attributes (truthy)', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { checked: true, disabled: true})
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<input disabled="true">'
			);
		});
		it('Second render (update)', () => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { checked: false, disabled: true})
			);

			Inferno.render(Inferno.createFragment(null, template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<input disabled="true">'
			);
		});
	});

	describe('should not render overloaded boolean attributes (falsy)', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('div', { checked: false, disabled: false})
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);
		});
		it('Second render (update)', () => {
			template = Inferno.createTemplate(createElement =>
				createElement('span', { checked: false, disabled: false})
			);

			Inferno.render(Inferno.createFragment(null, template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<span></span>'
			);
		});
	});

	describe('should properly render boolean attributes (falsy)', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { checked:"false", disabled:"false"})
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				 '<input disabled="false">' 
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment(null, template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<input disabled="false">'
			);
		});
	});

	describe('should render video / audio attributes', () => {
		let template;
		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', {type:'file', multiple:'true', capture:'true', accept:'image/*'})
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<input type="file" multiple="" capture="true" accept="image/*">'
			);
		});
	});


	describe('shouldn\'t render undefined value', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { checked: undefined})
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<input>'
			);
		});
	});

	describe('should be rendered as custom attribute', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('div', { 'custom-attr': 123})
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div custom-attr="123"></div>'
			);
		});
	});

	describe('should not render null properties', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('web-component', { className: null, id: null})
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<web-component></web-component>'
			);
		});
	});

	describe('should properly render "id" property', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('web-component', { id: 123 })
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<web-component id="123"></web-component>'
			);
		});
	});

	describe('should render overloaded boolean as a number value', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { download: 0 })
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<input>'
			);
		});
	});

	describe('should render download with boolean false value', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { href:"/images/xxx.jpg", download: false} )
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<input href="/images/xxx.jpg">'
			);
		});
	});

	describe('should render download with boolean null value', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { href: "/images/xxx.jpg", download: null})
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<input href="/images/xxx.jpg">'
			);
		});
		it('Second render (update)', () => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', {checked:true, disabled: true})
			);

			Inferno.render(Inferno.createFragment(null, template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<input disabled="true">'
			);
		});
	});

	describe('should render "overloaded" boolean properties', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { href:"/images/xxx.jpg", download:"true" })
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<input href="/images/xxx.jpg" download="true">'
			);
		});


		it('Third render (update)', () => {
			template = Inferno.createTemplate(createElement =>
				createElement('input', { checked:true, disabled:true })
			);

			Inferno.render(Inferno.createFragment(null, template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<input disabled="true">'
			);
		});
	});

	//describe('should not render overloaded "allowFullScreen" boolean attributes', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input allowFullScreen={false}></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input allowfullscreen="false">'
	//		);
	//	});
	//
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input checked="checked" disabled="disabled"></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input disabled="disabled">'
	//		);
	//	});
	//});
	//
	//describe('should render "allowFullScreen" boolean attributes', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input allowFullScreen="false"></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input isMap={true}></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//});
	//
	//describe('should not render "scoped" boolean attributes as "null"', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input scoped={null}></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//
	//	// Update to a property
	//	it('Second render (update)', () => {
	//		template = Inferno.createTemplate(t =>
	//			<input noValidate={ true }></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//});
	//
	//// "muted" is a property
	//describe('should not render "muted" boolean attributes (falsy)', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input muted={false}></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//		expect(container.firstChild.muted).to.be.false;
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//
	//	it('Second render (update)', () => {
	//
	//		let dataS = { foo: 'bar', bar: 'oops' };
	//
	//		template = Inferno.createTemplate(t =>
	//			<input dataset={dataS}></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input data-foo="bar" data-bar="oops">'
	//		);
	//	});
	//});
	//
	//// "muted" is a property
	//describe('should not render "muted" boolean attributes (truthy)', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input muted={true}></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//		expect(container.firstChild.muted).to.be.true;
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input disabled={true}></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input disabled="true">'
	//		);
	//	});
	//});
	//
	//
	//describe('should render "required" boolean attribute (truthy)', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input required={true}></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input required="">'
	//		);
	//	});
	//
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input disabled={true}></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input disabled="true">'
	//		);
	//	});
	//});
	//
	//// 'required' is a property and should not be set if a falsy value
	//describe('should render "required" boolean attribute (falsy)', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input required={false}></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input disabled={true}></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input disabled="true">'
	//		);
	//	});
	//});
	//
	//
	//describe('should render "hidden" boolean attribute (truthy)', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input hidden={true}></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input hidden="true">'
	//		);
	//	});
	//
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input hidden="false"></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//});
	//
	//describe('should render "hidden" boolean attribute (falsy)', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input hidden={false}></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input hidden="false">'
	//		);
	//	});
	//
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input hidden="false"></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//});
	//
	//describe('should render "draggable" boolean attribute (truthy)', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input draggable="true"></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input draggable="">'
	//		);
	//	});
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input hidden="false"></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//});
	//
	//describe('should not render "hidden" boolean attributes if "null"', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input hidden={null}></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input hidden="false"></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//});
	//
	//describe('should not render "formNoValidate" boolean attributes if "null"', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input formNoValidate={null}></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input hidden="false"></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//});
	//
	//describe('should render `formNoValidate` boolean attribute (thruty)', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input formNoValidate={ true }></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input formnovalidate="true">'
	//		);
	//	});
	//
	//	// Update to a property
	//	it('Second render (update)', () => {
	//		template = Inferno.createTemplate(t =>
	//			<input noValidate={true}></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//});
	//
	//
	//describe('should not render "seamless" boolean attributes if "null"', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<span seamless={null}></span>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<span></span>'
	//		);
	//	});
	//
	//	// Update to a property
	//	it('Second render (update)', () => {
	//		template = Inferno.createTemplate(t =>
	//			<span noValidate={ true }></span>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<span></span>'
	//		);
	//	});
	//});
	//
	//describe('should render "seamless" boolean attribute (thruty)', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input seamless={ true }></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		// this is a property
	//
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input seamless="true">'
	//		);
	//	});
	//
	//	// Update to a property
	//	it('Second render (update)', () => {
	//		template = Inferno.createTemplate(t =>
	//			<input type='checkbox' required={ true }></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input type="checkbox" required="">'
	//		);
	//	});
	//});
	//
	//describe('should properly render "className" property', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input className="Hello, world!"></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input class="Hello, world!">'
	//		);
	//	});
	//
	//	// Update to a property
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input type='checkbox' disabled={ true }></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input type="checkbox" disabled="true">'
	//		);
	//	});
	//});
	//
	//describe('should properly render numeric properties', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input start="5"></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input start="5">'
	//		);
	//	});
	//
	//	// Update to a property
	//	it('Second render (update)', () => {
	//
	//		template = Inferno.createTemplate(t =>
	//			<input spellCheck={ true }></input>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input>'
	//		);
	//	});
	//});
	//
	//describe('should properly render "disabled" boolean property', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input type='checkbox' disabled={true}></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input type="checkbox" disabled="true">'
	//		);
	//	});
	//
	//});
	//
	//describe('should not render overloaded falsy boolean properties', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input disabled={false} type='checkbox'></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input disabled="false" type="checkbox">'
	//		);
	//	});
	//});
	//
	//describe('should not render overloaded falsy boolean properties', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input disabled="false" type='checkbox'></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input type="checkbox">'
	//		);
	//	});
	//});
	//
	//describe('should render disabled boolean property as "disabled"', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<input type='checkbox' disabled='disabled'></input>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<input type="checkbox" disabled="disabled">'
	//		);
	//	});
	//});
	//
	//describe('should properly handle custom properties on web components', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<div dominic="cool"></div>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div dominic="cool"></div>'
	//		);
	//	});
	//});
	//
	//describe('should properly handle "aria-label" attribute', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<div aria-label="false"></div>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div aria-label="false"></div>'
	//		);
	//	});
	//});
	//
	//describe('should properly handle custom properties', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<div awesomeness="5"></div>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div awesomeness="5"></div>'
	//		);
	//	});
	//});
	//
	//describe('should properly handle the "title" attribute', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<div title="Inferno"></div>
	//		);
	//
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div title="Inferno"></div>'
	//		);
	//	});
	//});
	//
	//describe('should properly set className to empty string instead of null', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<div className=""></div>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div class=""></div>'
	//		);
	//	});
	//});
	//
	//describe('should not set "contentEditable" as a null value', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<div contentEditable={null}></div>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div></div>'
	//		);
	//	});
	//});
	//
	//describe('should set "contentEditable" property', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<div contentEditable={true}></div>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div contenteditable="true"></div>'
	//		);
	//	});
	//});
	//describe('should set "contentEditable" property', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<div contentEditable={false}></div>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div contenteditable="false"></div>'
	//		);
	//	});
	//});
	//
	//describe('should not set "contentEditable" property as a null value', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<div contentEditable="contentEditable"></div>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div></div>'
	//		);
	//	});
	//});
	//
	//describe('should handle selectedIndex', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<select selectedIndex="-1"><option>a2</option><option>a3</option></select>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<select><option>a2</option><option>a3</option></select>'
	//		);
	//	});
	//});
	//
	//describe('should handle selectedIndex', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<select><option>AM</option><option>PM</option></select>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(get(container.firstChild)).to.eql('AM');
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<select><option>AM</option><option>PM</option></select>'
	//		);
	//	});
	//});
	//
	//describe('should populate the value attribute on select', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate(t =>
	//			<select multiple={true} value="bar">
	//				<option value="foo">foo</option>
	//				<option value="bar">bar</option>
	//			</select>
	//		);
	//		Inferno.render(Inferno.createFragment(null, template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(get(container.firstChild)).to.eql(['bar']);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<select multiple=""><option>foo</option><option>bar</option></select>'
	//		);
	//	});
	//});
	//
	//describe('should populate the `value` attribute on select multiple', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate((t, val1, val2) =>
	//			<select multiple='mutiple' value={['foo', 'bar']}>
	//				<option value='bar'>{ val1 }</option>
	//				<option value='foo'>{ val2 }</option>
	//			</select>
	//		);
	//		Inferno.render(Inferno.createFragment(['bar', 'foo'], template), container);
	//	});
	//
	//	it('Initial render (creation)', () => {
	//		expect(container.firstChild.options[1].selected).to.be.true;
	//		expect(get(container.firstChild).sort()).to.eql(['bar', 'foo']);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			`<select multiple=""><option>bar</option><option>foo</option></select>`
	//		);
	//	});
	//
	//	it('Second render (update)', () => {
	//		Inferno.render(Inferno.createFragment(['Rocks', 'Inferno'], template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			`<select multiple=""><option>Rocks</option><option>Inferno</option></select>`
	//		);
	//	});
	//});
	//
	describe('should populate the `value` attribute on select multiple using groups', () => {
	   let template;

	   beforeEach(() => {
		   template = Inferno.createTemplate((createElement, createComponent, val1, val2) =>
			   	createElement('select', {multiple: true, value: ['foo', 'bar']},
					createElement('optgroup', {label: 'foo-group'},
						createElement('option', {value: 'bar'}, val1)
					),
					createElement('optgroup', {label: 'bar-group'},
						createElement('option', {value: 'foo'}, val2)
					)
				)
			);
		   Inferno.render(Inferno.createFragment(['bar', 'foo'], template), container);
	   });

	   it('Initial render (creation)', () => {
		   expect(
			   container.innerHTML
		   ).to.equal(
			   `<select multiple=""><optgroup label="foo-group"><option>bar</option></optgroup><optgroup label="bar-group"><option>foo</option></optgroup></select>`
		   );
	   });
	   it('Second render (update)', () => {
		   Inferno.render(Inferno.createFragment(['Rocks', 'Inferno'], template), container);
		   expect(
			   container.innerHTML
		   ).to.equal(
			   `<select multiple=""><optgroup label="foo-group"><option>Rocks</option></optgroup><optgroup label="bar-group"><option>Inferno</option></optgroup></select>`
		   );
	   });
	});

	///**
	// * Styles
	// */

	describe('should handle basic styles', () => {
	   let template;
	   const styleRule = { width:200, height:200 };

	   beforeEach(() => {
		   template = Inferno.createTemplate(createElement =>
			   createElement('div', { style: styleRule })
		   );
		   Inferno.render(Inferno.createFragment(null, template), container);
	   });

	   it('Initial render (creation)', () => {
		   expect(
			   container.innerHTML
		   ).to.equal(
			   '<div style="width: 200px; height: 200px;"></div>'
		   );
	   });
	});

	describe('should update styles when "style" changes from null to object', () => {
	   let template;
	   const styles = {color: 'red'};

	   beforeEach(() => {
		   template = Inferno.createTemplate(createElement =>
			   createElement('div', { style: {null} })
		   );
		   Inferno.render(Inferno.createFragment(null, template), container);
	   });

	   it('Initial render (creation)', () => {
		   expect(
			   container.innerHTML
		   ).to.equal(
			   '<div></div>'
		   );
	   });
	   it('Second render (update)', () => {
		   template = Inferno.createTemplate(createElement =>
			   createElement('div', { style: styles })
		   );
		   Inferno.render(Inferno.createFragment(null, template), container);
		   expect(
			   container.innerHTML
		   ).to.equal(
			   '<div style="color: red;"></div>'
		   );
	   });
	});

	describe('should ignore null styles', () => {
	   let template;
	   const styleRule = { backgroundColor: null, display: 'none' };

	   beforeEach(() => {
		   template = Inferno.createTemplate(createElement =>
			   createElement('div', { style: styleRule })
		   );
		   Inferno.render(Inferno.createFragment(null, template), container);
	   });

	   it('Initial render (creation)', () => {
		   expect(
			   container.innerHTML
		   ).to.equal(
			   '<div style="display: none;"></div>'
		   );
	   });
	});

	describe('should not set NaN value on styles', () => {
	   let template;
	   const styleRule = { 'font-size': parseFloat('zoo') } ;

	   beforeEach(() => {
		   template = Inferno.createTemplate(createElement =>
			   createElement('div', { style: styleRule })
		   );
		   Inferno.render(Inferno.createFragment(null, template), container);
	   });

	   it('Initial render (creation)', () => {
		   expect(
			   container.innerHTML
		   ).to.equal(
			   '<div></div>'
		   );
	   });
	});

	describe('should trim values so `px` will be appended correctly', () => {
	   let template;
	   const styleRule = { margin: '16 ' };

	   beforeEach(() => {
		   template = Inferno.createTemplate(createElement =>
			   createElement('div', { style: styleRule })
		   );
		   Inferno.render(Inferno.createFragment(null, template), container);
	   });

	   it('Initial render (creation)', () => {
		   expect(
			   container.innerHTML
		   ).to.equal(
			   '<div style="margin: 16px;"></div>'
		   );
	   });
	});

	describe('should support number values', () => {
	   let template;
	   const styleRule = { width: 7 };

	   beforeEach(() => {
		   template = Inferno.createTemplate(createElement =>
			   createElement('div', { style: styleRule })
		   );
		   Inferno.render(Inferno.createFragment(null, template), container);
	   });

	   it('Initial render (creation)', () => {

		   expect(
			   container.innerHTML
		   ).to.equal(
			   '<div style="width: 7px;"></div>'
		   );
	   });
	});
	
	describe('should properly render input download attribute', () => {
		let template = Inferno.createTemplate((createElement, createComponent, val1) =>
			createElement('div', {
				download: val1
			})
		);

		it('Initial render (creation)', () => {

			Inferno.render(Inferno.createFragment(false, template), container);

			expect(container.firstChild.getAttribute('download')).to.be.null;
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);
		});

		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment(true, template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div download="true"></div>'
			);
		});
	});


	describe('should support number values', () => {
		let template;
		const styleRule = {
			width: 7
		};

		beforeEach(() => {
			template = Inferno.createTemplate(createElement =>
				createElement('div', {
					style: styleRule
				})
			);
			Inferno.render(Inferno.createFragment(null, template), container);
		});

		it('Initial render (creation)', () => {

			expect(
				container.innerHTML
			).to.equal(
				'<div style="width: 7px;"></div>'
			);
		});
	});
}

