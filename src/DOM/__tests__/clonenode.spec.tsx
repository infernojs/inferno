import { expect } from 'chai';
import Inferno, { render } from 'inferno';
Inferno; // suppress ts 'never used' error

describe('CloneVNode use cases', () => {
	let container;

	beforeEach(function() {
		container = document.createElement('div');
	});

	afterEach(function() {
		container.innerHTML = '';
	});

	it('Should be able to render hoisted node', () => {
		const a = ['foo', 'bar'];

		render(<div>{[a,a,a,a]}</div>, container);

		expect(container.innerHTML).to.eql('<div>foobarfoobarfoobarfoobar</div>');
	});
});
