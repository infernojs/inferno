import { expect } from 'chai';
import { VNode } from '../dist-es/core/VNodes';
import { internal_normalize as normalize } from '../';

describe('normalizeProps', () => {
	it('should delete ref from props', () => {
		const vNode: VNode = {
			children: null,
			dom: null,
			events: null,
			flags: 0,
			key: null,
			props: { ref: () => {} },
			ref: null,
			type: null
		};

		normalize(vNode);

		expect(vNode.props).to.not.have.property('ref');
	});

	it('should delete key from props', () => {
		const vNode: VNode = {
			children: null,
			dom: null,
			events: null,
			flags: 0,
			key: null,
			props: { key: 'key' },
			ref: null,
			type: null
		};

		normalize(vNode);

		expect(vNode.props).to.not.have.property('key');
	});
});
