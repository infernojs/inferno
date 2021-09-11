import { Component, render, rerender } from 'inferno';

describe('patching routine (JSX)', () => {
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

  it('Should always unmount/mount if ReCreate flag is set', () => {
    const spyObj = { fn: () => {} };
    const spyObj2 = { fn: () => {} };
    const spy1 = spyOn(spyObj, 'fn');
    const spy2 = spyOn(spyObj2, 'fn');

    const div = (
      <div $ReCreate ref={spy1}>
        1
      </div>
    );

    render(div, container);

    let firstDiv = container.firstChild;

    expect(container.innerHTML).toEqual('<div>1</div>');
    expect(spy1.calls.count()).toBe(1);
    expect(spy1.calls.argsFor(0).length).toBe(1);
    expect(spy1.calls.argsFor(0)[0]).toEqual(firstDiv);

    const div2 = (
      <div $ReCreate ref={spy2}>
        1
      </div>
    );

    render(div2, container);

    expect(firstDiv).not.toBe(container.firstChild); // Div is different

    // Html is the same
    expect(container.innerHTML).toEqual('<div>1</div>');

    // Verify all callbacks were called
    expect(spy1.calls.count()).toBe(2);
    expect(spy1.calls.argsFor(1).length).toBe(1);
    expect(spy1.calls.argsFor(1)[0]).toEqual(null);

    expect(spy2.calls.count()).toBe(1);
    expect(spy2.calls.argsFor(0).length).toBe(1);
    expect(spy2.calls.argsFor(0)[0]).toEqual(container.firstChild);
  });

  it('Should be able to patch references', () => {
    class Component1 extends Component {
      constructor(p, c) {
        super(p, c);

        this.state = {
          value: 1
        };

        this.add = this.add.bind(this);
      }

      add(e) {
        e.stopPropagation();

        this.setState({
          value: ++this.state.value
        });
      }

      render(props) {
        return (
          <div id="child" onclick={this.add}>
            <span>{this.state.value}</span>
            {props.children}
          </div>
        );
      }
    }

    class Parent extends Component {
      constructor(p, c) {
        super(p, c);

        this.state = {
          value: 1
        };

        this.add = this.add.bind(this);
      }

      add(e) {
        e.stopPropagation();

        this.setState({
          value: 3
        });
      }

      render() {
        const arr = [];

        arr.push(<div>{this.state.value}</div>);

        if (this.state.value > 1) {
          arr.unshift(<div>{this.state.value}</div>);
        }

        return (
          <div id="parent" onclick={this.add}>
            <Component1>
              <div $HasNonKeyedChildren>{arr}</div>
            </Component1>
          </div>
        );
      }
    }

    render(<Parent />, container);

    expect(container.innerHTML).toBe('<div id="parent"><div id="child"><span>1</span><div><div>1</div></div></div></div>');

    container.querySelector('#child').click();
    rerender();

    expect(container.innerHTML).toBe('<div id="parent"><div id="child"><span>2</span><div><div>1</div></div></div></div>');

    container.querySelector('#parent').click();
    rerender();

    expect(container.innerHTML).toBe('<div id="parent"><div id="child"><span>2</span><div><div>3</div><div>3</div></div></div></div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });
});
