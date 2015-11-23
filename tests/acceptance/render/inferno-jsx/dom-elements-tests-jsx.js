import get from '../../../tools/get';
import Inferno from '../../../../src';

export default function domElementsTestsJsx(describe, expect, container) {
	
	
	[{
    creationName: 'should render a "div" tag - creation',
    creationRender: <div></div>,
    creationExpect: '<div></div>',
    updateName: 'should render a "span" tag - update',
    updateRender: <span></span>,
    updateExpect: '<span></span>'
},
{
    creationName: 'should render a "div" tag with a text node - creation',
    creationRender: <div>Hello world</div>,
    creationExpect: '<div>Hello world</div>',
    updateName: 'should render a "span" tag with a text node - update',
    updateRender: <div>Hello world 2</div>,
    updateExpect: '<div>Hello world 2</div>'
},
{
    creationName: 'should render "autoFocus" boolean attribute - creation',
    creationRender: <div autoFocus='true' />,
    creationExpect: '<div autofocus="true"></div>',
    updateName: 'should render "className" attribute - update',
    updateRender: <div className='fooBar' />,
    updateExpect: '<div class="fooBar"></div>'
},
{
    creationName: 'should set values as properties by default - creation',
    creationRender: <input title='Tip!' />,
    creationExpect: '<input title="Tip!">',
    updateName: 'should render value multiple attribute - update',
    updateRender: <div>Hello world 2</div>,
    updateExpect: '<div>Hello world 2</div>'
}].forEach((obj) => {
    it(obj.creationName, () => {
        Inferno.render(obj.creationRender, container)
        expect(container.innerHTML).to.eql(obj.creationExpect);
    });
    it(obj.updateName, () => {
        Inferno.render(obj.updateRender, container)
        expect(container.innerHTML).to.eql(obj.updateExpect);
    });
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
		beforeEach(() => {
			Inferno.render(<div className='Dominic rocks!' />, container);
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
		beforeEach(() => {
			Inferno.render(<input title='Tip!' />, container);
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
				`<select multiple=""><option value="foo">I'm a li-tag</option><option value="bar">I'm a li-tag</option></select>`
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
}
