import {  updateKeyed } from '../domMutate';
import createDOMTree from '../createTree';
import { render } from '../rendering';
import createTemplate from '../../core/createTemplate';
import TemplateFactory from '../../core/TemplateFactory';
import { addTreeConstructor } from '../../core/createTemplate';

addTreeConstructor( 'dom', createDOMTree );

const { createElement } = TemplateFactory;

describe( 'Update', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	it('should insert an additionnal tag node', () => {

		const template = createTemplate((child) => ({
			tag: 'div',

			children: child
		}));

		let span;

		span = createTemplate(() => ({
			tag: 'div',
			children: ["hello", " to"]
		}));

		render(template(span()), container);

		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.textContent).to.equal('hello to');

		render(template(span()), container);

		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.textContent).to.equal('hello to');

		span = createTemplate(() => ({
			tag: 'div'
		}));

		render(template(span()), container);

		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.textContent).to.equal('hello to');

	});


	it('should insert an additionnal tag node"', () => {

		const template = createTemplate((child) => ({
			tag: 'div',

			children: child
		}));


		const span = createTemplate(() => ({
			tag: 'div'
		}));

		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<div></div>');
		render(template(null), container);
		expect(container.firstChild.innerHTML).to.equal('');
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<div></div>');

	});


	it('should insert an additionnal tag node"', () => {

		const template = createTemplate((child) => ({
			tag: 'div',

			children: child
		}));

		const span = createTemplate(() => ({
			tag: 'div'
		}));
		render(template(null), container);
		expect(container.firstChild.innerHTML).to.equal('');
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<div></div>');
	});

	it('should insert an additionnal tag node"', () => {

		const template = createTemplate((child) => ({
			tag: 'div',

			children: child
		}));

		const span = createTemplate(() => ({
			tag: 'div'
		}));

		render(template(null), container);
		expect(container.firstChild.innerHTML).to.equal('');
		render(template(null), container);
		expect(container.firstChild.innerHTML).to.equal('');
	});

	it('should insert multiple additionnal tag node"', () => {

		const template = createTemplate((child) => ({
			tag: 'div',

			children: child
		}));
		let span;

		span = createTemplate(() => ({
			tag: 'div'
		}));

		render(template(span()), container);

		expect(container.firstChild.innerHTML).to.equal('<div></div>');

	});

	it('should render a node with dynamic values', () => {

		const template = createTemplate((val1, val2) => ({
			tag: 'div',
			children: [
				'Hello world - ',
				val1,
				' ',
				val2
			]
		}));


		render(template('Inferno', 'Owns'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world - Inferno Owns</div>'
		);
		render(template('Inferno', 'Owns'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world - Inferno Owns</div>'
		);

		render(template('Inferno', null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world - Inferno </div>'
		);

		render(template(null, 'Owns'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world -  Owns</div>'
		);

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world -  </div>'
		);

		render(template(undefined), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world -  </div>'
		);

		render(template(null, 'Owns'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world -  Owns</div>'
		);

		render(template('Test', 'Works!'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world - Test Works!</div>'
		);
	});


	it('should update a wrapped text node', () => {

		const template = createTemplate((val1, val2) => ({
			tag: 'div',
			children: [
				val1,
				' foo',
				val2
			]
		}));

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div> foo</div>'
		);

		render(template('Hello', 'Bar'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello fooBar</div>'
		);

		render(template(undefined), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div> foo</div>'
		);

		render(template('The', ' is dead!'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>The foo is dead!</div>'
		);
	});

	it('should update a wrapped text node', () => {

		const template = createTemplate((val1, val2) => ({
			tag: 'div',
			children: [
				val1,
				' foo',
				val2
			]
		}));

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div> foo</div>'
		);

		render(template(undefined), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div> foo</div>'
		);

		render(template('Hello', 'Bar'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello fooBar</div>'
		);

		render(template('Hello', null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello foo</div>'
		);

		render(template(null, 'Bar'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div> fooBar</div>'
		);

		render(template(undefined), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div> foo</div>'
		);

		render(template('The', ' is dead!'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>The foo is dead!</div>'
		);
	});

	it('should update a wrapped text node with 4 arguments', () => {
		const template = createTemplate((val1, val2, val3, val4) => ({
			tag: 'div',
			children: [
				val1,
				val2,
				val3,
				val4
			]
		}));

		render(template('Hello', ' world!', ' and ', 'Bar'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world! and Bar</div>'
		);

		render(template(null, null, null, null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div></div>'
		);

		render(template(), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div></div>'
		);

		render(template('Hello', ' world!', ' and ', 'Zoo'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world! and Zoo</div>'
		);

		expect(
			() => render(template('Hello', [], ' and ', 'Zoo'), container)
		).to.throw;

		render(template('Hello', null, ' and ', 'Zoo'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello and Zoo</div>'
		);

		expect(
			() => render(template('Hello', {}, ' and ', 'Zoo'), container)
		).to.throw;

		render(template('Hello', ' poz', ' and ', 'Zoo'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello poz and Zoo</div>'
		);

		render(template('The ', 'bar', ' is', ' is dead!'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>The bar is is dead!</div>'
		);

		render(template('Hello', ' world!', null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world!</div>'
		);
	});

	it('should update a node with static text', () => {

		const template = createTemplate((val) => ({
			tag: 'div',
			text: 'Hello, World',
			attrs: {
				id: val
			}
		}));

		render(template('Hello'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div id="Hello">Hello, World</div>'
		);

		render(template('Bar'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div id="Bar">Hello, World</div>'
		);

		render(template(), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello, World</div>'
		);

		render(template(), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello, World</div>'
		);

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello, World</div>'
		);

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello, World</div>'
		);

		render(template('foo'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div id="foo">Hello, World</div>'
		);
	});

	it('should update a node with multiple children and static text', () => {

		const template = createTemplate((val1) => ({
			tag: 'div',
			attrs: {
				id: val1
			},
			children: {
				text: 'Hello, World'
			}
		}));


		render(template('Hello'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div id="Hello">Hello, World</div>'
		);

		render(template('Hello'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div id="Hello">Hello, World</div>'
		);

		render(template(null), container); // should unset
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello, World</div>'
		);

		render(template('foo'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div id="foo">Hello, World</div>'
		);
	});

	it('should update a node with multiple children and static text', () => {

		const template = createTemplate((val1) => ({
			tag: 'div',
			attrs: {
				id: val1
			},
			children: {
				text: 'Hello, World'
			}
		}));

		render(template(null), container); // should unset
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello, World</div>'
		);

		render(template('Hello'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div id="Hello">Hello, World</div>'
		);

		render(template(undefined), container); // should unset
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello, World</div>'
		);

		render(template('foo'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div id="foo">Hello, World</div>'
		);

		render(template(), container); // should unset
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello, World</div>'
		);
	});

	it('should update a div with class attribute, and dynamic children with static text', () => {

		const template = createTemplate((child) => ({
			tag: 'div',
			attrs: {
				class: 'hello, world'
			},
			children: child
		}));


		const b = createTemplate(() => ({
			tag: 'span',
			children: ['1', '2', '3', ]
		}));

		const span = createTemplate((b) => ({
			tag: 'span',
			children: b
		}));

		render(template(null), container);

		expect(container.firstChild.nodeType).to.equal(1);
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.tagName).to.equal('DIV');

		render(template(span(b())), container);
		expect(container.firstChild.nodeType).to.equal(1);
		expect(container.firstChild.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.firstChild.childNodes.length).to.equal(3);
		expect(container.firstChild.tagName).to.equal('DIV');

		render(template(span(null)), container);

		expect(container.firstChild.nodeType).to.equal(1);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.tagName).to.equal('DIV');
	});

	it('should handle lots of dynamic variables', () => {
		const template = createTemplate(function(val1, val2, val3, val4, val5, val6) {
			return {
				tag: 'div',
				attrs: {
					className: val2,
					id: val1
				},
				children: [{
					tag: 'div',
					attrs: {
						id: val5
					},
					children: {
						tag: 'span',
						text: val6
					}
				}, {
					tag: 'div',
					attrs: {
						className: val4
					},
					children: val3
				}]

			};
		});

		render(template(), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.be.null;
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		render(template('foo1', 'bar1', 'foo2', 'bar2', 'foo3', 'bar3'), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('bar1');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('bar3');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('bar3');

		render(template('foo1', 'foo2', 'bar2', 'foo3', 'bar3'), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('foo2');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		render(template(null), container);
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.be.null;
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		render(template(undefined), container);
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.be.null;
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		render(template('yar1', 'noo1', [], 'noo2', 'yar3', 'noo3'), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('noo1');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('noo3');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('noo3');


		render(template('yar1', 'noo1', [], 'noo2', 'yar3', 123), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('noo1');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('123');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('123');

		render(template('yar1', 'noo1', 'yar2', 'noo2', 'yar3', 'noo3'), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('noo1');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('noo3');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('noo3');

		render(template('yar1', null, 'yar2', 'noo2', 'yar3', null), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.be.null;
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		render(template('yar1', null, null, 'noo2', null, null), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.be.null;
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		render(template([], null, null, [], null, null), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.be.null;
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		render(template([], [], 123, [], null, null), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.be.null;
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');
		/*
		expect(
			() => render(template([], [],  [], [], '',  []), container)
		).to.throw;*/
	});


	it('should render a basic example #7', () => {

		const div = createTemplate((child) => ({
			tag: 'div',
			children: child
		}));

		const span1 = createTemplate(() => 'Hello world!');

		render(div(span1()), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello world!</div>'
		);

		const span2 = createTemplate((child) => ({
			tag: 'span',
			children: 'Im updated!'
		}));

		render(div(span2()), container);

		const b = createTemplate((child) => ({
			tag: 'b',
			children: 'Im updated!'
		}));
		/*
		render(div(b()), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><b>Im updated!</b></div>'
		);

		render(div(span2()), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><span>Im updated!</span></div>'
		);

		render(div(), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div></div>'
		);*/
	});

	it('should patch a wrapped text node with its container', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: child
		}));

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div></div>'
		);

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div></div>'
		);

		const span = createTemplate(() => ({
			tag: 'div',
			children: 'Hello'
		}));
		render(template(span()), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><div>Hello</div></div>'
		);
	});

	it('should patch a text node into a tag node', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: child
		}));

		const span = createTemplate(function() {
			return 'Hello'
		});
		render(template(span()), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>Hello</div>'
		);
	});

	it('should patch a tag node into a text node', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: child
		}));


		const span = createTemplate(() => ({
			tag: 'span',
			children: 'Good bye!'
		}));
		render(template(span()), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><span>Good bye!</span></div>'
		);


		render(template(), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div></div>'
		);
	});

	it('should render text then update it', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: child
		}));


		const span = createTemplate(function() {
			return 'Hello'
		});
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('Hello');
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('Hello');
	});

	it('should render text then update to an array of text nodes', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: child
		}));

		const span = createTemplate(function() {
			return {
				tag: 'span',
				children: ['Hello ', 'World', '!']
			};
		});
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');

	});

	it('should render an array of text nodes then update to a single text node', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: child
		}));

		const span = createTemplate(function() {
			return {
				tag: 'span',
				children: ['Hello ', 'World', '!']
			};
		});
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');
	});

	it('should update and array of text nodes to another array of text nodes', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: child
		}));

		const span = createTemplate(function() {
			return {
				tag: 'span',
				children: ['Hello ', 'World']
			};
		});
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World</span>');
	});

	it('should update and array of text nodes to another array of text nodes #2', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: child
		}));

		const span = createTemplate(function() {
			return {
				tag: 'span',
				children: ['Hello ', 'World', '!']
			};
		});
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');
	});

	it('should update an node with static child', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: {
				tag: 'div',
				children: {
					tag: 'span',
					attrs: {
						id: child
					}
				}
			}
		}));

		render(template('id#1'), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span id="id#1"></span></div>');

		render(template('id#2'), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span id="id#2"></span></div>');
		render(template('id#3'), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span id="id#3"></span></div>');
	});

	it('should update an node with static child and dynamic custom attribute', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: {
				tag: 'div',
				children: child
			}
		}));

		const span = createTemplate(function(val) {
			return {
				tag: 'span',
				attrs: {
					custom_attr: val
				}
			};
		});
		render(template(span('id#1')), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#1"></span></div>');
		render(template(span('id#1')), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#1"></span></div>');
	});


	it('should update an node with static child and dynamic custom attribute and static text', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: {
				tag: 'div',
				children: child
			}
		}));

		const span = createTemplate(function(val) {
			return {
				tag: 'span',
				attrs: {
					custom_attr: val
				},
				child: 'Hello!!'
			};
		});
		render(template(span('id#1')), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#1"></span></div>');
		render(template(span('id#2')), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#2"></span></div>');
	});

	it('should update an node with static child and dynamic custom attribute and static text', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: {
				tag: 'div',
				children: child
			}
		}));

		const span = createTemplate(function(val) {
			return {
				tag: 'span',
				attrs: {
					custom_attr: val
				},
				child: 'Hello!!'
			};
		});

		const span2 = createTemplate(function(val) {
			return {
				tag: 'span',
				attrs: {
					caught_fire: val
				},
				children: 'Hello, world'
			};
		});

		render(template(span('id#1', span2('custom'))), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#1"></span></div>'); // WILL NOT FAIL

	});

	it('should not ignore a empty text node', () => {
		const template = createTemplate(() => ({
			tag: 'span',
			children: ''
		}));

		render(template(), container);
		expect(container.childNodes.length).to.equal(1);
		render(template(), container);
		expect(container.childNodes.length).to.equal(1);
	});

	it('should remove a text node', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: child
		}));

		render(template(['hello', 'world']), container);
		expect(container.firstChild.childNodes.length).to.equal(2);

	});

	it('should update multiple changes', () => {
		const template = createTemplate((val1, val2) => ({
			tag: 'div',
			attrs: {
				className: val1
			},
			children: val2
		}));

		render(template('hello', ['hello', 'world']), container);
		expect(container.firstChild.childNodes.length).to.equal(2);
		expect(container.firstChild.getAttribute('class')).to.equal('hello');


		render(template('good bye', ['hello']), container);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('class')).to.equal('good bye');
	});

	it('should update an node with static child and text', () => {
		const template = createTemplate(() => ({
			tag: 'div',
			children: {
				tag: 'div',
				children: 'Hello, World'
			}
		}));

		render(template(), container);
		expect(container.firstChild.innerHTML).to.equal('<div>Hello, World</div>');
		render(template(), container);
		expect(container.firstChild.innerHTML).to.equal('<div>Hello, World</div>');

		render(template(), container);
		expect(container.firstChild.innerHTML).to.equal('<div>Hello, World</div>');
	});

	it('should update an node with dynamic child', () => {
		const template = createTemplate((child) => ({
			tag: 'div',
			children: {
				tag: 'div',
				children: child
			}
		}));

		const span = createTemplate(function() {
			return {
				tag: 'span',
				children: ['Hello ', 'World']
			};
		});
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span>Hello World</span></div>');
	});

	it('should inject dynamic text various places', () => {

		const div = createTemplate((text) => ({
			tag: 'div',
			children: [
				'There is ', text, ' spoon!'
			]
		}));

		render(div('no'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>There is no spoon!</div>'
		);

		render(div('one'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>There is one spoon!</div>'
		);

		render(div(), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>There is  spoon!</div>'
		);

		render(div(null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>There is  spoon!</div>'
		);

		render(div(undefined), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div>There is  spoon!</div>'
		);
	});

	it('should render a div tag and remove styling', () => {

		let template;

		template = createTemplate((styleRule) =>
			createElement('div', {
				style: styleRule
			})
		);

		render(template({
			color: "red",
			paddingLeft: 10
		}), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div style="color: red; padding-left: 10px;"></div>'
		);

		render(template(null), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div></div>'
		);
	});

	describe('should render styling on root node, and set and remove styling on multiple children', () => {

		let template;

		template = createTemplate((styleRule) =>
			createElement('div', {
				style: {
					width: '200px'
				}
			}, createElement('div', {
				class: 'Hello, world!'
			}, createElement('div', {
				style: styleRule
			})))
		);

		it('Initial render (creation)', () => {
			render(template({
				color: "red",
				paddingTop: 10
			}), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div style="width: 200px;"><div class="Hello, world!"><div style="color: red; padding-top: 10px;"></div></div></div>'
			);
			render(template({
				color: "red",
				paddingLeft: 10
			}), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div style="width: 200px;"><div class="Hello, world!"><div style="color: red; padding-left: 10px;"></div></div></div>'
			);

		});

		it('Second render (update)', () => {
			render(template(null), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div style="width: 200px;"><div class="Hello, world!"><div></div></div></div>'
			);
		});

		it('Third render (update)', () => {
			render(template({
				color: "blue",
				marginBottom: 20
			}), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div style="width: 200px;"><div class="Hello, world!"><div style="color: blue; margin-bottom: 20px;"></div></div></div>'
			);
		});
	});

});