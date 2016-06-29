import { render } from './../rendering';
import createElement from './../../core/createElement';
import innerHTML from './../../../tools/innerHTML';

describe('Update (non-jsx)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	it('should insert an additionnal tag node', () => {
		const template = (child) => ({
			tag: 'div',
			children: child
		});

		let span;

		span = () => ({
			tag: 'div',
			children: [ 'hello', ' to' ]
		});

		render(template(span()), container);

		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.textContent).to.equal('hello to');

		render(template(span()), container);

		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.textContent).to.equal('hello to');

		span = () => ({
			tag: 'div'
		});

		render(template(span()), container);

		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.textContent).to.equal('');

	});

	it('should insert an additional tag node', () => {

		const template = (child) => ({
			tag: 'div',

			children: child
		});

		const span = () => ({
			tag: 'div'
		});

		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<div></div>');
		render(template(null), container);
		expect(container.firstChild.innerHTML).to.equal('');
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<div></div>');

	});

	it('should insert an additional tag node', () => {
		const template = (child) => ({
			tag: 'div',

			children: child
		});

		const span = () => ({
			tag: 'div'
		});
		render(template(null), container);
		expect(container.firstChild.innerHTML).to.equal('');
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<div></div>');
	});

	it('should insert an additional tag node', () => {
		const template = (child) => ({
			tag: 'div',

			children: child
		});

		const span = () => ({
			tag: 'div'
		});

		render(template(null), container);
		expect(container.firstChild.innerHTML).to.equal('');
		render(template(null), container);
		expect(container.firstChild.innerHTML).to.equal('');
	});

	it('should insert multiple additional tag node', () => {
		const template = (child) => ({
			tag: 'div',

			children: child
		});
		let span;

		span = () => ({
			tag: 'div'
		});

		render(template(span()), container);

		expect(container.firstChild.innerHTML).to.equal('<div></div>');
	});

	it('should render a node with dynamic values', () => {
		const template = (val1, val2) => ({
			tag: 'div',
			children: [
				'Hello world - ',
				val1,
				' ',
				val2
			]
		});

		render(template('Inferno', 'Owns'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world - Inferno Owns</div>')
		);
		render(template('Inferno', 'Owns'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world - Inferno Owns</div>')
		);

		render(template('Inferno', null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world - Inferno </div>')
		);

		render(template(null, 'Owns'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world -  Owns</div>')
		);

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world -  </div>')
		);

		render(template(undefined), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world -  </div>')
		);

		render(template(null, 'Owns'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world -  Owns</div>')
		);

		render(template('Test', 'Works!'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world - Test Works!</div>')
		);
	});

	it('should update a wrapped text node', () => {
		const template = (val1, val2) => ({
			tag: 'div',
			children: [
				val1,
				' foo',
				val2
			]
		});

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div> foo</div>')
		);

		render(template('Hello', 'Bar'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello fooBar</div>')
		);

		render(template(undefined), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div> foo</div>')
		);

		render(template('The', ' is dead!'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>The foo is dead!</div>')
		);
	});

	it('should update a wrapped text node', () => {

		const template = (val1, val2) => ({
			tag: 'div',
			children: [
				val1,
				' foo',
				val2
			]
		});

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div> foo</div>')
		);

		render(template(undefined), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div> foo</div>')
		);

		render(template('Hello', 'Bar'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello fooBar</div>')
		);

		render(template('Hello', null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello foo</div>')
		);

		render(template(null, 'Bar'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div> fooBar</div>')
		);

		render(template(undefined), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div> foo</div>')
		);

		render(template('The', ' is dead!'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>The foo is dead!</div>')
		);
	});

	it('should update a wrapped text node with 4 arguments', () => {
		const template = (val1, val2, val3, val4) => ({
			tag: 'div',
			children: [
				val1,
				val2,
				val3,
				val4
			]
		});

		render(template('Hello', ' world!', ' and ', 'Bar'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world! and Bar</div>')
		);

		render(template(null, null, null, null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div></div>')
		);

		render(template(), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div></div>')
		);

		render(template('Hello', ' world!', ' and ', 'Zoo'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world! and Zoo</div>')
		);

		expect(
			() => render(template('Hello', [], ' and ', 'Zoo'), container)
		).to.throw;

		render(template('Hello', null, ' and ', 'Zoo'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello and Zoo</div>')
		);

		expect(
			() => render(template('Hello', {}, ' and ', 'Zoo'), container)
		).to.throw;

		render(template('Hello', ' poz', ' and ', 'Zoo'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello poz and Zoo</div>')
		);

		render(template('The ', 'bar', ' is', ' is dead!'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>The bar is is dead!</div>')
		);

		render(template('Hello', ' world!', null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world!</div>')
		);
	});

	it('should update a node with static text', () => {

		const template = (val) => ({
			tag: 'div',
			children: 'Hello, World',
			attrs: {
				id: val
			}
		});

		render(template('Hello'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div id="Hello">Hello, World</div>')
		);

		render(template('Bar'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div id="Bar">Hello, World</div>')
		);

		render(template(), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello, World</div>')
		);

		render(template(), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello, World</div>')
		);

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello, World</div>')
		);

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello, World</div>')
		);

		render(template('foo'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div id="foo">Hello, World</div>')
		);
	});

	it('should update a node with multiple children and static text', () => {

		const template = (val1) => ({
			tag: 'div',
			attrs: {
				id: val1
			},
			children: 'Hello, World'
		});

		render(template('Hello'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div id="Hello">Hello, World</div>')
		);

		render(template('Hello'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div id="Hello">Hello, World</div>')
		);

		render(template(null), container); // should unset
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello, World</div>')
		);

		render(template('foo'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div id="foo">Hello, World</div>')
		);
	});

	it('should update a node with multiple children and static text', () => {
		const template = (val1) => ({
			tag: 'div',
			attrs: {
				id: val1
			},
			children: 'Hello, World'
		});

		render(template(null), container); // should unset
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello, World</div>')
		);

		render(template('Hello'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div id="Hello">Hello, World</div>')
		);

		render(template(undefined), container); // should unset
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello, World</div>')
		);

		render(template('foo'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div id="foo">Hello, World</div>')
		);

		render(template(), container); // should unset
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello, World</div>')
		);
	});

	it('should update a div with class attribute, and dynamic children with static text', () => {

		const template = (child) => ({
			tag: 'div',
			attrs: {
				class: 'hello, world'
			},
			children: child
		});

		const b = () => ({
			tag: 'span',
			children: [ '1', '2', '3' ]
		});

		const span = (b) => ({
			tag: 'span',
			children: b
		});

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
		const template = function (val1, val2, val3, val4, val5, val6) {
			return {
				tag: 'div',
				className: val2,
				attrs: {
					id: val1
				},
				children: [{
					tag: 'div',
					attrs: {
						id: val5
					},
					children: {
						tag: 'span',
						children: val6
					}
				}, {
					tag: 'div',
					className: val4,
					children: val3
				}]

			};
		};

		render(template(), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal(null);
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
		expect(container.firstChild.getAttribute('class')).to.equal(null);
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		render(template(undefined), container);
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal(null);
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
		expect(container.firstChild.getAttribute('class')).to.equal(null);
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		render(template('yar1', null, null, 'noo2', null, null), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal(null);
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		render(template([], null, null, [], null, null), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal(null);
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		render(template([], [], 123, [], null, null), container);

		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.textContent).to.equal('');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('');

		expect(
			() => render(template([], [], [], [], '', []), container)
		).to.throw;
	});

	it('should render a basic example #7', () => {

		const div = (child) => ({
			tag: 'div',
			children: child
		});

		const span1 = () => 'Hello world!';

		render(div(span1()), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello world!</div>')
		);

		const span2 = (child) => ({
			tag: 'span',
			children: 'Im updated!'
		});

		render(div(span2()), container);

		const b = (child) => ({
			tag: 'b',
			children: 'Im updated!'
		});

		/*
		render(div(b()), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><b>Im updated!</b></div>')
		);

		render(div(span2()), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><span>Im updated!</span></div>')
		);

		render(div(), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div></div>')
		);*/
	});

	it('should patch a wrapped text node with its container', () => {
		const template = (child) => ({
			tag: 'div',
			children: child
		});

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div></div>')
		);

		render(template(null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div></div>')
		);

		const span = () => ({
			tag: 'div',
			children: 'Hello'
		});
		render(template(span()), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div>Hello</div></div>')
		);
	});

	it('should patch a text node into a tag node', () => {
		const template = (child) => ({
			tag: 'div',
			children: child
		});

		const span = function () {
			return 'Hello';
		};
		render(template(span()), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>Hello</div>')
		);
	});

	it('should patch a tag node into a text node', () => {
		const template = (child) => ({
			tag: 'div',
			children: child
		});

		const span = () => ({
			tag: 'span',
			children: 'Good bye!'
		});
		render(template(span()), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><span>Good bye!</span></div>')
		);

		render(template(), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div></div>')
		);
	});

	it('should render text then update it', () => {
		const template = (child) => ({
			tag: 'div',
			children: child
		});

		const span = function () {
			return 'Hello';
		};
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('Hello');
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('Hello');
	});

	it('should render text then update to an array of text nodes', () => {
		const template = (child) => ({
			tag: 'div',
			children: child
		});

		const span = function () {
			return {
				tag: 'span',
				children: [ 'Hello ', 'World', '!' ]
			};
		};
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');

	});

	it('should render an array of text nodes then update to a single text node', () => {
		const template = (child) => ({
			tag: 'div',
			children: child
		});

		const span = function () {
			return {
				tag: 'span',
				children: [ 'Hello ', 'World', '!' ]
			};
		};
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');
	});

	it('should update and array of text nodes to another array of text nodes', () => {
		const template = (child) => ({
			tag: 'div',
			children: child
		});

		const span = function () {
			return {
				tag: 'span',
				children: [ 'Hello ', 'World' ]
			};
		};
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World</span>');
	});

	it('should update and array of text nodes to another array of text nodes #2', () => {
		const template = (child) => ({
			tag: 'div',
			children: child
		});

		const span = function () {
			return {
				tag: 'span',
				children: [ 'Hello ', 'World', '!' ]
			};
		};
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<span>Hello World!</span>');
	});

	it('should update an node with static child', () => {
		const template = (child) => ({
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
		});

		render(template('id#1'), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span id="id#1"></span></div>');

		render(template('id#2'), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span id="id#2"></span></div>');
		render(template('id#3'), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span id="id#3"></span></div>');
	});

	it('should update an node with static child and dynamic custom attribute', () => {
		const template = (child) => ({
			tag: 'div',
			children: {
				tag: 'div',
				children: child
			}
		});

		const span = function (val) {
			return {
				tag: 'span',
				attrs: {
					custom_attr: val
				}
			};
		};
		render(template(span('id#1')), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#1"></span></div>');
		render(template(span('id#1')), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#1"></span></div>');
	});

	it('should update an node with static child and dynamic custom attribute and static text', () => {
		const template = (child) => ({
			tag: 'div',
			children: {
				tag: 'div',
				children: child
			}
		});

		const span = function (val) {
			return {
				tag: 'span',
				attrs: {
					custom_attr: val
				},
				child: 'Hello!!'
			};
		};
		render(template(span('id#1')), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#1"></span></div>');
		render(template(span('id#2')), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#2"></span></div>');
	});

	it('should update an node with static child and dynamic custom attribute and static text', () => {
		const template = (child) => ({
			tag: 'div',
			children: {
				tag: 'div',
				children: child
			}
		});

		const span = function (val) {
			return {
				tag: 'span',
				attrs: {
					custom_attr: val
				},
				child: 'Hello!!'
			};
		};

		const span2 = function (val) {
			return {
				tag: 'span',
				attrs: {
					caught_fire: val
				},
				children: 'Hello, world'
			};
		};

		render(template(span('id#1', span2('custom'))), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span custom_attr="id#1"></span></div>'); // WILL NOT FAIL

	});

	it('should not ignore a empty text node', () => {
		const template = () => ({
			tag: 'span',
			children: ''
		});

		render(template(), container);
		expect(container.childNodes.length).to.equal(1);
		render(template(), container);
		expect(container.childNodes.length).to.equal(1);
	});

	it('should remove a text node', () => {
		const template = (child) => ({
			tag: 'div',
			children: child
		});

		render(template([ 'hello', 'world' ]), container);
		expect(container.firstChild.childNodes.length).to.equal(2);

	});

	it('should update multiple changes', () => {
		const template = (val1, val2) => ({
			tag: 'div',
			className: val1,
			children: val2
		});

		render(template('hello', [ 'hello', 'world' ]), container);
		expect(container.firstChild.childNodes.length).to.equal(2);
		expect(container.firstChild.getAttribute('class')).to.equal('hello');

		render(template('good bye', ['hello']), container);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('class')).to.equal('good bye');
	});

	it('should update an node with static child and text', () => {
		const template = () => ({
			tag: 'div',
			children: {
				tag: 'div',
				children: 'Hello, World'
			}
		});

		render(template(), container);
		expect(container.firstChild.innerHTML).to.equal('<div>Hello, World</div>');
		render(template(), container);
		expect(container.firstChild.innerHTML).to.equal('<div>Hello, World</div>');

		render(template(), container);
		expect(container.firstChild.innerHTML).to.equal('<div>Hello, World</div>');
	});

	it('should update an node with dynamic child', () => {
		const template = (child) => ({
			tag: 'div',
			children: {
				tag: 'div',
				children: child
			}
		});

		const span = function () {
			return {
				tag: 'span',
				children: [ 'Hello ', 'World' ]
			};
		};
		render(template(span()), container);
		expect(container.firstChild.innerHTML).to.equal('<div><span>Hello World</span></div>');
	});

	it('should inject dynamic text various places', () => {

		const div = (text) => ({
			tag: 'div',
			children: [
				'There is ', text, ' spoon!'
			]
		});

		render(div('no'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>There is no spoon!</div>')
		);

		render(div('one'), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>There is one spoon!</div>')
		);

		render(div(), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>There is  spoon!</div>')
		);

		render(div(null), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>There is  spoon!</div>')
		);

		render(div(undefined), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div>There is  spoon!</div>')
		);
	});

	it('should render a div tag and remove styling', () => {
		let template;

		template = (styleRule) =>
			createElement('div', {
				style: styleRule
			});

		render(template({
			color: 'red',
			paddingLeft: '10px'
		}), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div style="color: red; padding-left: 10px;"></div>')
		);

		render(template(null), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div></div>')
		);
	});

	if (typeof global !== 'undefined' && !global.usingJSDOM) {
		describe('should render styling on root node, and set and remove styling on multiple children', () => {
			let template;

			template = (styleRule) =>
				createElement('div', {
					style: {
						width: '200px'
					}
				}, createElement('div', {
					class: 'Hello, world!'
				}, createElement('div', {
					style: styleRule
				})));

			it('Initial render (creation)', () => {
				render(template({
					color: 'red',
					paddingTop: '10px'
				}), container);

				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div style="width: 200px;"><div class="Hello, world!"><div style="color: red; padding-top: 10px;"></div></div></div>')
				);
				render(template({
					color: 'red',
					paddingLeft: '10px'
				}), container);

				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div style="width: 200px;"><div class="Hello, world!"><div style="color: red; padding-left: 10px;"></div></div></div>')
				);

			});

			it('Second render (update)', () => {
				render(template(null), container);

				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div style="width: 200px;"><div class="Hello, world!"><div></div></div></div>')
				);
			});

			it('Third render (update)', () => {
				render(template({
					color: 'blue',
					marginBottom: '20px'
				}), container);

				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div style="width: 200px;"><div class="Hello, world!"><div style="color: blue; margin-bottom: 20px;"></div></div></div>')
				);
			});
		});
	}

	describe('Github #142', () => {
		describe('nonKeyed updates', () => {
			it('variation-1', () => {
				function A() {
					return {
						"tag": "div",
						"children": {
							"tag": "div",
							"children": {
								"tag": "table",
								"children": [
									{
										"tag": "tr",
										"children": [
											{
												"tag": "td",
												"children": "Text"
											}

										],
										"dom": null
									}
								]
							}
						},
						"dom": null
					}
				}

				function B() {
					return {
						"tag": "div",
						"children": {
							"tag": "div",
							"children": {
								"tag": "table",
								"children": [
									{
										"tag": "tr",
										"children": [
											{
												"tag": "td",
												"children": [
													"bar"
												]
											}
										],
										"dom": null
									}
								]
							}
						},
						"dom": null
					}
				}

				function C() {
					return {
						"tag": "div",
						"children": {
							"tag": "div",
							"children": {
								"tag": "table",
								"children": [
									{
										"tag": "tr",
										"children": [
											{
												"tag": "td",
												"children": [
													"text1"
												]
											}
										],
										"dom": null
									}
								]
							}
						},
						"dom": null
					}
				}

				render(A(), container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>Text</td></tr></table></div></div>');
				render(B(), container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>bar</td></tr></table></div></div>');
				render(C(), container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text1</td></tr></table></div></div>');
			});

			it('variation -2', () => {
				const A={
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"children": [
										{
											"tag": "td",
											"children": [
												"text",
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};
				const B = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"children": [
										{
											"tag": "td",
											"children": [
												[
													"text"
												]
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};
				const C={
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"children": [
										{
											"tag": "td",
											"children": [
												[
													"value"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				render(A, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text<br></td></tr></table></div></div>');
				render(B, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text</td></tr></table></div></div>');
				render(C, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>value<br></td></tr></table></div></div>');
			});

			it('variation 3', () => {
				const A = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table"
						}
					},
					"dom": null
				};
				const B = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"dom": null
								},
								{
									"tag": "tr",
									"children": [

										{
											"tag": "td",
											"children": [
												[
													"A"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										},
										{
											"tag": "td",
											"children": [
												[
													"B"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								},
								{
									"tag": "tr",
									"dom": null
								}
							]
						}
					},
					"dom": null
				};
				const C = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"dom": null
								},
								{
									"tag": "tr",
									"children": [
										{
											"tag": "td",
											"children": [
												"",
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				render(A, container);
				expect(container.innerHTML).to.equal('<div><div><table></table></div></div>');
				render(B, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr></tr><tr><td>A<br></td><td>B<br></td></tr><tr></tr></table></div></div>');
				render(C, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr></tr><tr><td><br></td></tr></table></div></div>');
			});

			it('variation 4', () => {
				const A = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"children": [
										{
											"tag": "td",
											"children": [
												[
													"text 1"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				const B = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"children": [
										{
											"tag": "td",
											"children": [
												"",
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				const C = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"children": [
										{
											"tag": "td",
											"children": [
												[
													"text 2"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				render(A, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text 1<br></td></tr></table></div></div>');
				render(B, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td><br></td></tr></table></div></div>');
				render(C, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text 2<br></td></tr></table></div></div>');
			});

			it('variation 5', () => {
				const A = [];
				A[0] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"children": [
								{
									"tag": "td",
									"children": [
										"",
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[1] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"children": [
								{
									"tag": "td",
									"children": [
										[
											"text 1",
											"text a"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[2] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"children": [
								{
									"tag": "td",
									"children": [
										[
											"text 2"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[3] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"children": [
								{
									"tag": "td",
									"children": [
										[
											{
												"tag": "br"
											},
											"text 3"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				render(A[0], container);
				expect(container.innerHTML).to.equal('<table><tr><td><br></td></tr></table>');
				render(A[1], container);
				expect(container.innerHTML).to.equal('<table><tr><td>text 1text a<br></td></tr></table>');
				render(A[2], container);
				expect(container.innerHTML).to.equal('<table><tr><td>text 2<br></td></tr></table>');
				render(A[3], container);
				expect(container.innerHTML).to.equal('<table><tr><td><br>text 3<br></td></tr></table>');
			});

			it('variation 6', () => {
				const A = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"children": [
										{
											"tag": "td",
											"children": [
												[
													"text 1"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				const B = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"children": [
										{
											"tag": "td",
											"children": [
												"",
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				const C = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"children": [
										{
											"tag": "td",
											"children": [
												[
													"text 2"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				render(A, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text 1<br></td></tr></table></div></div>');
				render(B, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td><br></td></tr></table></div></div>');
				render(C, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text 2<br></td></tr></table></div></div>');
			});

			it('variation 7', () => {
				const A = [];
				A[0] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"children": [
								{
									"tag": "td",
									"children": [
										"",
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[1] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"children": [
								{
									"tag": "td",
									"children": [
										[
											"text 1"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[2] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"children": [
								{
									"tag": "td",
									"children": [
										[
											"text 2"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[3] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"children": [
								{
									"tag": "td",
									"children": [
										[
											{
												"tag": "br"
											},
											"text 3"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				render(A[0], container);
				expect(container.innerHTML).to.equal('<table><tr><td><br></td></tr></table>');
				render(A[1], container);
				expect(container.innerHTML).to.equal('<table><tr><td>text 1<br></td></tr></table>');
				render(A[2], container);
				expect(container.innerHTML).to.equal('<table><tr><td>text 2<br></td></tr></table>');
				render(A[3], container);
				expect(container.innerHTML).to.equal('<table><tr><td><br>text 3<br></td></tr></table>');
			});
		});


		describe('KEYED updates', () => {
			it('variation-1', () => {
				function A() {
					return {
						"tag": "div",
						"children": {
							"tag": "div",
							"children": {
								"tag": "table",
								"children": [
									{
										"tag": "tr",
										"key": "row1",
										"children": [
											{
												"tag": "td",
												"key": "td1",
												"children": "Text"
											}

										],
										"dom": null
									}
								]
							}
						},
						"dom": null
					}
				}

				function B() {
					return {
						"tag": "div",
						"children": {
							"tag": "div",
							"children": {
								"tag": "table",
								"children": [
									{
										"tag": "tr",
										"key": "row1",
										"children": [
											{
												"tag": "td",
												"key": "td1",
												"children": [
													"bar"
												]
											}
										],
										"dom": null
									}
								]
							}
						},
						"dom": null
					}
				}

				function C() {
					return {
						"tag": "div",
						"children": {
							"tag": "div",
							"children": {
								"tag": "table",
								"children": [
									{
										"tag": "tr",
										"key": "row1",
										"children": [
											{
												"tag": "td",
												"key": "td1",
												"children": [
													"text1"
												]
											}
										],
										"dom": null
									}
								]
							}
						},
						"dom": null
					}
				}

				render(A(), container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>Text</td></tr></table></div></div>');
				render(B(), container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>bar</td></tr></table></div></div>');
				render(C(), container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text1</td></tr></table></div></div>');
			});

			it('variation -2', () => {
				const A={
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"key": "row1",
									"children": [
										{
											"tag": "td",
											"key": "td1",
											"children": [
												"text",
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};
				const B = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"key": "row1",
									"children": [
										{
											"tag": "td",
											"key": "td1",
											"children": [
												[
													"text"
												]
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};
				const C={
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"key": "row1",
									"children": [
										{
											"tag": "td",
											"key": "td1",
											"children": [
												[
													"value"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				render(A, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text<br></td></tr></table></div></div>');
				render(B, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text</td></tr></table></div></div>');
				render(C, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>value<br></td></tr></table></div></div>');
			});

			it('variation 3', () => {
				const A = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table"
						}
					},
					"dom": null
				};
				const B = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"key": "row1",
									"dom": null
								},
								{
									"tag": "tr",
									"key": "row2",
									"children": [

										{
											"tag": "td",
											"key": "td2-1",
											"children": [
												[
													"A"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										},
										{
											"tag": "td",
											"key": "td2-2",
											"children": [
												[
													"B"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								},
								{
									"tag": "tr",
									"key": "row3",
									"dom": null
								}
							]
						}
					},
					"dom": null
				};
				const C = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"key": "row1",
									"dom": null
								},
								{
									"tag": "tr",
									"key": "row2",
									"children": [
										{
											"tag": "td",
											"key": "td2-2",
											"children": [
												"",
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				render(A, container);
				expect(container.innerHTML).to.equal('<div><div><table></table></div></div>');
				render(B, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr></tr><tr><td>A<br></td><td>B<br></td></tr><tr></tr></table></div></div>');
				render(C, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr></tr><tr><td><br></td></tr></table></div></div>');
			});

			it('variation 4', () => {
				const A = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"key": "row1",
									"children": [
										{
											"tag": "td",
											"key": "td1-1",
											"children": [
												[
													"text 1"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				const B = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"key": "row1",
									"children": [
										{
											"tag": "td",
											"key": "td1-1",
											"children": [
												"",
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				const C = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"key": "row1",
									"children": [
										{
											"tag": "td",
											"key": "td1-1",
											"children": [
												[
													"text 2"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				render(A, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text 1<br></td></tr></table></div></div>');
				render(B, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td><br></td></tr></table></div></div>');
				render(C, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text 2<br></td></tr></table></div></div>');
			});

			it('variation 5', () => {
				const A = [];
				A[0] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"key": "row1",
							"children": [
								{
									"tag": "td",
									"key": "td1-1",
									"children": [
										"",
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[1] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"key": "row1",
							"children": [
								{
									"tag": "td",
									"key": "td1-1",
									"children": [
										[
											"text 1",
											"text a"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[2] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"key": "row1",
							"children": [
								{
									"tag": "td",
									"key": "td1-1",
									"children": [
										[
											"text 2"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[3] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"key": "row1",
							"children": [
								{
									"tag": "td",
									"key": "td1-1",
									"children": [
										[
											{
												"tag": "br"
											},
											"text 3"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				render(A[0], container);
				expect(container.innerHTML).to.equal('<table><tr><td><br></td></tr></table>');
				render(A[1], container);
				expect(container.innerHTML).to.equal('<table><tr><td>text 1text a<br></td></tr></table>');
				render(A[2], container);
				expect(container.innerHTML).to.equal('<table><tr><td>text 2<br></td></tr></table>');
				render(A[3], container);
				expect(container.innerHTML).to.equal('<table><tr><td><br>text 3<br></td></tr></table>');
			});

			it('variation 6', () => {
				const A = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"key": "row1",
									"children": [
										{
											"tag": "td",
											"key": "td1-1",
											"children": [
												[
													"text 1"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				const B = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"key": "row1",
									"children": [
										{
											"tag": "td",
											"key": "td1-1",
											"children": [
												"",
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				const C = {
					"tag": "div",
					"children": {
						"tag": "div",
						"children": {
							"tag": "table",
							"children": [
								{
									"tag": "tr",
									"key": "row1",
									"children": [
										{
											"tag": "td",
											"key": "td1-1",
											"children": [
												[
													"text 2"
												],
												{
													"tag": "br"
												}
											],
											"dom": null
										}
									],
									"dom": null
								}
							]
						}
					},
					"dom": null
				};

				render(A, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text 1<br></td></tr></table></div></div>');
				render(B, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td><br></td></tr></table></div></div>');
				render(C, container);
				expect(container.innerHTML).to.equal('<div><div><table><tr><td>text 2<br></td></tr></table></div></div>');
			});

			it('variation 7', () => {
				const A = [];
				A[0] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"key": "row1",
							"children": [
								{
									"tag": "td",
									"key": "td1-1",
									"children": [
										"",
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[1] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"key": "row1",
							"children": [
								{
									"tag": "td",
									"key": "td1-1",
									"children": [
										[
											"text 1"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[2] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"key": "row1",
							"children": [
								{
									"tag": "td",
									"key": "td1-1",
									"children": [
										[
											"text 2"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				A[3] =  {
					"tag": "table",
					"children": [
						{
							"tag": "tr",
							"key": "row1",
							"children": [
								{
									"tag": "td",
									"key": "td1-1",
									"children": [
										[
											{
												"tag": "br"
											},
											"text 3"
										],
										{
											"tag": "br"
										}
									]
								}
							]
						}
					]
				};

				render(A[0], container);
				expect(container.innerHTML).to.equal('<table><tr><td><br></td></tr></table>');
				render(A[1], container);
				expect(container.innerHTML).to.equal('<table><tr><td>text 1<br></td></tr></table>');
				render(A[2], container);
				expect(container.innerHTML).to.equal('<table><tr><td>text 2<br></td></tr></table>');
				render(A[3], container);
				expect(container.innerHTML).to.equal('<table><tr><td><br>text 3<br></td></tr></table>');
			});
		});
	});

	describe('Github #162', () => {
		it("works", function() {
			const A = [];

			A[0] =  {
				"tag": "div",
				"children": [
					"text 1"
				]
			};
			A[1] =  {
				"tag": "div",
				"children": [
					"text 2",
					{
						"tag": "br"
					},
					"text 3"
				]
			};
			A[2] =  {
				"tag": "div",
				"children": [
					"text 4"
				]
			};
			render(A[0], container);
			expect(container.innerHTML).to.equal('<div>text 1</div>');
			render(A[1], container);
			expect(container.innerHTML).to.equal('<div>text 2<br>text 3</div>');
			render(A[2], container);
			expect(container.innerHTML).to.equal('<div>text 4</div>');
		});
	});

	describe('Github #162', () => {
		it("works", function() {
			const A = [];
			A[0] =  {
				"tag": "div",
				"children": [
					"text 1",
					{
						"tag": "br"
					}
				]
			};

			A[1] =  {
				"tag": "div",
				"children": "text 2"
			};

			A[2] =  {
				"tag": "div",
				"children": [
					{
						"tag": "br"
					},
					"text 4"
				]
			};

			render(A[0], container);
			expect(container.innerHTML).to.equal('<div>text 1<br></div>');
			render(A[1], container);
			expect(container.innerHTML).to.equal('<div>text 2</div>');
			render(A[2], container);
			expect(container.innerHTML).to.equal('<div><br>text 4</div>');
		});
	});
});

