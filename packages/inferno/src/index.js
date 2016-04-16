import { createBlueprint, createVNode }from '../../../src/core/createBlueprint';
import { createUniversalElement } from '../../../src/core/universal';

export default {
	createBlueprint,
	createVNode,
	universal: {
		createElement: createUniversalElement
	}
};
