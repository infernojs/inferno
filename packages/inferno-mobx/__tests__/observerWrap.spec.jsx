import { Component, render } from 'inferno';
import { inject, observer, observerWrap } from 'inferno-mobx';
import { createElement } from 'inferno-create-element';
import { getObserverTree, observable, runInAction } from 'mobx';

const stateLessComp = ({ testProp }) => <div>result: {testProp}</div>;

stateLessComp.defaultProps = {
  testProp: 'default value for prop testProp'
};

describe('Stateless components observerWrap', () => {
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

  it('stateless component', (done) => {
    const StatelessCompObserver = observerWrap(stateLessComp);
    expect(StatelessCompObserver.defaultProps.testProp).toBe('default value for prop testProp');
    const wrapper = <StatelessCompObserver testProp={10} />;

    render(<StatelessCompObserver testProp="hello world" />, container);

    expect(container.textContent).toBe('result: hello world');
    done();
  });

  it('stateless component with context support', () => {
    const InnerComp = (_props, context) => createElement('p', {}, 'inner: ' + context.testContext);
    const StateLessCompWithContext = ({ store: { value } }, context) => {
      return createElement('div', {}, [
        createElement('p', {}, 'value: ' + value + ', '),
        createElement('p', {}, 'outer: ' + context.testContext + ', '),
        createElement(InnerComp, {})
      ]);
    };
    const StateLessCompWithContextObserver = observerWrap(StateLessCompWithContext);
    const store = observable({
      value: 0
    });
    class ContextProvider extends Component {
      getChildContext() {
        return { testContext: 'hello' };
      }

      render() {
        return <StateLessCompWithContextObserver store={store} />;
      }
    }
    render(<ContextProvider />, container);
    expect(container.textContent.replace(/\n/, '')).toBe('value: 0, outer: hello, inner: hello');
    store.value = 1;
    expect(container.textContent.replace(/\n/, '')).toBe('value: 1, outer: hello, inner: hello');
  });

  it('nestedRendering', () => {
    const store = observable({
      todos: [
        {
          title: 'a',
          completed: false
        }
      ]
    });

    let todoItemRenderings = 0;
    let todoItemUnmounts = 0;
    let todoItemUpdates = 0;
    let todoItemWillUpdates = 0;
    const TodoItemBase = ({ todo }) => {
      todoItemRenderings++;
      return <li>|{todo.title}</li>;
    };
    TodoItemBase.defaultHooks = {
      onComponentDidUpdate: () => {
        todoItemUpdates++;
      },
      onComponentShouldUpdate: ({ todo: { title: prev } }, { todo: { title: next } }) => {
        return prev !== next;
      },
      onComponentWillUnmount: () => {
        todoItemUnmounts++;
      },
      onComponentWillUpdate: () => {
        todoItemWillUpdates++;
      }
    };
    const TodoItem = observerWrap(TodoItemBase);

    let todoListRenderings = 0;
    const TodoList = observerWrap(() => {
      todoListRenderings++;
      const todos = store.todos;
      return (
        <div>
          <p>{todos.length}</p>
          {todos.map((todo, idx) => (
            <TodoItem key={idx} todo={todo} />
          ))}
        </div>
      );
    });

    render(<TodoList />, container);
    expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
    expect(container.querySelectorAll('li').length).toEqual(1);
    expect(container.querySelector('li').textContent).toEqual('|a');

    expect(todoItemRenderings).toEqual(1); // 'item1 should render once'

    expect(getObserverTree(store, 'todos').observers.length).toBe(1);
    expect(getObserverTree(store.todos[0], 'title').observers.length).toBe(1);

    store.todos[0].title += 'a';

    expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
    expect(todoItemRenderings).toEqual(2); //, 'item1 should have rendered twice');
    expect(container.querySelector('li').textContent).toEqual('|aa');
    expect(getObserverTree(store, 'todos').observers.length).toBe(1); //, 'observers count shouldn\'t change');
    expect(getObserverTree(store.todos[0], 'title').observers.length).toBe(1); //, 'title observers should not have increased');

    store.todos.push({
      title: 'b',
      completed: true
    });

    expect(container.querySelectorAll('li').length).toBe(2); //, 'list should two items in in the list');
    let expectedOutput = [];
    let nodes = container.querySelectorAll('li');

    for (let i = 0; i < nodes.length; i++) {
      expectedOutput.push(nodes[i].textContent);
    }
    expect(expectedOutput).toEqual(['|aa', '|b']);

    expect(todoListRenderings).toBe(2); // 'should have rendered list twice');
    expect(todoItemRenderings).toBe(3); //, 'item2 should have rendered as well');
    expect(getObserverTree(store, 'todos').observers.length).toBe(1); //, 'observers count shouldn\'t change');
    expect(getObserverTree(store.todos[0], 'title').observers.length).toBe(1); //, 'title observers should not have increased');
    expect(getObserverTree(store.todos[1], 'title').observers.length).toBe(1); //, 'title observers should have increased');
    expect(getObserverTree(store.todos[1], 'completed').observers).not.toBeDefined(); //, 'completed observers should not have increased');

    store.todos[1].title += 'b';

    expect(container.querySelectorAll('li').length).toBe(2); //, 'list should two items in in the list');
    expectedOutput = [];
    nodes = container.querySelectorAll('li');

    for (let i = 0; i < nodes.length; i++) {
      expectedOutput.push(nodes[i].textContent);
    }
    expect(expectedOutput).toEqual(['|aa', '|bb']);

    expect(todoListRenderings).toBe(2); // 'should have rendered list twice');
    expect(todoItemRenderings).toBe(4); //, 'item2 should have rendered as well');
    expect(getObserverTree(store, 'todos').observers.length).toBe(1); //, 'observers count shouldn\'t change');
    expect(getObserverTree(store.todos[0], 'title').observers.length).toBe(1); //, 'title observers should not have increased');
    expect(getObserverTree(store.todos[1], 'title').observers.length).toBe(1); //, 'title observers should have increased');
    expect(getObserverTree(store.todos[1], 'completed').observers).not.toBeDefined(); //, 'completed observers should not have increased');

    const oldTodo = store.todos.pop();

    expect(todoListRenderings).toBe(3); //, 'should have rendered list another time');
    expect(todoItemRenderings).toBe(4); //, 'item1 should not have rerendered');
    expect(container.querySelectorAll('li').length).toBe(1); //, 'list should have only on item in list now');
    expect(getObserverTree(oldTodo, 'title').observers).not.toBeDefined(); //, 'title observers should have decreased');
    expect(getObserverTree(oldTodo, 'completed').observers).not.toBeDefined(); //, 'completed observers should not have decreased');
    render(null, container);
    expect(todoItemUnmounts).toBe(2);
    expect(todoItemUpdates).toBe(2);
    expect(todoItemWillUpdates).toBe(2);
    expect(getObserverTree(store, 'todos').observers).not.toBeDefined();
    expect(getObserverTree(store.todos[0], 'title').observers).not.toBeDefined();
  });

  it('nestedRendering without should update hook', () => {
    const store = observable({
      todos: [
        {
          title: 'a',
          completed: false
        }
      ]
    });

    let todoItemRenderings = 0;
    let todoItemUnmounts = 0;
    let todoItemUpdates = 0;
    let todoItemWillUpdates = 0;
    const TodoItemBase = ({ todo }) => {
      todoItemRenderings++;
      return <li>|{todo.title}</li>;
    };
    TodoItemBase.defaultHooks = {
      onComponentDidUpdate: () => {
        todoItemUpdates++;
      },
      onComponentWillUnmount: () => {
        todoItemUnmounts++;
      },
      onComponentWillUpdate: () => {
        todoItemWillUpdates++;
      }
    };
    const TodoItem = observerWrap(TodoItemBase);

    let todoListRenderings = 0;
    const TodoList = observerWrap(() => {
      todoListRenderings++;
      const todos = store.todos;
      return (
        <div>
          <p>{todos.length}</p>
          {todos.map((todo, idx) => (
            <TodoItem key={idx} todo={todo} />
          ))}
        </div>
      );
    });

    render(<TodoList />, container);
    expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
    expect(container.querySelectorAll('li').length).toEqual(1);
    expect(container.querySelector('li').textContent).toEqual('|a');

    expect(todoItemRenderings).toEqual(1); // 'item1 should render once'

    expect(getObserverTree(store, 'todos').observers.length).toBe(1);
    expect(getObserverTree(store.todos[0], 'title').observers.length).toBe(1);

    store.todos[0].title += 'a';

    expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
    expect(todoItemRenderings).toEqual(2); //, 'item1 should have rendered twice');
    expect(getObserverTree(store, 'todos').observers.length).toBe(1); //, 'observers count shouldn\'t change');
    expect(getObserverTree(store.todos[0], 'title').observers.length).toBe(1); //, 'title observers should not have increased');

    store.todos.push({
      title: 'b',
      completed: true
    });

    expect(container.querySelectorAll('li').length).toBe(2); //, 'list should two items in in the list');
    let expectedOutput = [];
    let nodes = container.querySelectorAll('li');

    for (let i = 0; i < nodes.length; i++) {
      expectedOutput.push(nodes[i].textContent);
    }
    expect(expectedOutput).toEqual(['|aa', '|b']);

    expect(todoListRenderings).toBe(2); // 'should have rendered list twice');
    expect(todoItemRenderings).toBe(4); //, 'item2 should have rendered as well');
    expect(getObserverTree(store, 'todos').observers.length).toBe(1); //, 'observers count shouldn\'t change');
    expect(getObserverTree(store.todos[0], 'title').observers.length).toBe(1); //, 'title observers should not have increased');
    expect(getObserverTree(store.todos[1], 'title').observers.length).toBe(1); //, 'title observers should have increased');
    expect(getObserverTree(store.todos[1], 'completed').observers).not.toBeDefined(); //, 'completed observers should not have increased');

    store.todos[1].title += 'b';

    expect(container.querySelectorAll('li').length).toBe(2); //, 'list should two items in in the list');
    expectedOutput = [];
    nodes = container.querySelectorAll('li');

    for (let i = 0; i < nodes.length; i++) {
      expectedOutput.push(nodes[i].textContent);
    }
    expect(expectedOutput).toEqual(['|aa', '|bb']);

    expect(todoListRenderings).toBe(2); // 'should have rendered list twice');
    expect(todoItemRenderings).toBe(5); //, 'item2 should have rendered as well');
    expect(getObserverTree(store, 'todos').observers.length).toBe(1); //, 'observers count shouldn\'t change');
    expect(getObserverTree(store.todos[0], 'title').observers.length).toBe(1); //, 'title observers should not have increased');
    expect(getObserverTree(store.todos[1], 'title').observers.length).toBe(1); //, 'title observers should have increased');
    expect(getObserverTree(store.todos[1], 'completed').observers).not.toBeDefined(); //, 'completed observers should not have increased');

    const oldTodo = store.todos.pop();

    expect(todoListRenderings).toBe(3); //, 'should have rendered list another time');
    expect(todoItemRenderings).toBe(6); //, 'item1 should not have rerendered');
    expect(container.querySelectorAll('li').length).toBe(1); //, 'list should have only on item in list now');
    expect(getObserverTree(oldTodo, 'title').observers).not.toBeDefined(); //, 'title observers should have decreased');
    expect(getObserverTree(oldTodo, 'completed').observers).not.toBeDefined(); //, 'completed observers should not have decreased');
    render(null, container);
    expect(todoItemUnmounts).toBe(2);
    expect(todoItemUpdates).toBe(4);
    expect(todoItemWillUpdates).toBe(4);
    expect(getObserverTree(store, 'todos').observers).not.toBeDefined();
    expect(getObserverTree(store.todos[0], 'title').observers).not.toBeDefined();
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

    const TestComponent = observerWrap(() => {
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

    const Row = observerWrap(({ item }) => {
      return (
        <span>
          {item.name}
          {data.selected === item.name ? '!' : ''}
        </span>
      );
    });

    const Table = observerWrap(() => {
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

  it('Callbacks are bound on render', function () {
    const data = observable({
      name: 'tea'
    });

    let a = 0;
    let x = 0;
    let y = 0;
    let z = 0;

    const ViewFn = ({ item }) => {
      return <span>{item.name}</span>;
    };

    const View = observerWrap(ViewFn);

    const check = ({ item: prev }, { item: next }) => prev !== next;

    render(<View item={data} onComponentWillUpdate={(p, n) => (p !== n ? a++ : x++)} />, container);

    expect(a).toBe(0);
    expect(x).toBe(0);

    runInAction(() => {
      data.name = 'coffee';
    });

    expect(x).toBe(1);

    render(<View item={data} onComponentWillUpdate={(p, n) => (p !== n ? a++ : y++)} />, container);

    expect(a).toBe(1);
    expect(x).toBe(1);
    expect(y).toBe(0);

    runInAction(() => {
      data.name = 'soda';
    });

    expect(a).toBe(1);
    expect(x).toBe(1);
    expect(y).toBe(1);

    render(<View item={data} onComponentWillUpdate={(p, n) => (p !== n ? a++ : z++)} onComponentShouldUpdate={check} />, container);

    expect(a).toBe(1);
    expect(z).toBe(0);
    expect(y).toBe(1);

    runInAction(() => {
      data.name = 'water';
    });

    expect(y).toBe(2);

    render(<View item={data} onComponentWillUpdate={(p, n) => (p !== n ? a++ : x++)} />, container);

    expect(a).toBe(2);
    expect(x).toBe(1);
    expect(y).toBe(2);

    runInAction(() => {
      data.name = 'juice';
    });

    expect(a).toBe(2);
    expect(y).toBe(2);
    expect(x).toBe(2);
  });

  it('component should not be inject', () => {
    const Foo = ({ foo }) => {
      return (
        <div>
          context:
          {foo}
        </div>
      );
    };
    // inject wraps in a class component, which will make observerWrap throw
    expect(() => observerWrap(observer(Foo))).toThrow();
  });

  it('component should not be observer', () => {
    const Foo = ({ foo }) => {
      return (
        <div>
          context:
          {foo}
        </div>
      );
    };
    // observer wraps in a class component, which will make observerWrap throw
    expect(() => observerWrap(observer(Foo))).toThrow();
  });

  it('component should not be already be wrapped', () => {
    const msg = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    observerWrap(
      observerWrap(({ foo }) => {
        return (
          <div>
            context:
            {foo}
          </div>
        );
      })
    );

    expect(msg.length).toBe(1);
    console.error = baseWarn;
  });

  it('observer component can be injected', (done) => {
    const msg = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    const fooA = inject('foo')(observerWrap(() => null));

    render(<fooA />, container);

    // N.B, the injected component will be observer since mobx-react 4.0!
    const fooB = inject(() => {})(observerWrap(() => null));

    expect(msg.length).toBe(0);
    console.error = baseWarn;
    done();
  });

  it('observerWrap should keep MobX from eating exceptions', () => {
    const exception = new Error('dummy error');
    const Faulty = observerWrap(() => {
      throw exception;
    });
    expect(() => {
      render(<Faulty />, container);
    }).toThrow(exception);
  });
});
