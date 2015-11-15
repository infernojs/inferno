import get from '../../../tools/get';
import Inferno from '../../../../src';

export default function domElementsTestsJsx(describe, expect, container) {
	describe('should render a basic example', () => {
		let template;

		beforeEach(() => {
			Inferno.render(<div>Hello world</div>, container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world</div>'
			);
		});

		it('Second render (update)', () => {
			Inferno.render(<div>Hello world 2</div>, container);
			expect(
				container.innerHTML
			).to.equal(
				'<div>Hello world 2</div>'
			);
		});
	});
}
