// import mobx from 'mobx';
// import { expect } from 'chai';
// import connect from '../connect';
// import { render } from '../../DOM/rendering';
// import Component from '../../component/es2015';
// import * as Inferno from '../../testUtils/inferno';
// Inferno; // suppress ts 'never used' error
//
// let container;
// let store = mobx.observable({
// 	todos: [{ title: "a", completed: false }]
// });
//
// let todoItemRenderings = 0;
// let TodoItem = connect(function TodoItemF(props) {
// 	todoItemRenderings++;
// 	return <li>|{ props.todo.title }</li>;
// });
//
// let todoListRenderings = 0;
// let todoListWillReactCount = 0;
// let TodoList = connect(class extends Component<any, any> {
// 	renderings = 0;
//
// 	componentWillReact() {
// 		todoListWillReactCount++;
// 	}
//
// 	render() {
// 		todoListRenderings++;
// 		let todos = store.todos;
// 		return (
// 			<div>
// 				<h1>{ todos.length }</h1>
// 				{todos.map(function(todo) {
// 					return <TodoItem todo={todo}/>;
// 				})}
// 			</div>
// 		);
// 	}
// });
//
// class App extends Component<any, any> {
// 	render() {
// 		return <TodoList/>;
// 	}
// }
//
// function getDNode(obj, prop) {
// 	return obj.$mobx.values[prop];
// }
//
// describe('MobX Observer', () => {
//
// 	beforeEach(() => {
// 		container = document.createElement('div') as HTMLElement;
// 		container.style.display = 'none';
// 		document.body.appendChild(container);
// 	});
//
// 	afterEach(() => {
// 		document.body.removeChild(container);
// 		render(null, container);
// 	});
//
// 	it('should render a component', () => {
// 		expect(() => render(<App/>, container)).to.not.throw(Error);
// 	});
//
// });
