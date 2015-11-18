import get from '../../../tools/get';
import Inferno from '../../../../src';

export default function domComponentsTestsFunctional(describe, expect, container) {

	class BasicComponent1 extends Inferno.Component {
		template(createElement, name, title) {
			return createElement("div", {className: "basic"},
				createElement("span", {className: name}, "The title is ", title)
			);
		}
		render() {
			return Inferno.createFragment([this.props.name, this.props.title], this.template);
		}
	}

	describe('should render a basic component', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, Component) =>
				createElement('div', null,
					createElement(Component)
				)
			);
			Inferno.render(Inferno.createFragment([{component: BasicComponent1, props: {title: "abc", name: "basic-render"}}], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([{component: BasicComponent1, props: {title: "123", name: "basic-update"}}], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>'
			);
		});
	});

	class BasicComponent2 extends Inferno.Component {
		template(createElement, name, title, children) {
			return createElement("div", {className: "basic"},
				createElement("span", {className: name}, "The title is ", title),
				children
			);
		}
		render() {
			return Inferno.createFragment([this.props.name, this.props.title, this.props.children], this.template);
		}
	}

	describe('should render a basic component with children', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, Component) =>
					createElement('div', null,
						createElement(Component, null,
							createElement('span', null, 'I\m a child')
						)
					)
			);
			Inferno.render(Inferno.createFragment([{component: BasicComponent2, props: {title: "abc", name: "basic-render"}}], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([{component: BasicComponent2, props: {title: "123", name: "basic-update"}}], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>'
			);
		});
	});
}