import { render } from 'inferno';
import Component from 'inferno-component';
import { innerHTML } from 'inferno-utils';
import { makeReactive } from 'inferno-mobx';
import { extendObservable, observable, toJS } from 'mobx';

describe('MobX Observer', () => {
	let container;
	const store = {
		todos: observable(['one', 'two']),
		extra: observable({ test: 'observable!' }),
	};

	beforeEach(function() {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(function() {
		render(null, container);
		document.body.removeChild(container);
	});

	const TodoItem = makeReactive(function({ todo }) {
		return <li>{todo}</li>;
	});

	let todoListRenderings = 0;
	let todoListWillReactCount = 0;
	const TodoList = makeReactive(
		class extends Component {
			componentWillReact() {
				todoListWillReactCount++;
			}

			render() {
				todoListRenderings++;
				const todos = store.todos;
				return <div>{todos.map(todo => <TodoItem todo={todo} />)}</div>;
			}
		},
	);

	it('should render a component', () => {
		expect(() => render(<TodoList />, container)).not.toThrowError(Error);
	});

	it('should render a todo list', () => {
		render(<TodoList />, container);
		expect(container.innerHTML).toBe(innerHTML('<div><li>one</li><li>two</li></div>'));
	});

	it('should render a todo list with added todo item', () => {
		store.todos.push('three');
		render(<TodoList />, container);
		expect(container.innerHTML).toBe(innerHTML('<div><li>one</li><li>two</li><li>three</li></div>'));
	});

	it('should render a todo list with non observable item', () => {
		const FlatList = makeReactive(
			class extends Component {
				render({ extra }) {
					return <div>{store.todos.map(title => <li>{title}{extra.test}</li>)}</div>;
				}
			},
		);

		render(<FlatList extra={store.extra} />, container);
		store.extra = toJS({ test: 'XXX' });
		render(<FlatList extra={store.extra} />, container);
		extendObservable(store, {
			test: 'new entry',
		});
		render(<FlatList extra={store.extra} />, container);
		expect(container.innerHTML).toBe(innerHTML('<div><li>oneXXX</li><li>twoXXX</li><li>threeXXX</li></div>'));
	});

	it('should have a shouldComponentUpdate that returns false when appropriate', () => {
		const scu = TodoItem.prototype.shouldComponentUpdate;

		let todoItem = <TodoItem str="test" />;
		let str = 'different';
		expect(scu.call(todoItem, { str })).toBe(true);
		str = 'test';
		expect(scu.call(todoItem, { str })).toBe(false);
		expect(scu.call(todoItem, { str, prop: 'foo' })).toBe(true);

		const obj = {};
		todoItem = <TodoItem obj={obj} />;
		expect(scu.call(todoItem, { obj })).toBe(true);

		const observableObj = observable({});
		todoItem = <TodoItem observableObj={observableObj} />;
		expect(scu.call(todoItem, { observableObj })).toBe(false);
	});

	it('Should use given sCU over predefined sCU when possible', () => {
		const Foobar = makeReactive(
			class extends Component {
				shouldComponentUpdate() {
					return false;
				}

				render() {
					return <div>{this.props.number}</div>;
				}
			},
		);

		render(<Foobar number={1} />, container);
		expect(container.firstChild.innerHTML).toBe('1');

		render(<Foobar number={2} />, container);
		expect(container.firstChild.innerHTML).toBe('1');
	});
});
