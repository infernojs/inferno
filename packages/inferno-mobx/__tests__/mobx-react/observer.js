import { render } from 'inferno';
import { default as InfernoComponent } from 'inferno-component';
import createClass from 'inferno-create-class';
import { mounter, t } from './_util';
import mobx, { observable, action, computed } from 'mobx';
import InfernoServer from 'inferno-server';
import mobxReact, { observer, inject } from '../../dist-es';

const store = mobx.observable({
	todos: [{
		title: 'a',
		completed: false
	}]
});

let todoItemRenderings = 0;
const TodoItem = observer(function TodoItem(props) {
	todoItemRenderings++;
	return <li>|{ props.todo.title }</li>;
});

let todoListRenderings = 0;
let todoListWillReactCount = 0;
const TodoList = observer(createClass({
	renderings: 0,
	componentWillReact() {
		todoListWillReactCount++;
	},
	render() {
		todoListRenderings++;
		const todos = store.todos;
		return (
      <div>
        <hi>{ todos.length }</hi>
        { todos.map((todo, idx) => <TodoItem key={ idx } todo={ todo } />) }
      </div>
		);
	}
}));

const App = () => <TodoList />;

const getDNode = (obj, prop) => obj.$mobx.values[prop];

describe('mobx-react-port Observer', () => {
	let container = null,
		mount = null;

	beforeEach(function () {
		container = document.createElement('div');
		container.style.display = 'none';
		mount = mounter.bind(container);
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		document.body.removeChild(container);
	});

	it('nestedRendering', (done) => {
		render(<App />, container, () => {
			t.equal(todoListRenderings, 1, 'should have rendered list once');
			t.equal(todoListWillReactCount, 0, 'should not have reacted yet');
			t.equal(container.querySelectorAll('li').length, 1);
			t.equal(container.querySelector('li').innerText, '|a');

			t.equal(todoItemRenderings, 1, 'item1 should render once');

			t.equal(getDNode(store, 'todos').observers.length, 1);
			t.equal(getDNode(store.todos[0], 'title').observers.length, 1);

			store.todos[0].title += 'a';

			setTimeout(() => {
				t.equal(todoListRenderings, 1, 'should have rendered list once');
				t.equal(todoListWillReactCount, 0, 'should not have reacted');
				t.equal(todoItemRenderings, 2, 'item1 should have rendered twice');
				t.equal(getDNode(store, 'todos').observers.length, 1, 'observers count shouldn\'t change');
				t.equal(getDNode(store.todos[0], 'title').observers.length, 1, 'title observers should not have increased');

				store.todos.push({
					title: 'b',
					completed: true
				});

				setTimeout(() => {
					t.equal(container.querySelectorAll('li').length, 2, 'list should two items in in the list');
					t.deepEqual(Array.from(container.querySelectorAll('li')).map(e => e.innerText), [ '|aa', '|b' ]);

					t.equal(todoListRenderings, 2, 'should have rendered list twice');
					t.equal(todoListWillReactCount, 1, 'should have reacted');
					t.equal(todoItemRenderings, 3, 'item2 should have rendered as well');
					t.equal(getDNode(store.todos[1], 'title').observers.length, 1, 'title observers should have increased');
					t.equal(getDNode(store.todos[1], 'completed').observers.length, 0, 'completed observers should not have increased');

					const oldTodo = store.todos.pop();
					setTimeout(() => {
						t.equal(todoListRenderings, 3, 'should have rendered list another time');
						t.equal(todoListWillReactCount, 2, 'should have reacted');
						t.equal(todoItemRenderings, 3, 'item1 should not have rerendered');
						t.equal(container.querySelectorAll('li').length, 1, 'list should have only on item in list now');
						t.equal(getDNode(oldTodo, 'title').observers.length, 0, 'title observers should have decreased');
						t.equal(getDNode(oldTodo, 'completed').observers.length, 0, 'completed observers should not have decreased');

						done();
					});
				}, 20);
			}, 20);
		});
	});

	it('keep views alive', (done) => {
		let yCalcCount = 0;
		const data = mobx.observable({
			x: 3,
			get y() {
				yCalcCount++;
				return this.x * 2;
			},
			z: 'hi'
		});

		const TestComponent = observer(function testComponent() {
			return <div>{data.z + data.y}</div>;
		});

		render(<TestComponent />, container, function () {
			t.equal(yCalcCount, 1);
			t.equal(container.innerText, 'hi6');

			data.z = 'hello';
			// test: rerender should not need a recomputation of data.y because the subscription is kept alive

			setTimeout(() => {
				t.equal(yCalcCount, 1);

				t.equal(container.innerText, 'hello6');
				t.equal(yCalcCount, 1);

				t.equal(getDNode(data, 'y').observers.length, 1);

				render(<div />, container, () => {
					t.equal(getDNode(data, 'y').observers.length, 0);
					done();
				});
			}, 100);
		});
	});

	it('componentWillMount from mixin is run first', () => {
		// t.plan(1);
		const Comp = observer(React.createClass({
			componentWillMount: function () {
				// ugly check, but proofs that observer.willmount has run
				t.equal(this.render.name, 'initialRender');
			},
			render() {
				return null;
			}
		}));
		render(<Comp />, container, () => {
			t.end();
		});
	});

	it('does not views alive when using static rendering', (done) => {
		mobxReact.useStaticRendering(true);

		let renderCount = 0;
		const data = mobx.observable({
			z: 'hi'
		});

		const TestComponent = observer(function testComponent() {
			renderCount++;
			return <div>{ data.z }</div>;
		});

		render(<TestComponent />, container, function () {

			t.equal(renderCount, 1);
			t.equal(container.querySelector('div').innerText, 'hi');

			data.z = 'hello';
			// no re-rendering on static rendering

			setTimeout(() => {
				t.equal(renderCount, 1);

				t.equal(container.querySelector('div').innerText, 'hi');
				t.equal(renderCount, 1);

				t.equal(getDNode(data, 'z').observers.length, 0);

				mobxReact.useStaticRendering(false);
				done();
			}, 20);
		});
	});

	it('does not views alive when using static + string rendering', function (done) {
		mobxReact.useStaticRendering(true);

		let renderCount = 0;
		const data = mobx.observable({
			z: 'hi'
		});

		const TestComponent = observer(function testComponent() {
			renderCount++;
			return <div>{ data.z }</div>;
		});

		const output = InfernoServer.renderToStaticMarkup(<TestComponent />);

		data.z = 'hello';

		setTimeout(() => {
			t.equal(output, '<div>hi</div>');
			t.equal(renderCount, 1);

			t.equal(getDNode(data, 'z').observers.length, 0);

			mobxReact.useStaticRendering(false);
			done();
		}, 20);
	});

	it('issue 12', function (done) {
		const data = mobx.observable({
			selected: 'coffee',
			items: [{
				name: 'coffee'
			}, {
				name: 'tea'
			}]
		});

		/** Row Class */
		class Row extends InfernoComponent {
			constructor(props) {
				super(props);
			}

			render() {
				return (
					<span>{this.props.item.name}{data.selected === this.props.item.name ? '!' : ''}</span>
				);
			}
		}

		/** table stateles component */
		let Table = observer(function table() {
			return <div>{data.items.map(item => <Row key={ item.name } item={ item } />)}</div>;
		});

		render(<Table />, container, function () {
			t.equal(container.querySelector('div').innerText, 'coffee!tea');

			mobx.transaction(() => {
				data.items[1].name = 'boe';
				data.items.splice(0, 2, { name: 'soup' });
				data.selected = 'tea';
			});

			setTimeout(() => {
				t.equal(container.querySelector('div').innerText, 'soup');
				done();
			}, 20);
		});
	});

	it('changing state in render should fail', function () {
		const data = mobx.observable(2);
		const Comp = observer(() => {
			data(3);
			return <div>{ data() }</div>;
		});

		t.throws(
			() => render(<Comp />, container),
			'It is not allowed to change the state during a view'
		);

		mobx.extras.resetGlobalState();
		t.end();
	});

	it('component should not be inject', function () {
		const msg = [];
		const baseWarn = console.warn;
		console.warn = m => msg.push(m);

		observer(inject('foo')(createClass({
			render() {
				return <div>context:{ this.props.foo }</div>;
			}
		})));

		t.equal(msg.length, 1);
		console.warn = baseWarn;
		t.end();
	});

	it('observer component can be injected', () => {
		const msg = [];
		const baseWarn = console.warn;
		console.warn = m => msg.push(m);

		inject('foo')(observer(createClass({
			render: () => null
		})));

		// N.B, the injected component will be observer since mobx-react 4.0!
		inject(() => {})(observer(createClass({
			render: () => null
		})));

		t.equal(msg.length, 0);
		console.warn = baseWarn;
		t.end();
	});

	it('124 - react to changes in this.props via computed', function (done) {
		const Comp = observer(createClass({
			componentWillMount() {
				mobx.extendObservable(this, {
					get computedProp() {
						return this.props.x;
					}
				});
			},
			render() {
				return <span>x:{ this.computedProp }</span>;
			}
		}));

		const Parent = createClass({
			getInitialState() {
				return { v: 1 };
			},
			render() {
				return (
					<div onClick={ () => this.setState({ v: 2 }) }>
						<Comp x={ this.state.v } />
					</div>
				);
			}
		});

		render(<Parent />, container, () => {
			t.equal(container.querySelector('span').innerText, 'x:1');
			container.querySelector('div').click();
			setTimeout(() => {
				t.equal(container.querySelector('span').innerText, 'x:2');
				done();
			}, 20);
		});
	});

// Test on skip: since all reactions are now run in batched updates, the original issues can no longer be reproduced
// 	test.skip('should stop updating if error was thrown in render (#134)', function () {
// 		const data = mobx.observable(0);
// 		let renderingsCount = 0;
//
// 		const Comp = observer(function () {
// 			renderingsCount += 1;
// 			if (data.get() === 2) {
// 				throw new Error('Hello');
// 			}
// 			return <div />;
// 		});
//
// 		render(<Comp />, container, () => {
// 			t.equal(data.observers.length, 1);
// 			data.set(1);
// 			t.throws(() => data.set(2), 'Hello');
// 			t.equal(data.observers.length, 0);
// 			data.set(3);
// 			data.set(4);
// 			data.set(5);
//
// 			t.equal(renderingsCount, 3);
// 			t.end();
// 		});
// 	});

	it('should render component even if setState called with exactly the same props', function () {
		let renderCount = 0;
		const Component = observer(createClass({
			onClick() {
				this.setState({});
			},
			render() {
				renderCount++;
				return <div onClick={ this.onClick } id='clickableDiv' />;
			}
		}));
		render(<Component />, container, () => {
			t.equal(renderCount, 1, 'renderCount === 1');
			container.querySelector('#clickableDiv').click();
			t.equal(renderCount, 2, 'renderCount === 2');
			container.querySelector('#clickableDiv').click();
			t.equal(renderCount, 3, 'renderCount === 3');
			t.end();
		});
	});

	it('it rerenders correctly if some props are non-observables - 1', (done) => {
		let renderCount = 0;
		let odata = mobx.observable({ x: 1 });
		let data = { y: 1 };

		@observer class Component extends InfernoComponent {
			@mobx.computed get computed() {
				// n.b: data.y would not rerender! shallowly new equal props are not stored
				return this.props.odata.x;
			}
			render() {
				renderCount++;
				return <span onClick={stuff} >{this.props.odata.x}-{this.props.data.y}-{this.computed}</span>;
			}
		}

		const Parent = observer(createClass({
			render() {
				// this.props.odata.x;
				return <Component data={this.props.data} odata={this.props.odata} />;
			}
		}));

		function stuff() {
			data.y++;
			odata.x++;
		}

		render(<Parent odata={odata} data={data} />, container, () => {
			t.equal(renderCount, 1, 'renderCount === 1');
			t.equal(container.querySelector('span').innerText, '1-1-1');

			container.querySelector('span').click();
			setTimeout(() => {
				t.equal(renderCount, 2, 'renderCount === 2');
				t.equal(container.querySelector('span').innerText, '2-2-2');

				container.querySelector('span').click();
				setTimeout(() => {
					t.equal(renderCount, 3, 'renderCount === 3');
					t.equal(container.querySelector('span').innerText, '3-3-3');

					done();
				}, 10);
			}, 20);
		});
	});

	it('it rerenders correctly if some props are non-observables - 2', (done) => {
		let renderCount = 0;
		let odata = mobx.observable({ x: 1 });

		@observer class Component extends InfernoComponent {
			@mobx.computed get computed() {
				return this.props.data.y; // should recompute, since props.data is changed
			}

			render() {
				renderCount++;
				return <span onClick={stuff}>{this.props.data.y}-{this.computed}</span>;
			}
		}

		const Parent = observer(createClass({
			render() {
				let data = { y: this.props.odata.x };
				return <Component data={data} odata={this.props.odata} />;
			}
		}));

		function stuff() {
			odata.x++;
		}

		render(<Parent odata={odata} />, container, () => {
			t.equal(renderCount, 1, 'renderCount === 1');
			t.equal(container.querySelector('span').innerText, '1-1');

			container.querySelector('span').click();
			setTimeout(() => {
				t.equal(renderCount, 2, 'renderCount === 2');
				t.equal(container.querySelector('span').innerText, '2-2');

				container.querySelector('span').click();
				setTimeout(() => {
					t.equal(renderCount, 3, 'renderCount === 3');
					t.equal(container.querySelector('span').innerText, '3-3');

					done();
				}, 10);
			}, 20);
		});
	});

	it('Observer regions should react', (done) => {
		const data = mobx.observable('hi');
		const Observer = mobxReact.Observer;
		const Comp = () =>
			<div>
				<Observer>
					{ () => <span>{ data.get() }</span> }
				</Observer>
				<li>{ data.get() }</li>
			</div>;
		render(<Comp />, container, () => {
			t.equal(container.querySelector('span').innerText, 'hi');
			t.equal(container.querySelector('li').innerText, 'hi');

			data.set('hello');
			t.equal(container.querySelector('span').innerText, 'hello');
			t.equal(container.querySelector('li').innerText, 'hi');
			done();
		});

		it('Observer should not re-render on shallow equal new props', (done) => {
			let childRendering = 0;
			let parentRendering = 0;
			const data = { x: 1 };
			const odata = mobx.observable({ y: 1 });

			const Child = observer(({ data }) => {
				childRendering++;
				return <span>{data.x}</span>;
			});
			const Parent = observer(() => {
				parentRendering++;
				odata.y; // / depend
				return <Child data={data} />;
			});

			render(<Parent />, container, () => {
				t.equal(parentRendering, 1);
				t.equal(childRendering, 1);
				t.equal(container.querySelector('span').innerText, '1');

				odata.y++;
				setTimeout(() => {
					t.equal(parentRendering, 2);
					t.equal(childRendering, 1);
					t.equal(container.querySelector('span').innerText, '1');
					done();
				}, 20);
			});
		});
	});

	it('parent / childs render in the right order', () => {
		// See: https://jsfiddle.net/gkaemmer/q1kv7hbL/13/
		// t.plan(2);
		let events = [];

		class User {
			@observable name = "User's name";
		}

		class Store {
			@observable user = new User();
			@action logout() {
				this.user = null;
			}
		}

		const store = new Store();

		function tryLogout() {
			console.log('Logging out...');
			try {
				// ReactDOM.unstable_batchedUpdates(() => {
				store.logout();
				// t.ok(true);
				// });
			} catch (e) {
				t.fail(e);
			}
		}

		const Parent = observer(() => {
			events.push('parent');
			if (!store.user)
			{return <span>Not logged in.</span>;}
			return <div>
				<Child />
				<button onClick={tryLogout}>Logout</button>
			</div>;
		});

		const Child = observer(() => {
			events.push('child');
			return <span>Logged in as: {store.user.name}</span>;
		});

		render(<Parent />, container);

		tryLogout();

		t.deepEqual(events, [ 'parent', 'child', 'parent' ]);
		t.end();
	});


	it('206 - @observer should produce usefull errors if it throws', () => {
		const data = observable({ x: 1 });
		let renderCount = 0;

		@observer
		class Child extends InfernoComponent {
			render() {
				renderCount++;
				if (data.x === 42) {
					throw new Error('Oops!');
				}
				return <span>{data.x}</span>;
			}
		}

		render(<Child />, container);
		t.equal(renderCount, 1);

		try {
			data.x = 42;
		} catch (e) {
			const lines = e.stack.split('\n');
			t.equal(lines[0], 'Error: Oops!');
			t.equal(lines[1].indexOf('at Child.render'), 4);
			t.equal(renderCount, 2);
		}

		data.x = 3; // component recovers!
		t.equal(renderCount, 3);

		t.end();
	});

	it('195 - async componentWillMount does not work', (done) => {
		const renderedValues = [];

		@observer
		class WillMount extends InfernoComponent {
			@observable counter = 0;

			@mobx.action inc = () => this.counter++;

			componentWillMount() {
				setTimeout(() => {
					this.inc();
				}, 20);
			}

			render() {
				renderedValues.push(this.counter);
				return <p>{this.counter}<button onClick={this.inc}>+</button></p>;
			}
		}

		render(<WillMount />, container);

		setTimeout(() => {
			t.deepEqual(renderedValues, [ 0, 1 ]);
			done();
		}, 50);
	});
});

