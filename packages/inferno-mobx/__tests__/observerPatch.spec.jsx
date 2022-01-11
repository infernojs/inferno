import { Component, render } from 'inferno';
import * as mobx from 'mobx';
import { inject, observer, observerPatch } from 'inferno-mobx';
import { createClass } from 'inferno-create-class';
import { warning } from 'inferno-shared';

const getDNode = (obj, prop) => obj.$mobx.values[prop];

describe('Mobx Observer Patch', () => {
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

  it('nestedRendering', () => {
    const store = mobx.observable({
      todos: [
        {
          title: 'a',
          completed: false
        }
      ]
    });

    let todoItemRenderings = 0;
    class TodoItem extends Component {
      render({ todo }) {
        todoItemRenderings++;
        return <li>|{todo.title}</li>;
      }
      shouldComponentUpdate({ todo: { title } }) {
        return title !== this.props.todo.title;
      }
    }

    observerPatch(TodoItem);

    let todoListRenderings = 0;
    let todoListWillReactCount = 0;
    const TodoList = createClass({
      componentWillReact() {
        todoListWillReactCount++;
      },
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
    });

    observerPatch(TodoList);

    render(<TodoList />, container);
    expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
    expect(todoListWillReactCount).toEqual(0); //, 'should never call componentWillReact')
    expect(container.querySelectorAll('li').length).toEqual(1);
    expect(container.querySelector('li').textContent).toEqual('|a');

    expect(todoItemRenderings).toEqual(1); // 'item1 should render once'

    expect(getDNode(store, 'todos').observers.length).toBe(1);
    expect(getDNode(store.todos[0], 'title').observers.length).toBe(1);

    store.todos[0].title += 'a';

    expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
    expect(todoListWillReactCount).toEqual(0); //, 'should never call componentWillReact')
    expect(todoItemRenderings).toEqual(2); //, 'item1 should have rendered twice');
    expect(getDNode(store, 'todos').observers.length).toBe(1); //, 'observers count shouldn\'t change');
    expect(getDNode(store.todos[0], 'title').observers.length).toBe(1); //, 'title observers should not have increased');

    store.todos.push({
      title: 'b',
      completed: true
    });

    expect(container.querySelectorAll('li').length).toBe(2); //, 'list should two items in in the list');
    const expectedOutput = [];
    const nodes = container.querySelectorAll('li');

    for (let i = 0; i < nodes.length; i++) {
      expectedOutput.push(nodes[i].textContent);
    }
    expect(expectedOutput).toEqual(['|aa', '|b']);

    expect(todoListRenderings).toBe(2); //'should have rendered list twice');
    expect(todoListWillReactCount).toBe(0); //, 'should never call componentWillReact')
    expect(todoItemRenderings).toBe(3); //, 'item2 should have rendered as well');
    expect(getDNode(store.todos[1], 'title').observers.length).toBe(1); //, 'title observers should have increased');
    expect(getDNode(store.todos[1], 'completed').observers.length).toBe(0); //, 'completed observers should not have increased');

    const oldTodo = store.todos.pop();

    expect(todoListRenderings).toBe(3); //, 'should have rendered list another time');
    expect(todoListWillReactCount).toBe(0); //, 'should never call componentWillReact')
    expect(todoItemRenderings).toBe(3); //, 'item1 should not have rerendered');
    expect(container.querySelectorAll('li').length).toBe(1); //, 'list should have only on item in list now');
    expect(getDNode(oldTodo, 'title').observers.length).toBe(0); //, 'title observers should have decreased');
    expect(getDNode(oldTodo, 'completed').observers.length).toBe(0); //, 'completed observers should not have decreased');
  });

  it('keep views alive', () => {
    let yCalcCount = 0;
    const data = mobx.observable({
      x: 3,
      get y() {
        yCalcCount++;
        return this.x * 2;
      },
      z: 'hi'
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

    expect(getDNode(data, 'y').observers.length).toBe(1);

    render(<div />, container);

    expect(getDNode(data, 'y').observers.length).toBe(0);
  });

  it('patched render is run first', (done) => {
    let origRenderMethod;
    const Comp = createClass({
      render() {
        // ugly check, but proofs that observer.willmount has run
        // We cannot use function.prototype.name here like in react-redux tests because it is not supported in Edge/IE
        expect(this.render).not.toBe(origRenderMethod);
        return null;
      }
    });
    origRenderMethod = Comp.prototype.render;

    observerPatch(Comp);
    render(<Comp />, container);
    done();
  });

  it('issue 12', function () {
    const data = mobx.observable({
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
    class Table extends Component {
      render() {
        return (
          <div>
            {data.items.map((item) => (
              <Row key={item.name} item={item} />
            ))}
          </div>
        );
      }
    }
    observerPatch(Table);

    render(<Table />, container);

    expect(container.querySelector('div').textContent).toBe('coffee!tea');

    mobx.runInAction(() => {
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

    const Foo = inject('foo')(
      createClass({
        render() {
          return (
            <div>
              context:
              {this.props.foo}
            </div>
          );
        }
      })
    );
    observerPatch(Foo);

    expect(msg.length).toBe(1);
    console.error = baseWarn;
    done();
  });

  it('component should not be observer', function (done) {
    const msg = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    const Foo = observer(
      createClass({
        render() {
          return (
            <div>
              context:
              {this.props.foo}
            </div>
          );
        }
      })
    );
    observerPatch(Foo);

    expect(msg.length).toBe(1);
    console.error = baseWarn;
    done();
  });

  it('component should not be already be patched', function (done) {
    const msg = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    const Foo = createClass({
      render() {
        return (
          <div>
            context:
            {this.props.foo}
          </div>
        );
      }
    });
    observerPatch(Foo);
    observerPatch(Foo);

    expect(msg.length).toBe(1);
    console.error = baseWarn;
    done();
  });

  it('observer component can be injected', (done) => {
    const msg = [];
    const baseWarn = console.error;
    console.error = (m) => msg.push(m);

    const fooA = createClass({
      render: () => null
    });
    observerPatch(fooA);
    inject('foo')(fooA);

    // N.B, the injected component will be observer since mobx-react 4.0!
    const fooB = createClass({
      render: () => null
    });
    observerPatch(fooB);
    inject(() => {})(fooB);

    expect(msg.length).toBe(0);
    console.error = baseWarn;
    done();
  });

  it('should do warn when a patching a class extended from a patched class', (done) => {
    const msg = [];
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
    const Component = createClass({
      onClick() {
        this.setState({});
      },
      render() {
        renderCount++;
        return <div onClick={this.onClick} id="clickableDiv" />;
      }
    });
    observerPatch(Component);
    render(<Component />, container);

    expect(renderCount).toBe(1); //'renderCount === 1');
    container.querySelector('#clickableDiv').click();
    expect(renderCount).toBe(2); // 'renderCount === 2');
    container.querySelector('#clickableDiv').click();
    expect(renderCount).toBe(3); //'renderCount === 3');
    done();
  });

  it('observerPatch should keep MobX from eating exceptions', () => {
    const exception = new Error('dummy error');
    class Faulty extends Component {
      render() {
        throw exception;
      }
    }
    observerPatch(Faulty);
    expect(() => {
      render(<Faulty />, container);
    }).toThrow(exception);
  });

  // it('it rerenders correctly if some props are non-observables - 1', done => {
  //   let renderCount = 0;
  //   let odata = observable({ x: 1 })
  //   let data = { y : 1 }
  //
  //   @observer class Com extends Component {
  //     @computed get computed () {
  //       // n.b: data.y would not rerender! shallowly new equal props are not stored
  //       return this.props.odata.x;
  //     }
  //     render() {
  //       renderCount++;
  //       return <span onClick={stuff} >{this.props.odata.x}-{this.props.data.y}-{this.computed}</span>
  //     }
  //   }
  //
  //   const Parent = observer(createClass({
  //     render() {
  //       // this.props.odata.x;
  //       return <Com data={this.props.data} odata={this.props.odata} />
  //     }
  //   }))
  //
  //   function stuff() {
  //     data.y++;
  //     odata.x++;
  //   }
  //
  //   render(<Parent odata={odata} data={data} />, container);
  //
  //   expect(renderCount).toBe(1) // 'renderCount === 1');
  //   expect(container.querySelector("span").textContent).toBe("1-1-1");
  //
  //   container.querySelector("span").click();
  //   setTimeout(() => {
  //     expect(renderCount).toBe(2) // 'renderCount === 2');
  //     expect(container.querySelector("span").textContent).toBe("2-2-2");
  //
  //     container.querySelector("span").click();
  //     setTimeout(() => {
  //       expect(renderCount).toBe(3) // 'renderCount === 3');
  //       expect(container.querySelector("span").textContent).toBe("3-3-3");
  //
  //       done();
  //     }, 10);
  //   }, 20);
  // });

  // it('it rerenders correctly if some props are non-observables - 2', done => {
  //   let renderCount = 0;
  //   let odata = observable({ x: 1 })
  //
  //   @observer class Com extends Component {
  //     @computed get computed () {
  //       return this.props.data.y; // should recompute, since props.data is changed
  //     }
  //
  //     render() {
  //       renderCount++;
  //       return <span onClick={stuff}>{this.props.data.y}-{this.computed}</span>
  //     }
  //   }
  //
  //   const Parent = observer(createClass({
  //     render() {
  //       let data = { y : this.props.odata.x }
  //       return <Com data={data} odata={this.props.odata} />
  //     }
  //   }))
  //
  //   function stuff() {
  //     odata.x++;
  //   }
  //
  //   render(<Parent odata={odata} />, container);
  //   expect(renderCount).toBe(1) // 'renderCount === 1');
  //   expect(container.querySelector("span").textContent).toBe("1-1");
  //
  //   container.querySelector("span").click();
  //   setTimeout(() => {
  //     expect(renderCount).toBe(2) // 'renderCount === 2');
  //     expect(container.querySelector("span").textContent).toBe("2-2");
  //
  //     container.querySelector("span").click();
  //     setTimeout(() => {
  //       expect(renderCount).toBe(3) // 'renderCount === 3');
  //       expect(container.querySelector("span").textContent).toBe("3-3");
  //
  //       done();
  //     }, 10);
  //   }, 20);
  // })
});
