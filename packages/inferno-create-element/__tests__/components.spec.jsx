
import { render } from 'inferno';
import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import { assert, spy } from 'sinon';
import { innerHTML } from 'inferno-utils';

describe('Components (JSX)', () => {
	let container;
	let Inner;
	let attachedListener = null;
	let renderedName = null;

	beforeEach(function () {
		attachedListener = null;
		renderedName = null;
		container = document.createElement('div');
		document.body.appendChild(container);

		Inner = class extends Component {
			render() {
				attachedListener = this.props.onClick;
				renderedName = this.props.name;
				return <div className={this.props.name}/>;
			}
		};
	});

	afterEach(function () {
		render(null, container);
		document.body.removeChild(container);
	});

	class BasicComponent1 extends Component {
		render() {
			return (
				<div className="basic">
					<span className={this.props.name}>The title is {this.props.title}</span>
				</div>
			);
		}
	}

	it('should render a basic component jsx', () => {
		render((
			<div><BasicComponent1 title="abc" name="basic-render"/></div>
		), container);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>')
        );

		render((
			<div><BasicComponent1 title="abc" name="basic-render"/></div>
		), container);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>')
        );

		const attrs = { title: 'abc', name: 'basic-render2', foo: 'bar' };

		// JSX Spread Attribute
		render((
			<div><BasicComponent1 { ...attrs } /></div>
		), container);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span class="basic-render2">The title is abc</span></div></div>')
        );
	});

	class BasicComponent1b extends Component {
		render() {
			return (
				<div className="basic">
					<label>
						<input checked={this.props.isChecked}/>
						The title is {this.props.title}
					</label>
				</div>
			);
		}
	}

	it('should render a basic component with inputs', () => {
		render((
			<div>
				<BasicComponent1b title="abc" isChecked={true}/>
			</div>
		), container);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><label><input>The title is abc</label></div></div>')
        );
		expect(
			container.querySelector('input').checked
		).toBe(true);

		render((
			<div>
				<BasicComponent1b title="123" isChecked={false}/>
			</div>
		), container);
		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><label><input>The title is 123</label></div></div>')
        );
		expect(
			container.querySelector('input').checked
		).toBe(false);

		render((
			<div>
				<BasicComponent1b title="123" isChecked={null}/>
			</div>
		), container);

		render((
			<div></div>
		), container);

		render((
			<div>
				<BasicComponent1b title="123" isChecked={true}/>
			</div>
		), container);
		expect(
			container.querySelector('input').checked
		).toBe(true);
	});

	it('should render a basic component and remove property if null', () => {

		render((
				<div>
					<BasicComponent1 title="abc" name="basic-render"/>
				</div>
			),
			container
		);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>')
        );

		render((
				<div></div>
			),
			container
		);
		render((
				<div>
					<BasicComponent1 title="Hello, World!" name="basic-render"/>
				</div>
			),
			container
		);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span class="basic-render">The title is Hello, World!</span></div></div>')
        );

		render((
				<div>
					<BasicComponent1 title="123" name={null}/>
				</div>
			),
			container
		);
		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span>The title is 123</span></div></div>')
        );
		render((
				<div>
					<BasicComponent1 title={[]} name={null}/>
				</div>
			),
			container
		);
		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span>The title is </span></div></div>')
        );

		render((
			<div>
				<BasicComponent1 title={null} name={null}/>
			</div>
		), container);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span>The title is </span></div></div>')
        );

		render((
			<div>
				<BasicComponent1 title="abc" name={null}/>
			</div>
		), container);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span>The title is abc</span></div></div>')
        );

		render((
			<div>
				<BasicComponent1 title="123" name="basic-update"/>
			</div>
		), container);
		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>')
        );
	});

	it('should render a basic root component', () => {

		render((
			<BasicComponent1 title="abc" name="basic-render"/>
		), container);

		expect(container.firstChild.getAttribute('class')).toBe('basic');

		render((
			<BasicComponent1 title="abc" name="basic-render"/>
		), container);

		expect(container.firstChild.getAttribute('class')).toBe('basic');

		render((
			<BasicComponent1 title="123" name="basic-update"/>
		), container);
		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div class="basic"><span class="basic-update">The title is 123</span></div>')
        );
	});

	class BasicComponent2 extends Component {
		render() {
			return (
				<div className="basic">
					<span className={this.props.name}>The title is {this.props.title}</span>
					{this.props.children}
				</div>
			);
		}
	}

	it('should render a basic component with children', () => {

		render((
			<div>
				<BasicComponent2 title="abc" name="basic-render">
					<span>Im a child</span>
				</BasicComponent2>
			</div>
		), container);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span class="basic-render">The title is abc</span><span>Im a child</span></div></div>')
        );

		render((
			<div>
				<BasicComponent2 title="123" name="basic-update">
					<span>Im a child</span>
				</BasicComponent2>
			</div>
		), container);
		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span class="basic-update">The title is 123</span><span>Im a child</span></div></div>')
        );
	});

	it('should render multiple components', () => {

		render((
			<div>
				<BasicComponent1 title="component 1" name="basic-render"/>
				<BasicComponent1 title="component 2" name="basic-render"/>
			</div>
		), container);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span class="basic-render">The title is component 1</span></div>'
				+ '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>')
        );

		render((
			<div>
				<BasicComponent1 title="component 1" name="basic-render"/>
			</div>
		), container);
		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div><div class="basic"><span class="basic-render">The title is component 1</span></div></div>')
        );
	});

	class BasicComponent3 extends Component {
		render() {
			return (
				<div style={this.props.styles}>
					<span style={this.props.styles}>The title is {this.props.title}</span>
				</div>
			);
		}
	}

	it('should render a basic component with styling', () => {

		render((
			<BasicComponent3 title="styled!" styles={{ color: 'red', paddingLeft: '10px' }}/>
		), container);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>')
        );

		render((
			<BasicComponent3 />
		), container);

		render((
			<BasicComponent3 title="styled (again)!" styles={{ color: 'blue', marginBottom: '20px' }}/>
		), container);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div style="color: blue; margin-bottom: 20px;"><span style="color: blue; margin-bottom: 20px;">The title is styled (again)!</span></div>')
        );
	});

	it('should render a basic component and remove styling', () => {

		render((
			<BasicComponent3 title="styled!" styles={{ color: 'red', paddingTop: '20px' }}/>
		), container);

		expect(
			container.innerHTML
		).toBe(
            innerHTML('<div style="color: red; padding-top: 20px;"><span style="color: red; padding-top: 20px;">The title is styled!</span></div>')
        );

		render((
			<BasicComponent3 title="styles are removed!" styles={null}/>
		), container);

		expect(container.firstChild.getAttribute('style')).to.be.oneOf([ null, '' ]);
		expect(container.firstChild.tagName).toEqual('DIV');
		expect(container.firstChild.firstChild.innerHTML).toEqual('The title is styles are removed!');
	});

	class SuperComponent extends Component {
		constructor(props) {
			super(props);
			this.state = {
				organizations: [
					{ name: 'test1', key: '1' },
					{ name: 'test2', key: '2' },
					{ name: 'test3', key: '3' },
					{ name: 'test4', key: '4' },
					{ name: 'test5', key: '5' },
					{ name: 'test6', key: '6' }
				]
			};
		}

		render() {
			return (
				<ul class="login-organizationlist">
					{this.state.organizations.map((result) => {
						return <li>{result.name}</li>;
					})}
				</ul>
			);
		}
	}
	it('should render a basic component with a list of values from state', () => {
		render(<SuperComponent />, container);
		expect(
			container.innerHTML
		).toBe(
            '<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>'
        );
	});

	it('should render a basic component with an element and components as children', () => {
		class Navbar extends Component {
			render() {
				return (
					<ul>
						<li>Nav1</li>
					</ul>
				);
			}
		}

		class Main extends Component {
			render() {
				return (
					<div className="main">
						<Navbar />
						<div id="app"/>
					</div>
				);
			}
		}

		render(<Main />, container);

	});

	function test(element, expectedTag, expectedClassName, callback) {

		render(element, container);
		setTimeout(() => {
			expect(container.firstChild).not.toBe(null);
			expect(container.firstChild.tagName).toBe(expectedTag);
			expect(container.firstChild.className).toBe(expectedClassName);
			callback();
		}, 30);
	}

	it('should preserve the name of the class for use in error messages', function () {
		class Foo extends Component {
		}
		expect(Foo.name).toBe('Foo');
	});

	it('should only render once when setting state in componentWillMount', function (done) {
		let renderCount = 0;
		class Foo extends Component {
			constructor(props) {
				super(props);
				this.state = { bar: props.initialValue };
			}

			componentWillMount() {
				this.setState({ bar: 'bar' });
			}

			render() {
				renderCount++;
				return <span className={this.state.bar}/>;
			}
		}
		test(<Foo initialValue={null}/>, 'SPAN', 'bar', () => {
			test(<Foo initialValue="foo"/>, 'SPAN', 'bar', () => {
				expect(renderCount).toBe(2);
				done();
			});
		});
		// setState causes a render, so we should expect 2
	});

	it('should render with null in the initial state property', function (done) {
		class Foo extends Component {
			constructor(props) {
				super(props);
				this.state = null;
			}

			render() {
				return <span />;
			}
		}
		test(<Foo />, 'SPAN', '', done);
	});

	it('should setState through an event handler', (done) => {
		class Foo extends Component {
			constructor(props) {
				super(props);
				this.state = { bar: props.initialValue };
			}

			handleClick() {
				this.setState({ bar: 'bar' });
			}

			render() {
				return (
					<Inner
						name={this.state.bar}
						onClick={this.handleClick.bind(this)}
					/>
				);
			}
		}
		test(<Foo initialValue="foo"/>, 'DIV', 'foo', () => {
			expect(renderedName).toBe('foo');
			attachedListener();
			setTimeout(() => {
				expect(renderedName).toBe('bar');
				done();
			}, 10);
		});
	});

	it('should render using forceUpdate even when there is no state', (done) => {
		class Foo extends Component {
			constructor(props) {
				super(props);
				this.mutativeValue = props.initialValue;
			}

			handleClick() {
				this.mutativeValue = 'bar';
				this.forceUpdate();
			}

			render() {
				return (
					<Inner
						name={this.mutativeValue}
						onClick={this.handleClick.bind(this)}
					/>
				);
			}
		}
		test(<Foo initialValue="foo"/>, 'DIV', 'foo', function () {
			attachedListener();
			expect(renderedName).toBe('bar');
			done();
		});
	});

	describe('should render a component with a list of children that dynamically update via setState', () => {
		class Counter extends Component {
			constructor(props) {
				super(props);
				this.state = {
					count: 0
				};
				this.incrementCount = this.incrementCount.bind(this);
			}

			incrementCount() {
				this.setState({
					count: this.state.count + 1
				});
			}

			render() {
				return (
					<div class="my-component">
						<h1>{this.props.car} {this.state.count}</h1>
						<button type="button" onClick={this.incrementCount}>Increment</button>
					</div>
				);
			}
		}

		class Wrapper extends Component {
			constructor(props) {
				super(props);
			}

			render() {
				return (
					<div>
						{[ 'Saab', 'Volvo', 'BMW' ].map(function (c) {
							return (<Counter car={c}/>);
						})}
					</div>
				);
			}
		}

		it('Initial render (creation)', () => {
			render(<Wrapper />, container);

			expect(
				container.innerHTML
			).toBe(
                innerHTML('<div><div class="my-component"><h1>Saab 0</h1><button type="button">Increment</button></div><div class="my-component"><h1>Volvo 0</h1><button type="button">Increment</button></div><div class="my-component"><h1>BMW 0</h1><button type="button">Increment</button></div></div>')
            );
		});

		it('Second render (update) #1', (done) => {
			render(<Wrapper />, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
			buttons.forEach((button) => button.click());

			// requestAnimationFrame is needed here because
			// setState fires after a requestAnimationFrame
			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).toBe(
                    innerHTML('<div><div class="my-component"><h1>Saab 1</h1><button type="button">Increment</button></div><div class="my-component"><h1>Volvo 1</h1><button type="button">Increment</button></div><div class="my-component"><h1>BMW 1</h1><button type="button">Increment</button></div></div>')
                );
				done();
			});
		});
	});

	describe('should render a component with a conditional state item', () => {
		class SomeError extends Component {
			constructor(props) {
				super(props);

				this.state = {
					show: false
				};

				this.toggle = this.toggle.bind(this);
			}

			toggle() {
				this.setState({
					show: !this.state.show
				});
			}

			render() {
				return (
					<div className="login-view bg-visma">
						<button onClick={this.toggle}>TOGGLE</button>
						<br />
						{function () {
							if (this.state.show === true) {
								return <h1>This is cool!</h1>;
							} else {
								return <h1>Not so cool</h1>;
							}
						}.call(this)}
					</div>
				);
			}
		}

		it('Initial render (creation)', () => {
			render(<SomeError />, container);

			expect(
				container.innerHTML
			).toBe(
                innerHTML('<div class="login-view bg-visma"><button>TOGGLE</button><br><h1>Not so cool</h1></div>')
            );
		});

		it('Second render (update with state change) #2', (done) => {
			render(<SomeError />, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
			buttons.forEach((button) => button.click());

			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).toBe(
                    innerHTML('<div class="login-view bg-visma"><button>TOGGLE</button><br><h1>This is cool!</h1></div>')
                );
				done();
			});
		});
	});

	describe('should render a stateless component with a conditional state item', () => {
		const StatelessComponent = (props) => <p>{props.name}</p>;

		class Testing extends Component {
			constructor(props) {
				super(props);
				this.name = 'Kalle';

				this.state = {
					show: false
				};

				this.toggle = this.toggle.bind(this);
			}

			toggle() {
				this.setState({
					show: !this.state.show
				});
			}

			render() {
				return (
					<div>
						{function () {
							if (this.state.show === true) {
								return (
									<StatelessComponent name={this.name}/>
								);
							} else {
								return (
									<h1>Hello folks</h1>
								);
							}
						}.call(this)}
						<button onClick={this.toggle}>toggle</button>
					</div>
				);
			}
		}

		it('Initial render (creation)', () => {

			render(null, container);

			render(<Testing />, container);

			expect(
				container.innerHTML
			).toBe(innerHTML('<div><h1>Hello folks</h1><button>toggle</button></div>'));
		});

		it('Second render (update with state change) #3', (done) => {
			render(<Testing />, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
			buttons.forEach((button) => button.click());

			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).toBe(innerHTML('<div><p>Kalle</p><button>toggle</button></div>'));
				done();
			});
		});
	});

	describe('should render a repeating counter component with component children', () => {
		let id = 0;

		class Value extends Component {
			constructor(props) {
				super(props);
				this.id = ++id;
			}

			render() {
				return <div>{this.props.value}</div>;
			}
		}

		class Repeater extends Component {
			render() {
				// this doesn't work - only the last value is updated
				const children = [];
				for (let i = 0; i < 3; i++) {
					children.push(<Value key={i} value={this.props.value}/>);
				}

				return (<div>
					{children}
				</div>);

				// this works - all values are updated
				// return <div>
				//    <Value value={ this.props.value }/>
				//    <Value value={ this.props.value }/>
				//    <Value value={ this.props.value }/>
				// </div>
			}
		}

		it('should correctly render as values increase', () => {
			let value = 0;

			render(<Repeater value={value}/>, container);
			expect(
				container.innerHTML
			).toBe(innerHTML('<div><div>0</div><div>0</div><div>0</div></div>'));

			value++;
			render(<Repeater value={value}/>, container);
			expect(
				container.innerHTML
			).toBe(innerHTML('<div><div>1</div><div>1</div><div>1</div></div>'));

			value++;
			render(<Repeater value={value}/>, container);
			expect(
				container.innerHTML
			).toBe(innerHTML('<div><div>2</div><div>2</div><div>2</div></div>'));
		});
	});

	describe('should render a component with component children as the only child', () => {
		class Jaska extends Component {
			constructor(props) {
				super(props);
			}

			render() {
				return (
					<div>
						<h1>Okdokfwoe</h1>
						<p>odkodwq</p>
					</div>
				);
			}
		}

		class Container extends Component {
			constructor(props) {
				super(props);
			}

			render() {
				return (
					<div>
						{this.props.children}
					</div>
				);
			}
		}

		class TestingProps extends Component {
			constructor(props) {
				super(props);
			}

			render() {
				return (
					<div>
						<Container>
							<Jaska />
						</Container>
					</div>
				);
			}
		}

		it('should correctly render', () => {
			render(<TestingProps />, container);
			expect(
				container.innerHTML
			).toBe(
                innerHTML('<div><div><div><h1>Okdokfwoe</h1><p>odkodwq</p></div></div></div>')
            );
		});
	});

	describe('should render a component with with mapped text nodes', () => {
		class MyComponent98 extends Component {
			constructor(props) {
				super(props);
				this.state = {
					isok: false
				};
			}

			componentDidMount() {
				this.setState({ isok: true });
			}

			render() {
				return (
					<MyComponent99
						isok={this.state.isok}/>
				);
			}
		}

		class MyComponent99 extends Component {
			constructor(props) {
				super(props);
			}

			render() {
				return (
					<div>
						isok={this.props.isok ? 'true' : 'false'}
						<div>
							{this.props.isok &&
							[ 'a', 'b' ].map((x) => {
								return (
									<span>{x}</span>
								);
							})}
						</div>
					</div>
				);
			}
		}

		it('should correctly render', (done) => {
			render(<MyComponent98 />, container);
			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).toBe(innerHTML('<div>isok=true<div><span>a</span><span>b</span></div></div>'));
				done();
			});

		});
	});

	describe('should render a component with conditional boolean text nodes', () => {
		class MyComponent98 extends Component {
			constructor(props) {
				super(props);
				this.state = {
					isok: false
				};
			}

			componentDidMount() {
				this.setState({ isok: true });
			}

			render() {
				return (
					<MyComponent99
						isok={this.state.isok}/>
				);
			}
		}

		class MyComponent99 extends Component {
			constructor(props) {
				super(props);
			}

			render() {
				const z = function (v) {
					if (v) {
						return (
							<span>a</span>
						);
					} else {
						return (
							<span>b</span>
						);
					}
				};

				return (
					<div>
						<div>
							{z(this.props.isok)}
						</div>
					</div>
				);
			}
		}

		it('should correctly render', (done) => {
			render(<MyComponent98 />, container);
			setTimeout(() => {
				expect(
					container.innerHTML
				).toBe(innerHTML('<div><div><span>a</span></div></div>'));
				done();
			}, 10);
		});
	});

	const StatelessComponent2 = (props) => <div>{props.name}</div>;

	it('should render stateless component', () => {

		render(<StatelessComponent2 name="A"/>, container);
		expect(container.textContent).toBe('A');
	});

	it('should unmount stateless component', function () {

		render(<StatelessComponent2 name="A"/>, container);
		expect(container.textContent).toBe('A');

		render(null, container);
		expect(container.textContent).toBe('');
	});

	it('should support module pattern components', function () {
		function Child({ test }) {
			return <div>{test}</div>;
		}

		render(<Child test="test"/>, container);

		expect(container.textContent).toBe('test');
	});

	describe('should render a component with a conditional list that changes upon toggle', () => {
		class BuggyRender extends Component {
			constructor(props) {
				super(props);

				this.state = {
					empty: true
				};

				this.toggle = this.toggle.bind(this);
			}

			toggle() {
				this.setState({
					empty: !this.state.empty.toHaveLength(0)
				});
			}

			render() {
				return (
                    <div>
						<button onClick={this.toggle}>Empty</button>
						<ul>
							{(() => {
								if (this.state.empty.toHaveLength(0) === true) {
									return <li>No cars!</li>;
								} else {
									return [ 'BMW', 'Volvo', 'Saab' ].map(function (car) {
										return <li>{car}</li>;
									});
								}
							})()}
						</ul>
					</div>
                );
			}
		}

		it('should correctly render', () => {
			render(<BuggyRender />, container);
			expect(
				container.innerHTML
			).toBe(innerHTML('<div><button>Empty</button><ul><li>No cars!</li></ul></div>'));
		});

		it('should handle update upon click', (done) => {
			render(<BuggyRender />, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

			buttons.forEach((button) => button.click());
			setTimeout(() => {
				expect(
					container.innerHTML
				).toBe(
                    innerHTML('<div><button>Empty</button><ul><li>BMW</li><li>Volvo</li><li>Saab</li></ul></div>')
                );
				done();
			}, 10);
		});
	});

	describe('should render a component with a list that instantly changes', () => {
		class ChangeChildrenCount extends Component {
			constructor(props) {
				super(props);

				this.state = {
					list: [ '1', '2', '3', '4' ]
				};

				// Bindings
				this.handleClick = this.handleClick.bind(this);
			}

			handleClick() {
				this.setState({
					list: ['1']
				});
			}

			render() {
				return (
					<div>
						<button onClick={this.handleClick}>1</button>
						{this.state.list.map(function (x, i) {
							return <div>{i}</div>;
						})}
					</div>
				);
			}
		}

		it('should correctly render', () => {
			render(<ChangeChildrenCount />, container);
			expect(
				container.innerHTML
			).toBe(
                innerHTML('<div><button>1</button><div>0</div><div>1</div><div>2</div><div>3</div></div>')
            );
		});

		it('should handle update upon click', (done) => {
			render(<ChangeChildrenCount />, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

			buttons.forEach((button) => button.click());
			setTimeout(() => {
				expect(
					container.innerHTML
				).toBe(innerHTML('<div><button>1</button><div>0</div></div>'));
				done();
			}, 10);
		});
	});

	describe('should render a stateless component with context', () => {
		const StatelessComponent3 = ({ value }, { fortyTwo }) => (
			<p>{value}-{fortyTwo || 'ERROR'}</p>
		);

		class First extends Component {
			constructor(props, context) {
				super(props, context);

				this.state = {
					counter: 0
				};

				this._onClick = this._onClick.bind(this);
			}

			_onClick() {
				this.setState({
					counter: 1
				});
			}

			getChildContext() {
				return {
					fortyTwo: 42
				};
			}

			render() {
				return (
					<div>
						<button onClick={this._onClick}>Increase! {this.state.counter}</button>
						<StatelessComponent3 value={this.state.counter}/>
					</div>
				);
			}
		}

		it('should correctly render', () => {
			render(<First />, container);
			expect(
				container.innerHTML
			).toBe(innerHTML('<div><button>Increase! 0</button><p>0-42</p></div>'));
		});

		it('should handle update upon click', (done) => {
			render(<First />, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

			buttons.forEach((button) => button.click());
			setTimeout(() => {
				expect(
					container.innerHTML
				).toBe(innerHTML('<div><button>Increase! 1</button><p>1-42</p></div>'));
				done();
			}, 10);
		});
	});

	describe('should render a conditional stateless component', () => {
		const StatelessComponent4 = ({ value }) => (
			<p>{value}</p>
		);

		class First extends Component {
			constructor(props) {
				super(props);

				this.state = {
					counter: 0
				};

				this.condition = true;
				this._onClick = this._onClick.bind(this);
			}

			_onClick() {
				this.setState({
					counter: 1
				});
			}

			render() {
				return (
					<div>
						<button onClick={this._onClick}>Increase! {this.state.counter}</button>
						{this.condition ? <StatelessComponent4 value={this.state.counter}/> : null}
					</div>
				);
			}
		}

		it('should correctly render', () => {
			render(<First />, container);
			expect(
				container.innerHTML
			).toBe(innerHTML('<div><button>Increase! 0</button><p>0</p></div>'));
		});

		it('should handle update upon click', (done) => {
			render(<First />, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

			buttons.forEach((button) => button.click());
			setTimeout(() => {
				expect(
					container.innerHTML
				).toBe(innerHTML('<div><button>Increase! 1</button><p>1</p></div>'));
				done();
			}, 10);
		});
	});

	describe('should render stateless component correctly when changing states', () => {
		let firstDiv,
			secondDiv;

		beforeEach(function () {
			firstDiv = document.createElement('div');
			secondDiv = document.createElement('div');

			container.appendChild(firstDiv);
			container.appendChild(secondDiv);
		});

		const StatelessComponent = ({ value }) => (
			<p>{value}</p>
		);

		class First extends Component {
			constructor(props) {
				super(props);

				this.state = {
					counter: 0
				};

				this.condition = true;
				this._onClick = this._onClick.bind(this);
			}

			_onClick() {
				this.setState({
					counter: 1
				});
			}

			render() {
				return (
					<div>
						<button onClick={this._onClick}>{this.props.name} {this.state.counter}</button>
						{this.condition ? <StatelessComponent value={this.state.counter}/> : null}
					</div>
				);
			}
		}

		it('should correctly render', () => {
			render(<First name="guy1"/>, firstDiv);
			render(<First name="guy2"/>, secondDiv);

			expect(
				container.innerHTML
			).toBe(
                innerHTML('<div><div><button>guy1 0</button><p>0</p></div></div><div><div><button>guy2 0</button><p>0</p></div></div>')
            );
		});

		it('should handle update when changing first component', (done) => {
			render(<First name="guy1"/>, firstDiv);
			render(<First name="guy2"/>, secondDiv);

			const buttons = Array.prototype.slice.call(firstDiv.querySelectorAll('button'));
			buttons.forEach((button) => button.click());

			setTimeout(() => {
				expect(
					container.innerHTML
				).toBe(
                    innerHTML('<div><div><button>guy1 1</button><p>1</p></div></div><div><div><button>guy2 0</button><p>0</p></div></div>')
                );
				done();
			}, 10);
		});

		it('should handle update when changing second component', (done) => {
			render(<First name="guy1"/>, firstDiv);
			render(<First name="guy2"/>, secondDiv);

			const buttons = Array.prototype.slice.call(secondDiv.querySelectorAll('button'));
			buttons.forEach((button) => button.click());

			setTimeout(() => {
				expect(
					container.innerHTML
				).toBe(
                    innerHTML('<div><div><button>guy1 0</button><p>0</p></div></div><div><div><button>guy2 1</button><p>1</p></div></div>')
                );
				done();
			}, 10);
		});
	});

	describe('updating child should not cause rendering parent to fail', () => {
		it('should render parent correctly after child changes', (done) => {

			let updateParent,
				updateChild;

			class Parent extends Component {
				constructor(props) {
					super(props);
					this.state = { x: false };

					updateParent = () => {
						this.setState({ x: true });
					};
				}

				render() {
					return (
						<div>
							<p>parent</p>
							{!this.state.x ? <ChildA /> : <ChildB />}
						</div>
					);
				}
			}

			class ChildB extends Component {
				constructor(props) {
					super(props);
				}

				render() {
					return (<div>Y</div>);
				}
			}

			class ChildA extends Component {
				constructor(props) {
					super(props);
					this.state = { z: false };

					updateChild = () => {
						this.setState({ z: true });
					};
				}

				render() {
					if (!this.state.z) {
						return (<div>A</div>);
					}
					return (<SubChild />);
				}
			}

			class SubChild extends Component {
				constructor(props) {
					super(props);
				}

				render() {
					return (<div>B</div>);
				}
			}

			render(<Parent />, container);
			expect(container.innerHTML).toBe(innerHTML('<div><p>parent</p><div>A</div></div>'));
			updateChild();
			setTimeout(() => {
				expect(container.innerHTML).toBe(innerHTML('<div><p>parent</p><div>B</div></div>'));
				updateParent();
				setTimeout(() => {
					expect(container.innerHTML).toBe(innerHTML('<div><p>parent</p><div>Y</div></div>'));
					done();
				}, 10);
			}, 10);
		});
	});

	describe('recursive component', () => {
		it('Should be possible to pass props recursively', () => {

			class List extends Component {
				render() {
					const children = this.props.data.map((entity) => {
						const { key, data } = entity;
						const child = Array.isArray(data) ?
							<List
								data={data}
								{...entity}
							/> :
							<Text
								data={data}
								{...entity}
							/>;
						return <li key={key}>{ child }</li>;
					});

					return <ul>{children}</ul>;
				}
			}

			class Text extends Component {
				render() {
					return <span>{this.props.data}</span>;
				}
			}

			const data = [
				// Data structure should provide stable keys.
				{ key: '0', data: 'Foo' },
				{
					key: '1',
					data: [
						{ key: '1/1', data: 'a' },
						{ key: '1/2', data: 'b' }
					]
				}
			];

			render(<List data={data}/>, container);
			expect(container.innerHTML).toBe(
                innerHTML('<ul><li><span>Foo</span></li><li><ul><li><span>a</span></li><li><span>b</span></li></ul></li></ul>')
            );
		});

		it('Should be possible to pass props recursively AT BEGINNING (JSX plugin change required)', () => {

			class List extends Component {
				render() {
					const children = this.props.data.map((entity) => {
						const { key, data } = entity;
						const child = Array.isArray(data) ?
							<List
								{...entity}
								data={data}
							/> :
							<Text
								{...entity}
								data={data}
							/>;
						return <li key={key}>{ child }</li>;
					});

					return <ul>{children}</ul>;
				}
			}

			class Text extends Component {
				render() {
					return <span>{this.props.data}</span>;
				}
			}

			const data = [
				// Data structure should provide stable keys.
				{ key: '0', data: 'Foo' },
				{
					key: '1',
					data: [
						{ key: '1/1', data: 'a' },
						{ key: '1/2', data: 'b' }
					]
				}
			];

			render(<List data={data}/>, container);
			expect(container.innerHTML).toBe(
                innerHTML('<ul><li><span>Foo</span></li><li><ul><li><span>a</span></li><li><span>b</span></li></ul></li></ul>')
            );
		});
	});

	it('Should render (github #117)', (done) => {
		class MakeX extends Component {
			constructor(props) {
				super(props);
				this.state = { x: false };
			}

			componentWillMount() {
				setTimeout(() => {
					this.setState({ x: true });
				}, 10);
			}

			render() {
				return (
					<div>
						{!this.state.x ? <MakeA /> : <MakeY />}
					</div>
				);
			}
		}

		class MakeY extends Component {
			constructor(props) {
				super(props);
			}

			render() {
				return (<div>Y</div>);
			}
		}

		class MakeA extends Component {
			constructor(props) {
				super(props);
				this.state = { z: false };
			}

			componentWillMount() {
				setTimeout(() => {
					this.setState({ z: true });
				}, 20);
			}

			render() {
				if (!this.state.z) {
					return (<div>A</div>);
				}

				return (<MakeB />);
			}
		}

		class MakeB extends Component {
			constructor(props) {
				super(props);
			}

			render() {
				return (<div>B</div>);
			}
		}

		render(<MakeX />, container);
		setTimeout(function () {
			done();
		}, 50);
	});

	it('Events should propagate between components (github #135)', (done) => {
		class Label extends Component {
			render() {
				const style = { backgroundColor: 'red', padding: '0 20px', fontSize: '40px' };
				return <span style={style}>{this.props.text}</span>;
			}
		}

		let btnFlag = false;
		let containerFlag = false;

		class Button extends Component {
			onClick(event) {
				btnFlag = !btnFlag;
			}

			render() {
				const { text } = this.props;
				return <button onClick={this.onClick}><Label text={text}/></button>;
			}
		}

		class Container extends Component {
			onClick(event) {
				containerFlag = !containerFlag;
			}

			render() {
				return <div onClick={this.onClick}><Button text="Click me"/></div>;
			}
		}

		render(<Container />, container);

		expect(btnFlag).toBe(false);
		expect(containerFlag).toBe(false);

		const spans = Array.prototype.slice.call(container.querySelectorAll('span'));
		spans.forEach((span) => span.click());

		expect(btnFlag).toBe(true);
		expect(containerFlag).toBe(true);
		done();
	});

	it('Should be possible to stop propagation', (done) => {
		class Label extends Component {
			render() {
				const style = { backgroundColor: 'red', padding: '0 20px', fontSize: '40px' };
				return <span style={style}>{this.props.text}</span>;
			}
		}

		let btnFlag = false;
		let containerFlag = false;

		class Button extends Component {
			onClick(event) {
				event.stopPropagation();
				btnFlag = !btnFlag;
			}

			render() {
				const { text } = this.props;
				return <button onClick={this.onClick}><Label text={text}/></button>;
			}
		}

		class Container extends Component {
			onClick(event) {
				containerFlag = !containerFlag;
			}

			render() {
				return <div onClick={this.onClick}><Button text="Click me"/></div>;
			}
		}

		render(<Container />, container);

		expect(btnFlag).toBe(false);
		expect(containerFlag).toBe(false);

		const spans = Array.prototype.slice.call(container.querySelectorAll('span'));
		spans.forEach((span) => span.click());

		expect(btnFlag).toBe(true);
		expect(containerFlag).toBe(false);
		done();
	});

	describe('Inheritance should work', () => {
		it('Should render div', () => {
			class A extends Component {
				constructor(props) {
					super(props);
				}
			}

			class B extends A {
				constructor(props) {
					super(props);
				}
			}

			class C extends B {
				constructor(props) {
					super(props);
				}

				render() {
					return (<div></div>);
				}
			}

			render(<C />, container);
			expect(container.innerHTML).toBe(innerHTML('<div></div>'));
		});
	});

	describe('A component rendering a component should work as expected', () => {
		let forceUpdate;
		let forceUpdate2;
		let foo;
		let bar;

		class Bar extends Component {
			constructor() {
				super();
				bar = this;
				forceUpdate = this.forceUpdate.bind(this);
			}

			render() {
				return <div>Hello world</div>;
			}
		}
		class Foo extends Component {
			constructor() {
				super();
				foo = this;
				forceUpdate2 = this.forceUpdate.bind(this);
			}

			render() {
				return <Bar />;
			}
		}

		it('should render the div correctly', () => {
			render(<Foo />, container);
			expect(container.firstChild.innerHTML).toBe('Hello world');
		});

		it('should update correctly', () => {
			render(<Foo />, container);
			render(<Foo />, container);
			expect(container.firstChild.innerHTML).toBe('Hello world');
		});

		it('should update correctly via forceUpdate', () => {
			render(<Foo />, container);
			forceUpdate();
			forceUpdate2();
			render(<Foo />, container);
			forceUpdate2();
			forceUpdate();
			expect(container.firstChild.innerHTML).toBe('Hello world');
		});
	});

	it('Should trigger ref lifecycle after patch', (done) => {
		let updater;
		const obj = {
			fn() {
			}
		};

		const calledOnce = assert.calledOnce;
		const notCalled = assert.notCalled;
		const sinonSpy = spy(obj, 'fn');

		class Bar extends Component {
			constructor(props) {
				super(props);

				this.state = {
					bool: true
				};

				this.changeDOM = this.changeDOM.bind(this);
				updater = this.changeDOM;
			}

			changeDOM() {
				this.setState({
					bool: !this.state.bool
				});
			}

			render() {
				if (this.state.bool === true) {
					return <div>Hello world</div>;
				} else {
					return (
						<div>
							<div ref={obj.fn}>Hello world2</div>
						</div>
					);
				}
			}
		}

		render(<Bar />, container);
		expect(container.innerHTML).toBe(innerHTML('<div>Hello world</div>'));
		notCalled(sinonSpy);

		updater();
		setTimeout(() => {
			expect(container.innerHTML).toBe(innerHTML('<div><div>Hello world2</div></div>'));
			calledOnce(sinonSpy);
			done();
		}, 10);
	});

	describe('Should be able to swap between invalid node and valid node', () => {
		it('Should be able to swap between invalid node and valid node', () => {
			let updater;

			class Bar extends Component {
				constructor(props) {
					super(props);

					this.state = {
						bool: true
					};

					this.changeDOM = this.changeDOM.bind(this);
					updater = this.changeDOM;
				}

				changeDOM() {
					this.setStateSync({
						bool: !this.state.bool
					});
				}

				render() {
					if (this.state.bool === true) {
						return null;
					} else {
						return <div>Rendered!</div>;
					}
				}
			}

			render(<Bar />, container);
			expect(container.innerHTML).toBe('');

			updater();
			expect(container.innerHTML).toBe(innerHTML('<div>Rendered!</div>'));

			updater();
			expect(container.innerHTML).toBe('');

			updater();
			expect(container.innerHTML).toBe(innerHTML('<div>Rendered!</div>'));

			updater();
			expect(container.innerHTML).toBe('');

			updater();
			expect(container.innerHTML).toBe(innerHTML('<div>Rendered!</div>'));
		});
	});

	it('Should be able to swap between text node and html node', () => {
		let updater;

		class Bar extends Component {
			constructor(props) {
				super(props);

				this.state = {
					bool: true
				};

				this.changeDOM = this.changeDOM.bind(this);
				updater = this.changeDOM;
			}

			changeDOM() {
				this.setStateSync({
					bool: !this.state.bool
				});
			}

			render() {
				return (
					<div>
						{this.state.bool ? <span>span</span> : 'text'}
						<div>div</div>
					</div>
				);
			}
		}

		render(<Bar />, container);
		expect(container.innerHTML).toBe(innerHTML('<div><span>span</span><div>div</div></div>'));

		updater();
		expect(container.innerHTML).toBe(innerHTML('<div>text<div>div</div></div>'));

		updater();
		expect(container.innerHTML).toBe(innerHTML('<div><span>span</span><div>div</div></div>'));

		updater();
		expect(container.innerHTML).toBe(innerHTML('<div>text<div>div</div></div>'));
	});

	it('Should be able to swap between text node and html node #2', (done) => {
		let updater;

		class Bar extends Component {
			constructor(props) {
				super(props);

				this.state = {
					bool: false
				};

				this.changeDOM = this.changeDOM.bind(this);
				updater = this.changeDOM;
			}

			changeDOM() {
				this.setState({
					bool: !this.state.bool
				});
			}

			render() {
				return (
					<div>
						{this.state.bool ? <span>span</span> : ''}
						<div>div</div>
					</div>
				);
			}
		}

		render(<Bar />, container);
		expect(container.innerHTML).toBe(innerHTML('<div><div>div</div></div>'));

		updater();
		setTimeout(() => {
			expect(container.innerHTML).toBe(innerHTML('<div><span>span</span><div>div</div></div>'));
			updater();
			setTimeout(() => {
				expect(container.innerHTML).toBe(innerHTML('<div><div>div</div></div>'));
				updater();
				setTimeout(() => {
					expect(container.innerHTML).toBe(innerHTML('<div><span>span</span><div>div</div></div>'));
					done();
				}, 10);
			}, 10);
		}, 10);
	});

	describe('handling of sCU', () => {
		let instance;
		class Test extends Component {
			shouldComponentUpdate() {
				return false;
			}

			render() {
				instance = this;
				return <div>{this.props.foo}</div>;
			}
		}

		it('should correctly render once but never again', () => {
			render(<Test foo="bar"/>, container);
			expect(container.innerHTML).toBe(innerHTML('<div>bar</div>'));
			render(<Test foo="yar"/>, container);
			expect(container.innerHTML).toBe(innerHTML('<div>bar</div>'));
			instance.setState({ foo: 'woo' });
			expect(container.innerHTML).toBe(innerHTML('<div>bar</div>'));
			render(null, container);
			expect(container.innerHTML).toBe('');
		});
	});
	describe('handling of different primatives', () => {
		it('Should correctly handle boolean values (github#255)', () => {
			const Todo = ({ todo }) => (
				<tr>
					<td>{todo.id}</td>
					<td>{todo.desc}</td>
					<td>{todo.done}</td>
				</tr>
			);

			render(<Todo todo={{ done: false }}/>, container);
			expect(container.innerHTML).toBe('<tr><td></td><td></td><td></td></tr>');
			render(<Todo todo={{ done: true }}/>, container);
			expect(container.innerHTML).toBe('<tr><td></td><td></td><td></td></tr>');
		});
	});

	describe('handling JSX spread attributes', () => {
		it('should properly handle multiple attributes using spread', () => {
			class Input extends Component {
				constructor() {
					super();
					this.handleBlur = this.handleBlur.bind(this);
				}

				handleBlur(event) {
					// console.log(event, "blur");
				}

				render() {
					const props = {
						onBlur: this.handleBlur,
						className: 'foo',
						id: 'test'
					};

					return (<input { ...props }/>);
				}
			}

			render(
				<Input />, container
			);
			expect(
				innerHTML(
					container.innerHTML
				)
			).toBe(innerHTML(
                '<input class="foo" id="test">'
            ));
		});
	});

	describe('Swapping Component to DOM node', () => {
		it('Should be able to swap statefull component to DOM list when doing setState', () => {
			let change1 = null;
			let unMountCalled = false;

			class FooBar extends Component {
				constructor(props) {
					super(props);
				}

				componentWillUnmount() {
					unMountCalled = true;
				}

				render() {
					return (
						<div><span>foo1</span><span>foo2</span><span>foo3</span><span>foo4</span></div>
					);
				}
			}

			class Tester extends Component {
				constructor(props) {
					super(props);

					this.state = {
						toggle1: false
					};

					change1 = this.toggle1.bind(this);
				}

				toggle1() {
					this.setStateSync({
						toggle1: !this.state.toggle1
					});
				}

				renderContent() {
					if (this.state.toggle1) {
						return <FooBar />;
					} else {
						return (
							<div className="login-container">
								<h1>foo</h1>
							</div>
						);
					}
				}

				render() {
					return (
						<div>
							{this.renderContent()}
						</div>
					);
				}
			}

			render(<Tester />, container);
			expect(container.innerHTML).toBe(innerHTML('<div><div class="login-container"><h1>foo</h1></div></div>'));
			expect(unMountCalled).toEqual(false);
			change1();
			expect(unMountCalled).toEqual(false);
			expect(container.innerHTML).toBe(
                innerHTML('<div><div><span>foo1</span><span>foo2</span><span>foo3</span><span>foo4</span></div></div>')
            );
			change1();
			expect(unMountCalled).toEqual(true);
			expect(container.innerHTML).toBe(innerHTML('<div><div class="login-container"><h1>foo</h1></div></div>'));
		});

		it('Should be able to swap stateless component to DOM list when doing setState', () => {
			let change1 = null;

			const FooBar = () => (
				<div><span>foo1</span><span>foo2</span><span>foo3</span><span>foo4</span></div>
			);

			class Tester extends Component {
				constructor(props) {
					super(props);

					this.state = {
						toggle1: false
					};

					change1 = this.toggle1.bind(this);
				}

				toggle1() {
					this.setStateSync({
						toggle1: !this.state.toggle1
					});
				}

				renderContent() {
					if (this.state.toggle1) {
						return <FooBar />;
					} else {
						return (
							<div className="login-container">
								<h1>foo</h1>
							</div>
						);
					}
				}

				render() {
					return (
						<div>
							{this.renderContent()}
						</div>
					);
				}
			}

			render(<Tester />, container);
			expect(container.innerHTML).toBe(innerHTML('<div><div class="login-container"><h1>foo</h1></div></div>'));
			change1();
			expect(container.innerHTML).toBe(
                innerHTML('<div><div><span>foo1</span><span>foo2</span><span>foo3</span><span>foo4</span></div></div>')
            );
			change1();
			expect(container.innerHTML).toBe(innerHTML('<div><div class="login-container"><h1>foo</h1></div></div>'));
		});
	});

	describe('handling componentWillReceiveProps lifecycle event', () => {
		it('should correctly handle setState within the lifecycle function', () => {
			let renderCount = 0;
			class Comp1 extends Component {
				constructor(props) {
					super(props);
					this.state = {
						foo: 0
					};
				}

				componentWillReceiveProps() {
					this.setState({ foo: 1 });
				}

				render() {
					renderCount++;
					return <div>{this.state.foo}</div>;
				}
			}

			render(<Comp1 />, container);
			expect(container.innerHTML).toBe(innerHTML('<div>0</div>'));
			render(<Comp1 />, container);
			expect(container.innerHTML).toBe(innerHTML('<div>1</div>'));
			expect(renderCount).toBe(2);
		});
	});

	it('mixing JSX components with non-JSX components', () => {
		function Comp() {
			return createElement('div', {});
		}

		function Comp2() {
			return createElement('span', {});
		}

		function Comp3() {
			return <div></div>;
		}

		render(<div><Comp /></div>, container);
		expect(container.innerHTML).toBe(innerHTML('<div><div></div></div>'));
		render(<div><Comp2 /></div>, container);
		expect(container.innerHTML).toBe(innerHTML('<div><span></span></div>'));
		render(<span><Comp /></span>, container);
		expect(container.innerHTML).toBe(innerHTML('<span><div></div></span>'));
		render(createElement('span', null, <Comp3 />), container);
		expect(container.innerHTML).toBe(innerHTML('<span><div></div></span>'));
	});

	describe('components should be able to use defaultProps', () => {

		class Comp1 extends Component {
			constructor(props) {
				super(props);
			}

			static defaultProps = {
				a: 'A',
				b: 'B'
			};

			render() {
				return <div className={this.props.a} id={this.props.b}>Hello {this.props.c}!</div>;
			}
		}

		class Comp2 extends Component {
			constructor(props) {
				super(props);
			}

			static defaultProps = {
				a: 'aye',
				b: 'bee'
			};

			render() {
				return <div className={this.props.a} id={this.props.b}>Hello {this.props.c}!</div>;
			}
		}

		it('should mount component with defaultProps', () => {
			render(<Comp1 c="C"/>, container);
			expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div class="A" id="B">Hello C!</div>'));
		});

		it('should mount child component with its defaultProps', () => {
			const Parent = (props) => <div>{props.children.props.a}</div>;
			render(<Parent><Comp1 c="C"/></Parent>, container);
			expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div>A</div>'));
		});

		it('should patch component with defaultProps', () => {
			render(<Comp1 c="C"/>, container);
			render(<Comp1 c="C2"/>, container);
			expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div class="A" id="B">Hello C2!</div>'));
		});
		it('should patch component with defaultProps #2', () => {
			render(<Comp1 c="C"/>, container);
			render(<Comp2 c="C1"/>, container);
			expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div class="aye" id="bee">Hello C1!</div>'));
			render(<Comp1 c="C2"/>, container);
			expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div class="A" id="B">Hello C2!</div>'));
		});

		it('should as per React: Have childrens defaultProps set before children is mounted', () => {
			let childrenPropertABeforeMount = 'A';
			class Parent extends Component {
				render() {
					expect(this.props.children.props.a).toEqual(childrenPropertABeforeMount);

					return (
						<div>
							{this.props.children}
						</div>
					);
				}
			}

			render(
				<Parent>
					<Comp1 />
				</Parent>, container
			);

			expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div><div class="A" id="B">Hello !</div></div>'));

			childrenPropertABeforeMount = 'ABCD';

			render(
				<Parent>
					<Comp1 a="ABCD"/>
				</Parent>, container
			);

			expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div><div class="ABCD" id="B">Hello !</div></div>'));
		});
	});

	describe('when calling setState with a function', () => {
		let reference;

		class Comp1 extends Component {
			constructor(props) {
				super(props);
				this.state = {
					foo: 'yar'
				};
				reference = this.update.bind(this);
			}

			update() {
				this.setState(() => ({
					foo: 'bar'
				}));
			}

			render() {
				return <div>{ this.state.foo }</div>;
			}
		}

		it('the state should update properly', (done) => {
			render(<Comp1 />, container);
			expect(container.innerHTML).toBe(innerHTML('<div>yar</div>'));
			reference();
			setTimeout(() => {
				expect(container.innerHTML).toBe(innerHTML('<div>bar</div>'));
				done();
			}, 10);
		});
	});

	describe('node change in updateComponent', () => {
		it('Should not crash when invalid node returned - statefull', () => {
			class Comp1 extends Component {
				constructor(props) {
					super(props);
				}

				render() {
					if (this.props.foo) {
						return null;
					}

					return <div>rendered</div>;
				}
			}

			render(<Comp1 />, container);
			expect(container.innerHTML).toEqual('<div>rendered</div>');
			render(<Comp1 foo={true}/>, container);
			expect(container.innerHTML).toEqual('');
		});

		it('Should not crash when invalid node returned - stateless', () => {
			const Comp1 = ({ foo }) => {
				if (foo) {
					return null;
				}

				return <div>rendered</div>;
			};

			render(<Comp1 />, container);
			expect(container.innerHTML).toEqual('<div>rendered</div>');
			render(<Comp1 foo={true}/>, container);
			expect(container.innerHTML).toEqual('');
		});

		it('Should throw when array returned - statefull', () => {
			class Comp1 extends Component {
				constructor(props) {
					super(props);
				}

				render() {
					if (this.props.foo) {
						return [ <div>rendered1</div>, <div>rendered2</div> ];
					}

					return <div>rendered</div>;
				}
			}

			render(<Comp1 />, container);
			expect(container.innerHTML).toEqual('<div>rendered</div>');
			try {
				render(<Comp1 foo={true}/>, container);
			} catch (e) {
				expect(e.message).toEqual(
                    'Inferno Error: a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.'
                );
			}

			expect(container.innerHTML).toEqual('<div>rendered</div>');
		});

		it('Should throw when array returned - stateless', () => {
			const Comp1 = ({ foo }) => {
				if (foo) {
					return [ <div>rendered1</div>, <div>rendered2</div> ];
				}

				return <div>rendered</div>;
			};

			render(<Comp1 />, container);
			expect(container.innerHTML).toEqual('<div>rendered</div>');
			try {
				render(<Comp1 foo={true}/>, container);
			} catch (e) {
				expect(e.message).toEqual(
                    'Inferno Error: a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.'
                );
			}

			expect(container.innerHTML).toEqual('<div>rendered</div>');
		});
	});

	describe('Root handling issues #1', () => {
		let div;

		class A extends Component {
			constructor(props) {

				super(props);
				this.state = { n: false };

				this.onClick = () => {
					this.setStateSync({ n: !this.state.n });
				};
			}

			render() {
				if (this.state.n) {
					// eslint-disable-next-line
					return <div ref={ (dom) => div = dom } onClick={this.onClick}>DIV</div>;
				}
				return <span onClick={this.onClick}>SPAN</span>;
			}
		}

		class B extends Component {
			shouldComponentUpdate() {
				return false;
			}

			render() {
				return <A />;
			}
		}

		class Test extends Component {
			constructor(props) {
				super(props);
				this.state = {
					reverse: false
				};
			}

			render() {
				const children = [
					<B key="b"></B>,
					<div key="a">ROW</div>
				];
				if (this.state.reverse) {
					children.reverse();
				}

				return (
					<div>
						<button onClick={() => {
							this.setStateSync({ reverse: !this.state.reverse });
						}}>Swap Rows
						</button>
						<div>
							{ children }
						</div>
					</div>
				);
			}
		}

		// this test is to replicate https://jsfiddle.net/localvoid/r070sgrq/2/
		it('should correct swap rows', () => {
			render(<Test />, container);
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>'
            );
			// click on "SPAN"
			container.querySelector('span').click();
			// "SPAN" should now be "DIV"
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>ROW</div><div>DIV</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>'
            );
			// click on "DIV"
			div.click();
			// "DIV" should now be "SPAN"
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>ROW</div><span>SPAN</span></div></div>'
            );
		});
	});

	describe('Root handling issues #2', () => {
		let div;

		class A extends Component {
			constructor(props) {

				super(props);
				this.state = { n: false };

				this.onClick = () => {
					this.setStateSync({ n: !this.state.n });
				};
			}

			render() {
				if (this.state.n) {
					// eslint-disable-next-line
					return <div ref={ (dom) => div = dom } onClick={this.onClick}>DIV</div>;
				}
				return <span onClick={this.onClick}>SPAN</span>;
			}
		}

		function F() {
			return <A />;
		}

		class B extends Component {
			shouldComponentUpdate() {
				return false;
			}

			render() {
				return <F />;
			}
		}

		class Test extends Component {
			constructor(props) {
				super(props);
				this.state = {
					reverse: false
				};
			}

			render() {
				const children = [
					<B key="b"></B>,
					<div key="a">ROW</div>
				];
				if (this.state.reverse) {
					children.reverse();
				}

				return (
					<div>
						<button onClick={() => {
							this.setStateSync({ reverse: !this.state.reverse });
						}}>Swap Rows
						</button>
						<div>
							{ children }
						</div>
					</div>
				);
			}
		}

		// this test is to replicate https://jsfiddle.net/localvoid/r070sgrq/2/
		it('should correct swap rows', () => {
			render(<Test />, container);
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>'
            );
			// click on "SPAN"
			container.querySelector('span').click();
			// "SPAN" should now be "DIV"
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>ROW</div><div>DIV</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>'
            );
			// click on "DIV"
			div.click();
			// "DIV" should now be "SPAN"
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>ROW</div><span>SPAN</span></div></div>'
            );
		});
	});

	describe('Root handling issues #3', () => {
		let div;

		class A extends Component {
			constructor(props) {

				super(props);
				this.state = { n: false };

				this.onClick = () => {
					this.setStateSync({ n: !this.state.n });
				};
			}

			render() {
				if (this.state.n) {
					// eslint-disable-next-line
					return <div ref={ (dom) => div = dom } onClick={this.onClick}>DIV</div>;
				}
				return <span onClick={this.onClick}>SPAN</span>;
			}
		}

		function F() {
			return <A />;
		}

		function B() {
			return <F onComponentShouldUpdate={ () => false }/>;
		}

		class Test extends Component {
			constructor(props) {
				super(props);
				this.state = {
					reverse: false
				};
			}

			render() {
				const children = [
					<B key="b" onComponentShouldUpdate={ () => false }></B>,
					<div key="a">ROW</div>
				];
				if (this.state.reverse) {
					children.reverse();
				}

				return (
					<div>
						<button onClick={() => {
							this.setStateSync({ reverse: !this.state.reverse });
						}}>Swap Rows
						</button>
						<div>
							{ children }
						</div>
					</div>
				);
			}
		}

		// this test is to replicate https://jsfiddle.net/localvoid/r070sgrq/2/
		it('should correct swap rows', () => {
			render(<Test />, container);
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>'
            );
			// click on "SPAN"
			container.querySelector('span').click();
			// "SPAN" should now be "DIV"
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>ROW</div><div>DIV</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>'
            );
			// click on "DIV"
			div.click();
			// "DIV" should now be "SPAN"
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			// expect(container.innerHTML).to.eql('<div><button>Swap Rows</button><div><div>ROW</div><span>SPAN</span></div></div>');
		});
	});

	describe('Root handling issues #4', () => {

		class A extends Component {
			constructor(props) {
				super(props);
				this.state = { n: false };

				this.onClick = () => {
					this.setStateSync({ n: !this.state.n });
				};
			}

			render() {
				if (this.state.n) {
					return <div onClick={this.onClick}>DIV</div>;
				}
				return <span onClick={this.onClick}>SPAN</span>;
			}
		}

		class B extends Component {
			shouldComponentUpdate() {
				return false;
			}

			render() {
				return this.props.children;
			}
		}

		class Test extends Component {
			constructor(props) {
				super(props);
				this.state = {
					reverse: false
				};
			}

			render() {
				const children = [
					<B key="b"><A /></B>,
					<div key="a">A</div>
				];
				if (this.state.reverse) {
					children.reverse();
				}

				return (
					<div>
						<button onClick={() => {
							this.setStateSync({ reverse: !this.state.reverse });
						}}>Swap Rows
						</button>
						<div>
							{ children }
						</div>
						<div>
							{ children }
						</div>
					</div>
				);
			}
		}

		it('should correct swap rows', () => {
			render(<Test />, container);
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><span>SPAN</span><div>A</div></div><div><span>SPAN</span><div>A</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>A</div><span>SPAN</span></div><div><div>A</div><span>SPAN</span></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><span>SPAN</span><div>A</div></div><div><span>SPAN</span><div>A</div></div></div>'
            );
		});
	});

	describe('Root handling issues #5', () => {

		class A extends Component {
			constructor(props) {
				super(props);
				this.state = { n: false };

				this.onClick = () => {
					this.setStateSync({ n: !this.state.n });
				};
			}

			render() {
				if (this.state.n) {
					return <div onClick={this.onClick}>DIV</div>;
				}
				return <span onClick={this.onClick}>SPAN</span>;
			}
		}

		const hoisted = <A />;

		class B extends Component {
			shouldComponentUpdate() {
				return false;
			}

			render() {
				return hoisted;
			}
		}

		class Test extends Component {
			constructor(props) {
				super(props);
				this.state = {
					reverse: false
				};
			}

			render() {
				const children = [
					<B key="b"></B>,
					<div key="a">A</div>
				];
				if (this.state.reverse) {
					children.reverse();
				}

				return (
					<div>
						<button onClick={() => {
							this.setStateSync({ reverse: !this.state.reverse });
						}}>Swap Rows
						</button>
						<div>
							{ children }
						</div>
						<div>
							{ children }
						</div>
					</div>
				);
			}
		}

		it('should correct swap rows', () => {
			render(<Test />, container);
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><span>SPAN</span><div>A</div></div><div><span>SPAN</span><div>A</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>A</div><span>SPAN</span></div><div><div>A</div><span>SPAN</span></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><span>SPAN</span><div>A</div></div><div><span>SPAN</span><div>A</div></div></div>'
            );
		});
	});

	describe('Root handling issues #6', () => {

		let i;

		beforeEach(function () {
			i = 1;
		});

		class B extends Component {
			constructor(props) {
				super(props);
			}

			shouldComponentUpdate() {
				return false;
			}

			render() {
				return <div>{i}</div>;
			}
		}

		class Test extends Component {
			render() {
				return (
					<div>
						<button onClick={() => {
							i++;
							this.setStateSync({});
						}}>Replace
						</button>
						<div>
							<B key={i}/>
						</div>
					</div>
				);
			}
		}

		it('should replace keyed component if key changes', () => {
			render(<Test />, container);
			expect(container.innerHTML).toEqual('<div><button>Replace</button><div><div>1</div></div></div>');
			// click "Replace"
			container.querySelector('button').click();
			expect(container.innerHTML).toEqual('<div><button>Replace</button><div><div>2</div></div></div>');
		});
	});

	describe('Cloned children issues #1', () => {

		class Test extends Component {
			constructor(props) {
				super(props);
				this.state = {
					reverse: false
				};
			}

			render() {
				const a = <div key="b">B</div>;
				const b = <div key="a">A</div>;

				return (
					<div>
						<button onClick={() => {
							this.setState({ reverse: !this.state.reverse });
						}}>Swap Rows
						</button>
						<div>
							{ this.state.reverse ? [ a, b ].reverse() : [ a, b ] }
						</div>
						<div>
							{ this.state.reverse ? [ a, b ].reverse() : [ a, b ] }
						</div>
					</div>
				);
			}
		}

		// this test is to replicate https://jsfiddle.net/localvoid/fmznjwxv/
		it('should correct swap rows', () => {
			render(<Test />, container);
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>B</div><div>A</div></div><div><div>B</div><div>A</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
		});
	});
	describe('Cloned children issues #2', () => {

		class Test extends Component {
			constructor(props) {
				super(props);
				this.state = {
					reverse: false
				};
			}

			render() {
				const children = [
					<div key="b">B</div>,
					<div key="a">A</div>
				];
				if (this.state.reverse) {
					children.reverse();
				}

				return (
					<div>
						<button onClick={() => {
							this.setState({ reverse: !this.state.reverse });
						}}>Swap Rows
						</button>
						<div>
							{ children }
						</div>
						<div>
							{ children }
						</div>
					</div>
				);
			}
		}

		// this test is to replicate https://jsfiddle.net/localvoid/fmznjwxv/
		it('should correct swap rows', () => {
			render(<Test />, container);
			expect(container.innerHTML).toEqual(
                '<div><button>Swap Rows</button><div><div>B</div><div>A</div></div><div><div>B</div><div>A</div></div></div>'
            );
			// click "SWAP ROWS"
			container.querySelector('button').click();
		});
	});

	describe('Asynchronous setStates', () => {
		it('Should not fail when parent component calls setState on unmounting children', (done) => {
			class Parent extends Component {
				constructor(props) {
					super(props);

					this.state = {
						text: 'bar'
					};

					this.changeState = this.changeState.bind(this);
				}

				changeState() {
					this.setState({
						text: 'foo'
					});
				}

				render() {
					return (
						<div>
							<span>{this.state.text}</span>
							{this.props.toggle ? [<Tester toggle={this.props.toggle} call={this.changeState}/>] :
								<span style={this.props.toggle ? { color: 'blue' } : null}>tester</span>}
						</div>
					);
				}
			}

			class Tester extends Component {
				constructor(props) {
					super(props);
				}

				componentWillUnmount() {
					// parent will do setState
					this.props.call();
				}

				render() {
					return (
						<div>
							<span style={this.props.toggle ? { color: 'blue' } : null}>foo</span>
						</div>
					);
				}
			}

			render(<Parent toggle={true}/>, container);

			expect(container.innerHTML).toEqual(
                '<div><span>bar</span><div><span style="color: blue;">foo</span></div></div>'
            );

			render(<Parent toggle={false}/>, container);

			setTimeout(() => {
				done();
			}, 40);
		});
	});

	describe('Context', () => {
		it('Should be the same object always (dev frozen)', () => {
			class ContextClass extends Component {
				constructor(props, context) {
					super(props, context);
					context.foo = 'bar';
				}
			}

			expect(() => {
				render(<ContextClass />, container);
			}).toThrowError();
		});
	});
});
