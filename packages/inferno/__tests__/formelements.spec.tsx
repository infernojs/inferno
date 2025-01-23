import { Component, linkEvent, render } from 'inferno';

describe('FormElements', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  describe('text input', () => {
    interface TextBoxProps {
      value: string | number;
    }
    class TextBox extends Component<TextBoxProps> {
      constructor(props) {
        super(props);
      }

      public render() {
        return (
          <div>
            <input type="text" value={this.props.value} />
          </div>
        );
      }
    }

    it('Should set value as text on render', () => {
      render(<TextBox value={1} />, container);
      expect(container.querySelector('input').value).toBe('1');
    });

    it('Should override changed value on next render', () => {
      render(<TextBox value={1} />, container);
      let input = container.querySelector('input');
      expect(input.value).toBe('1');
      input.value = '2'; // Simulate user typing '2'
      expect(input.value).toBe('2');
      render(<TextBox value={3} />, container);
      input = container.querySelector('input');
      expect(input.value).toBe('3');
    });

    it('Should override changed value on next render even when value is same as on prev render', () => {
      render(<TextBox value={1} />, container);
      let input = container.querySelector('input');
      expect(input.value).toBe('1');
      input.value = '2'; // Simulate user typing '2'
      expect(input.value).toBe('2');
      render(<TextBox value={1} />, container);
      input = container.querySelector('input');
      expect(input.value).toBe('1');
    });

    it('Controlled - oninput - Should have updated props in onInput callbacks', () => {
      interface ExampleProps {
        value: number;
        callback: (value: number) => void;
      }

      class Example extends Component<ExampleProps> {
        constructor(props, context) {
          super(props, context);

          this._method = this._method.bind(this);
        }

        public _method() {
          this.props.callback(this.props.value);
        }

        public render() {
          return <input type="text" onInput={this._method} value="test" />;
        }
      }
      const spy = jasmine.createSpy('spy');

      render(<Example callback={spy} value={1} />, container);

      let event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.calls.argsFor(0)[0]).toBe(1); // Verify initial props are correct

      // Then update component
      render(<Example callback={spy} value={2} />, container);

      event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.calls.argsFor(1)[0]).toBe(2); // Verify props have changed
    });

    it('Controlled - onInput - Should have updated props in onInput callbacks', () => {
      interface ExampleProps {
        value: number;
        callback: (value: number) => void;
      }

      class Example extends Component<ExampleProps> {
        constructor(props, context) {
          super(props, context);

          this._method = this._method.bind(this);
        }

        public _method() {
          this.props.callback(this.props.value);
        }

        public render() {
          return <input type="text" onInput={this._method} value="test" />;
        }
      }

      let callCounter = 0;
      const args: number[] = [];

      const spy = function (arg) {
        callCounter++;
        args.push(arg);
      };

      render(<Example callback={spy} value={1} />, container);

      let event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(callCounter).toBe(1);
      expect(args[0]).toBe(1);

      // Then update component
      render(<Example callback={spy} value={2} />, container);

      event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(callCounter).toBe(2);
      expect(args[1]).toBe(2);
    });

    it('Controlled - onInput - Should have updated props in onInput callbacks in setState callback', () => {
      interface ExampleProps {
        value: number;
        callback: (value: number, a: number) => void;
      }

      interface ExampleState {
        a: number;
      }

      class Example extends Component<ExampleProps, ExampleState> {
        public state: ExampleState;

        constructor(props, context) {
          super(props, context);

          this.state = {
            a: 0,
          };

          this._method = this._method.bind(this);
        }

        public test() {
          this.props.callback(this.props.value, this.state.a);
        }

        public _method() {
          this.setState(
            {
              a: this.props.value,
            },
            this.test,
          );
        }

        public render() {
          return <input type="text" onInput={this._method} value="test" />;
        }
      }

      const spy = jasmine.createSpy('spy');

      render(<Example callback={spy} value={1} />, container);

      let event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.calls.argsFor(0)[0]).toBe(1); // Verify initial props are correct

      // Then update component
      render(<Example callback={spy} value={2} />, container);

      event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.calls.argsFor(1)[0]).toBe(2); // Verify props have changed
    });

    it('Controlled - onInput (linkEvent) - Should have updated props in onInput callbacks', () => {
      interface ExampleProps {
        value: number;
        callback: (value: number, a: number) => void;
      }

      class Example extends Component<ExampleProps> {
        constructor(props, context) {
          super(props, context);
        }

        public static _method(me) {
          me.props.callback(me.props.value);
        }

        public render() {
          return (
            <input
              type="text"
              onInput={linkEvent(this, Example._method)}
              value="test"
            />
          );
        }
      }

      const spy = jasmine.createSpy('spy');

      render(<Example callback={spy} value={1} />, container);

      let event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.calls.argsFor(0)[0]).toBe(1); // Verify initial props are correct

      // Then update component
      render(<Example callback={spy} value={2} />, container);

      event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.calls.argsFor(1)[0]).toBe(2); // Verify props have changed
    });

    it('NON Controlled - onInput (linkEvent) - Should have updated props in onInput callbacks', () => {
      interface ExampleProps {
        value: number;
        callback: (value: number, a: number) => void;
      }

      class Example extends Component<ExampleProps> {
        constructor(props, context) {
          super(props, context);
        }

        public static _method(me) {
          me.props.callback(me.props.value);
        }

        public render() {
          return (
            <input type="text" onInput={linkEvent(this, Example._method)} />
          );
        }
      }

      const spy = jasmine.createSpy('spy');

      render(<Example callback={spy} value={1} />, container);

      let event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.calls.argsFor(0)[0]).toBe(1); // Verify initial props are correct

      // Then update component
      render(<Example callback={spy} value={2} />, container);

      event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.calls.argsFor(1)[0]).toBe(2); // Verify props have changed
    });

    it('NON Controlled - onInput - Should have updated props in onInput callbacks', () => {
      interface ExampleProps {
        value: number;
        callback: (value: number) => void;
      }

      class Example extends Component<ExampleProps> {
        constructor(props, context) {
          super(props, context);

          this._method = this._method.bind(this);
        }

        public _method() {
          this.props.callback(this.props.value);
        }

        public render() {
          return <input type="text" onInput={this._method} />;
        }
      }

      const spy = jasmine.createSpy('spy');

      render(<Example callback={spy} value={1} />, container);

      let event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.calls.argsFor(0)[0]).toBe(1); // Verify initial props are correct

      // Then update component
      render(<Example callback={spy} value={2} />, container);

      event = document.createEvent('Event');
      event.initEvent('input', true, true);
      container.firstChild.dispatchEvent(event);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.calls.argsFor(1)[0]).toBe(2); // Verify props have changed
    });
  });

  describe('input type checkbox', () => {
    interface CheckBoxProps {
      checked?: boolean;
    }

    class CheckBox extends Component<CheckBoxProps> {
      constructor(props) {
        super(props);
      }

      public render() {
        return (
          <div>
            <input type="checkbox" checked={this.props.checked} />
          </div>
        );
      }
    }

    it('Should set checked on render', () => {
      render(<CheckBox checked={true} />, container);
      expect(container.querySelector('input').checked).toBe(true);
    });

    it('Should set checked on render #2', () => {
      render(<CheckBox checked={false} />, container);
      expect(container.querySelector('input').checked).toBe(false);
    });

    it('Should set checked on render #3', () => {
      render(<CheckBox />, container);
      expect(container.querySelector('input').checked).toBe(false);
    });

    it('Should override changed value on next render', () => {
      render(<CheckBox checked={false} />, container);
      let input = container.querySelector('input');
      expect(input.checked).toBe(false);
      input.checked = false; // Simulate user clicking checkbox twice
      render(<CheckBox checked={true} />, container);
      input = container.querySelector('input');
      expect(input.checked).toBe(true);
    });

    it('Should override changed value on next render even when value is same as on prev render', () => {
      render(<CheckBox checked={false} />, container);
      let input = container.querySelector('input');
      expect(input.checked).toBe(false);
      input.checked = true; // Simulate user clicking checkbox
      expect(input.checked).toBe(true);
      render(<CheckBox checked={false} />, container);
      input = container.querySelector('input');
      expect(input.checked).toBe(false);
    });

    it('Should override changed value on next render even when value is same as on prev render #1', () => {
      render(<CheckBox checked={true} />, container);
      let input = container.querySelector('input');
      expect(input.checked).toBe(true);
      input.checked = false; // Simulate user clicking checkbox
      expect(input.checked).toBe(false);
      render(<CheckBox checked={true} />, container);
      input = container.querySelector('input');
      expect(input.checked).toBe(true);
    });

    it('Should support indeterminate state', () => {
      let input;

      render(
        <input
          ref={(dom) => (input = dom)}
          type="checkbox"
          checked={false}
          indeterminate={true}
        />,
        container,
      );

      expect(input.indeterminate).toBe(true);
      expect(input.checked).toBe(false);

      render(
        <input
          ref={(dom) => (input = dom)}
          type="checkbox"
          checked={false}
          indeterminate={false}
        />,
        container,
      );

      expect(input.indeterminate).toBe(false);
      expect(input.checked).toBe(false);

      render(
        <input
          ref={(dom) => (input = dom)}
          type="checkbox"
          checked={true}
          indeterminate={false}
        />,
        container,
      );

      expect(input.indeterminate).toBe(false);
      expect(input.checked).toBe(true);
    });
  });

  // https://facebook.github.io/react/docs/forms.html
  describe('React form spec', () => {
    describe('Controlled select list', () => {
      interface SelectListProps {
        value: string;
      }

      class SelectList extends Component<SelectListProps> {
        constructor(props) {
          super(props);
        }

        public render() {
          return (
            <div>
              <select value={this.props.value}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          );
        }
      }

      it('Should pre select option by value', () => {
        render(<SelectList value="B" />, container);
        const selectList = container.querySelector('select');
        expect(selectList.childNodes[0].selected).toBe(false);
        expect(selectList.childNodes[1].selected).toBe(true);
        expect(selectList.childNodes[2].selected).toBe(false);
      });

      it('Should change value based on value property', () => {
        render(<SelectList value="B" />, container);
        let selectList = container.querySelector('select');
        expect(selectList.childNodes[0].selected).toBe(false);
        expect(selectList.childNodes[1].selected).toBe(true);
        expect(selectList.childNodes[2].selected).toBe(false);

        render(<SelectList value="C" />, container);
        selectList = container.querySelector('select');
        expect(selectList.childNodes[0].selected).toBe(false);
        expect(selectList.childNodes[1].selected).toBe(false);
        expect(selectList.childNodes[2].selected).toBe(true);
      });
    });

    describe('Controlled select list updates', () => {
      let updater;

      interface SelectListState {
        value: string;
      }

      class SelectList extends Component<unknown, SelectListState> {
        public state: SelectListState;

        constructor(props) {
          super(props);

          this.state = {
            value: 'A',
          };

          updater = (e) => {
            this.setState(e);
          };
        }

        public buildOptionsDynamically() {
          return [
            <option value="A">A</option>,
            <option value="B">B</option>,
            <option value="C">C</option>,
          ];
        }

        public render() {
          return (
            <div>
              <select value={this.state.value}>
                {this.buildOptionsDynamically()}
              </select>
            </div>
          );
        }
      }

      it('Should pre select option by value on update', (done) => {
        render(<SelectList />, container);
        let selectList = container.querySelector('select');
        expect(selectList.childNodes[0].selected).toBe(true);
        expect(selectList.childNodes[1].selected).toBe(false);
        expect(selectList.childNodes[2].selected).toBe(false);

        updater({ value: 'B' });
        setTimeout(() => {
          selectList = container.querySelector('select');
          expect(selectList.childNodes[0].selected).toBe(false);
          expect(selectList.childNodes[1].selected).toBe(true);
          expect(selectList.childNodes[2].selected).toBe(false);
          done();
        }, 10);
      });
    });

    describe('input range scu', () => {
      it('Should have correct value on initial render', () => {
        class TestInputRange extends Component {
          public shouldComponentUpdate() {
            return false;
          }

          public render() {
            return (
              <input
                name="test"
                type="range"
                min={50}
                max={500}
                step={5}
                defaultValue={260}
              />
            );
          }
        }
        render(<TestInputRange />, container);

        expect(container.firstChild.value).toBe('260');
        expect(container.firstChild.defaultValue).toBe('260');
      });

      it('Should have defaultValue even when defaultValue is omitted, if value exists', () => {
        class TestInputRange extends Component {
          public shouldComponentUpdate() {
            return false;
          }

          public render() {
            return (
              <input
                name="test"
                type="range"
                min={50}
                max={500}
                step={5}
                value="110"
              />
            );
          }
        }
        render(<TestInputRange />, container);

        expect(container.firstChild.value).toBe('110');
        expect(container.firstChild.defaultValue).toBe('110');
      });
    });

    describe('Non-controlled select element', () => {
      it('Should have 2nd option selected', () => {
        render(
          <select>
            <option value="a">a</option>
            <option selected={true} value="b">
              b
            </option>
          </select>,
          container,
        );

        expect(container.firstChild.children[0].selected).toBe(false);
        expect(container.firstChild.children[1].selected).toBe(true);
      });

      it('should render specified default selected option', () => {
        render(
          <div>
            <select>
              <option value="a">a</option>
              <option selected={true} value="b">
                b
              </option>
            </select>
          </div>,
          container,
        );

        expect(container.querySelector('select').children[0].selected).toEqual(
          false,
        );
        expect(container.querySelector('select').children[1].selected).toEqual(
          true,
        );
      });
    });

    describe('callbacks with FormElements', () => {
      it('Should call latest calback from props', () => {
        interface CompAState {
          orderedConfigs: Array<{ value: boolean }>;
        }
        class CompA extends Component<unknown, CompAState> {
          public state: CompAState;
          constructor(props) {
            super(props);
            this.state = {
              orderedConfigs: [
                { value: false },
                { value: true },
                { value: false },
              ],
            };
          }

          public handleClick(that, { targetConf, targetIndex }) {
            const newConfigs = that.state.orderedConfigs.map((conf, index) =>
              index === targetIndex ? { value: !targetConf.value } : conf,
            );

            this.setState({ orderedConfigs: newConfigs });
          }

          public render() {
            return (
              <CompB
                orderedConfigs={this.state.orderedConfigs}
                onClick={(...args) => {
                  this.handleClick(this, ...args);
                }}
              />
            );
          }
        }

        interface CompBProps {
          orderedConfigs: Array<{ value: boolean }>;
          onClick: (arg: {
            targetConf: { value: boolean };
            targetIndex: number;
          }) => void;
        }

        const CompB = function renderCompB(props: CompBProps) {
          return (
            <div>
              {props.orderedConfigs.map((conf, index) => (
                <input
                  type="checkbox"
                  checked={conf.value}
                  onClick={() => {
                    props.onClick({ targetConf: conf, targetIndex: index });
                  }}
                />
              ))}
            </div>
          );
        };

        render(<CompA />, container);

        expect(container.firstChild.firstChild.checked).toBe(false);
        // expect(container.querySelectorAll('input:checked').length).toEqual(1);

        let input = container.querySelector('input');
        input.click();

        expect(container.firstChild.firstChild.checked).toBe(true);
        // expect(container.querySelectorAll('input:checked').length).toEqual(2);

        input = container.querySelector('input');
        input.click();

        expect(container.firstChild.firstChild.checked).toBe(false);
        // expect(container.querySelectorAll('input:checked').length).toEqual(1);
      });
    });

    describe('Controlled inputs, checkbox', () => {
      it('Should keep unChecked if checked is false', () => {
        render(
          <label>
            <input type="checkbox" checked={false} name="test" value="test" />{' '}
            test
          </label>,
          container,
        );

        // Verify its not checked
        const input = container.querySelector('input');

        expect(input.checked).toBe(false);

        input.click();

        expect(input.checked).toBe(false);
      });

      it('Should be possible to control checkbox by props', () => {
        interface ComponentTestState {
          checked: boolean;
        }
        class ComponentTest extends Component<unknown, ComponentTestState> {
          public state: ComponentTestState;

          constructor(props) {
            super(props);
            this.state = { checked: false };
          }

          public handleClick() {
            this.setState((state) => ({ checked: !state.checked }));
          }

          public render() {
            return (
              <div>
                <button
                  onClick={() => {
                    this.handleClick();
                  }}
                />
                <input type="checkbox" checked={this.state.checked} />
              </div>
            );
          }
        }

        render(<ComponentTest />, container);

        expect(container.querySelectorAll('input').length).toBe(1);

        const input = container.querySelector('input');
        const button = container.querySelector('button');

        expect(input.checked).toBe(false);

        button.click();

        expect(input.checked).toBe(true);
      });

      it('Clicking checkbox should have value changed in callback, and reverted after it (unless no change in state)', () => {
        let changeToValue = true;

        interface ComponentTestState {
          checked: boolean;
        }
        class ComponentTest extends Component<unknown, ComponentTestState> {
          public state: ComponentTestState;
          constructor(props) {
            super(props);
            this.state = { checked: true };
          }

          public handleClick(event) {
            expect(event.currentTarget.checked).toBe(false);

            this.setState(() => ({ checked: changeToValue }));
          }

          public render() {
            return (
              <div>
                <input
                  onClick={(e) => {
                    this.handleClick(e);
                  }}
                  type="checkbox"
                  checked={this.state.checked}
                />
              </div>
            );
          }
        }

        render(<ComponentTest />, container);

        expect(container.querySelectorAll('input').length).toBe(1);

        const input = container.querySelector('input');

        expect(input.checked).toBe(true);

        input.click();

        expect(input.checked).toBe(true);

        changeToValue = false;

        input.click();

        expect(input.checked).toBe(false);
      });

      /* Same test as above, but in opposite order */
      it('Clicking checkbox should have value changed in callback, and reverted after it (unless no change in state) #2', () => {
        let changeToValue = false;

        interface ComponentTestState {
          checked: boolean;
        }
        class ComponentTest extends Component<unknown, ComponentTestState> {
          public state: ComponentTestState;
          constructor(props) {
            super(props);
            this.state = { checked: false };
          }

          public handleClick(event) {
            expect(event.currentTarget.checked).toBe(true);

            this.setState(() => ({ checked: changeToValue }));
          }

          public render() {
            return (
              <div>
                <input
                  onClick={(e) => {
                    this.handleClick(e);
                  }}
                  type="checkbox"
                  checked={this.state.checked}
                />
              </div>
            );
          }
        }

        render(<ComponentTest />, container);

        expect(container.querySelectorAll('input').length).toBe(1);

        const input = container.querySelector('input');

        expect(input.checked).toBe(false); // Initially false

        input.click(); // Inside event handler should be true

        expect(input.checked).toBe(false); // After render, it should be false again

        changeToValue = true;

        input.click(); // Inside event handler should be true

        expect(input.checked).toBe(true); // Now it should be true because value was changed in state
      });
    });
  });
});
