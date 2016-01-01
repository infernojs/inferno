import { insertOrAppend } from '../domMutate';
import { render, renderToString } from '../../core/rendering';

describe('domMutate ( UT tests)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	})

	afterEach(() => {
		render(null, container);
	});
	describe('insertOrAppend', () => {
	it('should set id as attribute when not allowed to set as property', () => {
		const newNode = document.createElement('span');
		insertOrAppend(container, newNode, false);
		expect(container.childNodes[0].tagName).to.equal('SPAN');
		expect(container.childNodes.length).to.equal(1);
	});
	});

});