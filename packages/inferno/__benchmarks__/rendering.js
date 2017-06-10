import { createTextVNode, createVNode } from '../dist-es/core/VNodes';
import { render } from '../dist-es/index';

suite('Rendering', () => {
	let container = document.createElement('div');
	let emptyFn = function () {};

	benchmark('Render Single div', () => {
		render(createVNode(2, 'div', null, null), container);
	});

	benchmark('Render and unmount single node with attributes and events', () => {
		render(createVNode(2, 'div', 'foobar', null, { id: 'test', 'data-attribute': 'foo', second: 'bar', onClick: emptyFn }, null), container);
		render(null, container);
	});

	benchmark('Render patch and unmount single node with attributes and events', () => {
		render(createVNode(2, 'div', 'foobar', null, { id: 'test', 'data-attribute': 'foo', second: 'bar', onClick: emptyFn }, null), container);
		render(createVNode(2, 'div', 'foobar2', null, { id: 'test', XXX: '2', second: 'test', onClick: null }, null), container);
		render(null, container);
	});

});
