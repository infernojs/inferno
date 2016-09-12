import {
	createOptVElement,
	createOptBlueprint,
	createVElement,
	createStaticVElement,
	createVFragment,
	createVComponent,
	createVPlaceholder,
	createVText
} from '../../../src/core/shapes';
import {
	ValueTypes,
	ChildrenTypes,
	NodeTypes
} from '../../../src/core/constants';
import cloneVNode from '../../../src/factories/cloneVNode';
import { warning, NO_OP } from '../../../src/shared';

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
	createOptVElement,
	createOptBlueprint,
	createVElement,
	createStaticVElement,
	createVFragment,
	createVPlaceholder,
	createVComponent,
	createVText,
	cloneVNode,
	ValueTypes,
	ChildrenTypes,
	NodeTypes,
	NO_OP
};
