import { render } from './../../DOM/rendering';
import Component from './../es2015';
import createElement from './../../core/createElement';
import innerHTML from './../../../tools/innerHTML';
import waits from './../../../tools/waits';

describe('Components (non-JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	class BasicComponent1 extends Component {
		render() {
			const template = (name, title) =>
				createElement('div', {
						className: 'basic'
					},
					createElement('span', {
						className: name
					}, 'The title is ', title)
				);
			return template(this.props.name, this.props.title);
		}
	}

	it('should render a basic component', () => {
		let template = (Component, title) =>
			createElement('div', null,
				createElement(Component, {
					title: title,
					name: 'basic-render'
				})
			);

		expect(() => {
			render(template(null, 'abc'), container);
		}).to.throw();

		expect(() => {
			render(template({}, 'abc'), container);
		}).to.throw();

		render(template(BasicComponent1, 'abc'), container);

		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('basic-render');
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.innerHTML).to.equal('The title is abc');

		expect(() => {
			render(template({}, 'abc'), container);
		}).to.throw();

		render(template(), container);

		expect(() => render(template(BasicComponent1, {}), container)).to.throw;

		render(template(BasicComponent1, []), container);

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
	});

	class BasicComponent1b extends Component {
		render() {
			const template = (isChecked, title) =>
				createElement('div', {
						className: 'basic'
					},
					createElement('label', {},
						createElement('input', {
							type: 'checkbox',
							checked: isChecked
						}),
						'The title is ',
						title
					)
				);
			return template(this.props.isChecked, this.props.title);
		}
	}
//
	it('should render a basic component with inputs', () => {
		let template = (Component, title, isChecked) =>
			createElement('div', null,
				createElement(Component, {
					title,
					isChecked
				})
			);

		render(null, container);

		render(template(BasicComponent1b, 'abc', true), container);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('type')).to.equal('checkbox');
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('LABEL');
		expect(container.firstChild.firstChild.firstChild.innerHTML).to.equal('<input type="checkbox">The title is abc');
		expect(container.querySelector('input').checked).to.equal(true);

		render(null, container);
		render(null, container);

		render(template(BasicComponent1b, 'abc', null), container);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('type')).to.equal('checkbox');
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('LABEL');
		expect(container.firstChild.firstChild.firstChild.innerHTML).to.equal('<input type="checkbox">The title is abc');
		expect(container.querySelector('input').checked).to.equal(false);
	});

	class BasicComponent1c extends Component {
		render() {
			const template = (isEnabled, title, type) =>
				createElement('div', {
						className: 'basic'
					},
					createElement('label', {},
						createElement('input', {
							type,
							enabled: isEnabled
						}),
						'The title is ',
						title
					)
				);
			return template(this.props.isEnabled, this.props.title, this.props.type);
		}
	}

	it('should render a basic component with input tag and attributes', () => {
		let template = (Component, title, isEnabled) =>
			createElement('div', null,
				createElement(Component, {
					title,
					isEnabled,
					type: 'password'
				})
			);

		render(template(BasicComponent1c, 'abc', true), container);
		expect(container.firstChild.firstChild.tagName).to.equal('DIV');
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('LABEL');
		expect(container.firstChild.firstChild.firstChild.firstChild.tagName).to.equal('INPUT');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('type')).to.equal('password');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('enabled')).to.equal('enabled');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('The title is abc');
		render(template(BasicComponent1c, ['abc'], true), container);
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
			const template = (isDisabled, title) =>
				createElement('div', { className: 'basic' },
					createElement('label', {},
						createElement('input', { type: 'password', disabled: isDisabled }),
						'The title is ',
						title
					)
				);
			return template(this.props.isDisabled, this.props.title);
		}
	}

	it('should render a basic component with inputs #3', () => {
		let template = (Component, title, isDisabled) =>
			createElement('div', null,
				createElement(Component, { title, isDisabled })
			);
		render(template(BasicComponent1d, 'abc', true), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><label><input type="password" disabled="">The title is abc</label></div></div>')
		);
		expect(
			container.querySelector('input').disabled
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
			container.querySelector('input').disabled
		).to.equal(
			false
		);
	});

	it('should render a basic component and remove property if null #1', () => {
		let template = (Component, title, name) =>
			createElement('div', null,
				createElement(Component, { title, name })
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

		let template = (Component, title, name) =>
			createElement('div', null,
				createElement(Component, { title, name })
			);

		render(template(BasicComponent1, 'abc', null), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span>The title is abc</span></div></div>'
		);

		render(null, container);

		render(template(BasicComponent1, '123', 'basic-update'), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>'
		);
	});

	it('should render a basic root component', () => {
		let template = (Component, title, name) =>
			createElement(Component, { title, name });

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

		render(null, container);

		expect(
			container.innerHTML
		).to.equal(
			''
		);
	});

	class BasicComponent2 extends Component {
		render() {
			const template = (name, title, children) =>
					createElement('div', {
							className: 'basic'
						},
						createElement('span', {
							className: name
						}, 'The title is ', title),
						children
					)
				;
			return template(this.props.name, this.props.title, this.props.children);
		}
	}

	it('should render a basic component with children', () => {
		let template = (Component, title, name) =>
			createElement('div', null,
				createElement(Component, {
						title,
						name
					},
					createElement('span', null, 'I\'m a child')
				)

			);

		render(template(BasicComponent2, 'abc', 'basic-render'), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is abc</span><span>I\'m a child</span></div></div>'
		);
		render(template(BasicComponent2, 'abc', 'basic-render'), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is abc</span><span>I\'m a child</span></div></div>'
		);

		render(
			template(BasicComponent2, '123', 'basic-update'), container

		);
		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-update">The title is 123</span><span>I\'m a child</span></div></div>'
		);
		render(
			template(BasicComponent2, '1234', 'basic-update'), container

		);
		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-update">The title is 1234</span><span>I\'m a child</span></div></div>'
		);
	});

	class BasicComponent2b extends Component {
		render() {
			const template = (children) =>
					createElement('div', null,
						createElement('span', null, 'component!'),
						createElement('div', null, children)
					)
				;
			return template(this.props.children);
		}
	}

	class BasicComponent2c extends Component {
		render() {
			const template = (children) =>
					createElement('div', null,
						createElement('span', null, 'other component!'),
						createElement('div', null, children)
					)
				;
			return template(this.props.children);
		}
	}

	class BasicComponent3 extends Component {
		render() {
			const template = (styles, title) =>
					createElement('div', {
							style: styles
						},
						createElement('span', {
							style: styles
						}, 'The title is ', title)
					)
				;

			return template(this.props.styles, this.props.title);
		}
	}

	if (typeof global !== 'undefined' && !global.usingJSDOM) {
		it('should render a basic component with styling', () => {

			let template = (Component, props) =>
					createElement(Component, props);

			render(template(BasicComponent3, {
				title: 'styled!',
				styles: {
					color: 'red',
					paddingLeft: '10px'
				}
			}), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>'
			);
			render(template(BasicComponent3, {
				title: 'styled!',
				styles: {
					color: 'red',
					paddingLeft: '10px'
				}
			}), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>'
			);

			render(template(BasicComponent3, {
				title: 'styled (again)!',
				styles: {
					color: 'blue',
					paddingRight: '20px'
				}
			}), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div style="color: blue; padding-right: 20px;"><span style="color: blue; padding-right: 20px;">The title is styled (again)!</span></div>'
			);
		});
	}

	it('should render a basic component with component children', () => {
		let template = (Component1, Component2, Component3) =>
			createElement(Component1, null,
				createElement(Component2, null,
					createElement(Component3, null)
				)
			);
		render(template(BasicComponent2b, BasicComponent2b, BasicComponent2b), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><span>component!</span><div><div><span>component!</span><div><div><span>component!</span><div></div></div></div></div></div></div>'
		);

		render(null, container);

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
				const template = (children) =>
					createElement('div', null,
						createElement('span', null, 'component!'),
						createElement('div', null, children)
					);
				return template(this.props.children);
			}
			componentWillMount() {
				componentWillMountCount++;
			}
		}

		componentWillMountCount = 0;
		template = (Component1, Component2, Component3) =>
			createElement(Component1, null,
				createElement(Component2, null,
					createElement(Component3, null)
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
			3
		);
	});

	describe('should render multiple components', () => {
		it('should render multiple components', () => {
			let template = (Component, title1, name1, Component2, title2, name2) =>
				createElement('div', null,
					createElement(Component, {
						title: title1,
						name: name1
					}),
					createElement(Component2, {
						title: title2,
						name: name2
					})
				);

			render(template(BasicComponent1, 'component 1', 'basic-render', BasicComponent1, 'component 2', 'basic-render'), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is component 1</span></div>' + '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>'
			);
			render('', container);

			render(template(BasicComponent1, 'component 1', 'basic-render', BasicComponent1, 'component 2', 'basic-render'), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is component 1</span></div>' + '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>'
			);

			render(template(BasicComponent1, null, 'basic-render'), container);
			render(template(BasicComponent1, null, null), container);
			render(null, container);
			render(template(BasicComponent1, 'component 1', 'basic-render'), container);
			render(template(), container);
			render(template(BasicComponent1, 'component 1', 'basic-render'), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is component 1</span></div></div>'
			);
			render(template(), container);
		});
	});


	it('should support a ref string reference in the component', () => {
		let elementRef = null;

		class ComponentRefCheck extends Component {
			constructor(props) {
				super(props);
				this.componentDidMount = this.componentDidMount.bind(this);
			}
			render() {
				return createElement('div', null,
					createElement('span', { ref: 'foo' })
				);
			}
			componentDidMount() {
				elementRef = this.refs.foo;
			}
		}
		render(createElement(ComponentRefCheck), container);
		const elementValidate = container.firstChild.firstChild;

		expect(elementValidate).to.equal(elementRef);
	});

	it('should mount and unmount a basic component', () => {
		let mountCount;
		let unmountCount;
		let template;

		class ComponentLifecycleCheck extends Component {
			render() {
				const template = () =>
					createElement('div', null,
						createElement('span', null)
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
		template = (Component) =>
			createElement(Component);
		render(template(ComponentLifecycleCheck), container);

		expect(mountCount).to.equal(1);
		render(null, container);
		expect(unmountCount).to.equal(1);
	});

	it('should mount and unmount a basic component #2', () => {
		let mountCount;
		let unmountCount;

		class ComponentLifecycleCheck extends Component {
			render() {
				return createElement('div', null,
					createElement('span', null)
				);
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

		render(createElement(ComponentLifecycleCheck), container);
		expect(mountCount).to.equal(1);
		render(null, container);
		expect(unmountCount).to.equal(1);
		render(createElement(ComponentLifecycleCheck), container);
		expect(mountCount).to.equal(2);
		render(null, container);
		expect(unmountCount).to.equal(2);
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
				const template = (counter) =>
						createElement('div', null,
							createElement('span', {}, counter)
						)
					;
				return template(this.state.counter);
			}
			componentWillMount() {
				componentWillMountCount++;
				this.setState({
					counter: this.state.counter + 1
				});
			}
		}

		beforeEach((done) => {
			componentWillMountCount = 0;
			template = (Component) =>
				createElement(Component)
			;
			render(template(ComponentLifecycleCheck), container);
			waits(30, done);
		});

		it('componentWillMountCount to have fired once', () => {
			expect(componentWillMountCount).to.equal(1);
		});
		it('the element in the component should show the new state', () => {
			expect(container.innerHTML).to.equal(
				'<div><span>1</span></div>'
			);
		});
	});

	describe('state changes should trigger all lifecycle events for an update #2', () => {
		let componentWillMountCount;
		let shouldComponentUpdateCount;
		let componentDidUpdateCount;
		let componentWillUpdateCount;
		let template;

		class ComponentLifecycleCheck extends Component {
			constructor() {
				super(null);
				this.state = {
					counter: 0
				};
			}
			render() {
				const template = (counter) =>
						createElement('div', null,
							createElement('span', {}, counter)
						)
					;
				return template(this.state.counter);
			}
			componentWillMount() {
				componentWillMountCount++;
				setTimeout(() => {
					this.setState({
						counter: this.state.counter + 1
					});
				}, 20)
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
		}

		beforeEach((done) => {
			componentWillMountCount = 0;
			shouldComponentUpdateCount = 0;
			componentDidUpdateCount = 0;
			componentWillUpdateCount = 0;
			template = (Component) =>
				createElement(Component)
			;
			render(template(ComponentLifecycleCheck), container);
			waits(30, done);
		});

		it('componentWillMountCount to have fired once', () => {
			expect(componentWillMountCount).to.equal(1);
		});
		it('shouldComponentUpdateCount to have fired once', () => {
			expect(shouldComponentUpdateCount).to.equal(1);
		});
		it('componentWillUpdateCount to have fired once', () => {
			expect(componentWillUpdateCount).to.equal(1);
		});
		it('componentDidUpdateCount to have fired once', () => {
			expect(componentDidUpdateCount).to.equal(1);
		});
		it('the element in the component should show the new state', () => {
			expect(container.innerHTML).to.equal(
				'<div><span>1</span></div>'
			);
		});
	});

	describe('should render a basic component with conditional fragment', () => {
		const tpl3625453295 = function () {
			return {
				tag: 'h1',
				children: 'BIG'
			};
		};
		const tpl4021787591 = function () {
			return {
				tag: 'h2',
				children: 'small'
			};
		};

		class conditionalComponent extends Component {
			render() {
				return {
					tag: 'div',
					children: [ this.props.condition ? tpl3625453295() : tpl4021787591(), {
						tag: 'p',
						children: 'test'
					}]
				};
			}
		}

		it('Initial render (creation)', () => {
			render(createElement(conditionalComponent, {condition: true}), container);
			expect(container.innerHTML).to.equal(
				'<div><h1>BIG</h1><p>test</p></div>'
			);
			render(createElement(conditionalComponent, {condition: false}), container);
			expect(container.innerHTML).to.equal(
				'<div><h2>small</h2><p>test</p></div>'
			);

		});
	});

	describe('should render a basic component with a list of values from state', () => {
		const tpl2026545261 = function (v0) {
			return {
				tag: 'ul',
				attrs: {
					class: 'login-organizationlist'
				},
				children: [ '', v0, '' ]
			};
		};
		const tpl3192647933 = function (v0) {
			return {
				tag: 'li',
				children: v0
			};
		};
		const tpl1546018623 = function (v0) {
			return { tag: v0 };
		};

		class valueComponent extends Component {
			constructor(props) {
				super(props);
				this.state = {
					organizations: [
						{ name: 'test1', key: '1' },
						{ name: 'test2', key: 2 },
						{ name: 'test3', key: '3' },
						{ name: 'test4', key: '4' },
						{ name: 'test5', key: '5' },
						{ name: 'test6', key: '6' }
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
			render(tpl1546018623(valueComponent), container);
			expect(container.innerHTML).to.equal(
				'<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>'
			);
			render(tpl1546018623(valueComponent), container);
			expect(container.innerHTML).to.equal(
				'<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>'
			);
			render(tpl1546018623(valueComponent), container);
			expect(container.innerHTML).to.equal(
				'<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>'
			);
		});
	});

	function BasicStatelessComponent1({
		name,
		title
	}) {

		const template = (name, title) =>
				createElement('div', {
						className: 'basic'
					},
					createElement('span', {
						className: name
					}, 'The title is ', title)
				)
			;
		return template(name, title);
	}

	it('should render a stateless component', () => {
		let template = (Component, title) =>
				createElement('div', null,
					createElement(Component, {
						title: title,
						name: 'Hello, World!'
					})
				)
			;

		render(template(), container);
		render(template(BasicStatelessComponent1, 'abc'), container);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('The title is abc');
		render(template(BasicStatelessComponent1, null), container);
		render(template(BasicStatelessComponent1, 'abc'), container);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('The title is abc');

		const text = () => {
			return {
				text: '123abc'
			};
		};

		const text1 = () => {
			return {
				tag: 'span',
				children: {
					text: '123abc'
				}
			};
		};

		expect(
			() => render(template(BasicStatelessComponent1, text), container)
		).to.throw;
		expect(
			() => render(template(BasicStatelessComponent1, text1), container)
		).to.throw;

		render(template(BasicStatelessComponent1), container);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('The title is ');

		expect(
			() => createTemplate(() => {
				return {
					tag: 'span',
					children: {
						text: null
					}
				};
			})
		).to.throw;

		render(template(BasicStatelessComponent1), container);
		expect(container.firstChild.childNodes.length).to.equal(1);
		expect(container.firstChild.firstChild.getAttribute('class')).to.equal('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).to.equal('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.tagName).to.equal('SPAN');
		expect(container.firstChild.firstChild.firstChild.textContent).to.equal('The title is ');
	});

	describe('should render a component with a conditional state item', () => {
		const tpl3578458729 = function (v0) {
			return {
				tag: 'div',
				className: 'login-view bg-visma',
				children: v0
			};
		};
		const tpl188998005 = function () {
			return {
				tag: 'div',
				children: 'VISIBLE'
			};
		};

		const tpl3754840163 = function (v0) {
			return {
				tag: 'div',
				children: {
					tag: 'button',
					events: {
						click: v0
					},
					children: 'Make visible'
				}
			};
		};

		class TEST extends Component {
			constructor(props) {
				super(props);
				this.state = {
					show: false
				};

				this.makeVisible = function () {
					this.setState({
						show: true
					});
				}.bind(this);
			}

			render() {
				return tpl3578458729((function () {
					if (this.state.show === true) {
						return tpl188998005(null);
					} else {
						return tpl3754840163(this.makeVisible);
					}
				}).call(this));
			}
		}

		const tpl79713834 = function (v0) {
			return {
				tag: v0
			};
		};

		it('Initial render (creation)', () => {
			render(tpl79713834(TEST), container);
			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div class="login-view bg-visma"><div><button>Make visible</button></div></div>')
			);
		});

		it('Second render (update with state change)', (done) => {
			render(tpl79713834(TEST), container);
			render(tpl79713834(TEST), container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

			buttons.forEach(button => button.click());

			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div class="login-view bg-visma"><div>VISIBLE</div>')
				);
				done();
			});
		});
	});

	describe('should render a component with a list of divs', () => {
		const BaseView = function (v0, v1) {
			return {
				tag: 'div',
				attrs: {
					class: 'login-view'
				},
				children: [{
					tag: 'button',
					events: {
						click: v0
					},
					children: 'ADD'
				}, {
					tag: 'br'
				}, v1 ]
			};
		};

		const Looper = function (v0) {
			return {
				tag: 'div',
				children: [
					{
						tag: 'h1',
						children: v0
					}
				]
			};
		};

		const starter = function (v0) {
			return {
				tag: v0
			};
		};

		class SomeError extends Component {
			constructor(props) {
				super(props);
				this.state = {
					list: [ 'SS', 'SS1' ]
				};
			}

			render() {
				/* eslint new-cap:0 */
				return BaseView(this.toggle, (function () {
					return this.state.list.map(function (result){
						return Looper(result);
					});
				}).call(this));
			};
		}

		it('Initial render (creation)', () => {
			render(starter(SomeError), container);

			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div class="login-view"><button>ADD</button><br><div><h1>SS</h1></div><div><h1>SS1</h1></div></div>')
			);

			render(starter(SomeError), container);

			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div class="login-view"><button>ADD</button><br><div><h1>SS</h1></div><div><h1>SS1</h1></div></div>')
			);
		});
	});

	describe('should render a component with a list of text nodes', () => {
		const root = function (children) {
			return {
				tag: 'div',
				children: children
			};
		};

		const header = function (children) {
			return {
				tag: 'div',
				children: children
			};
		};

		const view = function (state) {
			return root([
				(state
					? header(['Foo'])
					: header([ 'Bar', 'Qux' ]))
			]);
		};

		it('Initial render (creation)', () => {
			render(view(true), container);
			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><div>Foo</div></div>')
			);
		});
		it('Second render (update)', () => {
			render(view(true), container);
			render(view(false), container);
			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><div>BarQux</div></div>')
			);
		});
	});
});
