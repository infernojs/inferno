import { createTemplate, createVNode }from '../../../src/core/createTemplate';
import { createUniversalElement } from '../../../src/core/universal';

export default {
	createTemplate,
	createVNode,
	universal: {
		createElement: createUniversalElement
	}
};
