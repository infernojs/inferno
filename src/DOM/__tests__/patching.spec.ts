import {expect} from 'chai';
import {render} from './../rendering';
import {createVNode, VNodeFlags, createTextVNode} from "../../core/shapes";

describe('patching routine', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	// TODO: Try to cover patching lastVNode !== nextVNode. requires no normalise and hoisting
	it('Should do nothing if lastVNode strictly equals nextVnode', () => {
		const vNode = createVNode(
			VNodeFlags.HtmlElement,
			'span',
			null,
			createVNode(
				VNodeFlags.HtmlElement,
				'span',
				null,
				createTextVNode('a'),
				null,
				null,
				false
			),
			null,
			null,
			false
		);

		render(vNode, container);
		expect(container.innerHTML).to.eql('<span><span>a</span></span>');

		render(vNode, container);
		expect(container.innerHTML).to.eql('<span><span>a</span></span>');
	});

	// TODO: Try to make lastVNode have invalid flags
	it('Should mount nextNode if lastNode crashed', () => {
		const validNode = createVNode(
			VNodeFlags.HtmlElement,
			'span',
			null,
			createTextVNode('a'),
			null,
			null,
			false
		);
		const invalidNode = createVNode(0, 'span');
		debugger;
		render(validNode, container);
		debugger;
		try {
			render(invalidNode, container);
		} catch (e) {
			expect(e.message).to.eql('Inferno Error: mount() expects a valid VNode, instead it received an object with the type "object".');
		}
		expect(container.innerHTML).to.eql('<span>a</span>');

		render(validNode, container);
		expect(container.innerHTML).to.eql('<span>a</span>')
	});
});
