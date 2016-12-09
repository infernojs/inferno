import { expect } from 'chai';
import { render } from '../../DOM/rendering';
import h from '../hyperscript';
import { innerHTML } from '../../tools/utils'
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

	it('Should handle a hooks example #1', () => {
		const Component = ({ children }) => {
			return h('div', children);
		};
		const ComponentHooks = () => h(Component, {
			hooks: {
				onComponentDidUnmount() {
				},
			},
			children: 'Hello world!'
		});

		render(
			h(ComponentHooks),
			container
		);
		expect(container.innerHTML).to.equal('<div>Hello world!</div>');
	});

	it('Should handle different props (key, class, id, ref, children)', () => {
		const ComponentHooks = () => h('div#myId.test', {
			onComponentDidMount() {
			},
			key: 'myKey',
			ref: (c) => c,
			className: 'myClass',
			children: 'Hello world!'
		});

		render(
			h(ComponentHooks),
			container
		);
		expect(container.innerHTML).to.equal(innerHTML('<div class="test myClass" id="myId">Hello world!</div>'));
	});

	it('Should handle tag with no name', () => {
		const ComponentHooks = () => h('', { children: 'Hello world!' });
		render(
			h(ComponentHooks),
			container
		);
		expect(container.innerHTML).to.equal('<div>Hello world!</div>');
	});

	it('Should handle tag with no tag name but id is present', () => {
		const ComponentHooks = () => h('#myId');
		render(
			h(ComponentHooks),
			container
		);
		expect(container.innerHTML).to.equal('<div id="myId"></div>');
	});

});
