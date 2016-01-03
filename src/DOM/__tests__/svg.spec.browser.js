import createDOMTree from '../createTree';
import { render, renderToString } from '../rendering';
import createTemplate from '../../core/createTemplate';
import { addTreeConstructor } from '../../core/createTemplate';
import TemplateFactory from '../../core/TemplateFactory';

addTreeConstructor( 'dom', createDOMTree );

const { createElement } = TemplateFactory;

describe( 'createTree - SVG', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	it('should set "class" attribute', () => {

		const template = createTemplate((val1) =>
			createElement('svg', {height: val1})
		);
		render(template(200), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');

		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('height')).to.eql('200');
		expect(
			container.innerHTML
		).to.equal(
			'<svg height="200"></svg>'
		);
	});

	describe('should set "class" attribute', () => {

		it('Second render (update)', () => {
			const template = createTemplate((val1) =>
				createElement('svg', {height: val1})
			);
			render(template(200), container);

			expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');

			expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
			expect(container.firstChild.getAttribute('height')).to.eql('200');
			expect(
				container.innerHTML
			).to.equal(
				'<svg height="200"></svg>'
			);
		});
	});

	it('should respect SVG namespace and render SVG attributes', () => {

		let template;

		template = createTemplate((val1) =>
			createElement('svg', {
				xmlns: 'http://www.w3.org/2000/svg',
				version: '1.1',
				baseProfile: 'full',
				width: '200',
				height: val1
			}, null)
		);
		render(template(200), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('xmlns')).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('version')).to.eql('1.1');
		expect(container.firstChild.getAttribute('baseProfile')).to.eql('full');
		expect(container.firstChild.getAttribute('width')).to.eql('200');

		expect(
			container.innerHTML
		).to.equal(
			'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" baseProfile="full" width="200" height="200"></svg>'
		)

		template = createTemplate(() =>
			createElement('svg', {width: 200}, null)
		);
		render(template(), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('width')).to.eql('200');
		expect(
			container.innerHTML
		).to.equal(
			'<svg width="200"></svg>'
		);

		render(template(), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('width')).to.eql('200');
		expect(
			container.innerHTML
		).to.equal(
			'<svg width="200"></svg>'
		);
	})



	it('should set SVG as default namespace for <svg>', () => {

		let template = createTemplate((val) => ({
			tag: 'svg'
		}));

		render(template("test.jpg"), container);
		expect(container.firstChild.namespaceURI).to.equal("http://www.w3.org/2000/svg");
		render(template("test.jpg"), container);
		expect(container.firstChild.namespaceURI).to.equal("http://www.w3.org/2000/svg");

		render(template("test.jpg"), container);
		expect(container.firstChild.namespaceURI).to.equal("http://www.w3.org/2000/svg");
		render(template("test.jpg"), container);
		expect(container.firstChild.namespaceURI).to.equal("http://www.w3.org/2000/svg");
	});

	it('should unset a namespaced attributes', () => {

		let template = createTemplate((val) => ({
			tag: 'image',
			attrs: {
				xmlns: "http://www.w3.org/2000/svg",
				"xlink:href": val
			}
		}));

		render(template("test.jpg"), container);
		expect(container.firstChild.getAttributeNS('http://www.w3.org/1999/xlink', "href")).to.equal("test.jpg");

		render(template(null), container);
		expect(container.firstChild.getAttributeNS('http://www.w3.org/1999/xlink', "href")).to.be.null;
	});

	it('should use the parent namespace by default (static)', () => {

		let template = createTemplate(() => ({
			tag: 'svg',
			children: {
				tag: 'circle'
			}
		}));

		render(template(), container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		render(template(), container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		render(template(), container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		render(template(), container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	});



	it('should fuck the world with the edge case ( static)', () => {

		let template = createTemplate((child) => ({
			tag: 'div',
			children:{
				tag: 'svg'

			}
		}));

		render(template(), container);

		//expect(container.firstChild.firstChild.tagName).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');


	})


	it('should fuck the world with the edge case ( dynamic )', () => {

		let child = createTemplate(() => ({
			tag: 'circle',
		}));

		let template = createTemplate((child) => ({
			tag: 'div',
			children:child
		}));

		render(template(child()), container);

		//expect(container.firstChild.firstChild.tagName).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');


	})


	it('should keep parent namespace ( dynamic)', () => {

		let child,
			template = createTemplate((child) => ({
				tag: 'svg',
				attrs: {
					xmlns: 'http://www.w3.org/2000/svg'
				},
				children: child
			}));

		child = createTemplate(() => ({
			tag: 'circle',
		}));

		render(template(child()), container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		child = createTemplate(() => ({
			tag: 'circle',
			attrs: {
				xmlns: 'http://www.w3.org/2000/svg'
			},
			children: {
				tag: 'circle',
				attrs: {
					xmlns: 'http://www.w3.org/2000/svg'
				}
			}
		}));

		render(template(child()), container);
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		child = createTemplate(() => ({
			tag: 'circle',
			children: {
				tag: 'circle',
				children: {
					tag: 'g',
					attrs: {
						xmlns: 'http://www.w3.org/2000/svg'
					}
				}
			}
		}));

		render(template(child()), container);
		expect(container.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		child = createTemplate(() => ({
			tag: 'circle',
			children: {
				tag: 'circle',
				children: {
					tag: 'g',
					children: {
						tag: 'g'
					}
				}
			}
		}));

		render(template(child()), container);
		expect(container.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		child = createTemplate(() => ({
			tag: 'circle',
			children: {
				tag: 'circle',
				children: {
					tag: 'g',
					children: {
						tag: 'g',
						children: {
							tag: 'circle'
						}

					}
				}

			}
		}));

		render(template(child()), container);
		expect(container.firstChild.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	})

	it('should set class attribute', () => {

		const template = createTemplate((val) => ({
			tag: 'image',
			attrs: {
				class: val,
			}
		}));

		render(template("foo"), container);
		expect(container.firstChild.getAttribute('class')).to.equal('foo');

		render(template('bar'), container);
		expect(container.firstChild.getAttribute('class')).to.equal('bar');
	});

	it('should respect SVG namespace and render SVG attributes', () => {


		const template = createTemplate((val1, val2) => ({
			tag: 'svg',
			attrs: {
				xmlns: 'http://www.w3.org/2000/svg',
				version: '1.1',
				baseProfile: 'full',
				width: val1,
				height: val2
			}
		}));

		render(template(200, 200), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('xmlns')).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('version')).to.eql('1.1');
		expect(container.firstChild.getAttribute('baseProfile')).to.eql('full');
		expect(container.firstChild.getAttribute('width')).to.eql('200');
		expect(container.firstChild.getAttribute('height')).to.eql('200');

		render(template(300, 300), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('xmlns')).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('version')).to.eql('1.1');
		expect(container.firstChild.getAttribute('baseProfile')).to.eql('full');
		expect(container.firstChild.getAttribute('width')).to.eql('300');
		expect(container.firstChild.getAttribute('height')).to.eql('300');
	});

	it('should set "viewBox" attribute', () => {

		const template = createTemplate(() => ({
			tag: 'svg',
			attrs: {
				xmlns: 'http://www.w3.org/2000/svg',
				viewBox: '0 0 50 20'
			}
		}));

		render(template(), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql("svg");
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute("xmlns")).to.eql("http://www.w3.org/2000/svg");
		expect(container.firstChild.getAttribute("viewBox")).to.eql('0 0 50 20');

		render(template(), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql("svg");
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute("xmlns")).to.eql("http://www.w3.org/2000/svg");
		expect(container.firstChild.getAttribute("viewBox")).to.eql('0 0 50 20');
	});

	it('should solve SVG edge when wrapped inside a non-namespace element ( static)', () => {

		let template = createTemplate(() => ({
			tag: 'div',
			children:{
				tag: 'svg'

			}
		}));

		render(template(), container);

		//expect(container.firstChild.firstChild.tagName).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

	})


	it('should solve SVG edge case with XMLNS attribute when wrapped inside a non-namespace element ( static)', () => {

		let template = createTemplate(() => ({
			tag: 'div',
			attrs: {
				xmlns: 'http://www.w3.org/2000/svg',
			},
			children:{
				tag: 'svg'

			}
		}));

		render(template(), container);

		//expect(container.firstChild.firstChild.tagName).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

	})




	it('should solve SVG edge when wrapped inside a non-namespace element ( static)', () => {

		let template = createTemplate(() => ({
			tag: 'div',
			children:{
				attrs: {
					xmlns: 'http://www.w3.org/2000/svg'
				},
				tag: 'svg'

			}
		}));

		render(template(), container);

		//expect(container.firstChild.firstChild.tagName).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

	})


	it('should solve SVG edge when wrapped inside a non-namespace element ( dynamic )', () => {

		let child = createTemplate(() => ({
			tag: 'circle',
		}));

		let template = createTemplate((child) => ({
			tag: 'div',
			children:child
		}));

		render(template(child()), container);

		//expect(container.firstChild.firstChild.tagName).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	})

	it('should diff from SVG namespace to mathML namespace ( dynamic )', () => {

		let child;

		let template = createTemplate((child) => ({
			tag: 'div',
			children:child
		}));


		child = createTemplate(() => ({
			tag: 'circle',
		}));
		render(template(child()), container);

		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		child = createTemplate(() => ({
			tag: 'math',
		}));
		render(template(child()), container);

		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');

	})
});