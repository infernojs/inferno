import get from '../../../tools/get';
import Inferno from '../../../../src';

export default function domElementsTestsJsx(describe, expect, container) {
	describe('should render a basic example', () => {
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

	describe('should render a basic example #2', () => {
		beforeEach(() => {
			Inferno.render(<ul><li>Im a li-tag</li><li>Im a li-tag</li><li>Im a li-tag</li></ul>, container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				`<ul><li>Im a li-tag</li><li>Im a li-tag</li><li>Im a li-tag</li></ul>`
			);
		});
	});

	describe('should render a basic example #3', () => {
		beforeEach(() => {
			Inferno.render(
				<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>,
				container
			);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				`<ul><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li><li><span>Im a li-tag</span></li></ul>`
			);
		});
	});
}
