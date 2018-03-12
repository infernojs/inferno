import { Component, render } from 'inferno';
import * as mobx from 'mobx';
import { inject, observer, Observer, offError, trackComponents, useStaticRendering } from 'inferno-mobx';
import { createClass } from 'inferno-create-class';

const store = mobx.observable({
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
  createClass({
    renderings: 0,
    componentWillReact() {
      todoListWillReactCount++;
    },
    render() {
      todoListRenderings++;
      const todos = store.todos;
      return (
        <div>
          <hi>{todos.length}</hi>
          {todos.map((todo, idx) => <TodoItem key={idx} todo={todo} />)}
        </div>
      );
    }
  })
);

const App = () => <TodoList />;

const getDNode = (obj, prop) => obj.$mobx.values[prop];

describe('Mobx Observer', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  trackComponents();

  it('nestedRendering', done => {
    render(<App />, container);
    expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
    expect(todoListWillReactCount).toEqual(0); //, 'should not have reacted yet')
    expect(container.querySelectorAll('li').length).toEqual(1);
    expect(container.querySelector('li').textContent).toEqual('|a');

    expect(todoItemRenderings).toEqual(1); // 'item1 should render once'

    expect(getDNode(store, 'todos').observers.length).toBe(1);
    expect(getDNode(store.todos[0], 'title').observers.length).toBe(1);

    store.todos[0].title += 'a';

    setTimeout(() => {
      expect(todoListRenderings).toEqual(1); //, 'should have rendered list once');
      expect(todoListWillReactCount).toEqual(0); //, 'should not have reacted')
      expect(todoItemRenderings).toEqual(2); //, 'item1 should have rendered twice');
      expect(getDNode(store, 'todos').observers.length).toBe(1); //, 'observers count shouldn\'t change');
      expect(getDNode(store.todos[0], 'title').observers.length).toBe(1); //, 'title observers should not have increased');

      store.todos.push({
        title: 'b',
        completed: true
      });

      setTimeout(() => {
        expect(container.querySelectorAll('li').length).toBe(2); //, 'list should two items in in the list');
        const expectedOutput = [];
        const nodes = container.querySelectorAll('li');

        for (let i = 0; i < nodes.length; i++) {
          expectedOutput.push(nodes[i].textContent);
        }
        expect(expectedOutput).toEqual(['|aa', '|b']);

        expect(todoListRenderings).toBe(2); //'should have rendered list twice');
        expect(todoListWillReactCount).toBe(1); //, 'should have reacted')
        expect(todoItemRenderings).toBe(3); //, 'item2 should have rendered as well');
        expect(getDNode(store.todos[1], 'title').observers.length).toBe(1); //, 'title observers should have increased');
        expect(getDNode(store.todos[1], 'completed').observers.length).toBe(0); //, 'completed observers should not have increased');

        const oldTodo = store.todos.pop();
        setTimeout(() => {
          expect(todoListRenderings).toBe(3); //, 'should have rendered list another time');
          expect(todoListWillReactCount).toBe(2); //, 'should have reacted')
          expect(todoItemRenderings).toBe(3); //, 'item1 should not have rerendered');
          expect(container.querySelectorAll('li').length).toBe(1); //, 'list should have only on item in list now');
          expect(getDNode(oldTodo, 'title').observers.length).toBe(0); //, 'title observers should have decreased');
          expect(getDNode(oldTodo, 'completed').observers.length).toBe(0); //, 'completed observers should not have decreased');

          done();
        });
      }, 100);
    }, 100);
  });

  it('keep views alive', done => {
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

    setTimeout(() => {
      expect(yCalcCount).toBe(1);

      expect(container.textContent).toBe('hello6');
      expect(yCalcCount).toBe(1);

      expect(getDNode(data, 'y').observers.length).toBe(1);

      render(<div />, container);

      expect(getDNode(data, 'y').observers.length).toBe(0);
      done();
    }, 100);
  });

  it('componentWillMount from mixin is run first', done => {
    let origRenderMethod;
    const clss = createClass({
      componentWillMount: function() {
        // ugly check, but proofs that observer.willmount has run
        // We cannot use function.prototype.name here like in react-redux tests because it is not supported in Edge/IE
        expect(this.render).not.toBe(origRenderMethod);
      },
      render() {
        return null;
      }
    });
    origRenderMethod = clss.prototype.render;

    const Comp = observer(clss);
    render(<Comp />, container);
    done();
  });

  it('does not views alive when using static rendering', done => {
    useStaticRendering(true);

    let renderCount = 0;
    const data = mobx.observable({
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

    setTimeout(() => {
      expect(renderCount).toBe(1);

      expect(container.querySelector('div').textContent).toBe('hi');
      expect(renderCount).toBe(1);

      expect(getDNode(data, 'z').observers.length).toBe(0);

      useStaticRendering(false);
      done();
    }, 100);
  });

  it('issue 12', function(done) {
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
    const Table = observer(function table() {
      return <div>{data.items.map(item => <Row key={item.name} item={item} />)}</div>;
    });

    render(<Table />, container);

    expect(container.querySelector('div').textContent).toBe('coffee!tea');

    mobx.runInAction(() => {
      data.items[1].name = 'boe';
      data.items.splice(0, 2, { name: 'soup' });
      data.selected = 'tea';
    });

    setTimeout(() => {
      expect(container.querySelector('div').textContent).toBe('soup');
      done();
    }, 50);
  });

  it('component should not be inject', function(done) {
    const msg = [];
    const baseWarn = console.error;
    console.error = m => msg.push(m);

    observer(
      inject('foo')(
        createClass({
          render() {
            return <div>context:{this.props.foo}</div>;
          }
        })
      )
    );

    expect(msg.length).toBe(1);
    console.error = baseWarn;
    done();
  });

  it('observer component can be injected', done => {
    const msg = [];
    const baseWarn = console.error;
    console.error = m => msg.push(m);

    inject('foo')(
      observer(
        createClass({
          render: () => null
        })
      )
    );

    // N.B, the injected component will be observer since mobx-react 4.0!
    inject(() => {})(
      observer(
        createClass({
          render: () => null
        })
      )
    );

    expect(msg.length).toBe(0);
    console.error = baseWarn;
    done();
  });

  it('124 - react to changes in this.props via computed', function(done) {
    const Comp = observer(
      createClass({
        componentWillMount() {
          mobx.extendObservable(this, {
            get computedProp() {
              return this.props.x;
            }
          });
        },
        render() {
          return <span>x:{this.computedProp}</span>;
        }
      })
    );

    const Parent = createClass({
      getInitialState() {
        return { v: 1 };
      },
      render() {
        return (
          <div onClick={() => this.setState({ v: 2 })}>
            <Comp x={this.state.v} />
          </div>
        );
      }
    });

    render(<Parent />, container);

    expect(container.querySelector('span').textContent).toBe('x:1');
    container.querySelector('div').click();
    setTimeout(() => {
      expect(container.querySelector('span').textContent).toBe('x:2');
      done();
    }, 100);
  });

  // Test on skip: since all reactions are now run in batched updates, the original issues can no longer be reproduced
  // it.skip('should stop updating if error was thrown in render (#134)', function(done) {
  //   const data = mobx.observable(0);
  //   let renderingsCount = 0;
  //
  //   const Comp = observer(function() {
  //     renderingsCount += 1;
  //     if (data.get() === 2) {
  //       throw new Error('Hello');
  //     }
  //     return <div />;
  //   });
  //
  //   render(<Comp />, container, () => {
  //     expect(data.observers.length).toBe(1);
  //     data.set(1);
  //     t.throws(() => data.set(2), 'Hello');
  //     expect(data.observers.length).toBe(0);
  //     data.set(3);
  //     data.set(4);
  //     data.set(5);
  //
  //     expect(renderingsCount).toBe(3);
  //     done();
  //   });
  // });

  it('should render component even if setState called with exactly the same props', function(done) {
    let renderCount = 0;
    const Component = observer(
      createClass({
        onClick() {
          this.setState({});
        },
        render() {
          renderCount++;
          return <div onClick={this.onClick} id="clickableDiv" />;
        }
      })
    );
    render(<Component />, container);

    expect(renderCount).toBe(1); //'renderCount === 1');
    container.querySelector('#clickableDiv').click();
    expect(renderCount).toBe(2); // 'renderCount === 2');
    container.querySelector('#clickableDiv').click();
    expect(renderCount).toBe(3); //'renderCount === 3');
    done();
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

  it('Observer regions should react', done => {
    const data = mobx.observable.box('hi');
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

  it('Observer should not re-render on shallow equal new props', done => {
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
      odata.y; /// depend
      return <Child data={data} />;
    });

    render(<Parent />, container);
    expect(parentRendering).toBe(1);
    expect(childRendering).toBe(1);
    expect(container.querySelector('span').textContent).toBe('1');

    odata.y++;
    setTimeout(() => {
      expect(parentRendering).toBe(2);
      expect(childRendering).toBe(1);
      expect(container.querySelector('span').textContent).toBe('1');
      done();
    }, 20);
  });

  // TODO: Reaction Scheduler
  // it('parent / childs render in the right order', done => {
  //   // See: https://jsfiddle.net/gkaemmer/q1kv7hbL/13/
  //   let events = []
  //
  //   let ostore = observable({
  //     user: observable({ name: 'tester' }),
  //     logout() {
  //       this.user = null;
  //     }
  //   })
  //
  //   // var OUser = observable(class User {
  //   //   name = "Tester"
  //   // });
  //   //
  //   // // class User {
  //   // //   @observable name = "Tester";
  //   // // }
  //   //
  //   // var OStore = observable(class Store {
  //   //   user = new OUser();
  //   //   @action logout() {
  //   //     this.user = null;
  //   //   }
  //   // });
  //
  //   function tryLogout() {
  //     console.log("Logging out...");
  //     // try {
  //       // ReactDOM.unstable_batchedUpdates(() => {
  //       ostore.logout();
  //       // });
  //     // } catch(e) {
  //     //   throw Error('failure');
  //     // }
  //   }
  //   //
  //   // const store = OStore();
  //   expect(ostore.user.name).toBe('tester');
  //
  //   const Parent = observer(() => {
  //     events.push("parent")
  //     if (!ostore.user)
  //       return <span>Not logged in.</span>;
  //     return <div>
  //       <Child />
  //       <button onClick={tryLogout}>Logout</button>
  //     </div>;
  //   });
  //
  //   const Child = observer(() => {
  //     debugger;
  //     events.push("child")
  //     return <span>Logged in as: {ostore.user.name}</span>;
  //   });
  //
  //   render(<Parent />, container)
  //   expect(container.textContent).toBe('Logged in as: testerLogout');
  //   debugger;
  //   tryLogout();
  //   expect(container.textContent).toBe('wqd');
  //   expect(events).toEqual(["parent", "child", "parent"])
  //   done()
  //
  // })
  //
  //
  // it('206 - @observer should produce usefull errors if it throws', done => {
  //   const data = observable({x : 1})
  //   let renderCount = 0;
  //
  //   const emmitedErrors = [];
  //   const disposeErrorsHandler = onError(error => emmitedErrors.push(error));
  //
  //   @observer
  //   class Child extends Component {
  //     render() {
  //       renderCount++;
  //       if (data.x === 42)
  //         throw new Error("Oops!")
  //       return <span>{data.x}</span>;
  //     }
  //   }
  //
  //   render(<Child />, container);
  //   expect(renderCount).toBe(1);
  //
  //   try {
  //     data.x = 42;
  //     throw Error('should fail before this line');
  //   } catch (e) {
  //     const lines = e.stack.split("\n");
  //     expect(lines[0]).toBe("Error: Oops!");
  //     expect(lines[1].indexOf("at Child.render")).toBe(4);
  //     expect(renderCount).toBe(2);
  //   }
  //
  //   data.x = 3; // component recovers!
  //   expect(renderCount).toBe(3);
  //
  //   expect(emmitedErrors).toEqual([new Error("Oops!")]);
  //   disposeErrorsHandler();
  //   done();
  // });
  //
  // it('195 - async componentWillMount does not work', done => {
  //   const renderedValues = []
  //
  //   @observer
  //   class WillMount extends Component {
  //     @observable counter = 0
  //
  //     @action inc = () => this.counter++
  //
  //     componentWillMount() {
  //       setTimeout(() => this.inc(), 300)
  //     }
  //
  //     render() {
  //       renderedValues.push(this.counter)
  //       return <p>{this.counter}<button onClick={this.inc}>+</button></p>
  //     }
  //   }
  //
  //   render(<WillMount />, container);
  //
  //   setTimeout(() => {
  //     expect(renderedValues).toEqual([0, 1])
  //     done()
  //   }, 500)
  // })
  //
  //
  // test.skip('195 - should throw if trying to overwrite lifecycle methods', done => {
  //   // Test disabled, see #231...
  //
  //   @observer
  //   class WillMount extends Component {
  //     componentWillMount = () => {
  //     }
  //
  //     render() {
  //       return null;
  //     }
  //   }
  //
  //   try {
  //     render(<WillMount />, container);
  //   } catch (e) {
  //     expect(e.message).toBe("Cannot assign to read only property 'componentWillMount'");
  //     done();
  //   }
  // });
});
