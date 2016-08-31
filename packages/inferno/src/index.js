import {
	createVTemplate,
	createVComponent,
	createVFragment,
	createVElement,
	createVText,
	cloneVNode,
	convertVTemplate,
	createVTemplateReducers
} from '../../../src/core/shapes';
import { warning } from '../../../src/core/utils';
import { ChildrenTypes } from '../../../src/core/ChildrenTypes';

if (process.env.NODE_ENV !== 'production') {
	const testFunc = function testFn() {};
	warning(
		(testFunc.name || testFunc.toString()).indexOf('testFn') !== -1,
		'It looks like you\'re using a minified copy of the development build ' +
		'of Inferno. When deploying Inferno apps to production, make sure to use ' +
		'the production build which skips development warnings and is faster. ' +
		'See http://infernojs.org for more details.'
	);
}

export default {
	createVTemplate,
	createVComponent,
	createVElement,
	createVText,
	createVFragment,
	ChildrenTypes,
	cloneVNode,
	convertVTemplate,
	createVTemplateReducers
};
