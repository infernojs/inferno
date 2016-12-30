import { normalize } from './../../core/normalization';

suite('normalize benchmark', () => {
	const vNode = {
		children: null,
		dom: null,
		events: null,
		flags: 0,
		key: null,
		props: null,
		ref: null,
		type: null
	};

	benchmark('normalize should be quick', () => {
		normalize(vNode);
	});
});
