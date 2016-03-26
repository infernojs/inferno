//import getFormElementType from '../getFormElementType';
//import { render, renderToString } from '../rendering';
//
//describe('getFormElementType', () => {
//
//	let container;
//
//	it('should return various element types', () => {
//
//		container = document.createElement('select');
//		expect(getFormElementType(container)).to.equal('select');
//		container.multiple = true;
//		expect(getFormElementType(container)).to.equal('select-multiple');
//		container = document.createElement('input');
//		// no 'type', so return 'text'
//		expect(getFormElementType(container)).to.equal('text');
//		container.type = 'checkbox';
//		expect(getFormElementType(container)).to.equal('checkbox');
//	});
//});