import get from '../../../tools/get';
import Inferno from '../../../../src';
import waits from '../../../tools/waits';

export default function domComponentsTestsFunctional(describe, expect, container) {
	class BasicComponent1 extends Inferno.Component {
		template(createElement, createComponent, name, title) {
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
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createElement('div', null,
					createComponent(Component)
				)
			);
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1, props: {title: "abc", name: "basic-render"}}
			], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1, props: {title: "123", name: "basic-update"}}
			], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>'
			);
		});
	});

	class BasicComponent1b extends Inferno.Component {
		template(createElement, createComponent, isChecked, title) {
			return createElement("div", {className: "basic"},
				createElement('label', {},
					createElement("input", {type: 'checkbox', checked: isChecked}),
					"The title is ",
					title
				)
			);
		}
		render() {
			return Inferno.createFragment([this.props.isChecked, this.props.title], this.template);
		}
	}

	describe('should render a basic component with inputs', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
					createElement('div', null,
						createComponent(Component)
					)
			);
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1b, props: {title: "abc", isChecked: true}}
			], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is abc</label></div></div>'
			);
			expect(
				container.querySelector("input").checked
			).to.equal(
				true
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1b, props: {title: "123", isChecked: false}}
			], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is 123</label></div></div>'
			);
			expect(
				container.querySelector("input").checked
			).to.equal(
				false
			);
		});
		it('Third render (update)', () => {
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1b, props: {title: "123", isChecked: true}}
			], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is 123</label></div></div>'
			);
			expect(
				container.querySelector("input").checked
			).to.equal(
				true
			);
		});
	});

	class BasicComponent1c extends Inferno.Component {
		template(createElement, createComponent, isEnabled, title) {
			return createElement("div", {className: "basic"},
				createElement('label', {},
					createElement("input", {type: 'password', enabled: isEnabled}),
					"The title is ",
					title
				)
			);
		}
		render() {
			return Inferno.createFragment([this.props.isEnabled, this.props.title], this.template);
		}
	}

	describe('should render a basic component with inputs #2', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
					createElement('div', null,
						createComponent(Component)
					)
			);
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1c, props: {title: "abc", isEnabled: true}}
			], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password" enabled="true">The title is abc</label></div></div>'
			);
		});

		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1c, props: {title: "123", isEnabled: false}}
			], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password">The title is 123</label></div></div>'
			);
		});
	});

	class BasicComponent1d extends Inferno.Component {
		template(createElement, createComponent, isDisabled, title) {
			return createElement("div", {className: "basic"},
				createElement('label', {},
					createElement("input", {type: 'password', disabled: isDisabled}),
					"The title is ",
					title
				)
			);
		}
		render() {
			return Inferno.createFragment([this.props.isDisabled, this.props.title], this.template);
		}
	}

	describe('should render a basic component with inputs #3', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
					createElement('div', null,
						createComponent(Component)
					)
			);
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1d, props: {title: "abc", isDisabled: true}}
			], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password" disabled="true">The title is abc</label></div></div>'
			);
			expect(
				container.querySelector("input").disabled
			).to.equal(
				true
			);
		});

		/// NOTE!! This test fails!  You can't set it to false. You have to set it to null / remove the property. BUG!
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1d, props: {title: "123", isDisabled: false}}
			], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password">The title is 123</label></div></div>'
			);
			expect(
				container.querySelector("input").disabled
			).to.equal(
				false
			);
		});
	});

	describe('should render a basic component and remove property if null #1', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createElement('div', null,
					createComponent(Component)
				)
			);
			Inferno.render(Inferno.createFragment([{
				component: BasicComponent1,
				props: {
					title: "abc",
					name: "basic-render"
				}
			}], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([{
				component: BasicComponent1,
				props: {
					title: "123",
					name: null
				}
			}], template), container);
			expect(
				container.innerHTML
			).to.equal(
			   '<div><div class="basic"><span>The title is 123</span></div></div>'
			);
		});
	});

	describe('should render a basic component and remove property if null #2', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createElement('div', null,
					createComponent(Component)
				)
			);
			Inferno.render(Inferno.createFragment([{
				component: BasicComponent1,
				props: {
					title: "abc",
					name: null
				}
			}], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span>The title is abc</span></div></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([{
				component: BasicComponent1,
				props: {
					title: "123",
					name: "basic-update"
				}
			}], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>'
			);
		});
	});

	describe('should render a basic root component', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createComponent(Component)
			);
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1, props: {title: "abc", name: "basic-render"}}
			], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-render">The title is abc</span></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1, props: {title: "123", name: "basic-update"}}
			], template), container);
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

	describe('should render a basic component with children', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createElement('div', null,
					createComponent(Component,
						createElement('span', null, 'I\'m a child')
					)
				)
			);

			Inferno.render(
				Inferno.createFragment([{ component: BasicComponent2, props: {title: "abc", name: "basic-render"} }], template), container
			);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span><span>I\'m a child</span></div></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(
				Inferno.createFragment([{ component: BasicComponent2, props: {title: "123", name: "basic-update"} }], template), container
			);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-update">The title is 123</span><span>I\'m a child</span></div></div>'
			);
		});
	});

	class BasicComponent2b extends Inferno.Component {
		template(createElement, createComponent, children) {
			debugger;
			return createElement('div', null,
				createElement('span', null, 'component!'),
				createElement('div', null, children)
			)
		}
		render() {
			return Inferno.createFragment(this.props.children, this.template);
		}
	}

	describe('should render a basic component with component children', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component1, Component2, Component3) =>
				createComponent(Component1,
					createComponent(Component2,
						createComponent(Component3)
					)
				)
			);

			Inferno.render(
				Inferno.createFragment([
					{ component: BasicComponent2b },
					{ component: BasicComponent2b },
					{ component: BasicComponent2b }
				], template), container
			);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><span>component!</span><div><span>component!</span><div><span>component!</span><div><span>component!</span></div></div></div>'
			);
		});
		it('Second render (update) - should be the same', () => {
			Inferno.render(
				Inferno.createFragment([
					{ component: BasicComponent2b },
					{ component: BasicComponent2b },
					{ component: BasicComponent2b }
				], template), container
			);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-update">The title is 123</span><span>I\'m a child</span></div></div>'
			);
		});
	});

	describe('should render multiple components', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component, Component2) =>
				createElement('div', null,
					createComponent(Component),
					createComponent(Component2)
				)
			);
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1, props: {title: "component 1", name: "basic-render"}},
				{component: BasicComponent1, props: {title: "component 2", name: "basic-render"}}
			], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is component 1</span></div>'
				+ '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>'
			);
		});

		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent1, props: {title: "component 1", name: "basic-render"}},
				null
			], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is component 1</span></div></div>'
			);
		});
	});

	class BasicComponent3 extends Inferno.Component {
		template(createElement, createComponent, styles, styles2, title) {
			return createElement("div", {style: styles},
				createElement("span", {style: styles2}, "The title is ", title)
			);
		}
		render() {
			return Inferno.createFragment([this.props.styles, this.props.styles, this.props.title], this.template);
		}
	}

	/*
		IMPORTANT: These tests and the above component highlight the fact that fragment values passed into a template can ONLY apply to
		 a single element. Thus why we need styles and styles2, which actually have the exact same value in all these below tests

		 TODO This is a concern with the FUNCTIONAL_API, maybe we can implement some kind of warning system for DEV mode?
	 */
	describe('should render a basic component with styling', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createComponent(Component)
			);
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent3, props: {title: "styled!", styles: { color: "red", padding: 10}}}
			], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div style="color: red; padding: 10px;"><span style="color: red; padding: 10px;">The title is styled!</span></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent3, props: {title: "styled (again)!", styles: { color: "blue", margin: 20}}}
			], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div style="color: blue; margin: 20px;"><span style="color: blue; margin: 20px;">The title is styled (again)!</span></div>'
			);
		});
	});

	describe('should render a basic component and remove styling #1', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createComponent(Component)
			);
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent3, props: {title: "styled!", styles: { color: "red", padding: 10}}}
			], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div style="color: red; padding: 10px;"><span style="color: red; padding: 10px;">The title is styled!</span></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent3, props: {title: "styles are removed!", styles: null}}
			], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div style=""><span style="">The title is styles are removed!</span></div>'
			);
		});
	});

	describe('should render a basic component and remove styling #2', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createComponent(Component)
			);
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent3, props: {title: "NOT styled!", styles: null}}
			], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><span>The title is NOT styled!</span></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([
				{component: BasicComponent3, props: {title: "styled (again)!", styles: { color: "blue", margin: 20}}}
			], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div style="color: blue; margin: 20px;"><span style="color: blue; margin: 20px;">The title is styled (again)!</span></div>'
			);
		});
	});

	class TestComponent extends Inferno.Component {
		template(createElement, c, value, styles) {
			return createElement('select', {
					multiple: true,
					value: value,
					style: styles
				}, createElement('optgroup', {
						label: 'foo-group'
					},
					createElement('option', {
						value: 'foo'
					}, 'Im a li-tag')),
				createElement('optgroup', {
					label: 'bar-group'
				}, createElement('option', {
					value: 'bar'
				}, 'Im a li-tag')),
				createElement('optgroup', {
					label: 'dominic-group'
				}, createElement('option', {
					value: 'dominic'
				}, 'Im a li-tag'))
			);
		}
		render() {
			return Inferno.createFragment([this.props.value, this.props.style], this.template);
		}
	}

	describe('should render a basic test component', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createElement('div', null,
					createComponent(Component)
				)
			);
			Inferno.render(Inferno.createFragment([{
				component: TestComponent,
				props: {
					value: ['bar', 'dominic'],
					style: { background: 'red' }
				}
			}], template), container);
		});

		it('Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><select multiple="" style="background: red;"><optgroup label="foo-group">'
				+ '<option value="foo">Im a li-tag</option></optgroup><optgroup label="bar-group">'
				+ '<option value="bar">Im a li-tag</option></optgroup><optgroup label="dominic-group">'
				+ '<option value="dominic">Im a li-tag</option></optgroup></select></div>'
			);
		});
		it('Second render (update)', () => {
			Inferno.render(Inferno.createFragment([{
				component: TestComponent,
				props: {
					value: ['bar', 'dominic'],
					style: { background: 'red' }
				}
			}], template), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><select multiple="" style="background: red;"><optgroup label="foo-group">'
				+ '<option value="foo">Im a li-tag</option></optgroup><optgroup label="bar-group">'
				+ '<option value="bar">Im a li-tag</option></optgroup><optgroup label="dominic-group">'
				+ '<option value="dominic">Im a li-tag</option></optgroup></select></div>'
			);
		});
	});

	describe('should mount and unmount a basic component', () => {
		let mountCount;
		let unmountCount;
		let template;

		class ComponentLifecycleCheck extends Inferno.Component {
			template(createElement) {
				return createElement('div', null,
					createElement('span', null)
				)
			}
			render() {
				return Inferno.createFragment(null, this.template);
			}
			componentDidMount() {
				mountCount++;
			}
			componentWillUnmount() {
				unmountCount++;
			}
		}

		beforeEach(() => {
			mountCount = 0;
			unmountCount = 0;

			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createComponent(Component)
			);
			Inferno.render(Inferno.createFragment([{
				component: ComponentLifecycleCheck,
				props: {}
			}], template), container);
		});

		it("should have mounted the component", () => {
			expect(mountCount).to.equal(1);
		});

		it("should have unmounted the component", () => {
			Inferno.render(<div></div>, container);
			expect(container.innerHTML).to.equal('<div></div>');
			expect(unmountCount).to.equal(1);
		});
	});

	describe('should mount and unmount a basic component #2', () => {
		let mountCount;
		let unmountCount;
		let template;

		class ComponentLifecycleCheck extends Inferno.Component {
			template(createElement) {
				return createElement('div', null,
					createElement('span', null)
				)
			}
			render() {
				return Inferno.createFragment(null, this.template);
			}
			componentDidMount() {
				mountCount++;
			}
			componentWillUnmount() {
				unmountCount++;
			}
		}

		beforeEach(() => {
			mountCount = 0;
			unmountCount = 0;

			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createComponent(Component)
			);
			Inferno.render(Inferno.createFragment([{
				component: ComponentLifecycleCheck,
				props: {}
			}], template), container);
		});

		it("should have mounted the component", () => {
			expect(mountCount).to.equal(1);
		});
		it("should have unmounted the component", () => {
			Inferno.render(Inferno.createFragment([{
				component: null,
				props: {}
			}], template), container);
			expect(unmountCount).to.equal(1);
		});
	});

	describe('state changes should trigger all lifecycle events for an update', () => {
		let componentWillMountCount;
		let shouldComponentUpdateCount;
		let componentDidUpdateCount;
		let componentWillUpdateCount;
		let componentWillReceivePropsCount;
		let template;

		class ComponentLifecycleCheck extends Inferno.Component {
			constructor() {
				super();
				this.state = {
					counter: 0
				};
			}
			template(createElement, createComponent, counter) {
				return createElement('div', null,
					createElement('span', null, counter)
				)
			}
			render() {
				return Inferno.createFragment(this.state.counter, this.template);
			}
			componentWillMount() {
				componentWillMountCount++;
				this.setState({
					counter: this.state.counter + 1
				});
			}
			shouldComponentUpdate() {
				shouldComponentUpdateCount++;
				return true;
			}
			componentDidUpdate() {
				componentDidUpdateCount++;
			}
			componentWillUpdate() {
				componentWillUpdateCount++;
			}
			componentWillReceiveProps() {
				componentWillReceivePropsCount++;
			}
		}

		beforeEach((done) => {
			componentWillMountCount = 0;
			shouldComponentUpdateCount = 0;
			componentDidUpdateCount = 0;
			componentWillUpdateCount = 0;
			componentWillReceivePropsCount = 0;

			template = Inferno.createTemplate((createElement, createComponent, Component) =>
				createComponent(Component)
			);
			Inferno.render(Inferno.createFragment([{
				component: ComponentLifecycleCheck,
				props: {}
			}], template), container);
			waits(20, done)
		});

		it("componentWillMountCount to have fired once", () => {
			expect(componentWillMountCount).to.equal(1);
		});
		it("shouldComponentUpdateCount to have fired once", () => {
			expect(shouldComponentUpdateCount).to.equal(1);
		});
		it("componentWillUpdateCount to have fired once", () => {
			expect(componentWillUpdateCount).to.equal(1);
		});
		it("componentDidUpdateCount to have fired once", () => {
			expect(componentDidUpdateCount).to.equal(1);
		});
		it("componentWillReceivePropsCount not to have fired", () => {
			expect(componentWillReceivePropsCount).to.equal(0);
		});
		it("the element in the component should show the new state", () => {
			expect(container.innerHTML).to.equal(
				'<div><span>1</span></div>'
			);
		});
	});
}
