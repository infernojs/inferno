import Inferno from '../src';

	class BasicComponent1 extends Inferno.Component {
		render() {
			return (
				<div className="basic">
					<span className={ this.props.name }>The title is { this.props.title }</span>
				</div>
			);
		}
	}

    // NOTE! I don't want to clear out the 'div' for each test, because update should update the content, right?

	describe('should render a basic component', () => {
		
		let container = document.createElement('div');
		
		beforeEach(() => {

           // container.innerHTML = ""; NOTE! Same result here too if you clear out with innerHTML

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
				<div><BasicComponent1 title="abc" name="basic-render" /></div>
			), container);

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