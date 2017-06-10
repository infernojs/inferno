
import { render } from 'inferno';
import createElement from 'inferno-create-element';
import { innerHTML } from 'inferno-utils';

describe('CreateElement (non-JSX)', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		container.innerHTML = '';
		document.body.removeChild(container);
	});

	it('Should handle events correctly when having multiple children', () => {
		let triggered = false;

		const App = () => {
			return createElement('div', null,
				createElement('div', { className: 'title' }, 'Example'),
				createElement('button', {
					type: 'button',
					onClick: () => {
						triggered = !triggered;
					}
				}, 'Do a thing')
			);
		};

		// eslint-disable-next-line
		render(App(), container);
		expect(container.innerHTML).to.equal(innerHTML('<div><div class="title">Example</div><button type="button">Do a thing</button></div>'));
		expect(triggered).to.equal(false);

		const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
		buttons.forEach((button) => button.click());

		expect(triggered).to.equal(true);
	});

	it('Should handle events correctly when having single child', () => {
		let triggered = false;

		const app = () => {
			return createElement('div', null,
				createElement('button', {
					type: 'button',
					onClick: () => {
						triggered = !triggered;
					}
				}, 'Do a thing')
			);
		};

		render(app(), container);
		expect(container.innerHTML).to.equal(innerHTML('<div><button type="button">Do a thing</button></div>'));
		expect(triggered).to.equal(false);

		const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
		buttons.forEach((button) => button.click());

		expect(triggered).to.equal(true);
	});

	it('Should allow passing childs through "children" property (native component)', () => {
		const app = () => {
			return createElement('div', null,
				createElement('button', {
					type: 'button',
					children: ['Do a thing']
				})
			);
		};

		render(app(), container);
		expect(container.innerHTML).to.equal(innerHTML('<div><button type="button">Do a thing</button></div>'));
	});

	it('Should allow passing childs through "children" property (custom component)', () => {
		const Button = (props) => createElement('button', props);
		const app = () => {
			return createElement('div', null,
				createElement(Button, {
					type: 'button',
					children: ['Do a thing']
				})
			);
		};

		render(app(), container);
		expect(container.innerHTML).to.equal(innerHTML('<div><button type="button">Do a thing</button></div>'));
	});

	it('Should handle node with hooks and key', (done) => {

		const node = () => createElement('div', { key: 'key2' }, 'Hooks');
		const app = createElement(node, {
			key: 'key1',
			onComponentDidMount(domNode) {
				expect(app.key).to.equal('key1');
				expect(domNode.tagName).to.equal('DIV');
				done();
			}
		});

		render(app, container);
		expect(container.innerHTML).to.equal(innerHTML('<div>Hooks</div>'));
	});

	it('Should handle node with children but no props', () => {

		const node = () => createElement('div', null, 'Hooks');
		const app = createElement(node, null, 'Hooks');

		render(app, container);
		expect(container.innerHTML).to.equal(innerHTML('<div>Hooks</div>'));
	});

	it('Should throw with invalid name', () => {
		expect(() => createElement({}, null)).to.throw(Error);
	});

	it('Should handle node with refs', (done) => {
		let myRef = 'myRef';

		const app = () => {
			const node = () => createElement('a', {
				ref: (c) => (myRef = c)
			});
			return createElement(node, {
				onComponentDidMount() {
					expect(myRef.tagName).to.equal('A');
					done();
				}
			});
		};
		render(createElement(app, null), container);
	});
});
