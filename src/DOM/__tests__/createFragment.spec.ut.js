import createFragment from '../createFragment';
import { render, renderToString } from '../rendering';

describe('createFragment ( UT tests)', () => {

	it('should return the "body" of createFragment', () => {
		// Not much we can test here, but we will do our best!
		let newFragment = createFragment(document.createElement('div'), {});
		expect(newFragment).to.be.a.object;
		expect(newFragment.render).to.be.a.function;
		expect(newFragment.remove).to.be.a.function;
		newFragment = createFragment(document.createElement('div'), { domTree: {}});
		expect(newFragment).to.be.a.object;
		expect(newFragment.render).to.be.a.function;
		expect(newFragment.remove).to.be.a.function;

	});
});