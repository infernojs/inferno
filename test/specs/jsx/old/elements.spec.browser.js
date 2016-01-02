import Inferno from '../../../../packages/inferno/src/';
import InfernoDOM from '../../../../packages/inferno-dom/src/';

// WHY would we need this??

import { addTreeConstructor } from '../../../../src/core/createTemplate';
import createDOMTree from '../../../../src/DOM/createTree';

addTreeConstructor( 'dom', createDOMTree );

describe( 'Elements (JSX)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		InfernoDOM.render(null, container);
	});


	it('should render a simple div', () => {
		InfernoDOM.render(<div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		InfernoDOM.render(<div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
	});

	it('should render a simple div with multiple children', () => {
		InfernoDOM.render(<div><span></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		InfernoDOM.render(<div><span></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		InfernoDOM.render(<div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		InfernoDOM.render(<div><span></span><span></span><span></span><span></span><span></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(5);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		InfernoDOM.render(<div><span></span><span></span><span></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(3);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		InfernoDOM.render(<div><span></span><b>Hello, World!</b><span></span></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(3);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
	});

	it('should render a simple div with span child and dynamic id attribute', () => {
		InfernoDOM.render(<div id={'hello'}></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('id')).to.equal('hello');

		InfernoDOM.render(<div id={null}></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('id')).to.be.null;

		InfernoDOM.render(<div id='hello'></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('id')).to.equal('hello');

		// unset
		InfernoDOM.render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);
	});


	it('should render a simple div with span child and various dynamic attributes', () => {

		InfernoDOM.render(<div id={'hello'}></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('id')).to.equal('hello');

		InfernoDOM.render(<div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);

		InfernoDOM.render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);
		expect(container.innerHTML).to.equal('');
	});

	it('should render a simple div with dynamic span child', () => {

		const child = <span></span>

		InfernoDOM.render(<div>{child}</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		InfernoDOM.render(<div>{child}</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		// unset
		InfernoDOM.render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);
		expect(container.innerHTML).to.equal('');
	});

	it('should render a advanced div with static child and dynamic attributes', () => {

		let attrs;

		attrs = 'id#1'

		InfernoDOM.render(<div><div id={attrs}></div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.getAttribute('id')).to.equal('id#1');

		attrs = null

		InfernoDOM.render(<div><div id={attrs}></div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.getAttribute('id')).to.be.null;

		attrs = undefined

		InfernoDOM.render(<div id={attrs}></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(0);
		expect(container.firstChild.getAttribute('id')).to.be.null;

		attrs = 'id#4'

		InfernoDOM.render(<div><div id={attrs}></div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.getAttribute('id')).to.equal('id#4');

		attrs = 13 - 44 *4 /4;

		let b = <b className={123} >Hello, World!</b>
		let n = <n>{b}</n>

		InfernoDOM.render(<div class='Hello, World!'><span><div id={attrs}>{n}</div></span></div>, container);
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

		attrs = 13 - 44 *4 /4;

		b = <b className={1243} >Hello, World!</b>
		n = <n>{b}</n>

		InfernoDOM.render(<div class='Hello, World!'><span><div id={attrs}>{n}</div></span></div>, container);
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
		InfernoDOM.render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);

		attrs = 'id#444'

		InfernoDOM.render(<div class='Hello, Dominic' id={attrs}><div id={attrs}></div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('Hello, Dominic');
		expect(container.firstChild.getAttribute('id')).to.equal('id#444');
		expect(container.firstChild.firstChild.getAttribute('id')).to.equal('id#444');

		attrs = 'id#' + 333 -333 /3

		InfernoDOM.render(<div class='Hello, Dominic' id={attrs}><div id={attrs}></div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.getAttribute('class')).to.equal('Hello, Dominic');
		expect(container.firstChild.getAttribute('id')).to.equal('NaN');
		expect(container.firstChild.firstChild.getAttribute('id')).to.equal('NaN');

		// unset
		InfernoDOM.render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);

	});

	it('should render a simple div with dynamic span child and update to div child', () => {

		let child;

		child = <span></span>

		InfernoDOM.render(<div>{ child }</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');

		child = <div></div>

		InfernoDOM.render(<div>{child}</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');

		child = <div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>

		InfernoDOM.render(<div>{child}</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.childNodes.length).to.equal(9);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.nodeName).to.equal('DIV');
		child = <div>Hello, World!</div>

		InfernoDOM.render(<div>{child}</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.innerHTML).to.equal('Hello, World!');

		InfernoDOM.render(<div>{null}</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');


		InfernoDOM.render(<div></div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
	});

	it('should render and unset a simple div with dynamic span child', () => {

		let child;

		child = <span><span></span><span></span></span>

		InfernoDOM.render(<div>{child}</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.childNodes.length).to.equal(2);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.nodeName).to.equal('SPAN');

		InfernoDOM.render(<div>{null}</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');

		const divs = <div></div>;

		child = <span><span>{divs}</span></span>

		InfernoDOM.render(<div>{child}</div>, container);
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.nodeName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.firstChild.nodeName).to.equal('DIV');
	});


	it('should render a simple div children set to undefined', () => {

		InfernoDOM.render(<div>{undefined}</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('');

		InfernoDOM.render(<div>{undefined}</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('');
	});

	it('should render a simple div children set to null', () => {

		InfernoDOM.render(<div>{null}</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('');

		InfernoDOM.render(<div>{null}</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('');

		// unset
		InfernoDOM.render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);
	});

	it('should render a simple div children set to null', () => {

		InfernoDOM.render(<div><div>{null}</div></div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.textContent).to.equal('');

		InfernoDOM.render(<div><div>{null}</div></div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.firstChild.textContent).to.equal('');
	});

	it('should render a double div and a text node', () => {

		InfernoDOM.render(<div>{<div>Hello, World!</div> }</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('Hello, World!');

		InfernoDOM.render(<div>{<div>Hello, Redric!</div> }</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('Hello, Redric!');

	});

	it('should render a single div with text node', () => {

		InfernoDOM.render(<div><span></span><span></span></div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('');

		// unset
		InfernoDOM.render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);
	});

	it('should render a simple div with a text node', () => {

		InfernoDOM.render(<div>Hello, world!</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('Hello, world!');

		InfernoDOM.render(<div>Hello, world! 2</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.textContent).to.equal('Hello, world! 2');
	});

	it('should render a simple div with attributes', () => {

		InfernoDOM.render(<div id={123}>Hello, world!</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.getAttribute('id')).to.equal('123');
		expect(container.firstChild.textContent).to.equal('Hello, world!');

		InfernoDOM.render(<div id={'foo'}>Hello, world! 2</div>, container);

		expect(container.nodeName).to.equal('DIV');
		expect(container.firstChild.getAttribute('id')).to.equal('foo');
		expect(container.firstChild.textContent).to.equal('Hello, world! 2');
	});

	it('should render a simple div with inline style', () => {

		InfernoDOM.render(<div style="background-color:lightgrey;">Hello, world!</div>, container);

		expect(container.nodeName).to.equal('DIV');

		InfernoDOM.render(<div id={'foo'}>Hello, world! 2</div>, container);

		expect(container.nodeName).to.equal('DIV');

		// unset
		InfernoDOM.render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);

	});

	it('should render "className" attribute', () => {

		InfernoDOM.render(<div className='Dominic rocks!' />, container);
		expect(container.firstChild.className).to.eql('Dominic rocks!');
		expect(
			container.innerHTML
		).to.equal(
			'<div class="Dominic rocks!"></div>'
		);

		InfernoDOM.render(<div className='' />, container);
		expect(container.firstChild.className).to.eql('');

		InfernoDOM.render(<div className={null} />, container);
		expect(container.firstChild.className).to.eql('');

		InfernoDOM.render(<div className={undefined} />, container);
		expect(container.firstChild.className).to.eql('');

		InfernoDOM.render(<div className='Inferno rocks!' />, container);
		expect(container.firstChild.getAttribute('class')).to.eql('Inferno rocks!');
		expect(
			container.innerHTML
		).to.equal(
			'<div class="Inferno rocks!"></div>'
		);
	});

	it('shouldn\'t render null value', () => {

		InfernoDOM.render(<input values={ null } />, container);

		expect( container.value ).to.be.undefined;
		expect(
			container.innerHTML
		).to.equal(
			'<input>'
		);

		InfernoDOM.render(<input values={ undefined } />, container);

		expect( container.value ).to.be.undefined;
		expect(
			container.innerHTML
		).to.equal(
			'<input>'
		);

		// unset
		InfernoDOM.render(null, container);
		expect(container.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(0);

	});

	it('should set values as properties by default', () => {

		InfernoDOM.render(<input title='Tip!' />, container);

		expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
		expect(
			container.innerHTML
		).to.equal(
			'<input title="Tip!">'
		);

		InfernoDOM.render(<input title='Tip!' />, container);

		expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
		expect(
			container.innerHTML
		).to.equal(
			'<input title="Tip!">'
		);
	});

	it('should render a simple div with dynamic values and props', () => {

		let val1, val2;

		val1 = 'Inferno';
		val2 = 'Sucks!';

		InfernoDOM.render(<div className='foo'>
			<span className='bar'>{ val1 }</span>
			<span className='yar'>{ val2 }</span>
		</div>, container);

		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(1);
		expect(container.childNodes[0].childNodes[0].getAttribute('class')).to.eql('bar');
		expect(container.childNodes[0].childNodes[0].textContent).to.eql('Inferno');
		expect(container.childNodes[0].childNodes[1].getAttribute('class')).to.eql('yar');
		expect(container.childNodes[0].childNodes[1].textContent).to.eql('Sucks!');

		InfernoDOM.render(<div className='fooo'>
			<span className='bar'>{ val1 }</span>
			<span className='yar'>{ val2 }</span>
		</div>, container);

		expect(container.firstChild.nodeName).to.equal('DIV');
		expect(container.childNodes.length).to.equal(1);
		expect(container.childNodes[0].childNodes[0].getAttribute('class')).to.eql('bar');
		expect(container.childNodes[0].childNodes[0].textContent).to.eql('Inferno');
		expect(container.childNodes[0].childNodes[1].getAttribute('class')).to.eql('yar');
		expect(container.childNodes[0].childNodes[1].textContent).to.eql('Sucks!');
	});

	it('should properly render a input with download attribute', () => {

		let val1, val2;

		val1 = 'false';

		InfernoDOM.render(<input download={ val1 }></input>, container);

		expect(container.firstChild.nodeName).to.equal('INPUT');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('download')).to.equal('false');

		val1 = 'true';

		InfernoDOM.render(<input download={ val1 }></input>, container);

		expect(container.firstChild.nodeName).to.equal('INPUT');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('download')).to.equal('true');
	});

	it('should properly render "className" property on a custom element', () => {

		InfernoDOM.render(<custom-elem className="Hello, world!"></custom-elem>, container);

		expect(container.firstChild.nodeName).to.equal('CUSTOM-ELEM');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('class')).to.equal('Hello, world!');

		InfernoDOM.render(<custom-elem className="Hello, world!"></custom-elem>, container);

		expect(container.firstChild.nodeName).to.equal('CUSTOM-ELEM');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('class')).to.equal('Hello, world!');
	});

	it('should properly render "width" and "height" attributes', () => {

		InfernoDOM.render(<img src="" alt="Smiley face" height={42} width={42}></img>, container);

		expect(container.firstChild.nodeName).to.equal('IMG');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('src')).to.be.null;
		expect(container.firstChild.getAttribute('alt')).to.equal('Smiley face');
		expect(container.firstChild.getAttribute('height')).to.equal('42');
		expect(container.firstChild.getAttribute('width')).to.equal('42');

		InfernoDOM.render(<img src="" alt="Smiley face" height={42} width={42}></img>, container);

		expect(container.firstChild.nodeName).to.equal('IMG');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('src')).to.be.null;
		expect(container.firstChild.getAttribute('alt')).to.equal('Smiley face');
		expect(container.firstChild.getAttribute('height')).to.equal('42');
		expect(container.firstChild.getAttribute('width')).to.equal('42');
	});

	it('should properly render "width" and "height" attributes', () => {

		InfernoDOM.render(<input type="file" multiple="multiple" capture="capture" accept="image/*"></input>, container);

		expect(container.firstChild.nodeName).to.equal('INPUT');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('type')).to.equal('file');
		expect(container.firstChild.getAttribute('multiple')).to.equal('multiple');
		expect(container.firstChild.getAttribute('capture')).to.equal('capture');
		expect(container.firstChild.getAttribute('accept')).to.equal('image/*');

		InfernoDOM.render(<input type="file" multiple="multiple" capture="capture" accept="image/*"></input>, container);

		expect(container.firstChild.nodeName).to.equal('INPUT');
		expect(container.childNodes.length).to.equal(1);
		expect(container.firstChild.getAttribute('type')).to.equal('file');
		expect(container.firstChild.getAttribute('multiple')).to.equal('multiple');
		expect(container.firstChild.getAttribute('capture')).to.equal('capture');
		expect(container.firstChild.getAttribute('accept')).to.equal('image/*');
	});

	it('should handle className', () => {

		InfernoDOM.render(<div className={'foo'} />, container);
		expect(container.firstChild.className).to.equal('foo');
		InfernoDOM.render(<div className={'bar'} />, container);
		expect(container.firstChild.className).to.equal('bar');
		InfernoDOM.render(<div className={null} />, container);
		expect(container.firstChild.className).to.equal('');
		InfernoDOM.render(<div className={undefined} />, container);
		expect(container.firstChild.className).to.equal('');
		InfernoDOM.render(<svg className={'fooBar'} />, container);
		expect(container.firstChild.getAttribute('class')).to.equal('fooBar');
	});

	it('should remove attributes', () => {
		InfernoDOM.render(<img height="17" />, container);
		expect(container.firstChild.hasAttribute('height')).to.be.true;
		InfernoDOM.render(<img />, container);
		expect(container.firstChild.hasAttribute('height')).to.be.false;
	});

	it( 'should remove properties', () => {
		InfernoDOM.render(<div className="monkey" />, container);
		expect(container.firstChild.className).to.equal('monkey');
		InfernoDOM.render(<div />, container);
		expect(container.firstChild.className).to.equal('');
		InfernoDOM.render(<svg className="monkey" />, container);
		expect(container.firstChild.getAttribute('class')).to.equal('monkey');
		InfernoDOM.render(<svg />, container);
		expect(container.firstChild.getAttribute('class')).to.be.null;
	});

	it('should not update when switching between null/undefined', () => {

		const node = InfernoDOM.render(<div />, container);

		InfernoDOM.render(<div dir={null} />, container);
		InfernoDOM.render(<div dir={undefined} />, container);
		InfernoDOM.render(<div />, container);
		InfernoDOM.render(<div dir="ltr" />, container);
	});
});