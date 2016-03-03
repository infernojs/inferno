import { render } from '../../DOM/rendering';
import Component from '../../component';
import waits from '../../../tools/waits';
import innerHTML from '../../../tools/innerHTML';

describe('Async rendering (JSX)', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	describe('When handling functions that return a promise', () => {
		it('rootNodeWithDynamicChild - create()', (done) => {
			function getValue() {
				return new Promise((resolve, reject) => {
					resolve(<span>Hello world!</span>);
				});
			}
			render(<div>{ getValue() }</div>, container);

			requestAnimationFrame(() => {
				expect(container.firstChild.tagName).to.equal('DIV');
				expect(container.firstChild.firstChild.tagName).to.equal('SPAN');
				expect(container.firstChild.firstChild.textContent).to.equal('Hello world!');
				done();
			});
		});
		it('createRootNodeWithDynamicChild - update()', (done) => {
			function getValue() {
				return new Promise((resolve, reject) => {
					resolve(<span>Hello world!</span>);
				});
			}
			render(<div><span></span></div>, container);
			render(<div>{ getValue() }</div>, container);

			requestAnimationFrame(() => {
				expect(container.firstChild.tagName).to.equal('DIV');
				expect(container.firstChild.firstChild.tagName).to.equal('SPAN');
				expect(container.firstChild.firstChild.textContent).to.equal('Hello world!');
				done();
			});
		});
		it('nodeWithDynamicChild - create()', (done) => {
			function getValue() {
				return new Promise((resolve, reject) => {
					resolve(<span>Hello world!</span>);
				});
			}
			render(<div><div>{ getValue() }</div></div>, container);

			requestAnimationFrame(() => {
				expect(container.firstChild.firstChild.tagName).to.equal('DIV');
				expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
				expect(container.firstChild.firstChild.firstChild.textContent).to.equal('Hello world!');
				done();
			});
		});
		it('createRootNodeWithDynamicChild - update()', (done) => {
			function getValue() {
				return new Promise((resolve, reject) => {
					resolve(<span>Hello world!</span>);
				});
			}
			render(<div><span></span></div>, container);
			render(<div>{ getValue() }</div>, container);

			requestAnimationFrame(() => {
				expect(container.firstChild.tagName).to.equal('DIV');
				expect(container.firstChild.firstChild.tagName).to.equal('SPAN');
				expect(container.firstChild.firstChild.textContent).to.equal('Hello world!');
				done();
			});
		});
		it('dynamicNode - create()', (done) => {
			function getValue() {
				return new Promise((resolve, reject) => {
					resolve(<span>Hello world!</span>);
				});
			}
			render(<div><div>{ getValue() } test</div></div>, container);

			requestAnimationFrame(() => {
				expect(container.firstChild.tagName).to.equal('DIV');
				expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
				expect(container.firstChild.firstChild.firstChild.textContent).to.equal('Hello world!');
				done();
			});
		});
	});
});
