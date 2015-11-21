import get from '../../../tools/get';
import Inferno from '../../../../src';

export default function domComponentsTestsJsx(describe, expect, container) {
	class BasicComponent1 extends Inferno.Component {
		render() {
			return (
				<div className="basic">
					<span className={ this.props.name }>The title is { this.props.title }</span>
				</div>
			);
		}
	}

	describe('should render a basic component', () => {
		beforeEach(() => {
			Inferno.render((
				<div><BasicComponent1 title="abc" name="basic-render" /></div>
			), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render((
				<div><BasicComponent1 title="123" name="basic-update" /></div>
			), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>'
			);
		});
	});
}