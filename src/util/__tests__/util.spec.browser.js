import isArray from '../isArray';
import appendText from '../appendText';
import noop from '../noop';
import storage from '../storage';
import isVoid from '../isVoid';

describe( 'Util', () => {


	it( 'should be an array (isArray)', () => {

		expect( isArray([]) ).to.be.true;
		expect( isArray({}) ).to.be.false;
		expect( isArray(123) ).to.be.false;
		expect( isArray([{}]) ).to.be.true;
	} );

	it( 'should append text (appendText)', () => {
		let container = document.createElement('div');
		appendText(container, 'Hello');
		expect( container.textContent ).to.equal('Hello');
	} );

	it( 'should be a function (noop)', () => {
		expect( noop ).to.be.a.function;
	} );


	it( 'should work with Storage (storage)', () => {
		expect( storage ).to.be.a.object;
		expect( storage.set ).to.be.a.function;
		expect( storage.get ).to.be.a.function;
	} );

	it( 'should handle null and undefined (isVoid)', () => {
		expect( isVoid( undefined ) ).to.be.true;
		expect( isVoid( null ) ).to.be.true;
	} );

	it( 'should be a function (noop)', () => {
		expect( noop ).to.be.a.function;
	} );


} );