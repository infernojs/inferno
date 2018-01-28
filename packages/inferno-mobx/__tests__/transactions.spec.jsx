import { Component, render } from 'inferno';
import * as mobx from 'mobx';
import { observer } from 'inferno-mobx';
import { createClass } from 'inferno-create-class';

describe('Mobx Transacations', () => {
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

  it('mobx issue 50', done => {
    const foo = {
      a: mobx.observable(true),
      b: mobx.observable(false),
      c: mobx.computed(function() {
        return foo.b.get();
      })
    };
    function flipStuff() {
      mobx.runInAction(() => {
        foo.a.set(!foo.a.get());
        foo.b.set(!foo.b.get());
      });
    }
    let asText = '';
    let willReactCount = 0;
    mobx.autorun(() => (asText = [foo.a.get(), foo.b.get(), foo.c.get()].join(':')));
    const Test = observer(
      createClass({
        componentWillReact: () => willReactCount++,
        render: () => <div id="x">{[foo.a.get(), foo.b.get(), foo.c.get()].join(',')}</div>
      })
    );
    // In 3 seconds, flip a and b. This will change c.
    setTimeout(flipStuff, 200);

    setTimeout(() => {
      expect(asText).toBe('false:true:true');
      expect(document.getElementById('x').textContent).toBe('false,true,true');
      expect(willReactCount).toBe(1);
      done();
    }, 400);

    render(<Test />, container);
  });

  it('React.render should respect transaction', done => {
    const a = mobx.observable(2);
    const loaded = mobx.observable(false);
    const valuesSeen = [];

    const Component = observer(() => {
      valuesSeen.push(a.get());
      if (loaded.get()) return <div>{a.get()}</div>;
      else return <div>loading</div>;
    });

    render(<Component />, container);
    mobx.runInAction(() => {
      a.set(3);
      a.set(4);
      loaded.set(true);
    });

    setTimeout(() => {
      expect(container.textContent.replace(/\s+/g, '')).toBe('4');
      expect(valuesSeen).toEqual([2, 4]);
      done();
    }, 400);
  });

  it('React.render in transaction should succeed', done => {
    const a = mobx.observable(2);
    const loaded = mobx.observable(false);
    const valuesSeen = [];
    const Component = observer(() => {
      valuesSeen.push(a.get());
      if (loaded.get()) return <div>{a.get()}</div>;
      else return <div>loading</div>;
    });

    mobx.runInAction(() => {
      a.set(3);
      render(<Component />, container);
      a.set(4);
      loaded.set(true);
    });

    setTimeout(() => {
      expect(container.textContent.replace(/\s+/g, '')).toBe('4');
      expect(valuesSeen).toEqual([3, 4]);
      done();
    }, 400);
  });
});
