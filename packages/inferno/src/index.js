import createElement from '../../../src/core/createElement';
import createTemplate from '../../../src/core/createTemplate';
import { createUniversalElement } from '../../../src/core/universal';

export default {
	createElement,
	createTemplate,
	universal: {
		createElement: createUniversalElement
	}
};
