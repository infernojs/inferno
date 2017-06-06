import { internal_normalize as normalize } from 'inferno';

describe('normalizeProps', () => {
	it('should delete ref from props', () => {
		const vNode = {
			children: null,
			dom: null,
			events: null,
			flags: 0,
			key: null,
			props: {
				ref: () => {},
			},
			ref: null,
			type: null,
		};

		normalize(vNode);

		expect(vNode.props).not.toHaveProperty('ref');
	});

	it('should delete key from props', () => {
		const vNode = {
			children: null,
			dom: null,
			events: null,
			flags: 0,
			key: null,
			props: { key: 'key' },
			ref: null,
			type: null,
		};

		normalize(vNode);

		expect(vNode.props).not.toHaveProperty('key');
	});
});
