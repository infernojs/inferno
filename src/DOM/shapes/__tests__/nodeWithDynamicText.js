import template from '../index';
import { render, renderToString } from '../rendering';
import createTemplate from '../../core/createTemplate';
import createDOMTree from '../createTree';
import { addTreeConstructor } from '../../core/createTemplate';

addTreeConstructor('dom', createDOMTree);

describe('nodeWithDynamicText', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

});
