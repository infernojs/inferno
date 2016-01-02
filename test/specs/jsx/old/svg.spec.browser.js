import Inferno from '../../../../packages/inferno/src/';
import InfernoDOM from '../../../../packages/inferno-dom/src/';

// WHY would we need this??

import { addTreeConstructor } from '../../../../src/core/createTemplate';
import createDOMTree from '../../../../src/DOM/createTree';

addTreeConstructor( 'dom', createDOMTree );

describe( 'SVG (JSX)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		InfernoDOM.render(null, container);
	});

	it('should set SVG as default namespace for <svg>', () => {
		InfernoDOM.render(<svg></svg>, container);
		expect(container.firstChild.namespaceURI).to.equal("http://www.w3.org/2000/svg");
	});

	it('should use the parent namespace by default', () => {
		InfernoDOM.render(<svg><circle/></svg>, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		InfernoDOM.render(<svg><circle/></svg>, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	});

	it('should keep parent namespace', () => {

		InfernoDOM.render(<svg xmlns='http://www.w3.org/2000/svg'><circle/></svg>, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		InfernoDOM.render(<svg width="100" height="100">
			<g><circle cx="50" cy="50" r="40" stroke="green" fill="yellow" /></g>
			<g><g><circle cx="50" cy="50" r="40" stroke="green" fill="yellow" /></g></g>
		</svg>, container);
		expect(container.childNodes[0].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[0].childNodes[0].tagName).to.equal('g');
		expect(container.childNodes[0].childNodes[0].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[0].childNodes[0].firstChild.tagName).to.equal('circle');
		expect(container.childNodes[0].childNodes[0].firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		expect(container.childNodes[0].childNodes[1].tagName).to.equal('g');
		expect(container.childNodes[0].childNodes[1].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[0].childNodes[1].firstChild.tagName).to.equal('g');
		expect(container.childNodes[0].childNodes[1].firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[0].childNodes[1].firstChild.firstChild.tagName).to.equal('circle');
		expect(container.childNodes[0].childNodes[1].firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		InfernoDOM.render(<svg xmlns='http://www.w3.org/2000/svg'><circle/></svg>, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

	});

	it('should keep parent namespace with xmlns attribute', () => {

		InfernoDOM.render(<svg xmlns='http://www.w3.org/2000/svg'><circle/></svg>, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		InfernoDOM.render(<svg width="100" height="100" xmlns='http://www.w3.org/2000/svg'>
			<g><circle xmlns='http://www.w3.org/2000/svg' cx="50" cy="50" r="40" stroke="green" fill="yellow" /></g>
			<g><circle xmlns='http://www.w3.org/2000/svg' cx="50" cy="50" r="40" stroke="green" fill="yellow" /></g>
		</svg>, container);
		expect(container.childNodes[0].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[0].childNodes[0].tagName).to.equal('g');
		expect(container.childNodes[0].childNodes[0].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[0].childNodes[0].firstChild.tagName).to.equal('circle');
		expect(container.childNodes[0].childNodes[0].firstChild.getAttribute('xmlns')).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[0].childNodes[0].firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		expect(container.childNodes[0].childNodes[1].tagName).to.equal('g');
		expect(container.childNodes[0].childNodes[1].namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[0].childNodes[1].firstChild.tagName).to.equal('circle');
		expect(container.childNodes[0].childNodes[1].firstChild.getAttribute('xmlns')).to.equal('http://www.w3.org/2000/svg');
		expect(container.childNodes[0].childNodes[1].firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	})


	it('should set and remove dynamic className property', () => {

		let value = 'foo';

		InfernoDOM.render(<svg className={value}></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.getAttribute('class')).to.equal('foo');

		InfernoDOM.render(<svg></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.hasAttribute('class')).to.be.false;

	});

	it('should set and remove dynamic class attribute', () => {

		let value = 'foo';

		InfernoDOM.render(<svg class={value}></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.getAttribute('class')).to.equal('foo');

		InfernoDOM.render(<svg></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.hasAttribute('class')).to.be.false;

	});

	it('should set static class attribute, update to dynamic attr, and remove', () => {

		InfernoDOM.render(<svg class='bar'></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.getAttribute('class')).to.equal('bar');

		let value = 'foo';

		InfernoDOM.render(<svg class={value}></svg>, container);
		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.getAttribute('class')).to.equal('foo');

		InfernoDOM.render(<svg></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.hasAttribute('class')).to.be.false;

	});

	it('should remove known SVG camel case attributes', () => {

		InfernoDOM.render(<svg viewBox="0 0 100 100"></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.hasAttribute('viewBox')).to.be.true;

		InfernoDOM.render(<svg></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.hasAttribute('viewBox')).to.be.false;
	});

	it('should remove namespaced SVG attributes', () => {

		InfernoDOM.render(<svg><image xlinkHref="http://i.imgur.com/w7GCRPb.png" /></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.firstChild.hasAttributeNS(
			'http://www.w3.org/1999/xlink',
			'href'
		)).to.be.true;

		InfernoDOM.render(<svg><image /></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.firstChild.hasAttributeNS(
			'http://www.w3.org/1999/xlink',
			'href'
		)).to.be.false;
	});

	it('should remove arbitrary SVG camel case attributes', () => {

		InfernoDOM.render(<svg theWord="theBird" />, container);

		expect(container.firstChild.hasAttribute('theWord')).to.be.true;
		InfernoDOM.render(<svg />, container);
		expect(container.firstChild.hasAttribute('theWord')).to.be.false;
	});

	it('should update namespaced SVG attributes', () => {

		InfernoDOM.render(<svg><image xlinkHref="http://i.imgur.com/w7GCRPb.png" /></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.firstChild.hasAttributeNS(
			'http://www.w3.org/1999/xlink',
			'href'
		)).to.be.true;

		InfernoDOM.render(<svg><image xlinkHref="http://i.imgur.com/JvqCM2p.png" /></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');
		expect(container.firstChild.firstChild.getAttributeNS(
			'http://www.w3.org/1999/xlink',
			'href'
		)).to.equal('http://i.imgur.com/JvqCM2p.png');
	});

	it('should remove namespaced SVG attributes', () => {

		InfernoDOM.render(<svg clipPath="0 0 110 110"></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');

		expect(container.firstChild.hasAttribute('clip-path')).to.be.true;

		InfernoDOM.render(<svg><image /></svg>, container);

		expect(container.firstChild.firstChild.hasAttributeNS(
			'http://www.w3.org/1999/xlink',
			'href'
		)).to.be.false;
	});


	it('should remove namespaced SVG attributes', () => {

		InfernoDOM.render(<svg clipPath="0 0 110 110"></svg>, container);

		expect(container.firstChild.tagName).to.eql('svg');

		expect(container.firstChild.hasAttribute('clip-path')).to.be.true;

		InfernoDOM.render(<svg><image /></svg>, container);

		expect(container.firstChild.firstChild.hasAttributeNS(
			'http://www.w3.org/1999/xlink',
			'href'
		)).to.be.false;
	});


	it('should render a basic component with SVG', () => {
		class Component extends Inferno.Component {
			constructor(props) {
				super(props);
			}
			render() {
				return (
					<svg class="alert-icon">
						<use xlinkHref="#error"></use>
					</svg>
				)
			}
		}

		InfernoDOM.render(<Component />, container);

		expect(
			container.innerHTML
		).to.equal(
			'<svg class="alert-icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#error"></use></svg>'
		);

		InfernoDOM.render(<Component />, container);

		expect(
			container.innerHTML
		).to.equal(
			'<svg class="alert-icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#error"></use></svg>'
		);
	});
});
