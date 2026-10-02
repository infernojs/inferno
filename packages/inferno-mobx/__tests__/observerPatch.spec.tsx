import { Component, render } from 'inferno';
import { getObserverTree, observable, runInAction } from 'mobx';
import { inject, observer, observerPatch } from 'inferno-mobx';

describe('Mobx Observer Patch', () => {
  interface FooProps {
    foo?: string;
  }

  let container: HTMLDivElement;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('nestedRendering', () => {
    const store = observable({
      todos: [
        {
          title: 'a',
          completed: false,
        },
      ],
    });

    interface Todo {
      title: string;
      completed: boolean;
    }

    interface TodoItemProps {
      todo: Todo;
    }

    let todoItemRenderings = 0;
    class TodoItem extends Component<TodoItemProps> {
      render({ todo }: TodoItemProps) {
        todoItemRenderings++;
        return <li>|{todo.title}</li>;
      }

      shouldComponentUpdate({ todo: { title } }: TodoItemProps) {
        return title !== this.props.todo.title;
      }
    }

    observerPatch(TodoItem);

    let todoListRenderings = 0;
    let todoListWillReactCount = 0;
    class TodoList extends Component {
      componentWillReact() {
        todoListWillReactCount++;
      }

      render() {
        todoListRenderings++;
        const todos = store.todos;
        return (
          <div>
            {/* @ts-expect-error <hi> is not a known HTML element */}
            <hi>{todos.length}</hi>
            {todos.map((todo: Todo, idx: number) => (
              <TodoItem key={idx} todo={todo} />
            ))}
          </div>
        );
      }
    }

    observerPatch(TodoList);

    render(<TodoList />, container);
    expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
    expect(todoListWillReactCount).toEqual(0); //, 'should never call componentWillReact')
    expect(container.querySelectorAll('li').length).toEqual(1);
    expect(container.querySelector('li')!.textContent).toEqual('|a');

    expect(todoItemRenderings).toEqual(1); // 'item1 should render once'

    expect(getObserverTree(store, 'todos').observers!.length).toBe(1);
    expect(getObserverTree(store.todos[0], 'title').observers!.length).toBe(1);

    store.todos[0].title += 'a';

    expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
    expect(todoListWillReactCount).toEqual(0); //, 'should never call componentWillReact')
    expect(todoItemRenderings).toEqual(2); //, 'item1 should have rendered twice');
    expect(getObserverTree(store, 'todos').observers!.length).toBe(1); //, 'observers count shouldn\'t change');
    expect(getObserverTree(store.todos[0], 'title').observers!.length).toBe(1); //, 'title observers should not have increased');

    store.todos.push({
      title: 'b',
      completed: true,
    });

    expect(container.querySelectorAll('li').length).toBe(2); //, 'list should two items in in the list');
    const expectedOutput: Array<string | null> = [];
    const nodes = container.querySelectorAll('li');

    for (let i = 0; i < nodes.length; i++) {
      expectedOutput.push(nodes[i].textContent);
    }
    expect(expectedOutput).toEqual(['|aa', '|b']);

    expect(todoListRenderings).toBe(2); // 'should have rendered list twice');
    expect(todoListWillReactCount).toBe(0); //, 'should never call componentWillReact')
    expect(todoItemRenderings).toBe(3); //, 'item2 should have rendered as well');
    expect(getObserverTree(store.todos[1], 'title').observers!.length).toBe(1); //, 'title observers should have increased');
    expect(
      getObserverTree(store.todos[1], 'completed').observers,
    ).not.toBeDefined(); //, 'completed observers should not have increased');

    const oldTodo = store.todos.pop();

    expect(todoListRenderings).toBe(3); //, 'should have rendered list another time');
    expect(todoListWillReactCount).toBe(0); //, 'should never call componentWillReact')
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
      z: 'hi',
    });

    class TestComponent extends Component {
      render() {
        return (
          <div>
            {data.z}
            {data.y}
          </div>
        );
      }
    }
    observerPatch(TestComponent);

    render(<TestComponent />, container);
    expect(yCalcCount).toBe(1);
    expect(container.textContent).toBe('hi6');

    data.z = 'hello';
    // test: rerender should not need a recomputation of data.y because the subscription is kept alive

    expect(yCalcCount).toBe(1);

    expect(container.textContent).toBe('hello6');
    expect(yCalcCount).toBe(1);

    expect(getObserverTree(data, 'y').observers!.length).toBe(1);

    render(<div />, container);

    expect(getObserverTree(data, 'y').observers).not.toBeDefined();
  });

  it('patched render is run first', (done) => {
    class Comp extends Component {
      render() {
        // ugly check, but proofs that observer.willmount has run
        // We cannot use function.prototype.name here like in react-redux tests because it is not supported in Edge/IE
        expect(this.render).not.toBe(origRenderMethod);
        return null;
      }
    }

    const origRenderMethod = Comp.prototype.render;

    observerPatch(Comp);
    render(<Comp />, container);
    done();
  });

  it('renders only the replacement row after renaming and replacing rows in one action, issue 12', function () {
    const data = observable({
      selected: 'coffee',
      items: [
        {
          name: 'coffee',
        },
        {
          name: 'tea',
        },
      ],
    });

    interface Item {
      name: string;
    }

    interface RowProps {
      item: Item;
    }

    /** Row Class */
    class Row extends Component<RowProps> {
      constructor(props: RowProps) {
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
    class Table extends Component {
      render() {
        return (
          <div>
            {data.items.map((item: Item) => (
              <Row key={item.name} item={item} />
            ))}
          </div>
        );
      }
    }
    observerPatch(Table);

    render(<Table />, container);

    expect(container.querySelector('div')!.textContent).toBe('coffee!tea');

    runInAction(() => {
      data.items[1].name = 'boe';
      data.items.splice(0, 2, { name: 'soup' });
      data.selected = 'tea';
    });

    expect(container.querySelector('div')!.textContent).toBe('soup');
  });

  it('component should not be inject', function (done) {
    const msg: string[] = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    const Foo = inject('foo')(
      class FooCom extends Component<FooProps> {
        render() {
          return (
            <div>
              context:
              {this.props.foo}
            </div>
          );
        }
      },
    );
    observerPatch(Foo);

    expect(msg.length).toBe(1);
    console.error = baseWarn;
    done();
  });

  it('component should not be observer', function (done) {
    const msg: string[] = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    const Foo = observer(
      class FooC extends Component<FooProps> {
        render() {
          return (
            <div>
              context:
              {this.props.foo}
            </div>
          );
        }
      },
    );
    observerPatch(Foo);

    expect(msg.length).toBe(1);
    console.error = baseWarn;
    done();
  });

  it('component should not be already be patched', function (done) {
    const msg: string[] = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    class Foo extends Component<FooProps> {
      render() {
        return (
          <div>
            context:
            {this.props.foo}
          </div>
        );
      }
    }
    observerPatch(Foo);
    observerPatch(Foo);

    expect(msg.length).toBe(1);
    console.error = baseWarn;
    done();
  });

  it('observer component can be injected', (done) => {
    const msg: string[] = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    class fooA extends Component {
      render() {
        return null;
      }
    }
    observerPatch(fooA);
    inject('foo')(fooA);

    // N.B, the injected component will be observer since mobx-react 4.0!
    class fooB extends Component {
      render() {
        return null;
      }
    }
    observerPatch(fooB);
    inject(() => {})(fooB);

    expect(msg.length).toBe(0);
    console.error = baseWarn;
    done();
  });

  it('should do warn when a patching a class extended from a patched class', (done) => {
    const msg: string[] = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    class fooA extends Component {
      render() {
        return <p>Foo A</p>;
      }
    }
    observerPatch(fooA);

    class fooB extends fooA {
      render() {
        return <p>Foo B</p>;
      }
    }
    observerPatch(fooB);

    expect(msg.length).toBe(1);
    console.error = baseWarn;
    done();
  });

  it('should render component even if setState called with exactly the same props', function (done) {
    let renderCount = 0;
    class ComponentA extends Component<object> {
      constructor(props: object, ctx: object) {
        super(props, ctx);
        this.state = {};
      }

      onClick() {
        this.setState({});
      }

      render() {
        renderCount++;
        return <div onClick={this.onClick.bind(this)} id="clickableDiv" />;
      }
    }
    observerPatch(ComponentA);
    render(<ComponentA />, container);

    expect(renderCount).toBe(1); // 'renderCount === 1');
    (container.querySelector('#clickableDiv') as HTMLDivElement).click();
    expect(renderCount).toBe(2); // 'renderCount === 2');
    (container.querySelector('#clickableDiv') as HTMLDivElement).click();
    expect(renderCount).toBe(3); // 'renderCount === 3');
    done();
  });

  it('observerPatch should keep MobX from eating exceptions', () => {
    const exception = new Error('dummy error');
    class Faulty extends Component {
      // eslint-disable-next-line inferno/require-render-return
      render() {
        throw exception;
      }
    }
    observerPatch(Faulty);
    expect(() => {
      render(<Faulty />, container);
    }).toThrow(exception);
  });
});
