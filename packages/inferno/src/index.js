import createElement from '../../../src/core/createElement';
import { createTemplate, createVNode }from '../../../src/core/createTemplate';
import { createUniversalElement } from '../../../src/core/universal';

export default {
	createElement,
	createTemplate,
	createVNode,
	universal: {
		createElement: createUniversalElement
	}
};
