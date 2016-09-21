import { render } from '../../DOM/rendering';
import h from '../hyperscript';

describe('HyperScript (non-JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	it('Should handle a basic example', () => {
		render(
			h('div'),
			container
		);
		expect(container.innerHTML).to.equal('<div></div>');
	});

	it('Should handle a basic example #2', () => {
		render(
			h('div', 'Hello world!'),
			container
		);
		expect(container.innerHTML).to.equal('<div>Hello world!</div>');
	});

	it('Should handle a basic example #3', () => {
		render(
			h('div', { className: 'foo' }, 'Hello world!'),
			container
		);
		expect(container.innerHTML).to.equal('<div class="foo">Hello world!</div>');
	});

	const StatelesComponent = () => h('div', 'Hello world!');

	it('Should handle a basic example #4', () => {
		render(
			h(StatelesComponent),
			container
		);
		expect(container.innerHTML).to.equal('<div>Hello world!</div>');
	});
});