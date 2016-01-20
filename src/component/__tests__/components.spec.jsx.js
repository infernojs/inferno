import createTemplate, { addTreeConstructor } from '../../core/createTemplate';
import TemplateFactory from '../../core/TemplateFactory';
import { render } from '../../DOM/rendering';
import createTree from '../../DOM/createTree';
import Component from '../Component';
import waits from '../../../tools/waits';
import innerHTML from '../../../tools/innerHTML';
import { requestAnimationFrame } from '../../util/requestAnimationFrame';

const { createElement } = TemplateFactory;

// set the constructor to 'dom'
addTreeConstructor( 'dom', createTree );

/**
 * DO NOT MODIFY! We are facking Inferno to get JSX working!
 */
const Inferno = { createTemplate };

describe( 'Components (JSX)', () => {
	let container;
	let freeze = function(expectation) {
		Object.freeze(expectation);
		return expectation;
	};
	let Inner;
	let attachedListener = null;
	let renderedName = null;

	beforeEach(function() {

		attachedListener = null;
		renderedName = null;

		container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);

		Inner = class extends Component {
			getName() {
				return this.props.name;
			}
			render() {
				attachedListener = this.props.onClick;
				renderedName = this.props.name;
				return <div className={this.props.name} />;
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

	it('should render a basic component', () => {

		render((
			<div><BasicComponent1 title="abc" name="basic-render" /></div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML( '<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>' )
		);

		render((
			<div><BasicComponent1 title="abc" name="basic-render" /></div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML( '<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>' )
		);
	});


	class BasicComponent1b extends Component {
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
			innerHTML( '<div><div class="basic"><label><input>The title is abc</label></div></div>' )
		);
		expect(
			container.querySelector("input").checked
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
			innerHTML( '<div><div class="basic"><label><input>The title is 123</label></div></div>' )
		);
		expect(
			container.querySelector("input").checked
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
			container.querySelector("input").checked
		).to.equal(
			true
		);
	});

	it('should render a basic component and remove property if null', () => {

		render((
				<div>
					<BasicComponent1 title='abc' name='basic-render' />
				</div>
			),
			container
		);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML( '<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>' )
		);

		render((
				<div></div>
			),
			container
		);
		render((
				<div>
					<BasicComponent1 title='Hello, World!' name='basic-render' />
				</div>
			),
			container
		);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML( '<div><div class="basic"><span class="basic-render">The title is Hello, World!</span></div></div>' )
		);

		render((
				<div>
					<BasicComponent1 title='123' name={ null } />
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
					<BasicComponent1 title={[]} name={ null } />
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
				<BasicComponent1 title='abc' name={ null } />
			</div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div><div class="basic"><span>The title is abc</span></div></div>')
		);


		render((
			<div>
				<BasicComponent1 title='123' name='basic-update' />
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
			<BasicComponent1 title='abc' name='basic-render' />
		), container);

		expect(container.firstChild.getAttribute('class')).to.equal('basic');

		render((
			<BasicComponent1 title='abc' name='basic-render' />
		), container);

		expect(container.firstChild.getAttribute('class')).to.equal('basic');

		render((
			<BasicComponent1 title='123' name='basic-update' />
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
				<div className='basic'>
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
	});

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
			<BasicComponent3 title="styled!" styles={{ color: "red", paddingLeft: 10 }} />
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
			<BasicComponent3 title="styled (again)!" styles={{ color: "blue", marginBottom: 20 }} />
		), container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<div style="color: blue; margin-bottom: 20px;"><span style="color: blue; margin-bottom: 20px;">The title is styled (again)!</span></div>')
		);
	});

	it('should render a basic component and remove styling', () => {

		render((
			<BasicComponent3 title="styled!" styles={{ color: "red", paddingTop: 20 }} />
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
						<use xlinkHref="#error"></use>
					</svg>
				)
			}
		}

		render(<SvgComponent />, container);

		expect(
			container.innerHTML
		).to.equal(
			innerHTML('<svg class="alert-icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#error"></use></svg>')
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
			innerHTML('<svg class="alert-icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#error"></use></svg>')
		);
	});

	class SuperComponent extends Component {
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
			return (
				<ul class="login-organizationlist">
					{this.state.organizations.map((result) => {
						return <li>{ result.name }</li>;
					})}
				</ul>
			)
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

	function test(element, expectedTag, expectedClassName) {

		let instance = render(element, container);
		expect(container.firstChild).not.to.be.null;
		expect(container.firstChild.tagName).to.equal(expectedTag);
		expect(container.firstChild.className).to.equal(expectedClassName);
		return instance;
	}

	it('should preserve the name of the class for use in error messages', function() {
		class Foo extends Component { }
		expect(Foo.name).to.equal('Foo');
	});

	it('should only render once when setting state in componentWillMount', function() {
		var renderCount = 0;
		class Foo extends Component {
			constructor(props) {
				super(props);
				this.state = {bar: props.initialValue};
			}
			componentWillMount() {
				this.setState({bar: 'bar'});
			}
			render() {
				renderCount++;
				return <span className={this.state.bar} />;
			}
		}
		test(<Foo initialValue={null} />, 'SPAN', '');
		test(<Foo initialValue="foo" />, 'SPAN', 'foo');
		// setState causes a render, so we should expect 2
		expect(renderCount).to.equal(2);
	});

	it('should render with null in the initial state property', function() {
		class Foo extends Component {
			constructor() {
				super();
				this.state = null;
			}
			render() {
				return <span />;
			}
		}
		test(<Foo />, 'SPAN', '');
	});

	it('should setState through an event handler', function() {
		class Foo extends Component {
			constructor(props) {
				super(props);
				this.state = {bar: props.initialValue};
			}
			handleClick() {
				this.setState({bar: 'bar'});
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
		test(<Foo initialValue="foo" />, 'DIV', 'foo');
		attachedListener();
		expect(renderedName).to.equal('foo');
	});

	it('should render using forceUpdate even when there is no state', function() {
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
		test(<Foo initialValue="foo" />, 'DIV', 'foo');
		attachedListener();
		expect(renderedName).to.equal('bar');
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
						{["Saab", "Volvo", "BMW"].map(function(c) {
							return (<Counter car={c} />)
						})}
					</div>
				)
			}
		}

		it('Initial render (creation)', () => {
			render(<Wrapper/>, container);

			expect(
				container.innerHTML
			).to.equal(
				innerHTML( '<div><div class="my-component"><h1>Saab 0</h1><button type="button">Increment</button></div><div class="my-component"><h1>Volvo 0</h1><button type="button">Increment</button></div><div class="my-component"><h1>BMW 0</h1><button type="button">Increment</button></div></div>' )
			);
		});

		it('Second render (update)', (done) => {
			render(<Wrapper/>, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
			buttons.forEach(button => button.click());

			// requestAnimationFrame is needed here because
			// setState fires after a requestAnimationFrame
			requestAnimationFrame( () => {
				expect(
					container.innerHTML
				).to.equal(
					innerHTML( '<div><div class="my-component"><h1>Saab 1</h1><button type="button">Increment</button></div><div class="my-component"><h1>Volvo 1</h1><button type="button">Increment</button></div><div class="my-component"><h1>BMW 1</h1><button type="button">Increment</button></div></div>' )
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
						<button onClick={this.toggle}>TOGGLE</button>
						<br />
						{function(){
							if (this.state.show === true) {
								return <h1>This is cool!</h1>
							} else {
								return <h1>Not so cool</h1>
							}
						}.call(this)}
					</div>
				)
			}
		}

		it('Initial render (creation)', () => {
			render( <SomeError/>, container );

			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div class="login-view bg-visma"><button>TOGGLE</button><br><h1>Not so cool</h1></div>')
			);
		});

		it('Second render (update with state change)', (done) => {
			render( <SomeError/>, container );
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
			buttons.forEach(button => button.click());

			requestAnimationFrame( () => {
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
		const StatelessComponent = (props) => <p>{props.name}</p>;

		class Testing extends Component {
			constructor(props) {
				super(props);
				this.name = "Kalle";

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
						{function(){
							if (this.state.show === true) {
								return (
									<StatelessComponent name={this.name} />
								);
							} else {
								return (
									<h1>Hello guys</h1>
								);
							}
						}.call(this)}
						<button onClick={this.toggle}>toggle</button>
					</div>
				)
			}
		}

		it('Initial render (creation)', () => {

			render( {null}, container );

			render( <Testing/>, container );

			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><h1>Hello guys</h1><button>toggle</button></div>')
			);
		});

		it('Second render (update with state change)', (done) => {
			render( <Testing/>, container );
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
				return <div>{this.props.value}</div>
			}
		}

		class Repeater extends Component {
			render() {
				//this doesn't work - only the last value is updated
				var children = [];
				for (var i = 0; i < 3; i++) {
					children.push(<Value key={i} value={this.props.value}/>);
				}

				return (<div>
					{children}
				</div>);

				//this works - all values are updated
				//return <div>
				//    <Value value={this.props.value}/>
				//    <Value value={this.props.value}/>
				//    <Value value={this.props.value}/>
				//</div>
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
			};
			componentDidMount() {
				this.setState({isok: true});
			};
			render() {
				return (
					<MyComponent99
						isok={this.state.isok} />
				)
			};
		}

		class MyComponent99 extends Component {
			constructor(props) {
				super(props);
			};
			render() {
				console.log("isok="+this.props.isok);
				return (
					<div>
						isok={this.props.isok?'true':'false'}
						<div>
							{this.props.isok &&
							['a', 'b'].map( (x) => {
								return (
									<span>{x}</span>
								);
							})}
						</div>
					</div>
				)
			};
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

	describe('should render a component with with conditional boolean text nodes', () => {
		class MyComponent98 extends Component {
			constructor(props) {
				super(props);
				this.state = {
					isok: false
				};
			};
			componentDidMount() {
				this.setState({isok: true});
			};
			render() {
				return (
					<MyComponent99
						isok={this.state.isok} />
				)
			};
		}

		class MyComponent99 extends Component {
			constructor(props) {
				super(props);
			};
			render() {
				console.log("isok="+this.props.isok);

				var z = function(v) {
					if (v) {
						return (
							<span>a</span>
						);
					} else {
						return (
							<span>b</span>
						);
					};
				};

				return (
					<div>
						<div>
							{z(this.props.isok)}
						</div>
					</div>
				)
			};
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


	const StatelessComponent = (props) => <div>{props.name}</div>;

	it('should render stateless component', () => {

		render(<StatelessComponent name="A" />, container);
		expect(container.textContent).to.equal('A');
	});

	it('should unmount stateless component', function() {

		render(<StatelessComponent name="A" />, container);
		expect(container.textContent).to.equal('A');

		render(null, container);
		expect(container.textContent).to.equal('');
	});

});