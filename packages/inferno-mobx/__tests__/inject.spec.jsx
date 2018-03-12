import { render } from 'inferno';
import { createClass } from 'inferno-create-class';
import * as mobx from 'mobx';
import { inject, observer, Provider } from 'inferno-mobx';

describe('inject based context', () => {
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

  it('basic context', done => {
    const C = inject('foo')(
      observer(
        createClass({
          render() {
            return <div>context:{this.props.foo}</div>;
          }
        })
      )
    );
    const B = () => <C />;
    const A = () => (
      <Provider foo="bar">
        <B />
      </Provider>
    );
    render(<A />, container);
    expect(container.querySelector('div').textContent).toBe('context:bar');
    done();
  });

  it('props override context', done => {
    const C = inject('foo')(
      createClass({
        render() {
          return <div>context:{this.props.foo}</div>;
        }
      })
    );
    const B = () => <C foo={42} />;
    const A = createClass({
      render: () => (
        <Provider foo="bar">
          <B />
        </Provider>
      )
    });
    render(<A />, container);
    expect(container.querySelector('div').textContent).toBe('context:42');
    done();
  });

  it('overriding stores is supported', done => {
    const C = inject('foo', 'bar')(
      observer(
        createClass({
          render() {
            return (
              <div>
                context:{this.props.foo}
                {this.props.bar}
              </div>
            );
          }
        })
      )
    );
    const B = () => <C />;
    const A = createClass({
      render: () => (
        <Provider foo="bar" bar={1337}>
          <div>
            <span>
              <B />
            </span>
            <section>
              <Provider foo={42}>
                <B />
              </Provider>
            </section>
          </div>
        </Provider>
      )
    });
    render(<A />, container);
    expect(container.querySelector('span').textContent).toBe('context:bar1337');
    expect(container.querySelector('section').textContent).toBe('context:421337');
    done();
  });

  it('store should be available', done => {
    const C = inject('foo')(
      observer(
        createClass({
          render() {
            return <div>context:{this.props.foo}</div>;
          }
        })
      )
    );
    const B = () => <C />;
    const A = createClass({
      render: () => (
        <Provider baz={42}>
          <B />
        </Provider>
      )
    });

    try {
      render(<A />, container);
    } catch (e) {
      expect(e.message).toBe("MobX injector: Store 'foo' is not available! Make sure it is provided by some Provider");
      done();
    }
  });

  it('store is not required if prop is available', done => {
    const C = inject('foo')(
      observer(
        createClass({
          render() {
            return <div>context:{this.props.foo}</div>;
          }
        })
      )
    );
    const B = () => <C foo="bar" />;
    render(<B />, container);
    expect(container.querySelector('div').textContent).toBe('context:bar');
    done();
  });

  it('inject merges (and overrides) props', done => {
    const C = inject(() => ({ a: 1 }))(
      observer(
        createClass({
          render() {
            expect(this.props).toEqual({ a: 1, b: 2 });
            return null;
          }
        })
      )
    );
    const B = () => <C a={2} b={2} />;
    render(<B />, container);
    done();
  });

  it('warning is printed when changing stores', done => {
    let msg;
    const baseWarn = console.error;
    console.error = m => (msg = m);
    const a = mobx.observable.box(3);
    const C = observer(
      ['foo'],
      createClass({
        render() {
          return <div>context:{this.props.foo}</div>;
        }
      })
    );
    const B = observer(
      createClass({
        render: () => <C />
      })
    );
    const A = observer(
      createClass({
        render: () => (
          <section>
            <span>{a.get()}</span>
            <Provider foo={a.get()}>
              <B />
            </Provider>
          </section>
        )
      })
    );
    render(<A />, container);

    expect(container.querySelector('span').textContent).toBe('3');
    expect(container.querySelector('div').textContent).toBe('context:3');

    a.set(42);

    expect(container.querySelector('span').textContent).toBe('42');
    expect(container.querySelector('div').textContent).toBe('context:3');

    expect(msg).toBe("MobX Provider: Provided store 'foo' has changed. Please avoid replacing stores as the change might not propagate to all children");
    console.error = baseWarn;
    done();
  });

  it('custom storesToProps', done => {
    const C = inject((stores, props, context) => {
      expect(context).toEqual({ mobxStores: { foo: 'bar' } });
      expect(stores).toEqual({ foo: 'bar' });
      expect(props).toEqual({ baz: 42 });

      return {
        zoom: stores.foo,
        baz: props.baz * 2
      };
    })(
      observer(
        createClass({
          render() {
            return (
              <div>
                context:{this.props.zoom}
                {this.props.baz}
              </div>
            );
          }
        })
      )
    );
    const B = createClass({
      render: () => <C baz={42} />
    });
    const A = () => (
      <Provider foo="bar">
        <B />
      </Provider>
    );
    render(<A />, container);
    expect(container.querySelector('div').textContent).toBe('context:bar84');
    done();
  });

  it('support static hoisting, wrappedComponent and wrappedInstance', done => {
    const B = createClass({
      render() {
        this.testField = 1;
        return <div>{this.testField}</div>;
      }
    });
    B.bla = 17;
    B.bla2 = {};
    const C = inject('booh')(B);

    expect(C.wrappedComponent).toBe(B);
    expect(B.bla).toBe(17);
    expect(C.bla).toBe(17);

    let c = null;
    render(<C ref={i => (c = i)} booh={42} />, container);
    expect(c.wrappedInstance.testField).toBe(1);
    done();
  });

  // There are no contextTypes in Inferno
  // it('warning is printed when attaching contextTypes to HOC', done => {
  //   const msg = [];
  //   const baseWarn = console.error;
  //   console.error = m => msg.push(m);
  //   const C = inject(['foo'])(createClass({
  //     displayName: 'C',
  //     render() {
  //       return <div>context:{ this.props.foo }</div>;
  //     }
  //   }));
  //   C.propTypes = {};
  //   C.defaultProps = {};
  //   C.contextTypes = {};
  //
  //   const B = () => <C />;
  //   const A = () =>
  //     <Provider foo='bar'>
  //       <B />
  //     </Provider>;
  //   render(<A />, container);
  //   expect(msg.length).toBe(1);
  //   expect(msg[0]).toBe("Mobx Injector: you are trying to attach `contextTypes` on an component decorated with `inject` (or `observer`) HOC. Please specify the contextTypes on the wrapped component instead. It is accessible through the `wrappedComponent`");
  //   console.error = baseWarn;
  //   done();
  // });

  // DefaultProps only, there are no propTypes in inferno
  it('propTypes and defaultProps are forwarded', done => {
    const msg = [];
    const baseError = console.error;
    console.error = m => msg.push(m);

    const C = inject(['foo'])(
      createClass({
        displayName: 'C',
        render() {
          expect(this.props.y).toBe(3);
          return null;
        }
      })
    );
    C.defaultProps = {
      y: 3
    };
    const B = () => <C z="test" />;
    const A = () => (
      <Provider foo="bar">
        <B />
      </Provider>
    );
    render(<A />, container);
    expect(msg.length).toBe(0);
    console.error = baseError;
    done();
  });

  // There are no propTypes in Inferno
  // it('warning is not printed when attaching propTypes to injected component', done => {
  //   let msg = [];
  //   const baseWarn = console.error;
  //   console.error = m => msg = m;
  //
  //   const C = inject(["foo"])(createClass({
  //     displayName: 'C',
  //     render: () => <div>context:{ this.props.foo }</div>
  //   }));
  //   C.propTypes = {};
  //
  //   expect(msg.length, 0);
  //   console.error = baseWarn;
  //   done();
  // })
  //
  // it('warning is not printed when attaching propTypes to wrappedComponent', done => {
  //   let msg = [];
  //   const baseWarn = console.error;
  //   console.error = m => msg = m;
  //   const C = inject(["foo"])(createClass({
  //     displayName: 'C',
  //     render: () => <div>context:{ this.props.foo }</div>
  //   }))
  //   C.wrappedComponent.propTypes = {};
  //
  //   expect(msg.length, 0);
  //   console.error = baseWarn;
  //   done();
  // });

  it('using a custom injector is reactive', done => {
    const user = mobx.observable({ name: 'Noa' });
    const mapper = stores => ({ name: stores.user.name });
    const DisplayName = props => <h1>{props.name}</h1>;
    const User = inject(mapper)(DisplayName);
    const App = () => (
      <Provider user={user}>
        <User />
      </Provider>
    );
    render(<App />, container);

    expect(container.querySelector('h1').textContent).toBe('Noa');

    user.name = 'Veria';
    expect(container.querySelector('h1').textContent).toBe('Veria');
    done();
  });
  // TODO: fix this!
  // it('using a custom injector is not too reactive', done => {
  //   let listRender = 0;
  //   let itemRender = 0;
  //   let injectRender = 0;
  //
  //   function connect() {
  //     return (component) => inject.apply(this, arguments)(observer(component))
  //   }
  //
  //   class State {
  //     @observable highlighted = null;
  //     isHighlighted(item) {
  //       return this.highlighted == item;
  //     }
  //
  //     @action.bound highlight(item) {
  //       this.highlighted = item;
  //     }
  //   }
  //
  //   const items = observable([
  //     { title: 'ItemA' },
  //     { title: 'ItemB' },
  //     { title: 'ItemC' },
  //     { title: 'ItemD' },
  //     { title: 'ItemE' },
  //     { title: 'ItemF' },
  //   ]);
  //
  //   const state = new State();
  //
  //   class ListComponent extends Component {
  //
  //     render() {
  //       listRender++;
  //       const {items} = this.props;
  //
  //       return <ul>{
  //         items.map((item) => <ItemComponent key={item.title} item={item}/>)
  //       }</ul>
  //     }
  //   }
  //
  //   @connect(({state}, {item}) => {
  //     injectRender++;
  //     if (injectRender > 6) {
  //       // debugger;
  //     }
  //     debugger;
  //     return ({
  //       // Using
  //       // highlighted: expr(() => state.isHighlighted(item)) // seems to fix the problem
  //       highlighted: state.isHighlighted(item),
  //       highlight: state.highlight
  //     })
  //   })
  //   class ItemComponent extends Component {
  //     highlight = () => {
  //       debugger;
  //       const {item, highlight} = this.props;
  //       highlight(item);
  //     };
  //
  //     render() {
  //       itemRender++;
  //       const {highlighted, item} = this.props;
  //       return <li className={"hl_" + item.title} onClick={this.highlight}>{ item.title } { highlighted ? '(highlighted)' : '' } </li>
  //     }
  //   }
  //
  //   render(
  //     <Provider state={state}>
  //       <ListComponent items={items}/>
  //     </Provider>,
  //     container
  //   );
  //
  //   expect(listRender).toBe(1);
  //   expect(injectRender).toBe(6);
  //   expect(itemRender).toBe(6);
  //
  //   debugger;
  //
  //   container.querySelectorAll(".hl_ItemB").forEach(e => e.click());
  //   setTimeout(() => {
  //     expect(listRender).toBe(1);
  //     expect(injectRender).toBe(12); // ideally, 7
  //     expect(itemRender).toBe(7);
  //
  //     container.querySelectorAll(".hl_ItemF").forEach(e => e.click());
  //     setTimeout(() => {
  //       expect(listRender).toBe(1);
  //       expect(injectRender).toBe(18); // ideally, 9
  //       expect(itemRender).toBe(9);
  //       done();
  //     }, 20);
  //   }, 20);
  // });
});
