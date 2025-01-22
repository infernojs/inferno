import {Component, render} from 'inferno';
import { createElement } from 'inferno-create-element';

describe('Components 2 (TSX)', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    document.body.removeChild(container);
  });

  describe('recursive component', () => {
    it('Should be possible to pass props recursively', () => {
      interface ListProps {
        data: Array<{ key: string; data: string | Array<{ key: string; data: string }> }>;
      }
      class List extends Component<ListProps> {
        render() {
          const children = this.props.data.map((entity) => {
            const { key, data } = entity;
            const child = (Array.isArray(data) ?
                <List data={data} /> :
                <Text data={data as string} />
            );

            return <li key={key}>{child}</li>;
          });

          return <ul>{children}</ul>;
        }
      }

      interface TextProps {
        data: string;
      }

      class Text extends Component<TextProps> {
        render() {
          return <span>{this.props.data}</span>;
        }
      }

      const data = [
        { key: '0', data: 'Foo' },
        {
          key: '1',
          data: [
            { key: '1/1', data: 'a' },
            { key: '1/2', data: 'b' }
          ]
        }
      ];

      render(<List data={data} />, container);
      expect(container.innerHTML).toBe('<ul><li><span>Foo</span></li><li><ul><li><span>a</span></li><li><span>b</span></li></ul></li></ul>');
    });

    it('Should be possible to pass props recursively AT BEGINNING (JSX plugin change required)', () => {
      interface ListProps {
        data: Array<{ key: string; data: string | Array<{ key: string; data: string }> }>;
      }
      class List extends Component<ListProps> {
        render() {
          const children = this.props.data.map((entity) => {
            const { key, data } = entity;
            const child = (Array.isArray(data) ?
                <List data={data} /> :
                <Text data={data as string} />
            );

            return <li key={key}>{child}</li>;
          });

          return <ul>{children}</ul>;
        }
      }

      interface TextProps {
        data: string;
      }

      class Text extends Component<TextProps> {
        render() {
          return <span>{this.props.data}</span>;
        }
      }

      const data = [
        { key: '0', data: 'Foo' },
        {
          key: '1',
          data: [
            { key: '1/1', data: 'a' },
            { key: '1/2', data: 'b' }
          ]
        }
      ];

      render(<List data={data} />, container);
      expect(container.innerHTML).toBe('<ul><li><span>Foo</span></li><li><ul><li><span>a</span></li><li><span>b</span></li></ul></li></ul>');
    });
  });

  it('Should render (github #117)', (done) => {
    interface MakeXState {
      x: boolean;
    }

    class MakeX extends Component<object, MakeXState> {
      state: MakeXState;

      constructor(props) {
        super(props);
        this.state = { x: false };
      }

      componentWillMount() {
        setTimeout(() => {
          this.setState({ x: true });
        }, 10);
      }

      render() {
        return <div>{!this.state.x ? <MakeA /> : <MakeY />}</div>;
      }
    }

    class MakeY extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return <div>Y</div>;
      }
    }

    interface MakeAState {
      z: boolean;
    }

    class MakeA extends Component<object, MakeAState> {
      state: MakeAState;

      constructor(props) {
        super(props);
        this.state = { z: false };
      }

      componentWillMount() {
        setTimeout(() => {
          this.setState({ z: true });
        }, 20);
      }

      render() {
        if (!this.state.z) {
          return <div>A</div>;
        }

        return <MakeB />;
      }
    }

    class MakeB extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return <div>B</div>;
      }
    }

    render(<MakeX />, container);
    setTimeout(function () {
      done();
    }, 50);
  });

  it('Events should propagate between components (github #135)', (done) => {
    interface LabelProps {
      text: string
    }
    class Label extends Component<LabelProps> {
      render() {
        const style = {
          'background-color': 'red',
          padding: '0 20px',
          fontSize: '40px'
        };
        return <span style={style}>{this.props.text}</span>;
      }
    }

    let btnFlag = false;
    let containerFlag = false;


    class Button extends Component<LabelProps> {
      onClick(_event) {
        btnFlag = !btnFlag;
      }

      render() {
        const { text } = this.props;
        return (
          <button onClick={this.onClick}>
            <Label text={text} />
          </button>
        );
      }
    }

    class Container extends Component {
      onClick(_event) {
        containerFlag = !containerFlag;
      }

      render() {
        return (
          <div onClick={this.onClick}>
            <Button text="Click me" />
          </div>
        );
      }
    }

    render(<Container />, container);

    expect(btnFlag).toBe(false);
    expect(containerFlag).toBe(false);

    const spans = container.querySelectorAll('span');
    for (const span of spans) {
      span.click();
    }

    expect(btnFlag).toBe(true);
    expect(containerFlag).toBe(true);
    done();
  });

  it('Should be possible to stop propagation', (done) => {
    interface LabelProps {
      text: string
    }

    class Label extends Component<LabelProps> {
      render() {
        const style = {
          'background-color': 'red',
          padding: '0 20px',
          fontSize: '40px'
        };
        return <span style={style}>{this.props.text}</span>;
      }
    }

    let btnFlag = false;
    let containerFlag = false;

    class Button extends Component<LabelProps> {
      onClick(event) {
        event.stopPropagation();
        btnFlag = !btnFlag;
      }

      render() {
        const { text } = this.props;
        return (
          <button onClick={this.onClick}>
            <Label text={text} />
          </button>
        );
      }
    }

    class Container extends Component {
      onClick(_event) {
        containerFlag = !containerFlag;
      }

      render() {
        return (
          <div onClick={this.onClick}>
            <Button text="Click me" />
          </div>
        );
      }
    }

    render(<Container />, container);

    expect(btnFlag).toBe(false);
    expect(containerFlag).toBe(false);

    const spans = container.querySelectorAll('span');
    for (const span of spans) {
      span.click();
    }

    expect(btnFlag).toBe(true);
    expect(containerFlag).toBe(false);
    done();
  });

  describe('Inheritance should work', () => {
    it('Should render div', () => {
      class A extends Component {
        constructor(props) {
          super(props);
        }
      }

      class B extends A {
        constructor(props) {
          super(props);
        }
      }

      class C extends B {
        constructor(props) {
          super(props);
        }

        render() {
          return <div />;
        }
      }

      render(<C />, container);
      expect(container.innerHTML).toBe('<div></div>');
    });
  });

  describe('A component rendering a component should work as expected', () => {
    let forceUpdate;
    let forceUpdate2;

    class Bar extends Component {
      constructor() {
        super();
        forceUpdate = this.forceUpdate.bind(this);
      }

      render() {
        return <div>Hello world</div>;
      }
    }
    class Foo extends Component {
      constructor() {
        super();
        forceUpdate2 = this.forceUpdate.bind(this);
      }

      render() {
        return <Bar />;
      }
    }

    it('should render the div correctly', () => {
      render(<Foo />, container);
      expect(container.firstChild.innerHTML).toBe('Hello world');
    });

    it('should update correctly', () => {
      render(<Foo />, container);
      render(<Foo />, container);
      expect(container.firstChild.innerHTML).toBe('Hello world');
    });

    it('should update correctly via forceUpdate', () => {
      render(<Foo />, container);
      forceUpdate();
      forceUpdate2();
      render(<Foo />, container);
      forceUpdate2();
      forceUpdate();
      expect(container.firstChild.innerHTML).toBe('Hello world');
    });
  });

  it('Should trigger ref lifecycle after patch', (done) => {
    let updater;
    const obj = {
      fn() {}
    };

    spyOn(obj, 'fn');

    interface BarState {
      bool: boolean;
    }

    class Bar extends Component<object, BarState> {
      state: BarState;

      constructor(props) {
        super(props);

        this.state = {
          bool: true
        };

        this.changeDOM = this.changeDOM.bind(this);
        updater = this.changeDOM;
      }

      changeDOM() {
        this.setState({
          bool: !this.state.bool
        });
      }

      render() {
        if (this.state.bool === true) {
          return <div>Hello world</div>;
        } else {
          return (
            <div>
              <div ref={obj.fn}>Hello world2</div>
            </div>
          );
        }
      }
    }

    render(<Bar />, container);
    expect(container.innerHTML).toBe('<div>Hello world</div>');
    expect(obj.fn).not.toHaveBeenCalled();

    updater();
    setTimeout(() => {
      expect(container.innerHTML).toBe('<div><div>Hello world2</div></div>');
      expect(obj.fn).toHaveBeenCalledTimes(1);
      done();
    }, 10);
  });

  describe('Should be able to swap between invalid node and valid node', () => {
    it('Should be able to swap between invalid node and valid node', () => {
      let updater;

      interface BarState {
        bool: boolean;
      }

      class Bar extends Component<object, BarState> {
        state: BarState;

        constructor(props) {
          super(props);

          this.state = {
            bool: true
          };

          this.changeDOM = this.changeDOM.bind(this);
          updater = this.changeDOM;
        }

        changeDOM() {
          this.setState({
            bool: !this.state.bool
          });
        }

        render() {
          if (this.state.bool === true) {
            return null;
          } else {
            return <div>Rendered!</div>;
          }
        }
      }

      render(<Bar />, container);
      expect(container.innerHTML).toBe('');

      updater();
      expect(container.innerHTML).toBe('<div>Rendered!</div>');

      updater();
      expect(container.innerHTML).toBe('');

      updater();
      expect(container.innerHTML).toBe('<div>Rendered!</div>');

      updater();
      expect(container.innerHTML).toBe('');

      updater();
      expect(container.innerHTML).toBe('<div>Rendered!</div>');
    });
  });

  it('Should be able to swap between text node and html node', () => {
    let updater;

    interface BarState {
      bool: boolean;
    }

    class Bar extends Component<object, BarState> {
      state: BarState;

      constructor(props) {
        super(props);

        this.state = {
          bool: true
        };

        this.changeDOM = this.changeDOM.bind(this);
        updater = this.changeDOM;
      }

      changeDOM() {
        this.setState({
          bool: !this.state.bool
        });
      }

      render() {
        return (
          <div>
            {this.state.bool ? <span>span</span> : 'text'}
            <div>div</div>
          </div>
        );
      }
    }

    render(<Bar />, container);
    expect(container.innerHTML).toBe('<div><span>span</span><div>div</div></div>');

    updater();
    expect(container.innerHTML).toBe('<div>text<div>div</div></div>');

    updater();
    expect(container.innerHTML).toBe('<div><span>span</span><div>div</div></div>');

    updater();
    expect(container.innerHTML).toBe('<div>text<div>div</div></div>');
  });

  it('Should be able to swap between text node and html node #2', (done) => {
    let updater;

    interface BarState {
      bool: boolean;
    }

    class Bar extends Component<object, BarState> {
      state: BarState;

      constructor(props) {
        super(props);

        this.state = {
          bool: false
        };

        this.changeDOM = this.changeDOM.bind(this);
        updater = this.changeDOM;
      }

      changeDOM() {
        this.setState({
          bool: !this.state.bool
        });
      }

      render() {
        return (
          <div>
            {this.state.bool ? <span>span</span> : ''}
            <div>div</div>
          </div>
        );
      }
    }

    render(<Bar />, container);
    expect(container.innerHTML).toBe('<div><div>div</div></div>');

    updater();
    setTimeout(() => {
      expect(container.innerHTML).toBe('<div><span>span</span><div>div</div></div>');
      updater();
      setTimeout(() => {
        expect(container.innerHTML).toBe('<div><div>div</div></div>');
        updater();
        setTimeout(() => {
          expect(container.innerHTML).toBe('<div><span>span</span><div>div</div></div>');
          done();
        }, 10);
      }, 10);
    }, 10);
  });

  describe('handling of sCU', () => {
    let instance;
    let shouldUpdate = false;

    interface Test2Props {
      foo: string;
    }

    class Test extends Component<Test2Props> {
      shouldComponentUpdate() {
        return shouldUpdate;
      }

      render() {
        instance = this;
        return <div contentEditable={true}>{this.props.foo}</div>;
      }
    }

    class Test2 extends Component<Test2Props> {
      shouldComponentUpdate() {
        return shouldUpdate;
      }

      render() {
        instance = this;
        return createElement('div', { contenteditable: true }, this.props.foo);
      }
    }

    it('should correctly render once but never again', () => {
      shouldUpdate = false;
      render(<Test foo="bar" />, container);
      expect(container.innerHTML).toBe('<div contenteditable="true">bar</div>');
      render(<Test foo="yar" />, container);
      expect(container.innerHTML).toBe('<div contenteditable="true">bar</div>');
      instance.setState({ foo: 'woo' });
      expect(container.innerHTML).toBe('<div contenteditable="true">bar</div>');
      render(null, container);
      expect(container.innerHTML).toBe('');
    });

    it('Should not fail if text node has external change Github#1207 - createElement', () => {
      shouldUpdate = false;
      render(<Test2 foo="bar" />, container);
      expect(container.innerHTML).toBe('<div contenteditable="true">bar</div>');
      render(<Test2 foo="yar" />, container);
      expect(container.innerHTML).toBe('<div contenteditable="true">bar</div>');

      container.firstChild.removeChild(container.firstChild.firstChild); // When div is contentEditable user can remove whole text content
      expect(container.innerHTML).toBe('<div contenteditable="true"></div>');

      shouldUpdate = true;
      render(<Test2 foo="foo" />, container);
      expect(container.innerHTML).toBe('<div contenteditable="true">foo</div>');
      render(null, container);
      expect(container.innerHTML).toBe('');
    });

    it('Should not fail if text node has external change Github#1207', () => {
      shouldUpdate = false;
      render(<Test foo="bar" />, container);
      expect(container.innerHTML).toBe('<div contenteditable="true">bar</div>');
      render(<Test foo="yar" />, container);
      expect(container.innerHTML).toBe('<div contenteditable="true">bar</div>');

      container.firstChild.removeChild(container.firstChild.firstChild); // When div is contentEditable user can remove whole text content
      expect(container.innerHTML).toBe('<div contenteditable="true"></div>');

      shouldUpdate = true;
      render(<Test foo="foo" />, container);
      expect(container.innerHTML).toBe('<div contenteditable="true">foo</div>');
      render(null, container);
      expect(container.innerHTML).toBe('');
    });

    it('Should not fail if text node has external change Github#1207 (variation - 2)', () => {
      shouldUpdate = false;
      render(<Test foo="bar" />, container);
      expect(container.innerHTML).toBe('<div contenteditable="true">bar</div>');
      render(<Test foo="yar" />, container);
      expect(container.innerHTML).toBe('<div contenteditable="true">bar</div>');

      container.firstChild.removeChild(container.firstChild.firstChild); // When div is contentEditable user can remove whole text content
      expect(container.innerHTML).toBe('<div contenteditable="true"></div>');

      shouldUpdate = true;
      render(<Test foo="" />, container);
      expect(container.innerHTML).toBe('<div contenteditable="true"></div>');
      render(null, container);
      expect(container.innerHTML).toBe('');
    });
  });
  describe('handling of different primatives', () => {
    it('Should correctly handle boolean values (github#255)', () => {
      const Todo = ({ todo }) => (
        <tr>
          <td>{todo.id}</td>
          <td>{todo.desc}</td>
          <td>{todo.done}</td>
        </tr>
      );

      render(<Todo todo={{ done: false }} />, container);
      expect(container.innerHTML).toBe('<tr><td></td><td></td><td></td></tr>');
      render(<Todo todo={{ done: true }} />, container);
      expect(container.innerHTML).toBe('<tr><td></td><td></td><td></td></tr>');
    });
  });

  describe('handling JSX spread attributes', () => {
    it('should properly handle multiple attributes using spread', () => {
      class Input extends Component {
        constructor() {
          super();
          this.handleBlur = this.handleBlur.bind(this);
        }

        handleBlur(_event) {}

        render() {
          const props = {
            onBlur: this.handleBlur,
            className: 'foo',
            id: 'test'
          };

          return <input {...props} />;
        }
      }

      render(<Input />, container);
      expect(container.innerHTML).toBe('<input class="foo" id="test">');
    });
  });

  describe('Swapping Component to DOM node', () => {
    it('Should be able to swap statefull component to DOM list when doing setState', () => {
      let change1;
      let unMountCalled = false;

      class FooBar extends Component {
        constructor(props) {
          super(props);
        }

        componentWillUnmount() {
          unMountCalled = true;
        }

        render() {
          return (
            <div>
              <span>foo1</span>
              <span>foo2</span>
              <span>foo3</span>
              <span>foo4</span>
            </div>
          );
        }
      }

      interface TesterState {
        toggle1: boolean;
      }

      class Tester extends Component<any, TesterState> {
        state: TesterState;

        constructor(props) {
          super(props);

          this.state = {
            toggle1: false
          };

          change1 = this.toggle1.bind(this);
        }

        toggle1() {
          this.setState({
            toggle1: !this.state.toggle1
          });
        }

        renderContent() {
          if (this.state.toggle1) {
            return <FooBar />;
          } else {
            return (
              <div className="login-container">
                <h1>foo</h1>
              </div>
            );
          }
        }

        render() {
          return <div>{this.renderContent()}</div>;
        }
      }

      render(<Tester />, container);
      expect(container.innerHTML).toBe('<div><div class="login-container"><h1>foo</h1></div></div>');
      expect(unMountCalled).toEqual(false);
      change1();
      expect(unMountCalled).toEqual(false);
      expect(container.innerHTML).toBe('<div><div><span>foo1</span><span>foo2</span><span>foo3</span><span>foo4</span></div></div>');
      change1();
      expect(unMountCalled).toEqual(true);
      expect(container.innerHTML).toBe('<div><div class="login-container"><h1>foo</h1></div></div>');
    });

    it('Should be able to swap stateless component to DOM list when doing setState', () => {
      let change1;

      const FooBar = () => (
        <div>
          <span>foo1</span>
          <span>foo2</span>
          <span>foo3</span>
          <span>foo4</span>
        </div>
      );

      interface TesterState {
        toggle1: boolean;
      }

      class Tester extends Component<object, TesterState> {
        state: TesterState;

        constructor(props) {
          super(props);

          this.state = {
            toggle1: false
          };

          change1 = this.toggle1.bind(this);
        }

        toggle1() {
          this.setState({
            toggle1: !this.state.toggle1
          });
        }

        renderContent() {
          if (this.state.toggle1) {
            return <FooBar />;
          } else {
            return (
              <div className="login-container">
                <h1>foo</h1>
              </div>
            );
          }
        }

        render() {
          return <div>{this.renderContent()}</div>;
        }
      }

      render(<Tester />, container);
      expect(container.innerHTML).toBe('<div><div class="login-container"><h1>foo</h1></div></div>');
      change1();
      expect(container.innerHTML).toBe('<div><div><span>foo1</span><span>foo2</span><span>foo3</span><span>foo4</span></div></div>');
      change1();
      expect(container.innerHTML).toBe('<div><div class="login-container"><h1>foo</h1></div></div>');
    });
  });

  describe('handling componentWillReceiveProps lifecycle event', () => {
    it('should correctly handle setState within the lifecycle function', () => {
      let renderCount = 0;
      interface Comp1State {
        foo: number;
      }

      class Comp1 extends Component<object, Comp1State> {
        state: Comp1State;

        constructor(props) {
          super(props);
          this.state = {
            foo: 0
          };
        }

        componentWillReceiveProps() {
          this.setState({ foo: 1 });
        }

        render() {
          renderCount++;
          return <div>{this.state.foo}</div>;
        }
      }

      render(<Comp1 />, container);
      expect(container.innerHTML).toBe('<div>0</div>');
      render(<Comp1 />, container);
      expect(container.innerHTML).toBe('<div>1</div>');
      expect(renderCount).toBe(2);
    });
  });

  it('mixing JSX components with non-JSX components', () => {
    function Comp() {
      return createElement('div', {});
    }

    function Comp2() {
      return createElement('span', {});
    }

    function Comp3() {
      return <div />;
    }

    render(
      <div>
        <Comp />
      </div>,
      container
    );
    expect(container.innerHTML).toBe('<div><div></div></div>');
    render(
      <div>
        <Comp2 />
      </div>,
      container
    );
    expect(container.innerHTML).toBe('<div><span></span></div>');
    render(
      <span>
        <Comp />
      </span>,
      container
    );
    expect(container.innerHTML).toBe('<span><div></div></span>');
    render(createElement('span', null, <Comp3 />), container);
    expect(container.innerHTML).toBe('<span><div></div></span>');
  });

  describe('components should be able to use defaultProps', () => {
    interface Comp1Props {
      a?: string;
      b?: string;
      c?: string;
    }

    class Comp1 extends Component<Comp1Props> {
      constructor(props) {
        super(props);
      }

      static defaultProps = {
        a: 'A',
        b: 'B'
      };

      render() {
        return (
          <div className={this.props.a} id={this.props.b}>
            Hello {this.props.c}!
          </div>
        );
      }
    }

    class Comp2 extends Component<Comp1Props> {
      constructor(props) {
        super(props);
      }

      static defaultProps = {
        a: 'aye',
        b: 'bee'
      };

      render() {
        return (
          <div className={this.props.a} id={this.props.b}>
            Hello {this.props.c}!
          </div>
        );
      }
    }

    it('should mount component with defaultProps', () => {
      render(<Comp1 c="C" />, container);
      expect(container.innerHTML).toBe('<div class="A" id="B">Hello C!</div>');
    });

    it('should mount child component with its defaultProps', () => {
      const Parent = (props) => <div>{props.children.props.a}</div>;
      render(
        <Parent>
          <Comp1 c="C" />
        </Parent>,
        container
      );
      expect(container.innerHTML).toBe('<div>A</div>');
    });

    it('should patch component with defaultProps', () => {
      render(<Comp1 c="C" />, container);
      render(<Comp1 c="C2" />, container);
      expect(container.innerHTML).toBe('<div class="A" id="B">Hello C2!</div>');
    });
    it('should patch component with defaultProps #2', () => {
      render(<Comp1 c="C" />, container);
      render(<Comp2 c="C1" />, container);
      expect(container.innerHTML).toBe('<div class="aye" id="bee">Hello C1!</div>');
      render(<Comp1 c="C2" />, container);
      expect(container.innerHTML).toBe('<div class="A" id="B">Hello C2!</div>');
    });

    it('should as per React: Have childrens defaultProps set before children is mounted', () => {
      let childrenPropertABeforeMount = 'A';
      class Parent extends Component {
        render() {
          expect((this.props.children as any).props.a).toBe(childrenPropertABeforeMount);

          return <div>{this.props.children}</div>;
        }
      }

      render(
        <Parent>
          <Comp1 />
        </Parent>,
        container
      );

      expect(container.innerHTML).toBe('<div><div class="A" id="B">Hello !</div></div>');

      childrenPropertABeforeMount = 'ABCD';

      render(
        <Parent>
          <Comp1 a="ABCD" />
        </Parent>,
        container
      );

      expect(container.innerHTML).toBe('<div><div class="ABCD" id="B">Hello !</div></div>');
    });
  });

  describe('when calling setState with a function', () => {
    let reference;

    interface Comp1State {
      foo: string;
    }

    class Comp1 extends Component<object, Comp1State> {
      state: Comp1State;

      constructor(props) {
        super(props);
        this.state = {
          foo: 'yar'
        };
        reference = this.update.bind(this);
      }

      update() {
        this.setState(() => ({
          foo: 'bar'
        }));
      }

      render() {
        return <div>{this.state.foo}</div>;
      }
    }

    it('the state should update properly', (done) => {
      render(<Comp1 />, container);
      expect(container.innerHTML).toBe('<div>yar</div>');
      reference();
      setTimeout(() => {
        expect(container.innerHTML).toBe('<div>bar</div>');
        done();
      }, 10);
    });
  });

  describe('node change in updateComponent', () => {
    it('Should not crash when invalid node returned - statefull', () => {
      interface Comp1Props {
        foo?: boolean;
      }

      class Comp1 extends Component<Comp1Props> {
        constructor(props) {
          super(props);
        }

        render() {
          if (this.props.foo) {
            return null;
          }

          return <div>rendered</div>;
        }
      }

      render(<Comp1 />, container);
      expect(container.innerHTML).toEqual('<div>rendered</div>');
      render(<Comp1 foo={true} />, container);
      expect(container.innerHTML).toEqual('');
    });

    it('Should not crash when invalid node returned - stateless', () => {
      interface Comp1Props {
        foo?: boolean;
      }

      const Comp1 = ({ foo }: Comp1Props) => {
        if (foo) {
          return null;
        }

        return <div>rendered</div>;
      };

      render(<Comp1 />, container);
      expect(container.innerHTML).toEqual('<div>rendered</div>');
      render(<Comp1 foo={true} />, container);
      expect(container.innerHTML).toEqual('');
    });
  });

  describe('Root handling issues #1', () => {
    let div;

    interface AState {
      n: boolean;
    }

    class A extends Component<object, AState> {
      state: AState;
      private onClick: () => void;
      constructor(props) {
        super(props);
        this.state = { n: false };

        this.onClick = () => {
          this.setState({ n: !this.state.n });
        };
      }

      render() {
        if (this.state.n) {
           
          return (
            <div ref={(dom) => (div = dom)} onClick={this.onClick}>
              DIV
            </div>
          );
        }
        return <span onClick={this.onClick}>SPAN</span>;
      }
    }

    class B extends Component {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return <A />;
      }
    }

    interface TestState {
      reverse: boolean
    }

    class Test extends Component<object, TestState> {
      state: TestState;
      constructor(props) {
        super(props);
        this.state = {
          reverse: false
        };
      }

      render() {
        const children = [<B key="b" />, <div key="a">ROW</div>];
        if (this.state.reverse) {
          children.reverse();
        }

        return (
          <div>
            <button
              onClick={() => {
                this.setState({ reverse: !this.state.reverse });
              }}
            >
              Swap Rows
            </button>
            <div>{children}</div>
          </div>
        );
      }
    }

    // this test is to replicate https://jsfiddle.net/localvoid/r070sgrq/2/
    it('should correct swap rows', () => {
      render(<Test />, container);
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>');
      // click on "SPAN"
      container.querySelector('span').click();
      // "SPAN" should now be "DIV"
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>');
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>ROW</div><div>DIV</div></div></div>');
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>');
      // click on "DIV"
      div.click();
      // "DIV" should now be "SPAN"
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>');
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>ROW</div><span>SPAN</span></div></div>');
    });
  });

  describe('Root handling issues #2', () => {
    let div;

    interface AState {
      n: boolean;
    }

    class A extends Component<object, AState> {
      state: AState;
      private onClick: () => void;
      constructor(props) {
        super(props);
        this.state = { n: false };

        this.onClick = () => {
          this.setState({ n: !this.state.n });
        };
      }

      render() {
        if (this.state.n) {
           
          return (
            <div ref={(dom) => (div = dom)} onClick={this.onClick}>
              DIV
            </div>
          );
        }
        return <span onClick={this.onClick}>SPAN</span>;
      }
    }

    function F() {
      return <A />;
    }

    class B extends Component {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return <F />;
      }
    }

    interface TestState {
      reverse: boolean
    }

    class Test extends Component<object, TestState> {
      state: TestState;
      constructor(props) {
        super(props);
        this.state = {
          reverse: false
        };
      }

      render() {
        const children = [<B key="b" />, <div key="a">ROW</div>];
        if (this.state.reverse) {
          children.reverse();
        }

        return (
          <div>
            <button
              onClick={() => {
                this.setState({ reverse: !this.state.reverse });
              }}
            >
              Swap Rows
            </button>
            <div>{children}</div>
          </div>
        );
      }
    }

    // this test is to replicate https://jsfiddle.net/localvoid/r070sgrq/2/
    it('should correct swap rows', () => {
      render(<Test />, container);
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>');
      // click on "SPAN"
      container.querySelector('span').click();
      // "SPAN" should now be "DIV"
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>');
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>ROW</div><div>DIV</div></div></div>');
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>');
      // click on "DIV"
      div.click();
      // "DIV" should now be "SPAN"
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>');
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>ROW</div><span>SPAN</span></div></div>');
    });
  });

  describe('Root handling issues #3', () => {
    let div;

    interface AState {
      n: boolean;
    }

    class A extends Component<object, AState> {
      state: AState;
      private onClick: () => void;
      constructor(props) {
        super(props);
        this.state = { n: false };

        this.onClick = () => {
          this.setState({ n: !this.state.n });
        };
      }

      render() {
        if (this.state.n) {
           
          return (
            <div ref={(dom) => (div = dom)} onClick={this.onClick}>
              DIV
            </div>
          );
        }
        return <span onClick={this.onClick}>SPAN</span>;
      }
    }

    function F() {
      return <A />;
    }

    function B() {
      return <F onComponentShouldUpdate={() => false} />;
    }

    interface TestState {
      reverse: boolean
    }

    class Test extends Component<object, TestState> {
      state: TestState;
      constructor(props) {
        super(props);
        this.state = {
          reverse: false
        };
      }

      render() {
        const children = [<B key="b" onComponentShouldUpdate={() => false} />, <div key="a">ROW</div>];
        if (this.state.reverse) {
          children.reverse();
        }

        return (
          <div>
            <button
              onClick={() => {
                this.setState({ reverse: !this.state.reverse });
              }}
            >
              Swap Rows
            </button>
            <div>{children}</div>
          </div>
        );
      }
    }

    // this test is to replicate https://jsfiddle.net/localvoid/r070sgrq/2/
    it('should correct swap rows', () => {
      render(<Test />, container);
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>');
      // click on "SPAN"
      container.querySelector('span').click();
      // "SPAN" should now be "DIV"
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>');
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>ROW</div><div>DIV</div></div></div>');
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>DIV</div><div>ROW</div></div></div>');
      // click on "DIV"
      div.click();

      // "DIV" should now be "SPAN"
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><span>SPAN</span><div>ROW</div></div></div>');
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>ROW</div><span>SPAN</span></div></div>');

      render(null, container);
    });
  });

  describe('Root handling issues #4', () => {
    interface AState {
      n: boolean;
    }

    class A extends Component<object, AState> {
      state: AState;
      private onClick: () => void;
      constructor(props) {
        super(props);
        this.state = { n: false };

        this.onClick = () => {
          this.setState({ n: !this.state.n });
        };
      }

      render() {
        if (this.state.n) {
          return <div onClick={this.onClick}>DIV</div>;
        }
        return <span onClick={this.onClick}>SPAN</span>;
      }
    }

    class B extends Component {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return this.props.children;
      }
    }

    interface TestState {
      reverse: boolean
    }

    class Test extends Component<object, TestState> {
      state: TestState;

      constructor(props) {
        super(props);
        this.state = {
          reverse: false
        };
      }

      render() {
        const children = [
          <B key="b">
            <A />
          </B>,
          <div key="a">A</div>
        ];
        if (this.state.reverse) {
          children.reverse();
        }

        return (
          <div>
            <button
              onClick={() => {
                this.setState({ reverse: !this.state.reverse });
              }}
            >
              Swap Rows
            </button>
            <div>{children}</div>
            <div>{children}</div>
          </div>
        );
      }
    }

    it('should correct swap rows', () => {
      render(<Test />, container);
      expect(container.innerHTML).toEqual(
        '<div><button>Swap Rows</button><div><span>SPAN</span><div>A</div></div><div><span>SPAN</span><div>A</div></div></div>'
      );
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual(
        '<div><button>Swap Rows</button><div><div>A</div><span>SPAN</span></div><div><div>A</div><span>SPAN</span></div></div>'
      );
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual(
        '<div><button>Swap Rows</button><div><span>SPAN</span><div>A</div></div><div><span>SPAN</span><div>A</div></div></div>'
      );
    });
  });

  describe('Root handling issues #5', () => {
    interface AState {
      n: boolean;
    }

    class A extends Component<object, AState> {
      state: AState;
      private onClick: () => void;

      constructor(props) {
        super(props);
        this.state = { n: false };

        this.onClick = () => {
          this.setState({ n: !this.state.n });
        };
      }

      render() {
        if (this.state.n) {
          return <div onClick={this.onClick}>DIV</div>;
        }
        return <span onClick={this.onClick}>SPAN</span>;
      }
    }

    const hoisted = <A />;

    class B extends Component {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return hoisted;
      }
    }

    interface TestState {
      reverse: boolean;
    }

    class Test extends Component<object, TestState> {
      state: TestState;
      constructor(props) {
        super(props);
        this.state = {
          reverse: false
        };
      }

      render() {
        const children = [<B key="b" />, <div key="a">A</div>];
        if (this.state.reverse) {
          children.reverse();
        }
        Object.freeze(children);

        return (
          <div>
            <button
              onClick={() => {
                this.setState({ reverse: !this.state.reverse });
              }}
            >
              Swap Rows
            </button>
            <div>{children}</div>
            <div>{children}</div>
          </div>
        );
      }
    }

    it('should correct swap rows', () => {
      render(<Test />, container);
      expect(container.innerHTML).toEqual(
        '<div><button>Swap Rows</button><div><span>SPAN</span><div>A</div></div><div><span>SPAN</span><div>A</div></div></div>'
      );
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual(
        '<div><button>Swap Rows</button><div><div>A</div><span>SPAN</span></div><div><div>A</div><span>SPAN</span></div></div>'
      );
      // click "SWAP ROWS"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual(
        '<div><button>Swap Rows</button><div><span>SPAN</span><div>A</div></div><div><span>SPAN</span><div>A</div></div></div>'
      );
    });
  });

  describe('Root handling issues #6', () => {
    let i;

    beforeEach(function () {
      i = 1;
    });

    class B extends Component {
      constructor(props) {
        super(props);
      }

      shouldComponentUpdate() {
        return false;
      }

      render() {
        return <div>{i}</div>;
      }
    }

    class Test extends Component {
      render() {
        return (
          <div>
            <button
              onClick={() => {
                i++;
                this.setState({});
              }}
            >
              Replace
            </button>
            <div>
              <B key={i} />
            </div>
          </div>
        );
      }
    }

    it('should replace keyed component if key changes', () => {
      render(<Test />, container);
      expect(container.innerHTML).toEqual('<div><button>Replace</button><div><div>1</div></div></div>');
      // click "Replace"
      container.querySelector('button').click();
      expect(container.innerHTML).toEqual('<div><button>Replace</button><div><div>2</div></div></div>');
    });
  });

  describe('Cloned children issues #1', () => {
    interface TestState {
      reverse: boolean;
    }

    class Test extends Component<object, TestState> {
      state: TestState;

      constructor(props) {
        super(props);
        this.state = {
          reverse: false
        };
      }

      render() {
        const a = <div key="b">B</div>;
        const b = <div key="a">A</div>;

        return (
          <div>
            <button
              onClick={() => {
                this.setState({ reverse: !this.state.reverse });
              }}
            >
              Swap Rows
            </button>
            <div>{this.state.reverse ? [a, b].reverse() : [a, b]}</div>
            <div>{this.state.reverse ? [a, b].reverse() : [a, b]}</div>
          </div>
        );
      }
    }

    // this test is to replicate https://jsfiddle.net/localvoid/fmznjwxv/
    it('should correct swap rows', () => {
      render(<Test />, container);
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>B</div><div>A</div></div><div><div>B</div><div>A</div></div></div>');
      // click "SWAP ROWS"
      container.querySelector('button').click();
    });
  });
  describe('Cloned children issues #2', () => {
    interface TestState {
      reverse: boolean;
    }

    class Test extends Component<object, TestState> {
      state: TestState;

      constructor(props) {
        super(props);
        this.state = {
          reverse: false
        };
      }

      render() {
        const children = [<div key="b">B</div>, <div key="a">A</div>];
        if (this.state.reverse) {
          children.reverse();
        }

        return (
          <div>
            <button
              onClick={() => {
                this.setState({ reverse: !this.state.reverse });
              }}
            >
              Swap Rows
            </button>
            <div>{children}</div>
            <div>{children}</div>
          </div>
        );
      }
    }

    // this test is to replicate https://jsfiddle.net/localvoid/fmznjwxv/
    it('should correct swap rows', () => {
      render(<Test />, container);
      expect(container.innerHTML).toEqual('<div><button>Swap Rows</button><div><div>B</div><div>A</div></div><div><div>B</div><div>A</div></div></div>');
      // click "SWAP ROWS"
      container.querySelector('button').click();
    });
  });

  describe('Asynchronous setStates', () => {
    it('Should not fail when parent component calls setState on unmounting children', (done) => {
      interface ParentProps {
        toggle: boolean;
      }

      interface ParentState {
        text: string;
      }

      class Parent extends Component<ParentProps, ParentState> {
        state: ParentState;

        constructor(props) {
          super(props);

          this.state = {
            text: 'bar'
          };

          this.changeState = this.changeState.bind(this);
        }

        changeState() {
          this.setState({
            text: 'foo'
          });
        }

        render() {
          return (
            <div>
              <span>{this.state.text}</span>
              {this.props.toggle ? (
                [<Tester toggle={this.props.toggle} call={this.changeState} />]
              ) : (
                <span style={this.props.toggle ? { color: 'blue' } : null}>tester</span>
              )}
            </div>
          );
        }
      }

      class Tester extends Component<{call: () => void, toggle: boolean}> {
        constructor(props) {
          super(props);
        }

        componentWillUnmount() {
          // parent will do setState
          this.props.call();
        }

        render() {
          return (
            <div>
              <span style={this.props.toggle ? { color: 'blue' } : null}>foo</span>
            </div>
          );
        }
      }

      render(<Parent toggle={true} />, container);

      expect(container.innerHTML).toEqual('<div><span>bar</span><div><span style="color: blue;">foo</span></div></div>');

      render(<Parent toggle={false} />, container);

      setTimeout(() => {
        done();
      }, 40);
    });
  });
});
