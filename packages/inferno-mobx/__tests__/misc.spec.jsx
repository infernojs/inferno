import { render, rerender, Component } from 'inferno';
import { observer } from 'inferno-mobx';
import { extendObservable, observable } from 'mobx';

describe('Mobx Misc', () => {
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

  it('custom shouldComponentUpdate is not respected for observable changes (#50)', (done) => {
    let called = 0;
    const x = observable.box(3);
    const C = observer(
      class Foo extends Component {
        render() {
          return (
            <div>
              value:
              {x.get()}
            </div>
          );
        }
        shouldComponentUpdate() {
          called++;

          return false;
        }
      }
    );
    render(<C />, container);
    expect(container.querySelector('div').textContent).toBe('value:3');
    expect(called).toBe(0);
    x.set(42);
    expect(container.querySelector('div').textContent).toBe('value:42');
    expect(called).toBe(0);
    done();
  });

  it('custom shouldComponentUpdate is not respected for observable changes (#50) - 2', (done) => {
    let called = 0;
    const y = observable.box(5);
    const C = observer(
      class Foo extends Component {
        render() {
          return (
            <div>
              value:
              {this.props.y}
            </div>
          );
        }
        shouldComponentUpdate(nextProps) {
          called++;
          return nextProps.y !== 42;
        }
      }
    );
    const B = observer(
      class Foo extends Component {
        render() {
          return (
            <span>
              <C y={y.get()} />
            </span>
          );
        }
      }
    );
    render(<B />, container);
    expect(container.querySelector('div').textContent).toBe('value:5');
    expect(called).toBe(0);

    y.set(6);
    expect(container.querySelector('div').textContent).toBe('value:6');
    expect(called).toBe(1);

    y.set(42); // SCU => False
    expect(container.querySelector('div').textContent).toBe('value:42');
    expect(called).toBe(2);

    y.set(7);
    expect(container.querySelector('div').textContent).toBe('value:7');
    expect(called).toBe(3);

    done();
  });

  it('issue mobx 405', (done) => {
    function ExampleState() {
      extendObservable(this, {
        name: 'test',
        get greetings() {
          return 'Hello my name is ' + this.name;
        }
      });
    }

    const ExampleView = observer(
      class Foo extends Component {
        render() {
          return (
            <div>
              <input type="text" onChange={(e) => (this.props.exampleState.name = e.target.value)} value={this.props.exampleState.name} />
              <span>{this.props.exampleState.greetings}</span>
            </div>
          );
        }
      }
    );

    const exampleState = new ExampleState();
    render(<ExampleView exampleState={exampleState} />, container);
    expect(container.querySelector('span').textContent).toBe('Hello my name is test');

    done();
  });

  it('#85 Should handle state changing in constructors', function () {
    const a = observable.box(2);
    const Child = observer(
      class Foo extends Component {
        displayName = 'Child';
        constructor(props) {
          super(props);
          a.set(3);
          this.state = {};
        }
        render() {
          return (
            <div>
              child:
              {a.get()} -{' '}
            </div>
          );
        }
      }
    );
    const ParentWrapper = observer(function Parent() {
      return (
        <span>
          <Child />
          parent:
          {a.get()}
        </span>
      );
    });
    render(<ParentWrapper />, container);

    expect(container.getElementsByTagName('span')[0].textContent).toBe('child:3 - parent:2');
    a.set(5);

    rerender();

    expect(container.getElementsByTagName('span')[0].textContent).toBe('child:5 - parent:5');
    a.set(7);

    rerender();

    expect(container.getElementsByTagName('span')[0].textContent).toBe('child:7 - parent:7');
  });
});
