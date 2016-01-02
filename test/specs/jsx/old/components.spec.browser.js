import Inferno from '../../../../packages/inferno/src/';
import InfernoDOM from '../../../../packages/inferno-dom/src/';

// WHY would we need this??

import { addTreeConstructor } from '../../../../src/core/createTemplate';
import createDOMTree from '../../../../src/DOM/createTree';

addTreeConstructor( 'dom', createDOMTree );
import waits from '../../../tools/waits';

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

		Inner = class extends Inferno.Component {
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
		InfernoDOM.render(null, container);
	});

	class BasicComponent1 extends Inferno.Component {
		render() {
			return (
				<div className="basic">
				<span className={ this.props.name }>The title is { this.props.title }</span>
			</div>
		);
		}
	}

	it('should render a basic component', () => {

		InfernoDOM.render((
			<div><BasicComponent1 title="abc" name="basic-render" /></div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
		);

		InfernoDOM.render((
			<div><BasicComponent1 title="abc" name="basic-render" /></div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
		);
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

	class BasicComponent1c extends Inferno.Component {
		render() {
			return (<span>Hello World</span>);
		}
	}

	it('should render a basic component with inputs', () => {

		InfernoDOM.render((
			<div>
			<BasicComponent1b title="abc" isChecked={ true } />
			</div>
		), container);

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

		InfernoDOM.render((
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

		InfernoDOM.render((
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

		InfernoDOM.render((
			<div>
			<BasicComponent1 title='abc' name='basic-render' />
			</div>
		),
		container
		);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
		);

		InfernoDOM.render((
			<div>
			<BasicComponent1 title='Hello, World!' name='basic-render' />
			</div>
		),
		container
		);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is Hello, World!</span></div></div>'
		);

		InfernoDOM.render((
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

		InfernoDOM.render((
			<div>
			<BasicComponent1 title='abc' name={ null } />
			</div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span>The title is abc</span></div></div>'
		);


		InfernoDOM.render((
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

	it('should render a basic root component', () => {

		InfernoDOM.render((
			<BasicComponent1 title='abc' name='basic-render' />
		), container);

		expect(container.firstChild.getAttribute('class')).to.equal('basic');

		InfernoDOM.render((
			<BasicComponent1 title='abc' name='basic-render' />
		), container);

		expect(container.firstChild.getAttribute('class')).to.equal('basic');

		InfernoDOM.render((
			<BasicComponent1 title='123' name='basic-update' />
		), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div class="basic"><span class="basic-update">The title is 123</span></div>'
		);
	});

	class BasicComponent2 extends Inferno.Component {
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

		InfernoDOM.render((
			<div>
			<BasicComponent2 title="abc" name="basic-render">
			<span>Im a child</span>
		</BasicComponent2>
		</div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is abc</span><span>Im a child</span></div></div>'
		);

		InfernoDOM.render((
			<div>
			<BasicComponent2 title="123" name="basic-update">
			<span>Im a child</span>
		</BasicComponent2>
		</div>
		), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-update">The title is 123</span><span>Im a child</span></div></div>'
		);
	});

	it('should throw error when a component is included as a child without a template', () => {
		
		expect(() => InfernoDOM.render((
			<div>
				<BasicComponent2 title="abc" name="basic-render">
					<span>A child</span>
					<BasicComponent1c/>
				</BasicComponent2>
			</div>
		), container)).to.throw('Inferno Error: Children must be provided as templates.');
	});

	it('should render multiple components', () => {

		InfernoDOM.render((
			<div>
			<BasicComponent1 title="component 1" name="basic-render" />
			<BasicComponent1 title="component 2" name="basic-render" />
			</div>
		), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is component 1</span></div>'
			+ '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>'
		);

		InfernoDOM.render((
			<div>
			<BasicComponent1 title="component 1" name="basic-render" />
			</div>
		), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><div class="basic"><span class="basic-render">The title is component 1</span></div></div>'
		);
	});


	class BasicComponent3 extends Inferno.Component {
		render() {
			return (
				<div style={ this.props.styles }>
		<span style={ this.props.styles }>The title is { this.props.title }</span>
			</div>
		);
		}
	}

	it('should render a basic component with styling', () => {

		InfernoDOM.render((
			<BasicComponent3 title="styled!" styles={{ color: "red", paddingLeft: 10 }} />
		), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>'
		);

		InfernoDOM.render((
			<BasicComponent3 title="styled (again)!" styles={{ color: "blue", marginBottom: 20 }} />
		), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div style="color: blue; margin-bottom: 20px;"><span style="color: blue; margin-bottom: 20px;">The title is styled (again)!</span></div>'
		);
	});

	it('should render a basic component and remove styling', () => {

		InfernoDOM.render((
			<BasicComponent3 title="styled!" styles={{ color: "red", paddingTop: 20 }} />
		), container);

		expect(
			container.innerHTML
		).to.equal(
			'<div style="color: red; padding-top: 20px;"><span style="color: red; padding-top: 20px;">The title is styled!</span></div>'
		);

		InfernoDOM.render((
			<BasicComponent3 title="styles are removed!" styles={ null } />
		), container);
		expect(
			container.innerHTML
		).to.equal(
			'<div><span>The title is styles are removed!</span></div>'
		);
	});

	it('should render a basic component with SVG', () => {
		class Component extends Inferno.Component {
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

		InfernoDOM.render(<Component />, container);

		expect(
			container.innerHTML
		).to.equal(
			'<svg class="alert-icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#error"></use></svg>'
		);

		// unset
		InfernoDOM.render(null, container);

		expect(
			container.innerHTML
		).to.equal(
			''
		);

		InfernoDOM.render(<Component />, container);

		expect(
			container.innerHTML
		).to.equal(
			'<svg class="alert-icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#error"></use></svg>'
		);
	});

	class Component extends Inferno.Component {
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

		InfernoDOM.render(<Component />, container);
		expect(
			container.innerHTML
		).to.equal(
			'<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>'
		);
	});

	it('should render a basic component with an element and components as children', () => {
		class Navbar extends Inferno.Component {
			render() {
				return (
					<ul>
					<li>Nav1</li>
					</ul>
			);
			}
		}

		class Main extends Inferno.Component {
			render() {
				return (
					<div className="main">
					<Navbar />
					<div id="app"/>
					</div>
			);
			}
		}

		InfernoDOM.render(<Main/>, container);

	});

	function test(element, expectedTag, expectedClassName) {

		let instance = InfernoDOM.render(element, container);
		expect(container.firstChild).not.to.be.null;
		expect(container.firstChild.tagName).to.equal(expectedTag);
		expect(container.firstChild.className).to.equal(expectedClassName);
		return instance;
	}

	it('should preserve the name of the class for use in error messages', function() {
		class Foo extends Inferno.Component { }
		expect(Foo.name).to.equal('Foo');
	});

	it('should only render once when setting state in componentWillMount', function() {
		var renderCount = 0;
		class Foo extends Inferno.Component {
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
		test(<Foo initialValue="foo" />, 'SPAN', 'foo');
		expect(renderCount).to.equal(1);
	});

	it('should render with null in the initial state property', function() {
		class Foo extends Inferno.Component {
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
		class Foo extends Inferno.Component {
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
		class Foo extends Inferno.Component {
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

	it('should render a component with a list of children that dynamically update via setState', () => {
		class Counter extends Inferno.Component {
			constructor(props) {
				super(props);
				this.state = {
					count: 0
				};
				this.incrementCount = this.incrementCount.bind(this);
				setTimeout(this.incrementCount, 10);
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

		class Wrapper extends Inferno.Component {
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
			InfernoDOM.render(<Wrapper/>, container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="my-component"><h1>Saab 0</h1><button type="button">Increment</button></div><div class="my-component"><h1>Volvo 0</h1><button type="button">Increment</button></div><div class="my-component"><h1>BMW 0</h1><button type="button">Increment</button></div></div>'
			);
		});

		it('Second render (update)', (done) => {
			InfernoDOM.render(<Wrapper/>, container);

			waits(30, () => {
				expect(
					container.innerHTML
				).to.equal(
					'<div><div class="my-component"><h1>Saab 1</h1><button type="button">Increment</button></div><div class="my-component"><h1>Volvo 1</h1><button type="button">Increment</button></div><div class="my-component"><h1>BMW 1</h1><button type="button">Increment</button></div></div>'
				);
				done();
			});
		});
	});
});
