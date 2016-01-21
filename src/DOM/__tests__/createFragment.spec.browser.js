import createFragment from '../createFragment';
import { render, renderToString } from '../rendering';

describe('createFragment', () => {

	it('should return the "body" of createFragment', () => {
		let newFragment = createFragment(document.createElement('div'), {});
		expect(newFragment).to.be.a.object;
		expect(newFragment.render).to.be.a.function;
		expect(newFragment.remove).to.be.a.function;
		newFragment = createFragment(null, {});
		newFragment = createFragment(document.createElement('div'), { domTree: {} });
		expect(newFragment).to.be.a.object;
		expect(newFragment.render).to.be.a.function;
		expect(newFragment.remove).to.be.a.function;
		newFragment = createFragment(document.createElement('div'), { domTree: [] });
		expect(newFragment).to.be.a.object;

	});
});
