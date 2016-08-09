import { render } from './../../DOM/rendering';
import createElement from './../createElement';

describe('CreateElement should handle events', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	it('Should handle events correctly when having multiple children', () => {
		let triggered = false;

		const App = props => {
			return createElement('div', null,
				createElement('div', { className: 'title' }, 'Example'),
				createElement('button', {
					type: 'button',
					onClick: () => {
						triggered = !triggered;
					}
				}, 'Do a thing')
			)
		};

		render(App(), container);
		expect(container.innerHTML).to.equal('<div><div class="title">Example</div><button type="button">Do a thing</button></div>');
		expect(triggered).to.equal(false);

		const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
		buttons.forEach(button => button.click());

		expect(triggered).to.equal(true);
	});

	it('Should handle events correctly when having single child', () => {
		let triggered = false;

		const App = props => {
			return createElement('div', null,
				createElement('button', {
					type: 'button',
					onClick: () => {
						triggered = !triggered;
					}
				}, 'Do a thing')
			)
		};

		render(App(), container);
		expect(container.innerHTML).to.equal('<div><button type="button">Do a thing</button></div>');
		expect(triggered).to.equal(false);

		const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
		buttons.forEach(button => button.click());

		expect(triggered).to.equal(true);
	});

	it('Should handle events correctly when patching', () => {
		let triggered = false;

		render(createElement('button', {}, 'Click Me'), container);
		render(createElement('button', { onclick: () => (triggered = true) }, 'Click Me'), container);
		expect(triggered).to.equal(false);

		const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
		buttons.forEach(button => button.click());

		expect(triggered).to.equal(true);
	});
});
