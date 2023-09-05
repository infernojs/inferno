import { Component, render } from 'inferno';
import { observer } from 'inferno-mobx';
import { autorun, computed, observable, runInAction } from 'mobx';

describe('Mobx Transacations', () => {
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

  it('mobx issue 50', () => {
    const foo = {
      a: observable.box(true),
      b: observable.box(false),
      c: computed(function () {
        return foo.b.get();
      }),
    };
    function flipStuff() {
      runInAction(() => {
        foo.a.set(!foo.a.get());
        foo.b.set(!foo.b.get());
      });
    }
    let asText = '';
    let willReactCount = 0;
    autorun(() => (asText = [foo.a.get(), foo.b.get(), foo.c.get()].join(':')));

    observer(
      class MyCom extends Component {
        componentWillReact() {
          willReactCount++;
        }

        render() {
          return (
            <div id="x">
              {[foo.a.get(), foo.b.get(), foo.c.get()].join(',')}
            </div>
          );
        }
      },
    );

    render(<Test />, container);
    // In 3 seconds, flip a and b. This will change c.
    flipStuff();

    expect(asText).toBe('false:true:true');
    expect(document.getElementById('x').textContent).toBe('false,true,true');
    expect(willReactCount).toBe(1);
  });

  it('React.render should respect transaction', () => {
    const a = observable.box(2);
    const loaded = observable.box(false);
    const valuesSeen = [];

    const Component = observer(() => {
      valuesSeen.push(a.get());
      if (loaded.get()) return <div>{a.get()}</div>;
      else return <div>loading</div>;
    });

    render(<Component />, container);
    runInAction(() => {
      a.set(3);
      a.set(4);
      loaded.set(true);
    });

    expect(container.textContent.replace(/\s+/g, '')).toBe('4');
    expect(valuesSeen).toEqual([2, 4]);
  });

  it('React.render in transaction should succeed', () => {
    const a = observable.box(2);
    const loaded = observable.box(false);
    const valuesSeen = [];
    const Component = observer(() => {
      valuesSeen.push(a.get());
      if (loaded.get()) return <div>{a.get()}</div>;
      else return <div>loading</div>;
    });

    runInAction(() => {
      a.set(3);
      render(<Component />, container);
      a.set(4);
      loaded.set(true);
    });

    expect(container.textContent.replace(/\s+/g, '')).toBe('4');
    expect(valuesSeen).toEqual([3, 4]);
  });
});
