import Inferno from '../../../../src';
import get from '../../../tools/get';

const {
	createElement
} = Inferno.TemplateFactory;

describe('DOM element tests (jsx)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		Inferno.render(null, container);
	});

	describe('should render a basic example', () => {
		beforeEach(() => {
			Inferno.render(<div>Hello world</div>, container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world</div>'
			);

			Inferno.render(<div>Hello world 2</div>, container);
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world 2</div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(<div>Hello world 2</div>, container);
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world 2</div>'
			);
		});
	});

   	describe('should render a simple div with inline style', () => {

		it('Initial render (creation)', () => {

			Inferno.render(<div style="background-color:lightgrey;">Hello, world!</div>, container);			
             expect(container.nodeName).to.equal('DIV');
			Inferno.render(<div id={'foo'}>Hello, world! 2</div>, container);

             expect(container.nodeName).to.equal('DIV');

			Inferno.render(<div>Hello world 2</div>, container);
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world 2</div>'
			);

		});

		it('Second render (update)', () => {

			Inferno.render(<div id={'foo'}>Hello, world! 2</div>, container);

             expect(container.nodeName).to.equal('DIV');
		});
	});


	describe('should render a basic example #2', () => {
		beforeEach(() => {
			Inferno.render(<ul><li>Im a li-tag</li><li>Im a li-tag</li><li>Im a li-tag</li></ul>, container);
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
		it('Initial render (creation)', () => {
			Inferno.render(
				<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>,
				container
			);

			expect(
				container.innerHTML
			).to.equal(
				`<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>`
			);

			Inferno.render(
				<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>,
				container
			);

			expect(
				container.innerHTML
			).to.equal(
				`<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>`
			);

		});
	});

	describe('should render "autoFocus" boolean attributes', () => {
		it('Initial render (creation)', () => {
			Inferno.render(<div autoFocus='true' />, container);
			expect(container.firstChild.getAttribute('autoFocus')).to.eql('true');
			expect(
				container.innerHTML
			).to.equal(
				'<div autofocus="true"></div>'
			);

			Inferno.render(<div autoFocus='false' />, container);
			expect(container.firstChild.getAttribute('autoFocus')).to.eql('false');
			expect(
				container.innerHTML
			).to.equal(
				'<div autofocus="false"></div>'
			);

			Inferno.render(<div autoFocus='' />, container);
			expect(container.firstChild.getAttribute('autoFocus')).to.eql(null);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

		});
	});

	describe('should render "className" attribute', () => {

		it('Initial render (creation)', () => {
			Inferno.render(<div className='Dominic rocks!' />, container);
			expect(container.firstChild.className).to.eql('Dominic rocks!');
			expect(
				container.innerHTML
			).to.equal(
				'<div class="Dominic rocks!"></div>'
			);

            Inferno.render(<div autoFocus='true' />, container);
			expect(container.firstChild.getAttribute('autoFocus')).to.eql('true');
			expect(
				container.innerHTML
			).to.equal(
				'<div autofocus="true"></div>'
			);
			Inferno.render(<div className='' />, container);
			expect(container.firstChild.className).to.eql('');

			Inferno.render(<div className={null} />, container);
			expect(container.firstChild.className).to.eql('');

			Inferno.render(<div className={undefined} />, container);
			expect(container.firstChild.className).to.eql('');
		});

		it('Second render (update)', () => {
			Inferno.render(<div className='Inferno rocks!' />, container);
			expect(container.firstChild.getAttribute('class')).to.eql('Inferno rocks!');
			expect(
				container.innerHTML
			).to.equal(
				'<div class="Inferno rocks!"></div>'
			);
		});

	});

	describe('shouldn\'t render null value', () => {
		it('Initial render (creation)', () => {
			Inferno.render(<input values={ null } />, container);
			expect( container.value ).to.be.undefined;
			expect(
				container.innerHTML
			).to.equal(
				'<input>'
			);

			Inferno.render(<input values={ undefined } />, container);
			expect( container.value ).to.be.undefined;
			expect(
				container.innerHTML
			).to.equal(
				'<input>'
			);
            // should null be set?
			Inferno.render(<input values='null' />, container);
			expect( container.value ).to.be.undefined;
			expect(
				container.innerHTML
			).to.equal(
				'<input>'
			);
			
            // should undefined be set?
			Inferno.render(<input values='undefined' />, container);
			expect( container.value ).to.be.undefined;
			expect(
				container.innerHTML
			).to.equal(
				'<input>'
			);
			
			
		});
	});

	describe('should set values as properties by default', () => {
		it('Initial render (creation)', () => {
			Inferno.render(<input title='Tip!' />, container);

			expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
			expect(
				container.innerHTML
			).to.equal(
				'<input title="Tip!">'
			);

			Inferno.render(<input title='' />, container);

			expect(container.firstChild.getAttribute('title')).to.be.null;
			expect(
				container.innerHTML
			).to.equal(
				'<input>' 
			);

		});
	});

	describe('should render value multiple attribute', () => {
		it('Initial render (creation)', () => {
			Inferno.render((
				<select multiple={ true } value='foo'>
					<option value='foo'>I'm a li-tag</option>
					<option value='bar'>I'm a li-tag</option>
				</select>),
				container
			);

			expect(get(container.firstChild)).to.eql(['foo']);
			expect(
				container.innerHTML
			).to.equal(
				'<select multiple="multiple"><option value="foo" selected="selected">I\'m a li-tag</option><option value="bar">I\'m a li-tag</option></select>'
			);

			Inferno.render((
				<select multiple={ false } value='foo'>
					<option value='foo'>I'm a li-tag</option>
					<option value='bar'>I'm a li-tag</option>
				</select>),
				container
			);

			expect(get(container.firstChild)).to.eql(['foo']);
			expect(
				container.innerHTML
			).to.equal(
				'<select><option value="foo" selected="selected">I\'m a li-tag</option><option value="bar">I\'m a li-tag</option></select>'
			);

			Inferno.render((
				<select multiple={ null } value='foo'>
					<option value='foo'>I'm a li-tag</option>
					<option value='bar'>I'm a li-tag</option>
				</select>),
				container
			);

			expect(get(container.firstChild)).to.eql(['foo']);
			expect(
				container.innerHTML
			).to.equal(
				'<select><option value="foo" selected="selected">I\'m a li-tag</option><option value="bar">I\'m a li-tag</option></select>'
			);

            Inferno.render((
				<select multiple={ undefined } value='foo'>
					<option value='foo'>I'm a li-tag</option>
					<option value='bar'>I'm a li-tag</option>
				</select>),
				container
			);

			expect(get(container.firstChild)).to.eql(['foo']);
			expect(
				container.innerHTML
			).to.equal(
				'<select><option value="foo" selected="selected">I\'m a li-tag</option><option value="bar">I\'m a li-tag</option></select>'
			);

		});
	});

	describe('should render a basic example with dynamic values', () => {
		beforeEach(() => {
			const values = ['Inferno', 'Owns'];
			Inferno.render(<div>Hello world - { values[0] } { values[1] }</div>, container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world - Inferno Owns</div>'
			);
			const values = ['Test', 'Works!'];
			Inferno.render(<div>Hello world - { values[0] } { values[1] }</div>, container);
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world - Test Works!</div>'
			);
		});
		it('Second render (update)', () => {
			const values = ['Test', 'Works!'];
			Inferno.render(<div>Hello world - { values[0] } { values[1] }</div>, container);
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world - Test Works!</div>'
			);
		});
	});

	describe('should render a basic example with dynamic values and props', () => {
		beforeEach(() => {
			const values = ['Inferno', 'Rocks'];
			Inferno.render(
				<div className="foo">
					<span className="bar">{ values[0] }</span>
					<span className="yar">{ values[1] }</span>
				</div>,
				container
			);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
			);
			const values = ['Rocks', 'Inferno'];
			Inferno.render(
					<div className="foo">
						<span className="bar">{ values[0] }</span>
						<span className="yar">{ values[1] }</span>
					</div>,
				container
			);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="foo"><span class="bar">Rocks</span><span class="yar">Inferno</span></div>'
			);
		});
		it('Second render (update)', () => {
			const values = ['Rocks', 'Inferno'];
			Inferno.render(
					<div className="foo">
						<span className="bar">{ values[0] }</span>
						<span className="yar">{ values[1] }</span>
					</div>,
				container
			);
			expect(
				container.innerHTML
			).to.equal(
				`<div class="foo"><span class="bar">Rocks</span><span class="yar">Inferno</span></div>`
			);
		});
	});
});