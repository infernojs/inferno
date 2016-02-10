import createElement from '../../../src/core/createElement';
import { createStaticElement } from '../../../src/core/static';

export default {
	createElement,
	staticCompiler: {
		createElement: createStaticElement
	}
};
