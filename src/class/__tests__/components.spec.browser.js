import createTemplate, { addTreeConstructor } from '../../core/createTemplate';
import TemplateFactory from '../../core/TemplateFactory';
import { render } from '../../DOM/rendering';
import createTree from '../../DOM/createTree';
import Component from '../Component';
import waits from '../../../tools/waits';

const { createElement } = TemplateFactory;

// set the constructor to 'dom'
addTreeConstructor( 'dom', createTree );

describe( 'Components', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		//	render(null, container);
	});

	class BasicComponent1 extends Component {
		render() {
			const template = createTemplate((name, title) =>
				createElement("div", {
						className: "basic"
					},
					createElement("span", {
						className: name
					}, "The title is ", title)
				)
			);
			return template(this.props.name, this.props.title);
		}
	}

	it('should render a basic component', () => {

		let template = createTemplate((Component, title) =>
			createElement('div', null,
				createElement(Component, {
					title: title,
					name: "basic-render"
				})
			)
		);


		render(template(BasicComponent1, 'abc'), container);

		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('basic-render');
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.innerHTML).to.equal('The title is abc');

		render(template(BasicComponent1, 'abcdef'), container);

		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('basic-render');
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.innerHTML).to.equal('The title is abcdef');

		render(template(BasicComponent1, null), container);

		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('basic-render');
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.innerHTML).to.equal('The title is ');

		render(template(BasicComponent1, undefined), container);

		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('basic-render');
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.innerHTML).to.equal('The title is ');

		render(template(BasicComponent1, '1234'), container);

		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('basic-render');
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.innerHTML).to.equal('The title is 1234');

		// remove the component
		render(template(null, '1234'), container);
		expect(container.firstChild.tagName).to.equal('DIV');

		render(template(null, null), container);
		expect(container.firstChild.tagName).to.equal('DIV');
	});

	class BasicComponent1b extends Component {
		render() {
			const template = createTemplate((isChecked, title) =>
				createElement("div", {
						className: "basic"
					},
					createElement('label', {},
						createElement("input", {
							type: 'checkbox',
							checked: isChecked
						}),
						"The title is ",
						title
					)
				)
			);
			return template(this.props.isChecked, this.props.title);
		}
	}

	it('should render a basic component with inputs', () => {

		let template = createTemplate((Component, title, isChecked) =>
			createElement('div', null,
				createElement(Component, {
					title,
					isChecked
				})
			)
		);

		render(template(BasicComponent1b, "abc", true), container);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('type')).to.equal('checkbox');
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('LABEL');
		expect(container.firstChild.firstChild.firstChild.innerHTML).to.equal('<input type="checkbox">The title is abc');
		expect( container.querySelector("input").checked ).to.equal( true);

		render(template(BasicComponent1b, "abc", null), container);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('type')).to.equal('checkbox');
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('LABEL');
		expect(container.firstChild.firstChild.firstChild.innerHTML).to.equal('<input type="checkbox">The title is abc');
		expect(container.querySelector("input").checked).to.equal(false);
	});

	class BasicComponent1c extends Component {
		render() {
			const template = createTemplate((isEnabled, title, type) =>
				createElement("div", {
						className: "basic"
					},
					createElement('label', {},
						createElement("input", {
							type,
							enabled: isEnabled
						}),
						"The title is ",
						title
					)
				)
			);
			return template(this.props.isEnabled, this.props.title, this.props.type);
		}
	}

	it('should render a basic component with input tag and attributes', () => {

		let template = createTemplate((Component, title, isEnabled) =>
			createElement('div', null,
				createElement(Component, {
					title,
					isEnabled,
					type: 'password'
				})
			)
		);

		render(template(BasicComponent1c, 'abc', true), container);
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('LABEL');
		expect(container.firstChild.firstChild.firstChild.firstChild.tagName).to.equal('INPUT');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('type')).to.equal('password');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('enabled')).to.equal('enabled');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('The title is abc');
		render(template(BasicComponent1c, 'abc', true), container);
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('LABEL');
		expect(container.firstChild.firstChild.firstChild.firstChild.tagName).to.equal('INPUT');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('type')).to.equal('password');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('enabled')).to.equal('enabled');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('The title is abc');
	});

	class BasicComponent1d extends Component {
		render() {
			const template = createTemplate((isDisabled, title) =>
				createElement("div", {className: "basic"},
					createElement('label', {},
						createElement("input", {type: 'password', disabled: isDisabled}),
						"The title is ",
						title
					)
				)
			);
			return template(this.props.isDisabled, this.props.title);
		}
	}

	it('should render a basic component with inputs #3', () => {

		let template = createTemplate((Component, title, isDisabled) =>
			createElement('div', null,
				createElement(Component, {title, isDisabled})
			)
		);
		render(template(BasicComponent1d, 'abc', true), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><label><input type="password" disabled="">The title is abc</label></div></div>'
		);
		expect(
			container.querySelector("input").disabled
		).to.equal(
			true
		);

		render(template(BasicComponent1d, '123', false), container);
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

	it('should render a basic component and remove property if null #1', () => {

		let template  = createTemplate((Component, title, name) =>
			createElement('div', null,
				createElement(Component, {title, name})
			)
		);
		render(template(BasicComponent1, 'abc', 'basic-render'), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
		);

		render(template(BasicComponent1, '123', null), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span>The title is 123</span></div></div>'
		);
	});

	it('should render a basic component and remove property if null #2', () => {

		let template = createTemplate((Component, title, name) =>
			createElement('div', null,
				createElement(Component, {title, name})
			)
		);
		render(template(BasicComponent1, 'abc', null), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span>The title is abc</span></div></div>'
		);

		render(template(BasicComponent1, '123', 'basic-update'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>'
		);
	});


	it('should render a basic root component', () => {

		let template = createTemplate((Component, title, name) =>
			createElement(Component, {title, name})
		);

		render(template(BasicComponent1, 'abc', 'basic-render'), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div class="basic"><span class="basic-render">The title is abc</span></div>'
		);
		render(template(BasicComponent1, 'abc', 'basic-render'), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div class="basic"><span class="basic-render">The title is abc</span></div>'
		);

		render(template(BasicComponent1, 'abc', {}), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div class="basic"><span class="[object Object]">The title is abc</span></div>'
		);

		render(template(null, 'abc', 'basic-render'), container);

		expect(
			container.innerHTML
		).to.equal(
			''
		);

		render(template(null, null, null), container);

		expect(
			container.innerHTML
		).to.equal(
			''
		);
	});

	class BasicComponent2 extends Component {
		render() {
			const template = createTemplate((name, title, children) =>
				createElement("div", {
						className: "basic"
					},
					createElement("span", {
						className: name
					}, "The title is ", title),
					children
				)
			);
			return template(this.props.name, this.props.title, this.props.children);
		}
	}

	it('should render a basic component with children', () => {
		let template = createTemplate((Component, title, name) =>
			createElement('div', null,
				createElement(Component, {
						title,
						name
					},
					createElement('span', null, 'I\'m a child')
				)
			)
		);

		render(template(BasicComponent2, "abc", "basic-render"), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is abc</span><span>I\'m a child</span></div></div>'
		);
		render(template(BasicComponent2, "abc", "basic-render"), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is abc</span><span>I\'m a child</span></div></div>'
		);

		render(
			template(BasicComponent2, "123", "basic-update"), container

		);
		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-update">The title is 123</span><span>I\'m a child</span></div></div>'
		);
		render(
			template(BasicComponent2, "1234", "basic-update"), container

		);
		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-update">The title is 1234</span><span>I\'m a child</span></div></div>'
		);
	});



	class BasicComponent2b extends Component {
		render() {
			const template = createTemplate((children) =>
				createElement('div', null,
					createElement('span', null, 'component!'),
					createElement('div', null, children)
				)
			);
			return template(this.props.children);
		}
	}

	class BasicComponent2c extends Component {
		render() {
			const template = createTemplate((children) =>
				createElement('div', null,
					createElement('span', null, 'other component!'),
					createElement('div', null, children)
				)
			);
			return template(this.props.children);
		}
	}




	class BasicComponent3 extends Component {
		render() {
			const template = createTemplate((styles, title) =>
				createElement("div", {
						style: styles
					},
					createElement("span", {
						style: styles
					}, "The title is ", title)
				)
			);

			return template(this.props.styles, this.props.title);
		}
	}

	it('should render a basic component with styling', () => {

		let template = createTemplate((Component, props) =>
			createElement(Component, props)
		);

		render(template(BasicComponent3, {
			title: "styled!",
			styles: {
				color: "red",
				paddingLeft: 10
			}
		}), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>'
		);
		render(template(BasicComponent3, {
			title: "styled!",
			styles: {
				color: "red",
				paddingLeft: 10
			}
		}), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>'
		);

		render(template(BasicComponent3, {
			title: "styled (again)!",
			styles: {
				color: "blue",
				paddingRight: 20
			}
		}), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div style="color: blue; padding-right: 20px;"><span style="color: blue; padding-right: 20px;">The title is styled (again)!</span></div>'
		);
	});

	it('should render a basic component with component children', () => {

		let template = createTemplate((Component1, Component2, Component3) =>
			createElement(Component1, null,
				createElement(Component2, null,
					createElement(Component3, null)
				)
			)
		);
		render(template(BasicComponent2b, BasicComponent2b, BasicComponent2b), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><span>component!</span><div><div><span>component!</span><div><div><span>component!</span><div></div></div></div></div></div></div>'
		);

		render(template(BasicComponent2b, BasicComponent2b, BasicComponent2b), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><span>component!</span><div><div><span>component!</span><div><div><span>component!</span><div></div></div></div></div></div></div>'
		);

		render(template(BasicComponent2b, BasicComponent2b, BasicComponent2c), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><span>component!</span><div><div><span>component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>'
		);

		render(template(BasicComponent2b, BasicComponent2b, BasicComponent2c), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><span>component!</span><div><div><span>component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>'
		);

		render(template(BasicComponent2b, BasicComponent2c, BasicComponent2c), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><span>component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>'
		);
		render(template(BasicComponent2b, BasicComponent2c, BasicComponent2c), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><span>component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>'
		);
		render(template(BasicComponent2b, BasicComponent2c, BasicComponent2c), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><span>component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>'
		);

		render(template(BasicComponent2c, BasicComponent2c, BasicComponent2c), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><span>other component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>'
		);
		render(template(BasicComponent2c, BasicComponent2c, BasicComponent2c), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><span>other component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>'
		);
	});




	it('should render a basic component and correctly mount', () => {
		let template;
		let componentWillMountCount;

		class ComponentLifecycleCheck extends Component {
			render() {
				const template = createTemplate((children) =>
					createElement('div', null,
						createElement('span', null, 'component!'),
						createElement('div', null, children)
					)
				);
				return template(this.props.children);
			}
			componentWillMount() {
				componentWillMountCount++;
			}
		}

		componentWillMountCount = 0;
		template = createTemplate((Component1, Component2, Component3) =>
			createElement(Component1, null,
				createElement(Component2, null,
					createElement(Component3, null)
				)
			)
		);


		render(template(ComponentLifecycleCheck, ComponentLifecycleCheck, ComponentLifecycleCheck), container);
		expect(
			componentWillMountCount
		).to.equal(
			3
		);
		render(template(ComponentLifecycleCheck, ComponentLifecycleCheck, ComponentLifecycleCheck), container);
		expect(
			componentWillMountCount
		).to.equal(
			6
		);

		render(template(ComponentLifecycleCheck, ComponentLifecycleCheck, null), container);
		expect(
			componentWillMountCount
		).to.equal(
			8
		);
		render(template(ComponentLifecycleCheck, ComponentLifecycleCheck, null), container);
		expect(
			componentWillMountCount
		).to.equal(
			10
		);
	});






	it('should render multiple components', () => {

		let template = createTemplate((Component, title1, name1, Component2, title2, name2) =>
			createElement('div', null,
				createElement(Component, {
					title: title1,
					name: name1
				}),
				createElement(Component2, {
					title: title2,
					name: name2
				})
			)
		);


		render(template(BasicComponent1, 'component 1', 'basic-render', BasicComponent1, 'component 2', 'basic-render'), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is component 1</span></div>' + '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>'
		);
		render(template(BasicComponent1, 'component 1', 'basic-render', BasicComponent1, 'component 2', 'basic-render'), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is component 1</span></div>' + '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>'
		);

		render(template(BasicComponent1, 'component 1', 'basic-render'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is component 1</span></div></div>'
		);
	});



	it('should mount and unmount a basic component', () => {
		let mountCount;
		let unmountCount;
		let template;

		class ComponentLifecycleCheck extends Component {
			render() {
				const template = createTemplate(() =>
					createElement('div', null,
						createElement('span', null)
					)
				);
				return template();
			}
			componentDidMount() {
				mountCount++;
			}
			componentWillUnmount() {
				unmountCount++;
			}
		}

		mountCount = 0;
		unmountCount = 0;
		template = createTemplate((Component) =>
			createElement(Component)
		);
		render(template(ComponentLifecycleCheck), container);

		expect(mountCount).to.equal(1);

		render(null, container);
		expect(unmountCount).to.equal(1);
	});




	it('should mount and unmount a basic component #2', () => {
		let mountCount;
		let unmountCount;
		let template;

		class ComponentLifecycleCheck extends Component {
			render() {
				const template = createTemplate(() =>
					createElement('div', null,
						createElement('span', null)
					)
				);
				return template();
			}
			componentDidMount() {
				mountCount++;
			}
			componentWillUnmount() {
				unmountCount++;
			}
		}

		mountCount = 0;
		unmountCount = 0;
		template = createTemplate((Component) =>
			createElement(Component)
		);

		render(template(ComponentLifecycleCheck), container);

		expect(mountCount).to.equal(1);

		render(template(null), container);
		expect(unmountCount).to.equal(1);

	});

	describe('state changes should trigger all lifecycle events for an update', () => {
		let componentWillMountCount;
		let shouldComponentUpdateCount;
		let componentDidUpdateCount;
		let componentWillUpdateCount;
		let componentWillReceivePropsCount;
		let template;

		class ComponentLifecycleCheck extends Component {
			constructor() {
				super(null);
				this.state = {
					counter: 0
				};
			}
			render() {
				const template = createTemplate((counter) =>
					createElement('div', null,
						createElement('span', null, counter)
					)
				);
				return template(this.state.counter);
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
			template = createTemplate((Component) =>
				createElement(Component)
			);
			render(template(ComponentLifecycleCheck), container);
			waits(30, done)
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

	/*
	describe('should render a basic component with conditional fragment', () => {
		const tpl4282471407 = createTemplate(function (v0) {
			return {
				tag: 'div',
				children: ['', v0, '', {
					tag: 'p',
					children: 'test'
				}, '']
			};
		});
		const tpl3625453295 = createTemplate(function () {
			return {
				tag: 'h1',
				children: 'BIG'
			};
		});
		const tpl4021787591 = createTemplate(function () {
			return {
				tag: 'h2',
				children: 'small'
			};
		});
		const tpl1546018623 = createTemplate(function (v0) {
			return {tag: v0};
		});

		class Component extends Component {
			render() {
				let condition = true; // some logic
				return tpl4282471407(condition ? tpl3625453295(null) : tpl4021787591(null));
			}
		}

		it('Initial render (creation)', () => {
			render(tpl1546018623(Component), container);
			expect(container.innerHTML).to.equal(
				'<div><h1>BIG</h1><p>test</p></div>'
			);
		});
	});

	describe('should render a basic component with a list of values from state', () => {
		const tpl2026545261 = createTemplate(function (v0) {
			return {
				tag: 'ul',
				attrs: {
					class: 'login-organizationlist'
				},
				children: ['', v0, '']
			};
		});
		const tpl3192647933 = createTemplate(function (v0) {
			return {
				tag: 'li',
				children: v0
			};
		});
		const tpl1546018623 = createTemplate(function (v0) {
			return {tag: v0};
		});

		class Component extends Component {
			constructor(props) {
				super(props);
				this.state = {
					organizations: [
						{name: 'test1', key: '1'},
						{name: 'test2', key: '2'},
						{name: 'test3', key: '3'},
						{name: 'test4', key: '4'},
						{name: 'test5', key: '5'},
						{name: 'test6', key: '6'}
					]
				};
			}
			render() {
				return tpl2026545261(this.state.organizations.map(function (result) {
					return tpl3192647933(result.name);
				}));
			}
		}

		it('Initial render (creation)', () => {
			render(tpl1546018623(Component), container);
			expect(container.innerHTML).to.equal(
				'<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>'
			);
		});
	});*/

} );