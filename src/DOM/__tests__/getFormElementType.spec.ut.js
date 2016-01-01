import getFormElementType from '../getFormElementType';
import { render, renderToString } from '../../core/rendering';

describe('getFormElementType ( UT tests)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	})

	afterEach(() => {
		render(null, container);
	});

	it('should return various element types', () => {

		let node;

		node = document.createElement('select');
		expect(getFormElementType(node)).to.equal('select');
		node.multiple = true;
		expect(getFormElementType(node)).to.equal('select-multiple');
		node = document.createElement('input');
		// no 'type', so return 'text'
		expect(getFormElementType(node)).to.equal('text');
		node.type = 'checkbox';
		expect(getFormElementType(node)).to.equal('checkbox');
	});
});