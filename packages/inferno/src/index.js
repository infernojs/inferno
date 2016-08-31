import {
	createVTemplate
} from '../../../src/core/shapes';
import { warning, NO_OP } from '../../../src/core/utils';
import TemplateValueTypes from '../../../src/core/TemplateValueTypes';

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
	TemplateValueTypes
};
