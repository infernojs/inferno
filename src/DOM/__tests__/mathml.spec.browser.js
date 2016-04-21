//import { updateKeyed } from './../domMutate';
//import createDOMTree from './../createTree';
//import { render, renderToString } from './../rendering';
//import createTemplate from './../../core/createTemplate';
//import { addTreeConstructor } from './../../core/createTemplate';
//
//addTreeConstructor('dom', createDOMTree);
//
//describe('mathML namespace', () => {
//
//	let container;
//
//	beforeEach(() => {
//		container = document.createElement('div');
//	});
//
//	afterEach(() => {
//		render(null, container);
//	});
//
//	it('should set MathML as default namespace for <math>', () => {
//
//		let template = createTemplate(() => ({
//			tag: 'math'
//		}));
//
//		render(template(), container);
//		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//
//		render(template(), container);
//		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//	});
//
//	it('should render MathML element with children', () => {
//
//		let template = createTemplate(() => ({
//			tag: 'math',
//			children: {
//				tag: 'mrow',
//				children: [
//					{ tag: 'mi', children: 'a' },
//					{ tag: 'mn', children: '2' }
//				]
//			}
//		}));
//
//		render(template(), container);
//		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//		render(template(), container);
//		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//	});
//
//	it('should solve mathML edge when wrapped inside a non-namespace element (static)', () => {
//
//		let template = createTemplate(() => ({
//			tag: 'div',
//			children: {
//				tag: 'math',
//				children: ['{}']
//			}
//		}));
//
//		render(template(), container);
//		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//		render(template(), container);
//		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//
//	});
//
//	it('should solve mathML edge when wrapped inside a non-namespace element (dynamic)', () => {
//
//		let child = createTemplate(() => ({
//			tag: 'math'
//		}));
//
//		let template = createTemplate((child) => ({
//			tag: 'div',
//			children: child
//		}));
//
//		render(template(child()), container);
//		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//		render(template(null), container);
//		render(template(child()), container);
//		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//		render(template(null), container);
//	});
//
//	/**
//	 * This is an edge case, and will turn out wrong for the end-dev because of stupidity, but at
//	 * least the correct namespace is kept all the way down to the last element.
//	 * */
//	it('should solve mathML edge when wrapped inside multiple non-namespace element children (dynamic)', () => {
//
//		let child = createTemplate(() => ({
//			tag: 'math',
//			children: {
//				tag: 'span',
//				children: {
//					tag: 'mo'
//				}
//			}
//		}));
//
//		let template = createTemplate((child) => ({
//			tag: 'div',
//			children: child
//		}));
//
//		render(template(null), container);
//		render(template(child()), container);
//		expect(container.firstChild.tagName).to.equal('DIV');
//		expect(container.firstChild.firstChild.tagName.toLowerCase()).to.equal('math');
//		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('span');
//		expect(container.firstChild.firstChild.firstChild.firstChild.tagName.toLowerCase()).to.equal('mo');
//		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//		expect(container.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//		expect(container.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//		expect(container.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//		render(template(undefined), container);
//		render(template([]), container);
//		render(template('123'), container);
//		render(null, container);
//		render(template(child()), container);
//		expect(container.firstChild.tagName).to.equal('DIV');
//		expect(container.firstChild.firstChild.tagName.toLowerCase()).to.equal('math');
//		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('span');
//		expect(container.firstChild.firstChild.firstChild.firstChild.tagName.toLowerCase()).to.equal('mo');
//		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//		expect(container.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//		expect(container.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//		expect(container.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/1998/Math/MathML');
//	});
//});
