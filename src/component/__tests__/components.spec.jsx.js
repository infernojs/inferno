import { render } from '../../DOM/rendering';
import Component from '../../component/es2015';
import createElement from './../../core/createElement';
import { innerHTML } from '../../tools/utils';
import {
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	ChildrenTypes,
	ValueTypes,
	NodeTypes
} from './../../core/shapes.ts';

const Inferno = {
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	ChildrenTypes,
	ValueTypes,
	NodeTypes
};

describe('Components (JSX)', () => {
	let container;
	let Inner;
	let attachedListener = null;
	let renderedName = null;

	beforeEach(function () {

		attachedListener = null;
		renderedName = null;

		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);

		Inner = class extends Component {
			render() {
				attachedListener = this.props.onClick;
				renderedName = this.props.name;
				return <div className={ this.props.name } />;
			}
		};
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	class BasicComponent1 extends Component {
		render() {
			return (
				<div className="basic">
					<span className={ this.props.name }>The title is { this.props.title }</span>
				</div>
			);
		}
	}

	it('should render a basic component jsx', () => {
		render((
			<div><BasicComponent1 title="abc" name="basic-render" /></div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>')
		);

		render((
			<div><BasicComponent1 title="abc" name="basic-render" /></div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>')
		);

		const attrs = { title: 'abc', name: 'basic-render2', foo: 'bar' };

		// JSX Spread Attribute
		render((
			<div><BasicComponent1 { ...attrs } /></div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span class="basic-render2">The title is abc</span></div></div>')
		);
	});

	class BasicComponent1b extends Component {
		render() {
			return (
				<div className="basic">
					<label>
						<input checked={ this.props.isChecked } />
						The title is { this.props.title }
					</label>
				</div>
			);
		}
	}

	class BasicComponent1c extends Component {
		render() {
			return (<span>Hello World</span>);
		}
	}

	it('should render a basic component with inputs', () => {
		render((
			<div>
				<BasicComponent1b title="abc" isChecked={ true } />
			</div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><label><input>The title is abc</label></div></div>')
		);
		expect(
			container.querySelector('input').checked
		).to.equal(
			true
		);

		render((
			<div>
				<BasicComponent1b title="123" isChecked={ false } />
			</div>
		), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><label><input>The title is 123</label></div></div>')
		);
		expect(
			container.querySelector('input').checked
		).to.equal(
			false
		);

		render((
			<div>
				<BasicComponent1b title="123" isChecked={ null } />
			</div>
		), container);

		render((
			<div></div>
		), container);

		render((
			<div>
				<BasicComponent1b title="123" isChecked={ true } />
			</div>
		), container);
		expect(
			container.querySelector('input').checked
		).to.equal(
			true
		);
	});

	it('should render a basic component and remove property if null', () => {

		render((
				<div>
					<BasicComponent1 title="abc" name="basic-render" />
				</div>
			),
			container
		);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>')
		);

		render((
				<div></div>
			),
			container
		);
		render((
				<div>
					<BasicComponent1 title="Hello, World!" name="basic-render" />
				</div>
			),
			container
		);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span class="basic-render">The title is Hello, World!</span></div></div>')
		);

		render((
				<div>
					<BasicComponent1 title="123" name={ null } />
				</div>
			),
			container
		);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span>The title is 123</span></div></div>')
		);
		render((
				<div>
					<BasicComponent1 title={ [] } name={ null } />
				</div>
			),
			container
		);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span>The title is </span></div></div>')
		);

		render((
			<div>
				<BasicComponent1 title={ null } name={ null } />
			</div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span>The title is </span></div></div>')
		);

		render((
			<div>
				<BasicComponent1 title="abc" name={ null } />
			</div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span>The title is abc</span></div></div>')
		);

		render((
			<div>
				<BasicComponent1 title="123" name="basic-update" />
			</div>
		), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>')
		);
	});

	it('should render a basic root component', () => {

		render((
			<BasicComponent1 title="abc" name="basic-render" />
		), container);

		expect(container.firstChild.getAttribute('class')).to.equal('basic');

		render((
			<BasicComponent1 title="abc" name="basic-render" />
		), container);

		expect(container.firstChild.getAttribute('class')).to.equal('basic');

		render((
			<BasicComponent1 title="123" name="basic-update" />
		), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div class="basic"><span class="basic-update">The title is 123</span></div>')
		);
	});

	class BasicComponent2 extends Component {
		render() {
			return (
				<div className="basic">
					<span className={ this.props.name }>The title is { this.props.title }</span>
					{ this.props.children }
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
		).to.equal(
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
		).to.equal(
			innerHTML('<div><div class="basic"><span class="basic-update">The title is 123</span><span>Im a child</span></div></div>')
		);
	});

	/* no more templates
	 it('should throw error when a component is included as a child without a template', () => {

	 expect(() => render((
	 <div>
	 <BasicComponent2 title="abc" name="basic-render">
	 <span>A child</span>
	 <BasicComponent1c/>
	 </BasicComponent2>
	 </div>
	 ), container)).to.throw('Inferno Error: Children must be provided as templates.');

	 expect(() => render((
	 <div>
	 <BasicComponent2 title="abc" name="basic-render">
	 <span>A child</span>
	 <BasicComponent1c/>
	 </BasicComponent2>
	 </div>
	 ), container)).to.throw('Inferno Error: Children must be provided as templates.');
	 }); */

	it('should render multiple components', () => {

		render((
			<div>
				<BasicComponent1 title="component 1" name="basic-render" />
				<BasicComponent1 title="component 2" name="basic-render" />
			</div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span class="basic-render">The title is component 1</span></div>'
				+ '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>')
		);

		render((
			<div>
				<BasicComponent1 title="component 1" name="basic-render" />
			</div>
		), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span class="basic-render">The title is component 1</span></div></div>')
		);
	});

	class BasicComponent3 extends Component {
		render() {
			return (
				<div style={ this.props.styles }>
					<span style={ this.props.styles }>The title is { this.props.title }</span>
				</div>
			);
		}
	}

	it('should render a basic component with styling', () => {

		render((
			<BasicComponent3 title="styled!" styles={ { color: 'red', paddingLeft: '10px' } } />
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>')
		);

		render((
			<BasicComponent3 />
		), container);

		render((
			<BasicComponent3 title="styled (again)!" styles={ { color: 'blue', marginBottom: '20px' } } />
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div style="color: blue; margin-bottom: 20px;"><span style="color: blue; margin-bottom: 20px;">The title is styled (again)!</span></div>')
		);
	});

	it('should render a basic component and remove styling', () => {

		render((
			<BasicComponent3 title="styled!" styles={ { color: 'red', paddingTop: '20px' } } />
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div style="color: red; padding-top: 20px;"><span style="color: red; padding-top: 20px;">The title is styled!</span></div>')
		);

		render((
			<BasicComponent3 title="styles are removed!" styles={ null } />
		), container);
		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><span>The title is styles are removed!</span></div>')
		);
	});

	it('should render a basic component with SVG', () => {
		class SvgComponent extends Component {
			constructor(props) {
				super(props);
			}
			render() {
				return (
					<svg class="alert-icon">
						<use xlink:href="#error"></use>
					</svg>
				);
			}
		}

		render(<SvgComponent />, container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<svg class="alert-icon"><use xlink:href="#error"></use></svg>')
		);

		// unset
		render(null, container);

		expect(
			container.innerHTML
		).to.equal(
			''
		);

		render(<SvgComponent />, container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<svg class="alert-icon"><use xlink:href="#error"></use></svg>')
		);
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
					{ this.state.organizations.map((result) => {
						return <li>{ result.name }</li>;
					}) }
				</ul>
			);
		}
	}
	it('should render a basic component with a list of values from state', () => {
		render(<SuperComponent />, container);
		expect(
			container.innerHTML
		).to.equal(
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

		render(<Main/>, container);

	});

	function test(element, expectedTag, expectedClassName, callback) {

		render(element, container);
		requestAnimationFrame(() => {
			expect(container.firstChild).not.to.equal(null);
			expect(container.firstChild.tagName).to.equal(expectedTag);
			expect(container.firstChild.className).to.equal(expectedClassName);
			callback();
		});
	}

	it('should preserve the name of the class for use in error messages', function () {
		class Foo extends Component {}
		expect(Foo.name).to.equal('Foo');
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
				return <span className={ this.state.bar } />;
			}
		}
		test(<Foo initialValue={ null } />, 'SPAN', 'bar', () => {
			test(<Foo initialValue="foo" />, 'SPAN', 'bar', () => {
				expect(renderCount).to.equal(2);
				done();
			})
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

	it('should setState through an event handler', function (done) {
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
						name={ this.state.bar }
						onClick={ this.handleClick.bind(this) }
					/>
				);
			}
		}
		test(<Foo initialValue="foo" />, 'DIV', 'foo', function () {
			expect(renderedName).to.equal('foo');
			attachedListener();
			expect(renderedName).to.equal('bar');
			done();
		});
	});

	it('should render using forceUpdate even when there is no state', function (done) {
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
						name={ this.mutativeValue }
						onClick={ this.handleClick.bind(this) }
					/>
				);
			}
		}
		test(<Foo initialValue="foo" />, 'DIV', 'foo', function () {
			attachedListener();
			expect(renderedName).to.equal('bar');
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
			incrementCount(){
				this.setState({
					count: this.state.count + 1
				});
			}
			render(){
				return (
					<div class="my-component">
						<h1>{ this.props.car } { this.state.count }</h1>
						<button type="button" onClick={ this.incrementCount }>Increment</button>
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
						{ [ 'Saab', 'Volvo', 'BMW' ].map(function (c) {
							return (<Counter car={ c } />);
						}) }
					</div>
				);
			}
		}

		it('Initial render (creation)', () => {
			render(<Wrapper/>, container);

			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><div class="my-component"><h1>Saab 0</h1><button type="button">Increment</button></div><div class="my-component"><h1>Volvo 0</h1><button type="button">Increment</button></div><div class="my-component"><h1>BMW 0</h1><button type="button">Increment</button></div></div>')
			);
		});

		it('Second render (update)', (done) => {
			render(<Wrapper/>, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
			buttons.forEach(button => button.click());

			// requestAnimationFrame is needed here because
			// setState fires after a requestAnimationFrame
			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).to.equal(
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
					<div class="login-view bg-visma">
						<button onClick={ this.toggle }>TOGGLE</button>
						<br />
						{ function (){
							if (this.state.show === true) {
								return <h1>This is cool!</h1>;
							} else {
								return <h1>Not so cool</h1>;
							}
						}.call(this) }
					</div>
				);
			}
		}

		it('Initial render (creation)', () => {
			render(<SomeError/>, container);

			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div class="login-view bg-visma"><button>TOGGLE</button><br><h1>Not so cool</h1></div>')
			);
		});

		it('Second render (update with state change)', (done) => {
			render(<SomeError/>, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
			buttons.forEach(button => button.click());

			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div class="login-view bg-visma"><button>TOGGLE</button><br><h1>This is cool!</h1></div>')
				);
				done();
			});
		});
	});

	describe('should render a stateless component with a conditional state item', () => {
		const StatelessComponent = (props) => <p>{ props.name }</p>;

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
						{ function (){
							if (this.state.show === true) {
								return (
									<StatelessComponent name={ this.name } />
								);
							} else {
								return (
									<h1>Hello guys</h1>
								);
							}
						}.call(this) }
						<button onClick={ this.toggle }>toggle</button>
					</div>
				);
			}
		}

		it('Initial render (creation)', () => {

			render(null, container);

			render(<Testing/>, container);

			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><h1>Hello guys</h1><button>toggle</button></div>')
			);
		});

		it('Second render (update with state change)', (done) => {
			render(<Testing/>, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
			buttons.forEach(button => button.click());

			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div><p>Kalle</p><button>toggle</button></div>')
				);
				done();
			});
		});
	});

	describe('should render a repeating counter component with component children', () => {
		let id = 0;

		class Value extends Component {
			constructor(props){
				super(props);
				this.id = ++id;
			}
			render() {
				return <div>{ this.props.value }</div>;
			}
		}

		class Repeater extends Component {
			render() {
				// this doesn't work - only the last value is updated
				const children = [];
				for (let i = 0; i < 3; i++) {
					children.push(<Value key={ i } value={ this.props.value }/>);
				}

				return (<div>
					{ children }
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

			render(<Repeater value={ value }/>, container);
			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><div>0</div><div>0</div><div>0</div></div>')
			);

			value++;
			render(<Repeater value={ value }/>, container);
			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><div>1</div><div>1</div><div>1</div></div>')
			);

			value++;
			render(<Repeater value={ value }/>, container);
			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><div>2</div><div>2</div><div>2</div></div>')
			);
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
						{ this.props.children }
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
			).to.equal(
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
						isok={ this.state.isok } />
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
						isok={ this.props.isok ? 'true' : 'false' }
						<div>
							{ this.props.isok &&
							[ 'a', 'b' ].map((x) => {
								return (
									<span>{ x }</span>
								);
							}) }
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
				).to.equal(
					innerHTML('<div>isok=true<div><span>a</span><span>b</span></div></div>')
				);
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
						isok={ this.state.isok } />
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
							{ z(this.props.isok) }
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
				).to.equal(
					innerHTML('<div><div><span>a</span></div></div>')
				);
				done();
			});

		});
	});

	const StatelessComponent = (props) => <div>{ props.name }</div>;

	it('should render stateless component', () => {

		render(<StatelessComponent name="A" />, container);
		expect(container.textContent).to.equal('A');
	});

	it('should unmount stateless component', function () {

		render(<StatelessComponent name="A" />, container);
		expect(container.textContent).to.equal('A');

		render(null, container);
		expect(container.textContent).to.equal('');
	});

	it('should support module pattern components', function () {
		function Child({ test }) {
			return <div>{ test }</div>;
		}

		render(<Child test="test" />, container);

		expect(container.textContent).to.equal('test');
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
					empty: !this.state.empty
				});
			}

			render() {
				return (
					<div>
						<button onClick={this.toggle}>Empty</button>
						<ul>
							{(() => {
								if (this.state.empty === true) {
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
			).to.equal(
				innerHTML('<div><button>Empty</button><ul><li>No cars!</li></ul></div>')
			);
		});

		it('should handle update upon click', (done) => {
			render(<BuggyRender />, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

			buttons.forEach(button => button.click());
			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div><button>Empty</button><ul><li>BMW</li><li>Volvo</li><li>Saab</li></ul></div>')
				);
				done();
			});
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
			).to.equal(
				innerHTML('<div><button>1</button><div>0</div><div>1</div><div>2</div><div>3</div></div>')
			);
		});

		it('should handle update upon click', (done) => {
			render(<ChangeChildrenCount />, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

			buttons.forEach(button => button.click());
			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div><button>1</button><div>0</div></div>')
				);
				done();
			});
		});
	});

	describe('should render a conditional stateless component', () => {
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
						<button onClick={this._onClick}>Increase! {this.state.counter}</button>
						{this.condition ? <StatelessComponent value={this.state.counter} /> : null}
					</div>
				);
			}
		}

		it('should correctly render', () => {
			render(<First />, container);
			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><button>Increase! 0</button><p>0</p></div>')
			);
		});

		it('should handle update upon click', (done) => {
			render(<First />, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

			buttons.forEach(button => button.click());
			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div><button>Increase! 1</button><p>1</p></div>')
				);
				done();
			});
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
						{this.condition ? <StatelessComponent value={this.state.counter} /> : null}
					</div>
				);
			}
		}

		it('should correctly render', () => {
			render(<First name="guy1" />, firstDiv);
			render(<First name="guy2" />, secondDiv);

			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><div><button>guy1 0</button><p>0</p></div></div><div><div><button>guy2 0</button><p>0</p></div></div>')
			);
		});

		it('should handle update when changing first component', (done) => {
			render(<First name="guy1" />, firstDiv);
			render(<First name="guy2" />, secondDiv);

			const buttons = Array.prototype.slice.call(firstDiv.querySelectorAll('button'));
			buttons.forEach(button => button.click());

			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div><div><button>guy1 1</button><p>1</p></div></div><div><div><button>guy2 0</button><p>0</p></div></div>')
				);
				done();
			});
		});

		it('should handle update when changing second component', (done) => {
			render(<First name="guy1" />, firstDiv);
			render(<First name="guy2" />, secondDiv);

			const buttons = Array.prototype.slice.call(secondDiv.querySelectorAll('button'));
			buttons.forEach(button => button.click());

			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div><div><button>guy1 0</button><p>0</p></div></div><div><div><button>guy2 1</button><p>1</p></div></div>')
				);
				done();
			});
		});
	});

	describe('updating child should not cause rendering parent to fail', () => {
		it('should render parent correctly after child changes', () => {

			let updateParent,
				updateChild;

			class Parent extends Component {
				constructor(props) {
					super(props);
					this.state = {x: false};

					updateParent = () => {
						this.setState({x: true});
					};
				}

				render() {
					return (
						<div>
							<p>parent</p>
							{!this.state.x? <ChildA /> :<ChildB />}
						</div>
					);
				};
			}

			class ChildB extends Component {
				constructor(props) {
					super(props);
				};
				render() {
					return (<div>Y</div>);
				};
			}

			class ChildA extends Component {
				constructor(props) {
					super(props);
					this.state = {z: false};

					updateChild = () => {
						this.setState({z: true});
					}
				};

				render() {
					if (!this.state.z)
						return (<div>A</div>);

					return (<SubChild />);
				};
			}

			class SubChild extends Component {
				constructor(props) {
					super(props);
				};

				render() {
					return (<div>B</div>);
				};
			}

			render(<Parent />, container);
			expect(container.innerHTML).to.equal('<div><p>parent</p><div>A</div></div>');
			updateChild();
			expect(container.innerHTML).to.equal('<div><p>parent</p><div>B</div></div>');
			updateParent();
			expect(container.innerHTML).to.equal('<div><p>parent</p><div>Y</div></div>');
		});
	});

	describe('recursive component', () => {
		it('Should be possible to pass props recursively', () => {

			class List extends Component {
				render() {
					const children = this.props.data.
					map((entity) => {
						const { key, data, ...other } = entity;
						const child = Array.isArray(data) ?
							<List
								data={data}
								{...other}
							/> :
							<Text
								data={data}
								{...other}
							/>;
						return <li key={key}>{child}</li>;
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

			render(<List data={data} />, container);
			expect(container.innerHTML).to.equal('<ul><li><span>Foo</span></li><li><ul><li><span>a</span></li><li><span>b</span></li></ul></li></ul>');
		});

		it('Should be possible to pass props recursively AT BEGINNING (JSX plugin change required)', () => {

			class List extends Component {
				render() {
					const children = this.props.data.
					map((entity) => {
						const { key, data, ...other } = entity;
						const child = Array.isArray(data) ?
							<List
								{...other}
								data={data}
							/> :
							<Text
								{...other}
								data={data}
							/>;
						return <li key={key}>{child}</li>;
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

			render(<List data={data} />, container);
			expect(container.innerHTML).to.equal('<ul><li><span>Foo</span></li><li><ul><li><span>a</span></li><li><span>b</span></li></ul></li></ul>');
		});
	});

	it('Should render (github #117)', (done) => {
		class MakeX extends Component {
			constructor(props) {
				super(props);
				this.state = {x: false};
			};
			componentWillMount() {
				setTimeout(() => {
					this.setState({x: true});
				}, 10);
			};
			render() {
				return (
					<div>
						{!this.state.x?<MakeA />:<MakeY />}
					</div>
				);
			};
		}

		class MakeY extends Component {
			constructor(props) {
				super(props);
			};
			render() {
				return (<div>Y</div>);
			};
		}

		class MakeA extends Component {
			constructor(props) {
				super(props);
				this.state = {z: false};
			};

			componentWillMount() {
				setTimeout(() => {
					expect(() => this.setState({z: true})).to.throw();
				}, 20);
			};

			render() {
				if (!this.state.z) {
					return (<div>A</div>);
				}

				return (<MakeB />);
			};
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
		setTimeout(function() {
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

		var btnFlag = false;
		var containerFlag = false;

		class Button extends Component {
			onClick(event) {
				btnFlag = !btnFlag;
			}
			render() {
				const { text } = this.props;
				return <button onClick={this.onClick}><Label text={text} /></button>;
			}
		}

		class Container extends Component {
			onClick(event) {
				containerFlag = !containerFlag;
			}
			render() {
				return <div onClick={this.onClick}><Button text="Click me" /></div>
			}
		}

		render(<Container />, container);

		expect(btnFlag).to.equal(false);
		expect(containerFlag).to.equal(false);

		const spans = Array.prototype.slice.call(container.querySelectorAll('span'));
		spans.forEach(span => span.click());

		expect(btnFlag).to.equal(true);
		expect(containerFlag).to.equal(true);
		done();
	});

	it('Should be possible to stop propagation', (done) => {
		class Label extends Component {
			render() {
				const style = { backgroundColor: 'red', padding: '0 20px', fontSize: '40px' };
				return <span style={style}>{this.props.text}</span>;
			}
		}

		var btnFlag = false;
		var containerFlag = false;

		class Button extends Component {
			onClick(event) {
				event.stopPropagation();
				btnFlag = !btnFlag;
			}
			render() {
				const { text } = this.props;
				return <button onClick={this.onClick}><Label text={text} /></button>;
			}
		}

		class Container extends Component {
			onClick(event) {
				containerFlag = !containerFlag;
			}
			render() {
				return <div onClick={this.onClick}><Button text="Click me" /></div>
			}
		}

		render(<Container />, container);

		expect(btnFlag).to.equal(false);
		expect(containerFlag).to.equal(false);

		const spans = Array.prototype.slice.call(container.querySelectorAll('span'));
		spans.forEach(span => span.click());

		expect(btnFlag).to.equal(true);
		expect(containerFlag).to.equal(false);
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
					return (<div></div>)
				}
			}

			render(<C />, container);
			expect(container.innerHTML).to.equal('<div></div>');
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
			expect(container.firstChild.innerHTML).to.equal('Hello world');
		});

		it('should update correctly', () => {
			render(<Foo />, container);
			render(<Foo />, container);
			expect(container.firstChild.innerHTML).to.equal('Hello world');
		});

		it('should update correctly via forceUpdate', () => {
			render(<Foo />, container);
			forceUpdate();
			forceUpdate2();
			render(<Foo />, container);
			forceUpdate2();
			forceUpdate();
			expect(container.firstChild.innerHTML).to.equal('Hello world');
		});
	});

	it('Should trigger ref lifecycle after patch', () => {
		let updater;
		let obj = {
			fn: function () {}
		};

		const calledOnce = sinon.assert.calledOnce;
		const notCalled = sinon.assert.notCalled;
		const spy = sinon.spy(obj, 'fn');

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
		expect(container.innerHTML).to.equal('<div>Hello world</div>');
		notCalled(spy);

		updater();
		expect(container.innerHTML).to.equal('<div><div>Hello world2</div></div>');
		calledOnce(spy);
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
					this.setState({
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
			expect(container.innerHTML).to.equal('');

			updater();
			expect(container.innerHTML).to.equal('<div>Rendered!</div>');

			updater();
			expect(container.innerHTML).to.equal('');

			updater();
			expect(container.innerHTML).to.equal('<div>Rendered!</div>');

			updater();
			expect(container.innerHTML).to.equal('');

			updater();
			expect(container.innerHTML).to.equal('<div>Rendered!</div>');
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
				this.setState({
					bool: !this.state.bool
				});
			}

			render() {
				return (
					<div>
						{this.state.bool ? <span>span</span> : 'text'}
						<div>div</div>
					</div>
				)
			}
		}


		render(<Bar />, container);
		expect(container.innerHTML).to.equal('<div><span>span</span><div>div</div></div>');

		updater();
		expect(container.innerHTML).to.equal('<div>text<div>div</div></div>');

		updater();
		expect(container.innerHTML).to.equal('<div><span>span</span><div>div</div></div>');

		updater();
		expect(container.innerHTML).to.equal('<div>text<div>div</div></div>');
	});

	it('Should be able to swap between text node and html node #2', () => {
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
				)
			}
		}


		render(<Bar />, container);
		expect(container.innerHTML).to.equal('<div><div>div</div></div>');

		updater();
		expect(container.innerHTML).to.equal('<div><span>span</span><div>div</div></div>');

		updater();
		expect(container.innerHTML).to.equal('<div><div>div</div></div>');

		updater();
		expect(container.innerHTML).to.equal('<div><span>span</span><div>div</div></div>');
	});

	describe('handling of sCU', () => {
		let instance;
		class Test extends Component {
			shouldComponentUpdate() {
				return false;
			}
			render() {
				instance = this;
				return <div>{ this.props.foo }</div>;
			}
		}

		it('should correctly render once but never again', () => {
			render(<Test foo="bar" />, container);
			expect(container.innerHTML).to.equal('<div>bar</div>');
			render(<Test foo="yar" />, container);
			expect(container.innerHTML).to.equal('<div>bar</div>');
			instance.setState({ foo: 'woo' });
			expect(container.innerHTML).to.equal('<div>bar</div>');
			render(null, container);
			expect(container.innerHTML).to.equal('');
		});
	});
	describe('handling of different primatives', () => {
		it('Should correctly handle boolean values (github#255)', () => {
			const Todo = ({ todo }) => (
				<tr> <td>{todo.id}</td> <td>{todo.desc}</td> <td>{todo.done}</td> </tr>
			);

			render(<Todo todo={ { done: false } } />, container);
			expect(container.innerHTML).to.equal('<tr> <td></td> <td></td> <td></td> </tr>');
			render(<Todo todo={ { done: true } } />, container);
			expect(container.innerHTML).to.equal('<tr> <td></td> <td></td> <td></td> </tr>');
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
					console.log(event, "blur");
				}

				render() {
					const props = {
						onBlur : this.handleBlur,
						className: 'foo',
						id: 'test'
					};

					return (<input { ...props } ></input>);
				}
			}

			render(
				<Input />, container
			);
			expect(container.innerHTML).to.equal('<input class="foo" id="test">');
		});
	});

	describe('Swapping Component to DOM node', () => {
		it('Should be able to swap statefull component to DOM list when doing setState', () => {
			let change1 = null;

			class FooBar extends Component {
				constructor(props) {
					super(props)
				};

				render() {
					return (
						<div><span>foo1</span><span>foo2</span><span>foo3</span><span>foo4</span></div>
					)
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
					this.setState({
						toggle1: !this.state.toggle1
					});
				}

				renderContent() {
					if (this.state.toggle1) {
						return <FooBar />;
					} else {
						return (
							<div class="login-container">
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
					 )
				}
			}

			render(<Tester />, container);
			expect(container.innerHTML).to.equal('<div><div class="login-container"><h1>foo</h1></div></div>');
			change1();
			expect(container.innerHTML).to.equal('<div><div><span>foo1</span><span>foo2</span><span>foo3</span><span>foo4</span></div></div>');
			change1();
			expect(container.innerHTML).to.equal('<div><div class="login-container"><h1>foo</h1></div></div>');
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
					this.setState({
						toggle1: !this.state.toggle1
					});
				}

				renderContent() {
					if (this.state.toggle1) {
						return <FooBar />;
					} else {
						return (
							<div class="login-container">
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
					)
				}
			}

			render(<Tester />, container);
			expect(container.innerHTML).to.equal('<div><div class="login-container"><h1>foo</h1></div></div>');
			change1();
			expect(container.innerHTML).to.equal('<div><div><span>foo1</span><span>foo2</span><span>foo3</span><span>foo4</span></div></div>');
			change1();
			expect(container.innerHTML).to.equal('<div><div class="login-container"><h1>foo</h1></div></div>');
		});
	});

	describe('handling componentWillReceiveProps lifecycle event', () => {
		it('should correctly handle setState within the lifecycle funciton', () => {
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
					return <div>{ this.state.foo }</div>;
				}
			}

			render(<Comp1 />, container);
			expect(container.innerHTML).to.equal('<div>0</div>');
			render(<Comp1 />, container);
			expect(container.innerHTML).to.equal('<div>1</div>');
			expect(renderCount).to.equal(2);
		});
	});

	describe('tracking DOM state', () => {
		class ComponentA extends Component {
			render() {
				return <div><span>Something</span></div>;
			}
		}

		class ComponentB extends Component {
			render() {
				return <div><span>Something</span></div>;
			}
		}

		it('patching component A to component B, given they have the same children, should not change the DOM tree', () => {
			render(<ComponentA />, container);
			expect(container.innerHTML).to.equal('<div><span>Something</span></div>');
			const trackElemDiv = container.firstChild;
			const trackElemSpan = container.firstChild.firstChild;

			render(<ComponentB />, container);
			expect(container.innerHTML).to.equal('<div><span>Something</span></div>');
			expect(container.firstChild === trackElemDiv).to.equal(true);
			expect(container.firstChild.firstChild === trackElemSpan).to.equal(true);
		});
	});

	it('mixing JSX components with non-JSX components', () => {
		function Comp() {
			return createElement('div');
		}
		function Comp2() {
			return createElement('span');
		}
		function Comp3() {
			return <div></div>;
		}
		render(<div><Comp /></div>, container);
		expect(container.innerHTML).to.equal('<div><div></div></div>');
		render(<div><Comp2 /></div>, container);
		expect(container.innerHTML).to.equal('<div><span></span></div>');
		render(<span><Comp /></span>, container);
		expect(container.innerHTML).to.equal('<span><div></div></span>');
		render(createElement('span', null, <Comp3 />), container);
		expect(container.innerHTML).to.equal('<span><div></div></span>');
	});
});
