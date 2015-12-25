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

	it('should render and unset a simple div with dynamic span child', () => {

        const child = <span></span>
		
	    Inferno.render(<div>{child}</div>, container);
        expect(container.firstChild.nodeName).to.equal('DIV');
        expect(container.firstChild.childNodes.length).to.equal(1);
        expect(container.firstChild.firstChild.nodeName).to.equal('SPAN');

	    Inferno.render(<div>{null}</div>, container);
        expect(container.firstChild.nodeName).to.equal('DIV');
        expect(container.firstChild.childNodes.length).to.equal(1);
        expect(container.firstChild.firstChild.nodeName).to.equal(''); // should be removed, not be #text

	});
	
   	it('should render a simple div with span child and dynamic attributes', () => {

	    Inferno.render(<div id={'hello'}></div>, container);
        expect(container.firstChild.nodeName).to.equal('DIV');
        expect(container.firstChild.childNodes.length).to.equal(0);
        expect(container.firstChild.getAttribute('id')).to.equal('hello');

	    Inferno.render(<div></div>, container);
        expect(container.firstChild.nodeName).to.equal('DIV');
        expect(container.firstChild.childNodes.length).to.equal(0);

	    Inferno.render(<div>{null}</div>, container);
        expect(container.firstChild.nodeName).to.equal('DIV');
        expect(container.firstChild.childNodes.length).to.equal(0);

	});

   	it('should render a simple div with span child and various dynamic attributes', () => {

	    Inferno.render(<div id={'hello'}></div>, container);
        expect(container.firstChild.nodeName).to.equal('DIV');
        expect(container.firstChild.childNodes.length).to.equal(0);
        expect(container.firstChild.getAttribute('id')).to.equal('hello');

	    Inferno.render(<div></div>, container);
        expect(container.firstChild.nodeName).to.equal('DIV');
        expect(container.firstChild.childNodes.length).to.equal(0);

	    Inferno.render(<div class={'hello'}></div>, container);
        expect(container.firstChild.nodeName).to.equal('DIV');
        expect(container.firstChild.childNodes.length).to.equal(0);
        expect(container.firstChild.getAttribute('class')).to.equal('hello');

	    Inferno.render(<div class='hello'></div>, container);
        expect(container.firstChild.nodeName).to.equal('DIV');
        expect(container.firstChild.childNodes.length).to.equal(0);
        expect(container.firstChild.getAttribute('class')).to.equal('hello');

	    Inferno.render(<div title='hello'></div>, container);
        expect(container.firstChild.nodeName).to.equal('DIV');
        expect(container.firstChild.childNodes.length).to.equal(0);
        expect(container.firstChild.getAttribute('title')).to.equal('hello');

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
		beforeEach(() => {
			Inferno.render(<div style="background-color:lightgrey;">Hello, world!</div>, container);
		});

		it('Initial render (creation)', () => {

			expect(container.nodeName).to.equal('DIV');
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
		beforeEach(() => {
			Inferno.render(
				<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>,
				container
			);
		});
		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				`<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>`
			);
		});
	});

	describe('should render "autoFocus" boolean attributes', () => {
		beforeEach(() => {
			Inferno.render(<div autoFocus='true' />, container);
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

		it('Initial render (creation)', () => {
			Inferno.render(<div className='Dominic rocks!' />, container);
			expect(container.firstChild.getAttribute('class')).to.eql('Dominic rocks!');
			expect(
				container.innerHTML
			).to.equal(
				'<div class="Dominic rocks!"></div>'
			);

			Inferno.render(<div className='' />, container);
			expect(container.firstChild.getAttribute('class')).to.eql('');
			expect(
				container.innerHTML
			).to.equal(
				'<div class="Dominic rocks!"></div>'
			);

			Inferno.render(<div className={null} />, container);
			expect(container.firstChild.getAttribute('class')).to.eql('');
			expect(
				container.innerHTML
			).to.equal(
				'<div class="Dominic rocks!"></div>'
			);


			Inferno.render(<div className={undefined} />, container);
			expect(container.firstChild.getAttribute('class')).to.eql('');
			expect(
				container.innerHTML
			).to.equal(
				'<div class="Dominic rocks!"></div>'
			);


		});

		it('Second render (update)', () => {
			Inferno.render(<div className='Inferno rocks!' />, container);
			expect(container.firstChild.getAttribute('class')).to.eql('Inferno rocks!');
			expect(
				container.innerHTML
			).to.equal(
				'<div class="Dominic rocks!"></div>'
			);
		});

	});
	
	it('should render "autoFocus" boolean attributes', () => {
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
	});

	describe('shouldn\'t render null value', () => {
		beforeEach(() => {
			Inferno.render(<input values={ null } />, container);
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
		it('Initial render (creation)', () => {

			Inferno.render(<input title='Tip!' />, container);

			expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
			expect(
				container.innerHTML
			).to.equal(
				'<input title="Tip!">'
			);
		});
	});

  it('should handle className', function() {
      Inferno.render(<div style={{}} />, container);

      Inferno.render(<div className={'foo'} />, container);
      expect(container.firstChild.className).to.equal('foo');
      Inferno.render(<div className={'bar'} />, container);
      expect(container.firstChild.className).to.equal('bar');
      Inferno.render(<div className={null} />, container);
      expect(container.firstChild.className).to.equal('');
    });
	
	 it('should update styles if initially null', function() {
      let styles = null;

      Inferno.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      styles = {display: 'block'};

      Inferno.render(<div style={styles} />, container);
      expect(stubStyle.display).to.equal('');
    });
	

	 it('should skip child object attribute on web components', function() {
      

      // Test initial render to null
      Inferno.render(<my-component children={['foo']} />, container);
      expect(container.firstChild.hasAttribute('children')).to.be.false;

      // Test updates to null
      Inferno.render(<my-component children={['foo']} />, container);
      expect(container.firstChild.hasAttribute('children')).to.be.false;
    });

    it('should remove attributes', function() {
      Inferno.render(<img height="17" />, container);

      expect(container.firstChild.hasAttribute('height')).to.be.true;
      Inferno.render(<img />, container);
      expect(container.firstChild.hasAttribute('height')).to.be.false;
    });

   it('should remove properties', function() {
      
      Inferno.render(<div className="monkey" />, container);

      expect(container.firstChild.className).to.equal('monkey');
      Inferno.render(<div />, container);
      expect(container.firstChild.className).to.equal('');
    });
	
	 it('should clear a single style prop when changing `style`', function() {
      let styles = {display: 'none', color: 'red'};

      Inferno.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      styles = {color: 'green'};
      Inferno.render(<div style={styles} />, container);
      expect(stubStyle.display).to.equal('');
      expect(stubStyle.color).to.equal('green');
    });


    it('should clear all the styles when removing `style`', function() {
      const styles = {display: 'none', color: 'red'};
      Inferno.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      Inferno.render(<div />, container);
      expect(stubStyle.display).to.equal('');
      expect(stubStyle.color).to.equal('');
    });

	
	it('should update styles when `style` changes from null to object', function() {
      const styles = {color: 'red'};
      Inferno.render(<div style={styles} />, container);
      Inferno.render(<div />, container);
      Inferno.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;
      expect(stubStyle.color).to.equal('red');
    });
	
	
	  it('should not update when switching between null/undefined', function() {
      var container = document.createElement('div');
      var node = Inferno.render(<div />, container);

      node.setAttribute = setter;

      Inferno.render(<div dir={null} />, container);
      Inferno.render(<div dir={undefined} />, container);
      Inferno.render(<div />, container);
      Inferno.render(<div dir="ltr" />, container);
    });
	
	 it('should not update when switching between null/undefined', function() {

      const node = Inferno.render(<div />, container);

      Inferno.render(<div dir={null} />, container);
      Inferno.render(<div dir={undefined} />, container);
      Inferno.render(<div />, container);
      Inferno.render(<div dir="ltr" />, container);
    });
	
	 it('handles multiple child updates without interference', function() {

      // ABCD
      Inferno.render(
        <div>
          <div key="one">
            <div key="A">A</div><div key="B">B</div>
          </div>
          <div key="two">
            <div key="C">C</div><div key="D">D</div>
          </div>
        </div>,
        container
      );
      // BADC
      Inferno.render(
        <div>
          <div key="one">
            <div key="B">B</div><div key="A">A</div>
          </div>
          <div key="two">
            <div key="D">D</div><div key="C">C</div>
          </div>
        </div>,
        container
      );

      expect(container.textContent).to.equal('BADC');
    });
	
	
	
	describe('should render value multiple attribute', () => {
		beforeEach(() => {
			Inferno.render((
					<select multiple={ true } value='foo'>
						<option value='foo'>I'm a li-tag</option>
						<option value='bar'>I'm a li-tag</option>
					</select>),
				container
			);
		});
		it('Initial render (creation)', () => {
			expect(get(container.firstChild)).to.eql(['foo']);
			expect(
				container.innerHTML
			).to.equal(
				`<select multiple="multiple"><option value="foo" selected="selected">I\'m a li-tag</option><option value="bar">I\'m a li-tag</option></select>`
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