import { expect } from 'chai';
import { render } from 'inferno';
import Component from 'inferno-component';
import { observable, extendObservable, toJS } from 'mobx';
import { innerHTML } from 'inferno/test/utils';
import makeReactive from '../dist-es/makeReactive';

describe('MobX Observer', () => {
	let container;
	const store = {
		todos: observable([ 'one', 'two' ]),
		extra: observable({ test: 'observable!' })
	};

	beforeEach(function () {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		document.body.removeChild(container);
	});

	const TodoItem = makeReactive(function ({ todo }) {
		return <li>{ todo }</li>;
	});

	let todoListRenderings = 0;
	let todoListWillReactCount = 0;
	const TodoList = makeReactive(class extends Component {
		componentWillReact() {
			todoListWillReactCount++;
		}

		render() {
			todoListRenderings++;
			const todos = store.todos;
			return <div>{todos.map((todo) => <TodoItem todo={todo}/>)}</div>;
		}
	});

	it('should render a component', () => {
		expect(() => render(<TodoList/>, container)).to.not.throw(Error);
	});

	it('should render a todo list', () => {
		render(<TodoList/>, container);
		expect(container.innerHTML).to.equal(innerHTML('<div><li>one</li><li>two</li></div>'));
	});

	it('should render a todo list with added todo item', () => {
		store.todos.push('three');
		render(<TodoList/>, container);
		expect(container.innerHTML).to.equal(innerHTML('<div><li>one</li><li>two</li><li>three</li></div>'));
	});

	it('should render a todo list with non observable item', () => {
		const FlatList = makeReactive(class extends Component {
			render({ extra }) {
				return <div>{store.todos.map((title) => <li>{ title }{ extra.test }</li>)}</div>;
			}
		});

		render(<FlatList extra={ store.extra }/>, container);
		store.extra = toJS({ test: 'XXX' });
		render(<FlatList extra={ store.extra }/>, container);
		extendObservable(store, {
			test: 'new entry'
		});
		render(<FlatList extra={ store.extra }/>, container);
		expect(container.innerHTML).to.equal(innerHTML('<div><li>oneXXX</li><li>twoXXX</li><li>threeXXX</li></div>'));
	});
});
