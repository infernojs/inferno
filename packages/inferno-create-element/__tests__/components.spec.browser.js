import { render } from 'inferno';
import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import { innerHTML, waits } from 'inferno-utils';

let global;

describe('Components (non-JSX)', () => {
	let container;

	beforeEach(function() {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function() {
		render(null, container);
		document.body.removeChild(container);
	});

	class BasicComponent1 extends Component {
		render() {
			const template = (name, title) =>
				createElement(
					'div',
					{
						className: 'basic',
					},
					createElement(
						'span',
						{
							className: name,
						},
						'The title is ',
						title,
					),
				);
			return template(this.props.name, this.props.title);
		}
	}

	it('should render a basic component', () => {
		let template = (Component, title) =>
			createElement(
				'div',
				null,
				createElement(Component, {
					title,
					name: 'basic-render',
				}),
			);

		expect(() => {
			render(template(null, 'abc'), container);
		}).toThrowError();

		expect(() => {
			render(template({}, 'abc'), container);
		}).toThrowError();

		render(template(BasicComponent1, 'abc'), container);

		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).toBe('basic-render');
		expect(container.firstChild.firstChild.tagName).toBe('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('SPAN');
		expect(container.firstChild.firstChild.firstChild.innerHTML).toBe('The title is abc');

		expect(() => {
			render(template({}, 'abc'), container);
		}).toThrowError();

		expect(() => render(template(BasicComponent1, {}), container)).toThrow();

		render(template(BasicComponent1, []), container);

		render(template(BasicComponent1, 'abcdef'), container);

		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).toBe('basic-render');
		expect(container.firstChild.firstChild.tagName).toBe('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('SPAN');
		expect(container.firstChild.firstChild.firstChild.innerHTML).toBe('The title is abcdef');

		render(template(BasicComponent1, null), container);

		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).toBe('basic-render');
		expect(container.firstChild.firstChild.tagName).toBe('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('SPAN');
		expect(container.firstChild.firstChild.firstChild.innerHTML).toBe('The title is ');

		render(template(BasicComponent1, undefined), container);

		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).toBe('basic-render');
		expect(container.firstChild.firstChild.tagName).toBe('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('SPAN');
		expect(container.firstChild.firstChild.firstChild.innerHTML).toBe('The title is ');

		render(template(BasicComponent1, '1234'), container);

		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).toBe('basic-render');
		expect(container.firstChild.firstChild.tagName).toBe('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('SPAN');
		expect(container.firstChild.firstChild.firstChild.innerHTML).toBe('The title is 1234');
	});

	class BasicComponent1b extends Component {
		render() {
			const template = (isChecked, title) =>
				createElement(
					'div',
					{
						className: 'basic',
					},
					createElement(
						'label',
						{},
						createElement('input', {
							type: 'checkbox',
							checked: isChecked,
						}),
						'The title is ',
						title,
					),
				);
			return template(this.props.isChecked, this.props.title);
		}
	}
	//
	it('should render a basic component with inputs', () => {
		let template = (Component, title, isChecked) =>
			createElement(
				'div',
				null,
				createElement(Component, {
					title,
					isChecked,
				}),
			);

		render(null, container);

		render(template(BasicComponent1b, 'abc', true), container);
		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('type')).toBe('checkbox');
		expect(container.firstChild.firstChild.tagName).toBe('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('LABEL');
		expect(container.firstChild.firstChild.firstChild.innerHTML).toBe(
			innerHTML('<input type="checkbox">The title is abc'),
		);
		expect(container.querySelector('input').checked).toBe(true);

		render(null, container);
		render(null, container);

		render(template(BasicComponent1b, 'abc', null), container);
		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('type')).toBe('checkbox');
		expect(container.firstChild.firstChild.tagName).toBe('DIV');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('LABEL');
		expect(container.firstChild.firstChild.firstChild.innerHTML).toBe(
			innerHTML('<input type="checkbox">The title is abc'),
		);
		expect(container.querySelector('input').checked).toBe(false);
	});

	class BasicComponent1c extends Component {
		render() {
			const template = (isEnabled, title, type) =>
				createElement(
					'div',
					{
						className: 'basic',
					},
					createElement(
						'label',
						{},
						createElement('input', {
							type,
							disabled: !isEnabled,
						}),
						'The title is ',
						title,
					),
				);
			return template(this.props.isEnabled, this.props.title, this.props.type);
		}
	}

	it('should render a basic component with input tag and attributes', () => {
		let template = (Component, title, isEnabled) =>
			createElement(
				'div',
				null,
				createElement(Component, {
					title,
					isEnabled,
					type: 'password',
				}),
			);

		render(template(BasicComponent1c, 'abc', true), container);
		expect(container.firstChild.firstChild.tagName).toBe('DIV');
		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('LABEL');
		expect(container.firstChild.firstChild.firstChild.firstChild.tagName).toBe('INPUT');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('type')).toBe('password');
		expect(container.firstChild.firstChild.firstChild.firstChild.disabled).toBe(false);
		expect(container.firstChild.firstChild.firstChild.textContent).toBe('The title is abc');
		render(template(BasicComponent1c, ['abc'], true), container);
		expect(container.firstChild.firstChild.tagName).toBe('DIV');
		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('LABEL');
		expect(container.firstChild.firstChild.firstChild.firstChild.tagName).toBe('INPUT');
		expect(container.firstChild.firstChild.firstChild.firstChild.getAttribute('type')).toBe('password');
		expect(container.firstChild.firstChild.firstChild.firstChild.disabled).toBe(false);
		expect(container.firstChild.firstChild.firstChild.textContent).toBe('The title is abc');
	});

	class BasicComponent1d extends Component {
		render() {
			const template = (isDisabled, title) =>
				createElement(
					'div',
					{ className: 'basic' },
					createElement(
						'label',
						{},
						createElement('input', { type: 'password', disabled: isDisabled }),
						'The title is ',
						title,
					),
				);
			return template(this.props.isDisabled, this.props.title);
		}
	}

	it('should render a basic component with inputs #3 #3', () => {
		let template = (Component, title, isDisabled) =>
			createElement('div', null, createElement(Component, { title, isDisabled }));
		render(template(BasicComponent1d, 'abc', true), container);
		expect(innerHTML(container.innerHTML)).toBe(
			innerHTML(
				'<div><div class="basic"><label><input disabled="" type="password">The title is abc</label></div></div>',
			),
		);
		expect(container.querySelector('input').disabled).toBe(true);

		render(template(BasicComponent1d, '123', false), container);
		expect(innerHTML(container.innerHTML)).toBe(
			'<div><div class="basic"><label><input type="password">The title is 123</label></div></div>',
		);
		expect(container.querySelector('input').disabled).toBe(false);
	});

	it('should render a basic component and remove property if null #1', () => {
		let template = (Component, title, name) => createElement('div', null, createElement(Component, { title, name }));

		render(template(BasicComponent1, 'abc', 'basic-render'), container);

		expect(container.innerHTML).toBe(
			'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>',
		);

		render(template(BasicComponent1, '123', null), container);
		expect(container.innerHTML).toBe('<div><div class="basic"><span>The title is 123</span></div></div>');
	});

	it('should render a basic component and remove property if null #2', () => {
		let template = (Component, title, name) => createElement('div', null, createElement(Component, { title, name }));

		render(template(BasicComponent1, 'abc', null), container);

		expect(container.innerHTML).toBe('<div><div class="basic"><span>The title is abc</span></div></div>');

		render(null, container);

		render(template(BasicComponent1, '123', 'basic-update'), container);
		expect(container.innerHTML).toBe(
			'<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>',
		);
	});

	it('should render a basic root component', () => {
		let template = (Component, title, name) => createElement(Component, { title, name });

		render(template(BasicComponent1, 'abc', 'basic-render'), container);

		expect(container.innerHTML).toBe('<div class="basic"><span class="basic-render">The title is abc</span></div>');
		render(template(BasicComponent1, 'abc', 'basic-render'), container);

		expect(container.innerHTML).toBe('<div class="basic"><span class="basic-render">The title is abc</span></div>');

		render(template(BasicComponent1, 'abc', {}), container);

		expect(container.innerHTML).toBe('<div class="basic"><span class="[object Object]">The title is abc</span></div>');

		render(null, container);

		expect(container.innerHTML).toBe('');
	});

	class BasicComponent2 extends Component {
		render() {
			const template = (name, title, children) =>
				createElement(
					'div',
					{
						className: 'basic',
					},
					createElement(
						'span',
						{
							className: name,
						},
						'The title is ',
						title,
					),
					children,
				);
			return template(this.props.name, this.props.title, this.props.children);
		}
	}

	it('should render a basic component with children', () => {
		let template = (Component, title, name) =>
			createElement(
				'div',
				null,
				createElement(
					Component,
					{
						title,
						name,
					},
					createElement('span', null, "I'm a child"),
				),
			);

		render(template(BasicComponent2, 'abc', 'basic-render'), container);

		expect(container.innerHTML).toBe(
			'<div><div class="basic"><span class="basic-render">The title is abc</span><span>I\'m a child</span></div></div>',
		);
		render(template(BasicComponent2, 'abc', 'basic-render'), container);

		expect(container.innerHTML).toBe(
			'<div><div class="basic"><span class="basic-render">The title is abc</span><span>I\'m a child</span></div></div>',
		);

		render(template(BasicComponent2, '123', 'basic-update'), container);
		expect(container.innerHTML).toBe(
			'<div><div class="basic"><span class="basic-update">The title is 123</span><span>I\'m a child</span></div></div>',
		);
		render(template(BasicComponent2, '1234', 'basic-update'), container);
		expect(container.innerHTML).toBe(
			'<div><div class="basic"><span class="basic-update">The title is 1234</span><span>I\'m a child</span></div></div>',
		);
	});

	class BasicComponent2b extends Component {
		render() {
			const template = children =>
				createElement('div', null, createElement('span', null, 'component!'), createElement('div', null, children));
			return template(this.props.children);
		}
	}

	class BasicComponent2c extends Component {
		render() {
			const template = children =>
				createElement(
					'div',
					null,
					createElement('span', null, 'other component!'),
					createElement('div', null, children),
				);
			return template(this.props.children);
		}
	}

	class BasicComponent3 extends Component {
		render() {
			const template = (styles, title) =>
				createElement(
					'div',
					{
						style: styles,
					},
					createElement(
						'span',
						{
							style: styles,
						},
						'The title is ',
						title,
					),
				);

			return template(this.props.styles, this.props.title);
		}
	}

	if (typeof global !== 'undefined' && !global.usingJSDOM) {
		it('should render a basic component with styling', () => {
			let template = (Component, props) => createElement(Component, props);

			render(
				template(BasicComponent3, {
					title: 'styled!',
					styles: {
						color: 'red',
						paddingLeft: '10px',
					},
				}),
				container,
			);

			expect(container.innerHTML).toBe(
				'<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>',
			);
			render(
				template(BasicComponent3, {
					title: 'styled!',
					styles: {
						color: 'red',
						paddingLeft: '10px',
					},
				}),
				container,
			);

			expect(container.innerHTML).toBe(
				'<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>',
			);

			render(
				template(BasicComponent3, {
					title: 'styled (again)!',
					styles: {
						color: 'blue',
						paddingRight: '20px',
					},
				}),
				container,
			);
			expect(container.innerHTML).toBe(
				'<div style="color: blue; padding-right: 20px;"><span style="color: blue; padding-right: 20px;">The title is styled (again)!</span></div>',
			);
		});
	}

	it('should render a basic component with component children', () => {
		let template = (Component1, Component2, Component3) =>
			createElement(Component1, null, createElement(Component2, null, createElement(Component3, null)));
		render(template(BasicComponent2b, BasicComponent2b, BasicComponent2b), container);

		expect(container.innerHTML).toBe(
			'<div><span>component!</span><div><div><span>component!</span><div><div><span>component!</span><div></div></div></div></div></div></div>',
		);

		render(null, container);

		render(template(BasicComponent2b, BasicComponent2b, BasicComponent2b), container);
		expect(container.innerHTML).toBe(
			'<div><span>component!</span><div><div><span>component!</span><div><div><span>component!</span><div></div></div></div></div></div></div>',
		);

		render(template(BasicComponent2b, BasicComponent2b, BasicComponent2c), container);
		expect(container.innerHTML).toBe(
			'<div><span>component!</span><div><div><span>component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>',
		);

		render(template(BasicComponent2b, BasicComponent2c, BasicComponent2c), container);
		expect(container.innerHTML).toBe(
			'<div><span>component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>',
		);

		render(template(BasicComponent2b, BasicComponent2c, BasicComponent2c), container);
		expect(container.innerHTML).toBe(
			'<div><span>component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>',
		);

		render(template(BasicComponent2c, BasicComponent2c, BasicComponent2c), container);
		expect(container.innerHTML).toBe(
			'<div><span>other component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>',
		);
		render(template(BasicComponent2c, BasicComponent2c, BasicComponent2c), container);
		expect(container.innerHTML).toBe(
			'<div><span>other component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>',
		);
	});

	it('should render a basic component and correctly mount', () => {
		let template;
		let componentWillMountCount;

		class ComponentLifecycleCheck extends Component {
			render() {
				const _template = children =>
					createElement('div', null, createElement('span', null, 'component!'), createElement('div', null, children));
				return _template(this.props.children);
			}

			componentWillMount() {
				componentWillMountCount++;
			}
		}

		componentWillMountCount = 0;
		template = (Component1, Component2, Component3) =>
			createElement(Component1, null, createElement(Component2, null, createElement(Component3, null)));

		render(template(ComponentLifecycleCheck, ComponentLifecycleCheck, ComponentLifecycleCheck), container);
		expect(componentWillMountCount).toBe(3);

		render(template(ComponentLifecycleCheck, ComponentLifecycleCheck, ComponentLifecycleCheck), container);
		expect(componentWillMountCount).toBe(3);
	});

	describe('should render multiple components', () => {
		it('should render multiple components', () => {
			let template = (Component, title1, name1, Component2, title2, name2) =>
				createElement(
					'div',
					null,
					createElement(Component, {
						title: title1,
						name: name1,
					}),
					createElement(Component2, {
						title: title2,
						name: name2,
					}),
				);

			render(
				template(BasicComponent1, 'component 1', 'basic-render', BasicComponent1, 'component 2', 'basic-render'),
				container,
			);

			expect(container.innerHTML).toBe(
				'<div><div class="basic"><span class="basic-render">The title is component 1</span></div>' +
					'<div class="basic"><span class="basic-render">The title is component 2</span></div></div>',
			);

			render(
				template(BasicComponent1, 'component 1', 'basic-render', BasicComponent1, 'component 2', 'basic-render'),
				container,
			);

			expect(container.innerHTML).toBe(
				'<div><div class="basic"><span class="basic-render">The title is component 1</span></div>' +
					'<div class="basic"><span class="basic-render">The title is component 2</span></div></div>',
			);
		});
	});

	it('should mount and unmount a basic component', () => {
		let mountCount;
		let unmountCount;
		let template;

		class ComponentLifecycleCheck extends Component {
			render() {
				const _template = () => createElement('div', null, createElement('span', null));
				return _template();
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
		template = Component => createElement(Component, null);
		render(template(ComponentLifecycleCheck), container);

		expect(mountCount).toBe(1);
		render(null, container);
		expect(unmountCount).toBe(1);
	});

	it('should mount and unmount a basic component #2', () => {
		let mountCount;
		let unmountCount;

		class ComponentLifecycleCheck extends Component {
			render() {
				return createElement('div', null, createElement('span', null));
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

		render(createElement(ComponentLifecycleCheck, null), container);
		expect(mountCount).toBe(1);
		render(null, container);
		expect(unmountCount).toBe(1);
		render(createElement(ComponentLifecycleCheck, null), container);
		expect(mountCount).toBe(2);
		render(null, container);
		expect(unmountCount).toBe(2);
	});

	describe('state changes should trigger all lifecycle events for an update', () => {
		let componentWillMountCount;
		let template;

		class ComponentLifecycleCheck extends Component {
			constructor() {
				super(null);
				this.state = {
					counter: 0,
				};
			}

			render() {
				const _template = counter => createElement('div', null, createElement('span', {}, counter));
				return _template(this.state.counter);
			}

			componentWillMount() {
				componentWillMountCount++;
				this.setState({
					counter: this.state.counter + 1,
				});
			}
		}

		beforeEach(done => {
			componentWillMountCount = 0;
			template = Component => createElement(Component, null);
			render(template(ComponentLifecycleCheck), container);
			waits(30, done);
		});

		it('componentWillMountCount to have fired once', () => {
			expect(componentWillMountCount).toBe(1);
		});
		it('the element in the component should show the new state', () => {
			expect(container.innerHTML).toBe('<div><span>1</span></div>');
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
					counter: 0,
				};
			}

			render() {
				const _template = counter => createElement('div', null, createElement('span', {}, counter));
				return _template(this.state.counter);
			}

			componentWillMount() {
				componentWillMountCount++;
				setTimeout(() => {
					this.setState({
						counter: this.state.counter + 1,
					});
				}, 1);
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

		beforeEach(done => {
			componentWillMountCount = 0;
			shouldComponentUpdateCount = 0;
			componentDidUpdateCount = 0;
			componentWillUpdateCount = 0;
			template = Component => createElement(Component, null);
			render(template(ComponentLifecycleCheck), container);
			waits(30, done);
		});

		it('componentWillMountCount to have fired once', () => {
			expect(componentWillMountCount).toBe(1);
		});
		it('shouldComponentUpdateCount to have fired once', () => {
			expect(shouldComponentUpdateCount).toBe(1);
		});
		it('componentWillUpdateCount to have fired once', () => {
			expect(componentWillUpdateCount).toBe(1);
		});
		it('componentDidUpdateCount to have fired once', () => {
			expect(componentDidUpdateCount).toBe(1);
		});
		it('the element in the component should show the new state', () => {
			expect(container.innerHTML).toBe('<div><span>1</span></div>');
		});
	});

	describe('should render a basic component with conditional fragment', () => {
		const tpl3625453295 = function() {
			return createElement('h1', null, 'BIG');
		};
		const tpl4021787591 = function() {
			return createElement('h2', null, 'small');
		};

		class ConditionalComponent extends Component {
			render() {
				return createElement('div', null, [
					this.props.condition ? tpl3625453295() : tpl4021787591(),
					createElement('p', null, 'test'),
				]);
			}
		}

		it('Initial render (creation)', () => {
			render(createElement(ConditionalComponent, { condition: true }), container);
			expect(container.innerHTML).toBe('<div><h1>BIG</h1><p>test</p></div>');
			render(createElement(ConditionalComponent, { condition: false }), container);
			expect(container.innerHTML).toBe('<div><h2>small</h2><p>test</p></div>');
		});
	});

	describe('should render a basic component with a list of values from state', () => {
		const tpl2026545261 = function(v0) {
			return createElement('ul', { class: 'login-organizationlist' }, '', v0, '');
		};
		const tpl3192647933 = function(v0) {
			return createElement('li', null, v0);
		};
		const tpl1546018623 = function(v0) {
			return createElement(v0, null);
		};

		class ValueComponent extends Component {
			constructor(props) {
				super(props);
				this.state = {
					organizations: [
						{ name: 'test1', key: '1' },
						{ name: 'test2', key: 2 },
						{ name: 'test3', key: '3' },
						{ name: 'test4', key: '4' },
						{ name: 'test5', key: '5' },
						{ name: 'test6', key: '6' },
					],
				};
			}

			render() {
				return tpl2026545261(
					this.state.organizations.map(function(result) {
						return tpl3192647933(result.name);
					}),
				);
			}
		}

		it('Initial render (creation)', () => {
			render(tpl1546018623(ValueComponent), container);
			expect(container.innerHTML).toBe(
				'<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>',
			);
			render(tpl1546018623(ValueComponent), container);
			expect(container.innerHTML).toBe(
				'<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>',
			);
			render(tpl1546018623(ValueComponent), container);
			expect(container.innerHTML).toBe(
				'<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>',
			);
		});
	});

	function BasicStatelessComponent1({ name, title }) {
		const template = (_name, _title) =>
			createElement(
				'div',
				{
					className: 'basic',
				},
				createElement(
					'span',
					{
						className: _name,
					},
					'The title is ',
					_title,
				),
			);
		return template(name, title);
	}

	it('should render a stateless component', () => {
		let template = (Component, title) =>
			createElement(
				'div',
				null,
				createElement(Component, {
					title,
					name: 'Hello, World!',
				}),
			);

		render(template(BasicStatelessComponent1, 'abc'), container);
		expect(container.firstChild.childNodes.length).toBe(1);
		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).toBe('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('SPAN');
		expect(container.firstChild.firstChild.firstChild.textContent).toBe('The title is abc');
		render(template(BasicStatelessComponent1, null), container);
		render(template(BasicStatelessComponent1, 'abc'), container);
		expect(container.firstChild.childNodes.length).toBe(1);
		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).toBe('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('SPAN');
		expect(container.firstChild.firstChild.firstChild.textContent).toBe('The title is abc');

		render(template(BasicStatelessComponent1), container);
		expect(container.firstChild.childNodes.length).toBe(1);
		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).toBe('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('SPAN');
		expect(container.firstChild.firstChild.firstChild.textContent).toBe('The title is ');

		render(template(BasicStatelessComponent1), container);
		expect(container.firstChild.childNodes.length).toBe(1);
		expect(container.firstChild.firstChild.getAttribute('class')).toBe('basic');
		expect(container.firstChild.firstChild.firstChild.getAttribute('class')).toBe('Hello, World!');
		expect(container.firstChild.firstChild.firstChild.tagName).toBe('SPAN');
		expect(container.firstChild.firstChild.firstChild.textContent).toBe('The title is ');
	});

	describe('should render a component with a conditional state item', () => {
		const tpl3578458729 = function(v0) {
			return createElement('div', { className: 'login-view bg-visma' }, v0);
		};
		const tpl188998005 = function() {
			return createElement('div', null, 'VISIBLE');
		};

		const tpl3754840163 = function(v0) {
			return createElement('div', null, createElement('button', { onclick: v0 }, 'Make visible'));
		};

		class TEST extends Component {
			constructor(props) {
				super(props);
				this.state = {
					show: false,
				};

				this.makeVisible = function() {
					this.setState({
						show: true,
					});
				}.bind(this);
			}

			render() {
				return tpl3578458729(
					function() {
						if (this.state.show === true) {
							return tpl188998005();
						} else {
							return tpl3754840163(this.makeVisible);
						}
					}.call(this),
				);
			}
		}

		const tpl79713834 = function(v0) {
			return createElement(v0, null);
		};

		it('Initial render (creation)', () => {
			render(tpl79713834(TEST), container);
			expect(container.innerHTML).toBe(
				innerHTML('<div class="login-view bg-visma"><div><button>Make visible</button></div></div>'),
			);
		});

		it('Second render (update with state change)', done => {
			render(tpl79713834(TEST), container);
			render(tpl79713834(TEST), container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

			buttons.forEach(button => button.click());

			requestAnimationFrame(() => {
				expect(container.innerHTML).toBe(innerHTML('<div class="login-view bg-visma"><div>VISIBLE</div>'));
				done();
			});
		});
	});

	describe('should render a component with a list of divs', () => {
		const BaseView = function(v0, v1) {
			return createElement(
				'div',
				{ class: 'login-view' },
				createElement('button', { onclick: v0 }, 'ADD'),
				createElement('br', null),
				v1,
			);
		};

		const Looper = function(v0) {
			return createElement('div', null, createElement('h1', null, v0));
		};

		const starter = function(v0) {
			return createElement(v0, null);
		};

		class SomeError extends Component {
			constructor(props) {
				super(props);
				this.state = {
					list: ['SS', 'SS1'],
				};
			}

			render() {
				/* eslint new-cap:0 */
				return BaseView(
					this.toggle,
					function() {
						return this.state.list.map(function(result) {
							return Looper(result);
						});
					}.call(this),
				);
			}
		}

		it('Initial render (creation)', () => {
			render(starter(SomeError), container);

			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="login-view"><button>ADD</button><br><div><h1>SS</h1></div><div><h1>SS1</h1></div></div>',
				),
			);

			render(starter(SomeError), container);

			expect(container.innerHTML).toBe(
				innerHTML(
					'<div class="login-view"><button>ADD</button><br><div><h1>SS</h1></div><div><h1>SS1</h1></div></div>',
				),
			);
		});
	});

	describe('should render a component with a list of text nodes', () => {
		const root = function(children) {
			return createElement('div', null, children);
		};

		const header = function(children) {
			return createElement('div', null, children);
		};

		const view = function(state) {
			return root([state ? header(['Foo']) : header(['Bar', 'Qux'])]);
		};

		it('Initial render (creation)', () => {
			render(view(true), container);
			expect(container.innerHTML).toBe(innerHTML('<div><div>Foo</div></div>'));
		});
		it('Second render (update)', () => {
			render(view(true), container);
			render(view(false), container);
			expect(container.innerHTML).toBe(innerHTML('<div><div>BarQux</div></div>'));
		});
	});

	describe('SetState function callback', () => {
		it('Should have state, props, and context as parameters', done => {
			function checkParams(state, props, context) {
				expect(state).toEqual({ btnstate: 'btnstate' });
				expect(props).toEqual({ buttonProp: 'magic', children: 'btn' });
				expect(context).toEqual({ color: 'purple' });
				done();
			}

			class Button extends Component {
				constructor(props) {
					super(props);
					this.state = {
						btnstate: 'btnstate',
					};
				}

				click() {
					this.setState(checkParams);
				}

				render() {
					return createElement(
						'button',
						{
							onClick: this.click.bind(this),
							style: {
								background: this.context.color,
							},
						},
						this.props.children,
					);
				}
			}

			class Message extends Component {
				render() {
					return createElement('div', null, [this.props.text, createElement(Button, { buttonProp: 'magic' }, 'btn')]);
				}
			}

			class MessageList extends Component {
				getChildContext() {
					return { color: 'purple' };
				}

				render() {
					const children = this.props.messages.map(function(message) {
						return createElement(Message, { text: message.text });
					});

					return createElement('div', null, children);
				}
			}

			render(createElement(MessageList, { messages: [{ text: 'eka' }, { text: 'toka' }] }), container);

			container.querySelector('button').click();
		});
	});
});
