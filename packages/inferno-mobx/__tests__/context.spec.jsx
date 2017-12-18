import { render } from 'inferno';
import { createClass } from 'inferno-create-class';
import * as mobx from 'mobx';
import { observer, Provider } from 'inferno-mobx';

describe('observer based context', () => {
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

  it('using observer to inject throws warning', done => {
    const w = console.error;
    const warns = [];
    console.error = msg => warns.push(msg);

    observer(['test'], () => null);

    expect(warns.length).toBe(1);
    expect(warns[0]).toEqual(
      'Mobx observer: Using observer to inject stores is deprecated since 4.0. Use `@inject("store1", "store2") @observer ComponentClass` or `inject("store1", "store2")(observer(componentClass))` instead of `@observer(["store1", "store2"]) ComponentClass`'
    );

    console.error = w;
    done();
  });

  it('basic context', done => {
    const C = observer(
      ['foo'],
      createClass({
        render() {
          return <div>context:{this.props.foo}</div>;
        }
      })
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
    const C = observer(
      ['foo'],
      createClass({
        render() {
          return <div>context:{this.props.foo}</div>;
        }
      })
    );
    const B = () => <C foo={42} />;
    const A = () => (
      <Provider foo="bar">
        <B />
      </Provider>
    );
    render(<A />, container);
    expect(container.querySelector('div').textContent).toBe('context:42');
    done();
  });

  it('overriding stores is supported', done => {
    const C = observer(
      ['foo', 'bar'],
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
    );
    const B = () => <C />;
    const A = () => (
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
    );
    render(<A />, container);

    expect(container.querySelector('span').textContent).toBe('context:bar1337');
    expect(container.querySelector('section').textContent).toBe(
      'context:421337'
    );
    done();
  });

  it('store should be available', done => {
    const C = observer(
      ['foo'],
      createClass({
        render() {
          return <div>context:{this.props.foo}</div>;
        }
      })
    );
    const B = () => <C />;
    const A = () => (
      <Provider baz={42}>
        <B />
      </Provider>
    );
    try {
      render(<A />, container);
    } catch (e) {
      expect(e.message).toBe(
        "MobX injector: Store 'foo' is not available! Make sure it is provided by some Provider"
      );
      done();
    }
  });

  it('store is not required if prop is available', done => {
    const C = observer(
      ['foo'],
      createClass({
        render() {
          return <div>context:{this.props.foo}</div>;
        }
      })
    );
    const B = () => <C foo="bar" />;
    render(<B />, container);
    expect(container.querySelector('div').textContent).toBe('context:bar');
    done();
  });

  it('warning is printed when changing stores', done => {
    let msg = null;
    const baseWarn = console.error;
    console.error = m => (msg = m);
    const a = mobx.observable(3);
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
            <span>{a.get()}</span>,
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
    expect(msg).toEqual(
      "MobX Provider: Provided store 'foo' has changed. Please avoid replacing stores as the change might not propagate to all children"
    );
    console.error = baseWarn;
    done();
  });

  it('warning is not printed when changing stores, but suppressed explicitly', done => {
    let msg = null;
    const baseWarn = console.error;
    console.error = m => (msg = m);
    const a = mobx.observable(3);
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
            <span>{a.get()}</span>,
            <Provider foo={a.get()} suppressChangedStoreWarning>
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
    expect(msg).toBe(null);
    console.error = baseWarn;
    done();
  });
});
