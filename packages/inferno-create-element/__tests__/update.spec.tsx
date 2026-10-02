import { Component, type InfernoNode, render } from 'inferno';
import { createElement } from 'inferno-create-element';

describe('Stateful Component updates', () => {
  let container: HTMLDivElement;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('Should forget old updates', (done) => {
    let updatesAfromOutside!: () => void;

    interface AState {
      stuff: boolean;
    }

    class A extends Component<object, AState> {
      state: AState;

      componentWillUnmount() {}

      constructor(props: object) {
        super(props);

        this.state = {
          stuff: true,
        };

        updatesAfromOutside = this.updateMe.bind(this);
      }

      updateMe() {
        this.setState({
          stuff: false,
        });
      }

      render() {
        return <div>A Component A</div>;
      }
    }

    class B extends Component<object> {
      constructor(props: object) {
        super(props);
      }

      render() {
        return <div>B Component B</div>;
      }
    }

    // Render A
    const spy = spyOn(A.prototype, 'componentWillUnmount');
    render(<A />, container);
    expect(container.innerHTML).toBe('<div>A Component A</div>');
    // Render B
    render(<B />, container);
    expect(container.innerHTML).toBe('<div>B Component B</div>');
    expect(spy).toHaveBeenCalledTimes(1); // componentUnMount should have been called
    spy.calls.reset();

    // delayed update triggers for A
    updatesAfromOutside();
    expect(container.innerHTML).toBe('<div>B Component B</div>');

    done();
  });

  it('Should throw when calling setState from constructor', () => {
    // Following test simulates situation that setState is called when mounting process has not finished, fe. in constructor

    interface ParentState {
      show: boolean;
    }

    class Parent extends Component<object, ParentState> {
      state: ParentState;

      constructor(props: object) {
        super(props);

        this.state = {
          show: false,
        };

        this.domagic = this.domagic.bind(this);

        // Call setState
        expect(() => {
          this.setState({
            show: true,
          });
        }).toThrow();
      }

      domagic() {
        this.setState({
          show: !this.state.show,
        });
      }

      render() {
        return (
          <div>
            <button onclick={this.domagic} />
            <Child show={this.state.show} />
          </div>
        );
      }
    }

    interface ChildProps {
      show: boolean;
    }

    class Child extends Component<ChildProps> {
      constructor(props: ChildProps) {
        super(props);
      }

      render() {
        return (
          <div>
            {this.props.show ? (
              <span className="hr red">
                <span className="hr-text">Late</span>
              </span>
            ) : null}
            <p>More content</p>
          </div>
        );
      }
    }

    render(<Parent />, container);
  });

  it('Should update boolean properties when children change same time', () => {
    let updateCaller: (() => void) | null = null;

    interface AState {
      values: { checked: boolean }[];
    }

    class A extends Component<object, AState> {
      state: AState;

      constructor(props: object) {
        super(props);

        this.state = {
          values: [{ checked: false }, { checked: false }, { checked: false }],
        };

        this.updateCaller = this.updateCaller.bind(this);
        updateCaller = this.updateCaller;
      }

      updateCaller() {
        this.setState({
          values: [{ checked: false }, { checked: false }],
        });
      }

      render() {
        return (
          <div>
            {this.state.values.map(function (value) {
              return <input type="checkbox" checked={value.checked} />;
            })}
          </div>
        );
      }
    }

    render(<A />, container);
    expect(container.innerHTML).toBe(
      '<div><input type="checkbox"><input type="checkbox"><input type="checkbox"></div>',
    );
    const firstChild = container.firstChild as HTMLDivElement;
    expect((firstChild.childNodes[0] as HTMLInputElement).checked).toBe(false);
    expect((firstChild.childNodes[1] as HTMLInputElement).checked).toBe(false);
    expect((firstChild.childNodes[2] as HTMLInputElement).checked).toBe(false);

    const checkbox = container.querySelector('input')!;
    checkbox.checked = true; // SIMULATE user selecting checkbox
    expect((firstChild.childNodes[0] as HTMLInputElement).checked).toBe(true);

    updateCaller!(); // New render
    expect(container.innerHTML).toBe(
      '<div><input type="checkbox"><input type="checkbox"></div>',
    );
    expect((firstChild.childNodes[0] as HTMLInputElement).checked).toBe(false);
    expect((firstChild.childNodes[1] as HTMLInputElement).checked).toBe(false);
  });

  it('Should Not get stuck in UNMOUNTED state when parent updates before child setState', () => {
    let updateCaller: (() => void) | null = null;

    interface Data {
      test: boolean;
    }

    // This parent is used for setting up Test scenario, not much related
    class Parent extends Component<object> {
      constructor(props: object) {
        super(props);
      }

      render() {
        return (
          <div>
            <A />
          </div>
        );
      }
    }

    interface AState {
      obj: Data;
    }

    // A component holds all the stuff together
    class A extends Component<object, AState> {
      state: AState;

      constructor(props: object) {
        super(props);

        this.state = {
          obj: {
            test: true,
          },
        };

        this.updateCaller = this.updateCaller.bind(this);
        updateCaller = this.updateCaller;
      }

      updateCaller() {
        this.setState({
          obj: {
            test: !this.state.obj.test,
          },
        });
      }

      render() {
        return (
          <div>
            <B data={this.state.obj} />
          </div>
        );
      }
    }

    interface DataProps {
      data: Data;
    }

    // B has direct child C, B Is simple wrapper component
    class B extends Component<DataProps> {
      constructor(props: DataProps) {
        super(props);
      }

      render() {
        return <C data={this.props.data} />;
      }
    }

    let stuckChild: (() => void) | null = null;

    interface CState {
      b: boolean;
    }

    // C is real component which does the job
    // C is the one that gets unmounted...
    class C extends Component<DataProps, CState> {
      state: CState;

      constructor(props: DataProps) {
        super(props);

        this.state = {
          b: false,
        };

        this.imstuck = this.imstuck.bind(this);
        stuckChild = this.imstuck;
      }

      imstuck() {
        this.setState({
          b: !this.state.b,
        });
      }

      render() {
        return (
          <div>
            {this.props.data.test + ''}
            {this.state.b + ''}
          </div>
        );
      }
    }

    render(<Parent />, container);

    expect(container.innerHTML).toBe(
      '<div><div><div>truefalse</div></div></div>',
    );

    updateCaller!();
    expect(container.innerHTML).toBe(
      '<div><div><div>falsefalse</div></div></div>',
    );
    updateCaller!();
    expect(container.innerHTML).toBe(
      '<div><div><div>truefalse</div></div></div>',
    );
    updateCaller!();
    expect(container.innerHTML).toBe(
      '<div><div><div>falsefalse</div></div></div>',
    );
    stuckChild!();
    expect(container.innerHTML).toBe(
      '<div><div><div>falsetrue</div></div></div>',
    );
    stuckChild!();
    expect(container.innerHTML).toBe(
      '<div><div><div>falsefalse</div></div></div>',
    );
    stuckChild!();
    expect(container.innerHTML).toBe(
      '<div><div><div>falsetrue</div></div></div>',
    );
  });

  it('Should Not get stuck in UNMOUNTED state when child setState runs before and after parent updates', () => {
    let updateCaller: (() => void) | null = null;

    interface Data {
      test: boolean;
    }

    // This parent is used for setting up Test scenario, not much related
    class Parent extends Component<object> {
      constructor(props: object) {
        super(props);
      }

      render() {
        return (
          <div>
            <A />
          </div>
        );
      }
    }

    interface AState {
      obj: Data;
    }

    // A component holds all the stuff together
    class A extends Component<object, AState> {
      state: AState;

      constructor(props: object) {
        super(props);

        this.state = {
          obj: {
            test: true,
          },
        };

        this.updateCaller = this.updateCaller.bind(this);
        updateCaller = this.updateCaller;
      }

      updateCaller() {
        this.setState({
          obj: {
            test: !this.state.obj.test,
          },
        });
      }

      render() {
        return (
          <div>
            <B data={this.state.obj} />
          </div>
        );
      }
    }

    interface DataProps {
      data: Data;
    }

    // B has direct child C, B Is simple wrapper component
    class B extends Component<DataProps> {
      constructor(props: DataProps) {
        super(props);
      }

      render() {
        return <C data={this.props.data} />;
      }
    }

    let stuckChild: (() => void) | null = null;

    interface CState {
      b: boolean;
    }

    // C is real component which does the job
    // C is the one that gets unmounted...
    class C extends Component<DataProps, CState> {
      state: CState;

      constructor(props: DataProps) {
        super(props);

        this.state = {
          b: false,
        };

        this.imstuck = this.imstuck.bind(this);
        stuckChild = this.imstuck;
      }

      imstuck() {
        this.setState({
          b: !this.state.b,
        });
      }

      render() {
        return (
          <div>
            {this.props.data.test + ''}
            {this.state.b + ''}
          </div>
        );
      }
    }

    render(<Parent />, container);

    expect(container.innerHTML).toBe(
      '<div><div><div>truefalse</div></div></div>',
    );

    stuckChild!();
    expect(container.innerHTML).toBe(
      '<div><div><div>truetrue</div></div></div>',
    );
    stuckChild!();
    expect(container.innerHTML).toBe(
      '<div><div><div>truefalse</div></div></div>',
    );
    stuckChild!();
    expect(container.innerHTML).toBe(
      '<div><div><div>truetrue</div></div></div>',
    );

    updateCaller!();
    expect(container.innerHTML).toBe(
      '<div><div><div>falsetrue</div></div></div>',
    );
    updateCaller!();
    expect(container.innerHTML).toBe(
      '<div><div><div>truetrue</div></div></div>',
    );
    updateCaller!();
    expect(container.innerHTML).toBe(
      '<div><div><div>falsetrue</div></div></div>',
    );

    stuckChild!();
    expect(container.innerHTML).toBe(
      '<div><div><div>falsefalse</div></div></div>',
    );
  });

  it('Should keep order of nodes', () => {
    interface Item {
      value: string;
      text: string;
    }

    let setItems: ((collection: Item[]) => void) | null = null;

    interface InnerComponentToGetUnmountedProps {
      i: number;
      value: string;
    }

    class InnerComponentToGetUnmounted extends Component<InnerComponentToGetUnmountedProps> {
      constructor(props: InnerComponentToGetUnmountedProps) {
        super(props);
      }

      render() {
        return (
          <div className="common-root">
            {(() => {
              if (this.props.i % 2 === 0) {
                return (
                  <div>
                    DIV
                    {this.props.value}
                  </div>
                );
              } else {
                return (
                  <span>
                    SPAN
                    {this.props.value}
                  </span>
                );
              }
            })()}
          </div>
        );
      }
    }

    interface DropdownItemProps {
      children?: InfernoNode;
    }

    const DropdownItem = ({ children }: DropdownItemProps) => (
      <li>{children}</li>
    );

    interface LooperState {
      items: Item[];
    }

    class Looper extends Component<object, LooperState> {
      state: LooperState;

      constructor(props: object) {
        super(props);

        this.state = {
          items: [],
        };

        this.setItems = this.setItems.bind(this);

        setItems = this.setItems;
      }

      setItems(collection: Item[]) {
        this.setState({
          items: collection,
        });
      }

      render() {
        return (
          <div>
            <ul>
              {this.state.items.map(function (item, i) {
                return (
                  <DropdownItem key={item.value}>
                    <InnerComponentToGetUnmounted
                      key={0}
                      i={i}
                      value={item.value}
                    />
                    <span key={1}>{item.text}</span>
                  </DropdownItem>
                );
              })}
            </ul>
          </div>
        );
      }
    }

    render(<Looper />, container);
    expect(container.innerHTML).toBe('<div><ul></ul></div>');
    setItems!([
      { value: 'val1', text: 'key1' },
      { value: 'val2', text: 'key2' },
      { value: 'val3', text: 'key3' },
      { value: 'val4', text: 'key4' },
    ]);

    expect(container.innerHTML).toBe(
      '<div><ul><li><div class="common-root"><div>DIVval1</div></div><span>key1</span></li><li><div class="common-root"><span>SPANval2</span></div><span>key2</span></li><li><div class="common-root"><div>DIVval3</div></div><span>key3</span></li><li><div class="common-root"><span>SPANval4</span></div><span>key4</span></li></ul></div>',
    );

    setItems!([
      { value: 'val2', text: 'key2' },
      { value: 'val3', text: 'key3' },
    ]);
    expect(container.innerHTML).toBe(
      '<div><ul><li><div class="common-root"><div>DIVval2</div></div><span>key2</span></li><li><div class="common-root"><span>SPANval3</span></div><span>key3</span></li></ul></div>',
    );

    setItems!([
      { value: 'val1', text: 'key1' },
      { value: 'val2', text: 'key2' },
      { value: 'val3', text: 'key3' },
      { value: 'val4', text: 'key4' },
    ]);
    expect(container.innerHTML).toBe(
      '<div><ul><li><div class="common-root"><div>DIVval1</div></div><span>key1</span></li><li><div class="common-root"><span>SPANval2</span></div><span>key2</span></li><li><div class="common-root"><div>DIVval3</div></div><span>key3</span></li><li><div class="common-root"><span>SPANval4</span></div><span>key4</span></li></ul></div>',
    );
  });

  it('Should not crash when patching array to array with hooks', () => {
    let updater: ((stuff: InfernoNode) => void) | null = null;
    const stuff: InfernoNode[] = [<div>{['Test']}</div>, <span>1</span>];
    const orig: InfernoNode[] = [[<span ref={function () {}}>{'1'}</span>]];

    interface StuffState {
      stuff: InfernoNode;
    }

    class Stuff extends Component<object, StuffState> {
      state: StuffState;

      constructor(props: object) {
        super(props);

        this.state = {
          stuff,
        };

        updater = (_stuff: InfernoNode) => {
          this.setState({ stuff: _stuff });
        };
      }

      render() {
        return (
          <div>
            <div>{this.state.stuff}</div>
          </div>
        );
      }
    }

    render(<Stuff />, container);
    updater!(orig);
    expect(container.innerHTML).toBe('<div><div><span>1</span></div></div>');
  });

  it('Should allow camelCase properties when using JSX plugin', () => {
    const fakeObj = {
      func() {},
    };
    const submitSpy = spyOn(fakeObj, 'func');

    class Tester extends Component<object> {
      constructor(props: object) {
        super(props);
      }

      render() {
        return (
          <form>
            <input
              id="inputId"
              onFocus={(e) => {
                expect(e).toBeTruthy();
              }}
              type="text"
            />
          </form>
        );
      }
    }

    render(<Tester />, container);
    expect(container.innerHTML).toEqual(
      '<form><input id="inputId" type="text"></form>',
    );
    const input = container.querySelector('#inputId') as HTMLInputElement;
    expect(submitSpy).not.toHaveBeenCalled();
    input.focus();
  });

  it('Should not append when replacing ES6 component with functional component', () => {
    const A = function () {
      return (
        <div>
          <div className="topheader">
            <h1>A</h1>
          </div>
        </div>
      );
    };

    function B() {
      return (
        <div className="simplegrid">
          <div className="topheader">
            <h1>B</h1>
          </div>
          <div className="viewcontent fullscreen">
            <C />
          </div>
        </div>
      );
    }

    class C extends Component {
      componentWillUnmount() {}

      render() {
        return <div className="report-container">C</div>;
      }
    }

    const expectedA = '<div><div class="topheader"><h1>A</h1></div></div>';
    const expectedB =
      '<div class="simplegrid"><div class="topheader"><h1>B</h1></div><div class="viewcontent fullscreen"><div class="report-container">C</div></div></div>';
    render(<A />, container);
    expect(container.innerHTML).toEqual(expectedA);

    render(<B />, container);
    expect(container.innerHTML).toEqual(expectedB);

    // SO FAR SO GOOD

    // NOW START SWAPPING

    render(<A />, container);
    expect(container.innerHTML).toEqual(expectedA);

    render(<B />, container);
    expect(container.innerHTML).toEqual(expectedB);

    render(<A />, container);
    expect(container.innerHTML).toEqual(expectedA);

    render(<B />, container);
    expect(container.innerHTML).toEqual(expectedB);

    render(<A />, container);
    expect(container.innerHTML).toEqual(expectedA);

    render(<B />, container);
    expect(container.innerHTML).toEqual(expectedB);

    render(<A />, container);
    expect(container.innerHTML).toEqual(expectedA);

    render(<B />, container);
    expect(container.innerHTML).toEqual(expectedB);
  });

  it('Should not fail removing child of component node Github #1111', () => {
    interface InfoLiProps {
      check?: boolean;
      checked: boolean;
      type: string;
      label: string;
      onClick: (event: MouseEvent) => void;
      children?: InfernoNode;
    }

    const InfoLi = function InfoLi(props: InfoLiProps) {
      return (
        <li>
          {createElement('input', {
            checked: props.check,
            type: props.type,
            label: props.label,
            onClick: props.onClick,
          })}{' '}
          {props.label}: check, then uncheck
          <div>{props.children}</div>
        </li>
      );
    };

    interface ConfigsListProps {
      orderedConfigs: string[];
    }

    interface ConfigsListState {
      checks: boolean[];
    }

    class ConfigsList extends Component<ConfigsListProps, ConfigsListState> {
      state: ConfigsListState;

      constructor(props: ConfigsListProps) {
        super(props);
        this.state = {
          // @ts-expect-error the configs are strings, so `value` is always undefined
          checks: props.orderedConfigs.map((mod) => Boolean(mod.value)),
        };
      }

      handleCheck(index: number, ifChecked: boolean) {
        this.setState({
          checks: this.state.checks.map((ch, i) =>
            i === index ? ifChecked : ch,
          ),
        });
      }

      render(props: ConfigsListProps) {
        return (
          <ol>
            {props.orderedConfigs.map((conf, index) => {
              const child =
                this.state.checks[index] &&
                createElement('div', null, 'hi there');
              return (
                <InfoLi
                  label={conf}
                  type="checkbox"
                  checked={this.state.checks[index]}
                  onClick={(event) => {
                    this.handleCheck(
                      index,
                      (event.target as HTMLInputElement).checked,
                    );
                  }}
                >
                  {child}
                </InfoLi>
              );
            })}
          </ol>
        );
      }
    }

    render(<ConfigsList orderedConfigs={['use proxy?']} />, container);

    const input = container.querySelector('input')!;

    input.click();

    input.click();
  });
});
