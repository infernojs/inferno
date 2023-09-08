import { Component, render } from 'inferno';
import { extendObservable, getObserverTree, observable, runInAction } from 'mobx';
import { inject, observer, Observer, onError, trackComponents, useStaticRendering } from 'inferno-mobx';

const store = observable({
  todos: [
    {
      title: 'a',
      completed: false
    }
  ]
});

let todoItemRenderings = 0;
const TodoItem = observer(function TodoItem(props) {
  todoItemRenderings++;
  return <li>|{props.todo.title}</li>;
});

let todoListRenderings = 0;
let todoListWillReactCount = 0;
const TodoList = observer(
  class extends Component {
    componentWillReact() {
      todoListWillReactCount++;
    }
    render() {
      todoListRenderings++;
      const todos = store.todos;
      return (
        <div>
          <hi>{todos.length}</hi>
          {todos.map((todo, idx) => (
            <TodoItem key={idx} todo={todo} />
          ))}
        </div>
      );
    }
  }
);

const App = () => <TodoList />;

describe('Mobx Observer', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  beforeAll(function () {
    trackComponents();
  });

  it('nestedRendering', () => {
    render(<App />, container);
    expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
    expect(todoListWillReactCount).toEqual(0); //, 'should not have reacted yet')
    expect(container.querySelectorAll('li').length).toEqual(1);
    expect(container.querySelector('li').textContent).toEqual('|a');

    expect(todoItemRenderings).toEqual(1); // 'item1 should render once'

    expect(getObserverTree(store, 'todos').observers.length).toBe(1);
    expect(getObserverTree(store.todos[0], 'title').observers.length).toBe(1);

    store.todos[0].title += 'a';

    expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
    expect(todoListWillReactCount).toEqual(0); //, 'should not have reacted')
    expect(todoItemRenderings).toEqual(2); //, 'item1 should have rendered twice');
    expect(getObserverTree(store, 'todos').observers.length).toBe(1); //, 'observers count shouldn\'t change');
    expect(getObserverTree(store.todos[0], 'title').observers.length).toBe(1); //, 'title observers should not have increased');

    store.todos.push({
      title: 'b',
      completed: true
    });

    expect(container.querySelectorAll('li').length).toBe(2); //, 'list should two items in the list');
    const expectedOutput = [];
    const nodes = container.querySelectorAll('li');

    for (let i = 0; i < nodes.length; i++) {
      expectedOutput.push(nodes[i].textContent);
    }
    expect(expectedOutput).toEqual(['|aa', '|b']);

    expect(todoListRenderings).toBe(2); //'should have rendered list twice');
    expect(todoListWillReactCount).toBe(1); //, 'should have reacted')
    expect(todoItemRenderings).toBe(3); //, 'item2 should have rendered as well');
    expect(getObserverTree(store.todos[1], 'title').observers.length).toBe(1); //, 'title observers should have increased');
    expect(getObserverTree(store.todos[1], 'completed').observers).not.toBeDefined(); //, 'completed observers should not have increased');

    const oldTodo = store.todos.pop();

    expect(todoListRenderings).toBe(3); //, 'should have rendered list another time');
    expect(todoListWillReactCount).toBe(2); //, 'should have reacted')
    expect(todoItemRenderings).toBe(3); //, 'item1 should not have rerendered');
    expect(container.querySelectorAll('li').length).toBe(1); //, 'list should have only on item in list now');
    expect(getObserverTree(oldTodo, 'title').observers).not.toBeDefined(); //, 'title observers should have decreased');
    expect(getObserverTree(oldTodo, 'completed').observers).not.toBeDefined(); //, 'completed observers should not have decreased');
  });

  it('keep views alive', () => {
    let yCalcCount = 0;
    const data = observable({
      x: 3,
      get y() {
        yCalcCount++;
        return this.x * 2;
      },
      z: 'hi'
    });

    const TestComponent = observer(function testComponent() {
      return (
        <div>
          {data.z}
          {data.y}
        </div>
      );
    });

    render(<TestComponent />, container);
    expect(yCalcCount).toBe(1);
    expect(container.textContent).toBe('hi6');

    data.z = 'hello';
    // test: rerender should not need a recomputation of data.y because the subscription is kept alive

    expect(yCalcCount).toBe(1);

    expect(container.textContent).toBe('hello6');
    expect(yCalcCount).toBe(1);

    expect(getObserverTree(data, 'y').observers.length).toBe(1);

    render(<div />, container);

    expect(getObserverTree(data, 'y').observers).not.toBeDefined();
  });

  it('componentWillMount from mixin is run first', (done) => {
    let origRenderMethod;
    class clss extends Component {
      componentWillMount() {
        // ugly check, but proofs that observer.willmount has run
        // We cannot use function.prototype.name here like in react-redux tests because it is not supported in Edge/IE
        expect(this.render).not.toBe(origRenderMethod);
      }
      render() {
        return null;
      }
    }

    origRenderMethod = clss.prototype.render;

    const Comp = observer(clss);
    render(<Comp />, container);
    done();
  });

  it('does not views alive when using static rendering', () => {
    useStaticRendering(true);

    let renderCount = 0;
    const data = observable({
      z: 'hi'
    });

    const TestComponent = observer(function testComponent() {
      renderCount++;
      return <div>{data.z}</div>;
    });

    render(<TestComponent />, container);

    expect(renderCount).toBe(1);
    expect(container.querySelector('div').textContent).toBe('hi');

    data.z = 'hello';
    // no re-rendering on static rendering

    expect(renderCount).toBe(1);

    expect(container.querySelector('div').textContent).toBe('hi');
    expect(renderCount).toBe(1);

    expect(getObserverTree(data, 'z').observers).not.toBeDefined();

    useStaticRendering(false);
  });

  it('issue 12', function () {
    const data = observable({
      selected: 'coffee',
      items: [
        {
          name: 'coffee'
        },
        {
          name: 'tea'
        }
      ]
    });

    /** Row Class */
    class Row extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <span>
            {this.props.item.name}
            {data.selected === this.props.item.name ? '!' : ''}
          </span>
        );
      }
    }

    /** table stateles component */
    const Table = observer(function table() {
      return (
        <div>
          {data.items.map((item) => (
            <Row key={item.name} item={item} />
          ))}
        </div>
      );
    });

    render(<Table />, container);

    expect(container.querySelector('div').textContent).toBe('coffee!tea');

    runInAction(() => {
      data.items[1].name = 'boe';
      data.items.splice(0, 2, { name: 'soup' });
      data.selected = 'tea';
    });

    expect(container.querySelector('div').textContent).toBe('soup');
  });

  it('component should not be inject', function (done) {
    const msg = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    observer(
      inject('foo')(
        class extends Component {
          render() {
            return (
              <div>
                context:
                {this.props.foo}
              </div>
            );
          }
        }
      )
    );

    expect(msg.length).toBe(1);
    console.error = baseWarn;
    done();
  });

  it('observer component can be injected', (done) => {
    const msg = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    inject('foo')(
      observer(
        class extends Component {
          render() {
            return null;
          }
        }
      )
    );

    // N.B, the injected component will be observer since mobx-react 4.0!
    inject(() => {})(
      observer(
        class extends Component {
          render() {
            return null;
          }
        }
      )
    );

    expect(msg.length).toBe(0);
    console.error = baseWarn;
    done();
  });

  it('124 - react to changes in this.props via computed', function () {
    const Comp = observer(
      class extends Component {
        componentWillMount() {
          extendObservable(this, {
            get computedProp() {
              return this.props.x;
            }
          });
        }
        render() {
          return (
            <span>
              x:
              {this.computedProp}
            </span>
          );
        }
      }
    );

    class Parent extends Component {
      constructor(props) {
        super(props);
        this.state = { v: 1 };
      }
      render() {
        return (
          <div onClick={() => this.setState({ v: 2 })}>
            <Comp x={this.state.v} />
          </div>
        );
      }
    }

    render(<Parent />, container);

    expect(container.querySelector('span').textContent).toBe('x:1');
    container.querySelector('div').click();
    expect(container.querySelector('span').textContent).toBe('x:2');
  });

  it('should render component even if setState called with exactly the same props', function (done) {
    let renderCount = 0;
    class Com extends Component {
      onClick() {
        this.setState({});
      }
      render() {
        renderCount++;
        return <div onClick={this.onClick.bind(this)} id="clickableDiv" />;
      }
    }

    render(<Com />, container);

    expect(renderCount).toBe(1); //'renderCount === 1');
    container.querySelector('#clickableDiv').click();
    expect(renderCount).toBe(2); // 'renderCount === 2');
    container.querySelector('#clickableDiv').click();
    expect(renderCount).toBe(3); //'renderCount === 3');
    done();
  });

  it('Observer regions should react', (done) => {
    const data = observable.box('hi');
    const Comp = () => (
      <div>
        <Observer>{() => <span>{data.get()}</span>}</Observer>
        <li>{data.get()}</li>
      </div>
    );
    render(<Comp />, container);

    expect(container.querySelector('span').textContent).toBe('hi');
    expect(container.querySelector('li').textContent).toBe('hi');

    data.set('hello');
    expect(container.querySelector('span').textContent).toBe('hello');
    expect(container.querySelector('li').textContent).toBe('hi');
    done();
  });

  it('Observer should not re-render on shallow equal new props', () => {
    let childRendering = 0;
    let parentRendering = 0;
    const data = { x: 1 };
    const odata = observable({ y: 1 });

    const Child = observer(({ data }) => {
      childRendering++;
      return <span>{data.x}</span>;
    });
    const Parent = observer(() => {
      parentRendering++;
      odata.y; /// depend
      return <Child data={data} />;
    });

    render(<Parent />, container);
    expect(parentRendering).toBe(1);
    expect(childRendering).toBe(1);
    expect(container.querySelector('span').textContent).toBe('1');

    odata.y++;
    expect(parentRendering).toBe(2);
    expect(childRendering).toBe(1);
    expect(container.querySelector('span').textContent).toBe('1');
  });

  it('observer should throw on new life cycle hooks', () => {
    class A extends Component {
      static getDerivedStateFromProps() {
        return {};
      }
    }
    expect(() => observer(A)).toThrow();
    class B extends Component {
      getSnapshotBeforeUpdate() {
        return {};
      }
    }
    expect(() => observer(B)).toThrow();
    expect(() =>
      observer({
        render: () => undefined,
        getSnapshotBeforeUpdate: () => {
          return {};
        }
      })
    ).toThrow();
  });

  it('observer should send exception to errorsReporter and re-thrown', () => {
    const exception = new Error('dummy error');
    let reported;
    const off = onError((error) => {
      reported = error;
    });
    class Faulty extends Component {
      render() {
        throw exception;
      }
    }
    observer(Faulty);
    expect(() => {
      render(<Faulty />, container);
    }).toThrow(exception);
    expect(reported).toEqual(exception);
    off();
  });
});
