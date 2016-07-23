import { render } from './../../DOM/rendering';
import Provider from '../Provider';
import connect from '../connect';
import { createBlueprint } from './../../core/shapes';

const Inferno = {
	createBlueprint
};

describe('Provider tests (jsx)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
		container.innerHTML = '';
	});
});
