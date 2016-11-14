import {expect} from 'chai';
import {render} from './../rendering';
import {createVNode, VNodeFlags, createTextVNode} from "../../core/shapes";
import {disableRecycling, recyclingEnabled, enableRecycling} from "../recycling";

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
		const yar = createVNode(2, 'div', null, '123', null, null, true);
		const bar = createVNode(2, 'div', null, '123', null, null, true);
		let foo = createVNode(2, 'div', null, [bar, yar], null, null, true);

		render(foo, container);
		expect(container.innerHTML).to.eql('<div><div>123</div><div>123</div></div>');

		foo = createVNode(2, 'div', null, [bar, yar], null, null, true);

		render(foo, container);
		expect(container.innerHTML).to.eql('<div><div>123</div><div>123</div></div>');
	});

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

		render(validNode, container);
		try {
			render(invalidNode, container);
		} catch (e) {
			expect(e.message).to.eql('Inferno Error: mount() expects a valid VNode, instead it received an object with the type "object".');
		}
		expect(container.innerHTML).to.eql('<span>a</span>');

		render(validNode, container);
		expect(container.innerHTML).to.eql('<span>a</span>');
	});

	it('Patch operation when nextChildren is NOT Invalid/Array/StringOrNumber/VNode', () => {
		const validNode = createVNode(
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

		const invalidChildNode = createVNode(
			VNodeFlags.HtmlElement,
			'span',
			null,
			createVNode(0, 'span'),
			null,
			null,
			false
		);

		render(validNode, container);
		render(invalidChildNode, container);
	});

	it('Should not access real DOM property when text does not change', () => {
		render(createTextVNode('a'), container);
		expect(container.innerHTML).to.eql('a');
		render(createTextVNode('a'), container);
		expect(container.innerHTML).to.eql('a');
	});
});

describe('Recyling', () => {
	it('Should be possible to disable it', () => {
		expect(recyclingEnabled).to.eql(true);
		disableRecycling();
		expect(recyclingEnabled).to.eql(false);
		enableRecycling();
		expect(recyclingEnabled).to.eql(true);
	})
});
