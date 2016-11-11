import { expect } from 'chai';
import { render } from '../../DOM/rendering';
import h from '../hyperscript';
import { TEXT } from '../../core/ChildrenTypes';

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
		const ComponentHooks = () => h('div', {
			hooks: {
				onComponentDidUnmount() {
					console.log('onComponentDidUnmount');
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

	it('Should handle different props (key, class, id, ref, children, childrenType)', () => {
		const ComponentHooks = () => h('div#myId.test', {
			onComponentDidMount() {
				console.log('onComponentDidMount');
			},
			key: 'myKey',
			ref: (c) => c,
			className: 'myClass',
			childrenType: TEXT,
			children: 'Hello world!'
		});

		render(
			h(ComponentHooks),
			container
		);
		expect(container.innerHTML).to.equal('<div class="test myClass" id="myId">Hello world!</div>');
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
		const ComponentHooks = () => h('#myId',);
		render(
			h(ComponentHooks),
			container
		);
		expect(container.innerHTML).to.equal('<div></div>');
	});

});
