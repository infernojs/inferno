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

	class BasicComponent1b extends Inferno.Component {
		render() {
			return (
				<div className='basic'>
					<label>
						<input checked={ this.props.isChecked } />
						The title is { this.props.title }
					</label>
				</div>
			);
		}
	}

	describe('should render a basic component with inputs', () => {
		beforeEach(() => {
			Inferno.render((
				<div>
					<BasicComponent1b title="abc" isChecked={ true } />
				</div>
			), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input>The title is abc</label></div></div>'
			);
			expect(
				container.querySelector("input").checked
			).to.equal(
				true
			);
		});
		it('Second render (update)', () => {
			Inferno.render((
				<div>
					<BasicComponent1b title="123" isChecked={ false } />
				</div>
			), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input>The title is 123</label></div></div>'
			);
			expect(
				container.querySelector("input").checked
			).to.equal(
				false
			);
		});
		it('Third render (update)', () => {
			Inferno.render((
				<div>
					<BasicComponent1b title="123" isChecked={ true } />
				</div>
			), container);
			expect(
				container.querySelector("input").checked
			).to.equal(
				true
			);
		});
	});

	describe('should render a basic component and remove property if null #1', () => {
		beforeEach(() => {
			Inferno.render((
					<div>
						<BasicComponent1 title='abc' name='basic-render' />
					</div>
				),
				container
			);
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
					<div>
						<BasicComponent1 title='123' name={ null } />
					</div>
				),
				container
			);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span>The title is 123</span></div></div>'
			);
		});
	});

	describe('should render a basic component and remove property if null #2', () => {
		beforeEach(() => {
			Inferno.render((
				<div>
					<BasicComponent1 title='abc' name={ null } />
				</div>
			), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span>The title is abc</span></div></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render((
				<div>
					<BasicComponent1 title='123' name='basic-update' />
				</div>
			), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>'
			);
		});
	});

	describe('should render a basic root component', () => {
		beforeEach(() => {
			Inferno.render((
				<BasicComponent1 title='abc' name='basic-render' />
			), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-render">The title is abc</span></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render((
				<BasicComponent1 title='123' name='basic-update' />
			), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-update">The title is 123</span></div>'
			);
		});
	});

	class BasicComponent2 extends Inferno.Component {
		template(createElement, createComponent, name, title, children) {
			return createElement("div", {className: "basic"},
				createElement("span", {className: name}, "The title is ", title),
				children
			);
		}
		render() {
			return Inferno.createFragment([this.props.name, this.props.title, this.props.children], this.template);
		}
	}
}