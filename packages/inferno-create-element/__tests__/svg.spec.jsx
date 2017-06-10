
import { render } from 'inferno';
import { innerHTML } from 'inferno-utils';

describe('createTree - SVG (JSX)', () => {

	let container;

	beforeEach(function () {
		container = document.createElement('div');
	});

	afterEach(function () {
		render(null, container);
	});

	it('should render svg as <svg>', () => {
		render(null, container);
		render(<svg/>, container);
		expect(innerHTML(container.innerHTML)).to.equal(innerHTML('<svg></svg>'));
	});

	it('should use the parent namespace by default', () => {
		render(null, container);
		render(<svg xmlns="http://www.w3.org/2000/svg">
			<circle xmlns="http://www.w3.org/2000/svg"/>
		</svg>, container);
		expect(innerHTML(container.firstChild.firstChild.tagName)).to.equal('circle');
		expect(
			innerHTML(
				container.firstChild.getAttribute('xmlns')
			)
		).to.equal('http://www.w3.org/2000/svg');

		render(null, container);
		expect(container.innerHTML).to.equal('');
	});

	it('should keep parent namespace', () => {

		render(<svg xmlns="http://www.w3.org/2000/svg">
			<circle/>
		</svg>, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		render(null, container);
		render(<svg width="100" height="100">
			<g>
				<circle cx="50" cy="50" r="40" stroke="green" fill="yellow"/>
			</g>
			<g>
				<g>
					<circle cx="50" cy="50" r="40" stroke="green" fill="yellow"/>
				</g>
			</g>
		</svg>, container);
		expect(container.childNodes[ 0 ].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[ 0 ].childNodes[ 0 ].tagName).to.equal('g');
		expect(container.childNodes[ 0 ].childNodes[ 0 ].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[ 0 ].childNodes[ 0 ].firstChild.tagName).to.equal('circle');
		expect(container.childNodes[ 0 ].childNodes[ 0 ].firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		expect(container.childNodes[ 0 ].childNodes[ 1 ].tagName).to.equal('g');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].firstChild.tagName).to.equal('g');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].firstChild.firstChild.tagName).to.equal('circle');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		render(<svg xmlns="http://www.w3.org/2000/svg">
			<circle/>
		</svg>, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

	});

	it('should keep parent namespace with xmlns attribute', () => {

		render(<svg xmlns="http://www.w3.org/2000/svg">
			<circle/>
		</svg>, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		render(<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
			<g>
				<circle xmlns="http://www.w3.org/2000/svg" cx="50" cy="50" r="40" stroke="green" fill="yellow"/>
			</g>
			<g>
				<circle xmlns="http://www.w3.org/2000/svg" cx="50" cy="50" r="40" stroke="green" fill="yellow"
								foo={ undefined }/>
			</g>
		</svg>, container);
		expect(container.childNodes[ 0 ].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[ 0 ].childNodes[ 0 ].tagName).to.equal('g');
		expect(container.childNodes[ 0 ].childNodes[ 0 ].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[ 0 ].childNodes[ 0 ].firstChild.tagName).to.equal('circle');
		expect(container.childNodes[ 0 ].childNodes[ 0 ].firstChild.getAttribute('xmlns')).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[ 0 ].childNodes[ 0 ].firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		expect(container.childNodes[ 0 ].childNodes[ 1 ].tagName).to.equal('g');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].firstChild.tagName).to.equal('circle');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].firstChild.getAttribute('xmlns')).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[ 0 ].childNodes[ 1 ].firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	});

	it('should set and remove dynamic class property', () => {

		const value = 'foo';

		render(<svg className={ value }/>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.getAttribute('class')).to.equal('foo');

		render(<svg/>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.hasAttribute('class')).to.equal(false);

	});

	it('should set and remove dynamic class attribute', () => {

		const value = 'foo';

		render(<svg className={ value }/>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.getAttribute('class')).to.equal('foo');

		render(<svg/>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.hasAttribute('class')).to.equal(false);

	});

	it('should set static class attribute, update to dynamic attr, and remove', () => {

		render(<svg className={ null }/>, container);
		render(<svg className={ {}}/>, container);
		render(<svg className="bar"/>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.getAttribute('class')).to.equal('bar');

		const value = 'foo';

		render(<svg className={ value }/>, container);
		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.getAttribute('class')).to.equal('foo');

		render(<svg/>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.hasAttribute('class')).to.equal(false);

	});

	it('should remove known SVG camel case attributes', () => {

		render(<svg viewBox="0 0 100 100"/>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.hasAttribute('viewBox')).to.equal(true);

		render(<svg/>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.hasAttribute('viewBox')).to.equal(false);
	});

	it('should remove arbitrary SVG camel case attributes', () => {

		render(<svg theWord="theBird"/>, container);

		expect(container.firstChild.hasAttribute('theWord')).to.equal(true);
		render(<svg />, container);
		expect(container.firstChild.hasAttribute('theWord')).to.equal(false);
	});

	it('should remove namespaced SVG attributes', () => {

		render(<svg clip-path="0 0 110 110"/>, container);

		expect(container.firstChild.tagName).to.eql('svg');

		expect(container.firstChild.hasAttribute('clip-path')).to.equal(true);

		render(<svg>
			<image />
		</svg>, container);

		expect(container.firstChild.firstChild.hasAttributeNS(
			'http://www.w3.org/1999/xlink',
			'href'
		)).to.equal(false);
	});

	it('should remove namespaced SVG attributes', () => {

		render(<svg clip-path="0 0 110 110"/>, container);

		expect(container.firstChild.tagName).to.eql('svg');

		expect(container.firstChild.hasAttribute('clip-path')).to.equal(true);

		render(<svg>
			<image />
		</svg>, container);

		expect(container.firstChild.firstChild.hasAttributeNS(
			'http://www.w3.org/1999/xlink',
			'href'
		)).to.equal(false);
	});

	it('Should make SVG and children with spread attribute', () => {
		const spread = { id: 'test' };

		render(<svg {...spread}/>, container);
		expect(
			innerHTML(
				container.innerHTML
			)
		).to.equal(
			innerHTML(
				'<svg id="test"></svg>'
			)
		);
	});

});
