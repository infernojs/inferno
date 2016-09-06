import { render } from './../rendering';
import { innerHTML } from '../../tools/utils';
import createElement from './../../core/createElement';
import { createStaticVElement, createOptBlueprint, createVComponent, createVElement, ChildrenTypes, ValueTypes, NodeTypes } from './../../core/shapes';

const Inferno = {
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	ChildrenTypes,
	ValueTypes,
	NodeTypes
};

describe('Elements (JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	it('should render a simple div', () => {
		render(<div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		render(<div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
	});

	it('should render a simple div with multiple children', () => {
		render(<div><span></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		render(<div><span></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		render(<div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		render(<div><span></span><span></span><span></span><span></span><span></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(5);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		render(<div><span></span><span></span><span></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(3);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		render(undefined, container);
		render(<div><span></span><b>Hello, World!</b><span></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(3);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
	});

	it('should render a simple div with multiple children #2', () => {
		const items = [ 1, 2, 3 ];
		const header = 'Hello ';

		render(<div>{ header }{ items }</div>, container);
		expect(container.firstChild.innerHTML).to.equal('Hello 123');

		render(<div>{ header }{ [ 4, 5, 6 ] }</div>, container);
		expect(container.firstChild.innerHTML).to.equal('Hello 456');
	});

	it('should render a simple div with span child and dynamic id attribute', () => {
		render(<div id={ 'hello' }></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('id')).to.equal('hello');

		render(<div id={ null }></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('id')).to.equal(null);

		render(<div class={ 'hello' }></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('class')).to.equal('hello'); // 'class¨attribute exist!

		render(<div id="hello"></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('id')).to.equal('hello');

		// unset
		render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);
	});

	it('should render a simple div with span child and various dynamic attributes', () => {

		render(<div id={ 'hello' }></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('id')).to.equal('hello');

		render(<div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);

		render(<div class={ 'hello' }></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('class')).to.equal('hello');

		render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);
		expect(container.innerHTML).to.equal('');
	});

	it('should render a simple div with dynamic span child', () => {

		const child = <span></span>;

		render(<div>{ undefined }</div>, container);
		render(<div>{ child }</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		render(<div>{ null }</div>, container);
		render(<div>{ child }</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		// unset
		render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);
		expect(container.innerHTML).to.equal('');
	});

	it('should render a advanced div with static child and dynamic attributes', () => {

		let attrs;

		attrs = 'id#1';;

		render(<div><div id={ attrs }></div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.getAttribute('id')).to.equal('id#1');

		attrs = null;

		render(<div><div id={ attrs }></div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.getAttribute('id')).to.equal(null);

		attrs = undefined;

		render(<div id={ attrs }></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('id')).to.equal(null);

		attrs = 'id#4';

		render(<div><div id={ attrs }></div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.getAttribute('id')).to.equal('id#4');

		attrs = 13 - 44 * 4 / 4;

		let b = <b className={ 123 } >Hello, World!</b>;
		let n = <n>{ b }</n>;

		render(<div class="Hello, World!"><span><div id={ attrs }>{ n }</div></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('Hello, World!');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.getAttribute('id')).to.equal('-31');
		expect(container.firstChild.firstChild.firstChild.firstChild.nodeName).to.equal('N');
		expect(container.firstChild.firstChild.firstChild.firstChild.firstChild.nodeName).to.equal('B');
		expect(container.firstChild.firstChild.firstChild.firstChild.firstChild.innerHTML).to.equal('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('123');

		attrs = 13 - 44 * 4 / 4;

		b = <b className={ 1243 } >Hello, World!</b>;
		n = <n>{ b }</n>;

		render(<div class="Hello, World!"><span><div id={ attrs }>{ n }</div></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('Hello, World!');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.getAttribute('id')).to.equal('-31');
		expect(container.firstChild.firstChild.firstChild.firstChild.nodeName).to.equal('N');
		expect(container.firstChild.firstChild.firstChild.firstChild.firstChild.nodeName).to.equal('B');
		expect(container.firstChild.firstChild.firstChild.firstChild.firstChild.innerHTML).to.equal('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('1243');

		// unset
		render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);

		attrs = 'id#444';

		render(<div class="Hello, Dominic" id={ attrs }><div id={ attrs }></div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('Hello, Dominic');
		expect(container.firstChild.getAttribute('id')).to.equal('id#444');
		expect(container.firstChild.firstChild.getAttribute('id')).to.equal('id#444');

		attrs = 'id#' + 333 - 333 / 3;

		render(<div class="Hello, Dominic" id={ attrs }><div id={ attrs }></div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('Hello, Dominic');
		expect(container.firstChild.getAttribute('id')).to.equal('NaN');
		expect(container.firstChild.firstChild.getAttribute('id')).to.equal('NaN');

		// unset
		render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);

	});

	it('should render a simple div with dynamic span child and update to div child', () => {
		let child = <span></span>;

		render(<div>{ child }</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');

		render(<div></div>, container);

		child = <div></div>;

		render(<div>{ child }</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');

		child = <div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>;

		render(<div>{ child }</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.childNodes.length).to.equal(9);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.nodeName).to.equal('DIV');
		child = <div>Hello, World!</div>;

		render(<div>{ child }</div>, container);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.innerHTML).to.equal('Hello, World!');

		render(<div>{ null }</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');

		render(<div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
	});

	it('should render and unset a simple div with dynamic span child', () => {

		let child;

		child = <span><span></span><span></span></span>;

		render(<div>{ child }</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.childNodes.length).to.equal(2);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.nodeName).to.equal('SPAN');

		render(<div>{ null }</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');

		const divs = <div></div>;

		child = <span><span>{ divs }</span></span>;

		render(<div>{ child }</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.nodeName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.firstChild.nodeName).to.equal('DIV');
	});

	it('should render a simple div children set to undefined', () => {

		render(<div>{ undefined }</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('');

		render(<div>{ undefined }</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('');
	});

	it('should render a simple div children set to null', () => {

		render(<div>{ null }</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('');

		render(<div>{ null }</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('');

		// unset
		render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);
	});

	it('should render a simple div children set to null', () => {

		render(<div><div>{ null }</div></div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.textContent).to.equal('');

		render(<div><div>{ null }</div></div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.textContent).to.equal('');
	});

	it('should render a double div and a text node', () => {

		render(<div>{ <div>Hello, World!</div> }</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('Hello, World!');

		render(<div>{ null }</div>, container);

		render(<div>{ <div>Hello, Inferno!</div> }</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('Hello, Inferno!');

	});

	it('should render a single div with text node', () => {

		render(<div><span></span><span></span></div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('');

		// unset
		render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);
	});

	it('should render a simple div with a text node', () => {

		render(<div>Hello, world!</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('Hello, world!');

		render(<div>Hello, world! 2</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('Hello, world! 2');
	});

	it('should render a simple div with attributes', () => {

		render(<div id={ 123 }>Hello, world!</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.getAttribute('id')).to.equal('123');
		expect(container.firstChild.textContent).to.equal('Hello, world!');

		render(<div id={ 'foo' }>Hello, world! 2</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.getAttribute('id')).to.equal('foo');
		expect(container.firstChild.textContent).to.equal('Hello, world! 2');
	});

	it('should render a simple div with inline style', () => {

		render(<div style="background-color:lightgrey;">Hello, world!</div>, container);

		expect(container.nodeName).to.equal('DIV');

		render(<div id={ 'foo' }>Hello, world! 2</div>, container);

		expect(container.nodeName).to.equal('DIV');

		// unset
		render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);

	});

	it('should render "className" attribute', () => {

		// Bad tests, you shouldn't use className on SVG elements

		// render(<div className="Dominic rocks!" />, container);
		// expect(container.firstChild.className).to.eql('Dominic rocks!');
		// expect(
		// 	container.innerHTML
		// ).to.equal(
		// 	innerHTML('<div class="Dominic rocks!"></div>')
		// );
		// render(<div className='' />, container);
		// expect(container.firstChild.className).to.eql('');

		render(<div class="123" />, container);
		expect(container.firstChild.getAttribute('class')).to.eql('123');

		render(<div className={ null } />, container);
		expect(container.firstChild.className).to.eql('');

		render(<div className={ undefined } />, container);
		expect(container.firstChild.className).to.eql('');

		render(<div className="Inferno rocks!" />, container);
		expect(container.firstChild.getAttribute('class')).to.eql('Inferno rocks!');
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div class="Inferno rocks!"></div>')
		);
	});

	it('shouldn\'t render null value', () => {

		render(<input values={ null } />, container);

		expect(container.value).to.equal(undefined);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<input>')
		);

		render(<input values={ undefined } />, container);
		expect(container.value).to.equal(undefined);

		render(<input values={ null } />, container);
		expect(container.value).to.equal(undefined);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<input>')
		);

		// unset
		render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);

	});

	it('should set values as properties by default', () => {

		render(<input title="Tip!" />, container);

		expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<input title="Tip!">')
		);

		render(<input name="Tip!" />, container);

		expect(container.firstChild.getAttribute('name')).to.eql('Tip!');
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<input name="Tip!">')
		);

		render(<input title="Tip!" />, container);

		expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<input title="Tip!">')
		);
	});

	it('should render a simple div with dynamic values and props', () => {

		let val1, val2;

		val1 = 'Inferno';
		val2 = 'Sucks!';

		render(<div className="foo">
			<span className="bar">{ val1 }</span>
			<span className="yar">{ val2 }</span>
		</div>, container);

		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(1);
		expect(container.childNodes[ 0 ].childNodes[ 0 ].getAttribute('class')).to.eql('bar');
		expect(container.childNodes[ 0 ].childNodes[ 0 ].textContent).to.eql('Inferno');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].getAttribute('class')).to.eql('yar');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].textContent).to.eql('Sucks!');

		render(<div className="fooo">
			<span className="bar">{ val1 }</span>
			<span className="yar">{ val2 }</span>
		</div>, container);

		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(1);
		expect(container.childNodes[ 0 ].childNodes[ 0 ].getAttribute('class')).to.eql('bar');
		expect(container.childNodes[ 0 ].childNodes[ 0 ].textContent).to.eql('Inferno');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].getAttribute('class')).to.eql('yar');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].textContent).to.eql('Sucks!');
	});

	it('should properly render a input with download attribute', () => {

		let val1, val2;

		val1 = 'false';

		render(<input download={ val1 }></input>, container);

		expect(container.firstChild.nodeName).to.equal('INPUT');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('download')).to.equal('false');

		val1 = 'true';

		render(<input download={ val1 }></input>, container);

		expect(container.firstChild.nodeName).to.equal('INPUT');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('download')).to.equal('true');
	});

	it('should properly render "className" property on a custom element', () => {

		render(<custom-elem className="Hello, world!"></custom-elem>, container);

		expect(container.firstChild.nodeName).to.equal('CUSTOM-ELEM');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('class')).to.equal('Hello, world!');

		render(<custom-elem className="Hello, world!"></custom-elem>, container);

		expect(container.firstChild.nodeName).to.equal('CUSTOM-ELEM');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('class')).to.equal('Hello, world!');
	});

	it('should properly render "width" and "height" attributes', () => {

		render(<img src='' alt="Smiley face" height={ 42 } width={ 42 }></img>, container);

		expect(container.firstChild.nodeName).to.equal('IMG');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('src')).to.equal('');
		expect(container.firstChild.getAttribute('alt')).to.equal('Smiley face');
		expect(container.firstChild.getAttribute('height')).to.equal('42');
		expect(container.firstChild.getAttribute('width')).to.equal('42');

		render(<img src='' alt="Smiley face" height={ 42 } width={ 42 } fooBar={ [] }></img>, container);

		expect(container.firstChild.nodeName).to.equal('IMG');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('src')).to.equal('');
		expect(container.firstChild.getAttribute('alt')).to.equal('Smiley face');
		expect(container.firstChild.getAttribute('height')).to.equal('42');
		expect(container.firstChild.getAttribute('width')).to.equal('42');
	});

	it('should properly render "width" and "height" attributes', () => {

		render(<input type="file" multiple="multiple" capture="capture" accept="image/*"></input>, container);

		expect(container.firstChild.nodeName).to.equal('INPUT');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('type')).to.equal('file');
		expect(container.firstChild.getAttribute('multiple')).to.equal('');
		expect(container.firstChild.capture).to.equal(true);
		expect(container.firstChild.getAttribute('accept')).to.equal('image/*');

		render(<input type="file" multiple="multiple" capture="capture" accept="image/*"></input>, container);

		expect(container.firstChild.nodeName).to.equal('INPUT');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('type')).to.equal('file');
		expect(container.firstChild.getAttribute('multiple')).to.equal('');
		expect(container.firstChild.capture).to.equal(true);
		expect(container.firstChild.getAttribute('accept')).to.equal('image/*');
	});

	it('should handle className', () => {

		render(<div className={ 'foo' } />, container);
		expect(container.firstChild.className).to.equal('foo');
		render(<div className={ 'bar' } />, container);
		expect(container.firstChild.className).to.equal('bar');
		render(<div className={ null } />, container);
		expect(container.firstChild.className).to.equal('');
		render(<div className={ undefined } />, container);
		expect(container.firstChild.className).to.equal('');
		render(<svg class={ 'fooBar' } />, container);
		expect(container.firstChild.getAttribute('class')).to.equal('fooBar');
	});

	it('should remove attributes', () => {
		render(<img height="17" />, container);
		expect(container.firstChild.hasAttribute('height')).to.equal(true);
		render(<img />, container);
		expect(container.firstChild.hasAttribute('height')).to.equal(false);
		render(<img height={ null } />, container);
		expect(container.firstChild.hasAttribute('height')).to.equal(false);
	});

	it('should remove properties #2', () => {
		render(<div class="monkey" />, container);
		expect(container.firstChild.getAttribute('class')).to.equal('monkey');
		render(<div />, container);
		expect(container.firstChild.className).to.equal('');
		render(<svg class="monkey" />, container);
		expect(container.firstChild.getAttribute('class')).to.equal('monkey');
		render(<svg />, container);
		expect(container.firstChild.getAttribute('class')).to.equal(null);
	});

	it('should not update when switching between null/undefined', () => {
		render(<div dir={ null } />, container);
		render(<div dir={ 123 } />, container);
		render(<div dir={ null } />, container);
		render(<div dir={ undefined } />, container);
		render(<div />, container);
		render(<div dir="ltr" />, container);
		render(<div dir={ [] } />, container);
	});

	it('should render an iframe', () => {
		document.body.appendChild(container);
		render(<iframe src="http://infernojs.org"></iframe>, container);
		expect(container.firstChild.contentWindow).to.not.equal(undefined);
		document.body.removeChild(container);
	});

	it('should render a HTML5 video', () => {
		document.body.appendChild(container);
		render((
			<video width="400" controls volume={ 0 }>
				<source src="http://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
			</video>
		), container);
		expect(container.firstChild.volume).to.not.equal(undefined);
		expect(container.firstChild.volume).to.be.equal(0);
		document.body.removeChild(container);
	});

	it('should dangerously set innerHTML', () => {
		render((
			<div dangerouslySetInnerHTML={ { __html: 'Hello world!' } } />
		), container);
		expect(container.innerHTML).to.equal('<div>Hello world!</div>');
	});

	it('handles JSX spread props (including children)', () => {
		const foo = {
			children: 'Hello world!',
			className: 'lol'
		};
		const bar = {
			id: 'test'
		};

		render((
			<div { ...foo } { ...bar } />
		), container);
		expect(container.innerHTML).to.equal('<div class="lol" id="test">Hello world!</div>');
	});

	it('mixing JSX with non-JSX', () => {
		render(<div>{ createElement('div') }</div>, container);
		expect(container.innerHTML).to.equal('<div><div></div></div>');
		render(<div>{ createElement('span') }</div>, container);
		expect(container.innerHTML).to.equal('<div><span></span></div>');
		render(<span>{ createElement('div') }</span>, container);
		expect(container.innerHTML).to.equal('<span><div></div></span>');
	});

	it('Should be able to construct input with Hooks, Events, Attributes defined', (done) => {
		function test() {}
		const obj = { fn: function () {}, focus: function () {} };
		const bool = false;
		const newValue = 't';
		const spread = { id: 'test' };
		const spy = sinon.spy(obj, 'fn');
		const spyFocus = sinon.spy(obj, 'focus');


		// TODO: Fails to creation of node fix needed
		render(<input type="text" ref={obj.fn} spellcheck="false"
					readOnly={bool ? 'readonly' : false} disabled={bool}
					ondragenter={test} ondragover={test} value={newValue} oninput={test}
					onfocus={obj.focus} class="edit-field" onkeydown={test} onkeyup={test}
					onBlur={test} {...spread} />, container);
		// TODO: Somehow verify hooks / events work. Not sure this is as expected
		document.body.appendChild(container);
		const input = container.querySelector('#test');
		sinon.assert.calledOnce(spy, 'Hook should work'); // Verify hook works
		input.focus();
		requestAnimationFrame(() => {
			sinon.assert.calledOnce(spyFocus, 'Event should work'); // Verify hook works
			document.body.removeChild(container);
			done();
		});
	});
});
