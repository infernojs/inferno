import Inferno from '../../../src';

describe( 'Inferno - (non-JSX)', () => {

	it( 'should be a object', () => {
		expect(Inferno).to.be.a.object;
	});
	it( 'should be a function', () => {
		expect(Inferno.createTemplate).to.be.a.function;
	});
});
