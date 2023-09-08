import { Component, createPortal, render } from 'inferno';
import { isDOMInsideComponent, isDOMInsideVNode } from 'inferno-extras';

describe('Extras', () => {
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

  describe('isDOMInsideComponent', () => {
    it('Should return true if event.target is found outside Portal', () => {
      const secondRoot = document.createElement('div');

      let instance;

      class Tester extends Component {
        constructor(props) {
          super(props);

          instance = this;
        }

        render(props, state) {
          return (
            <div>
              Move It
              {createPortal(
                <div>
                  <span>test</span>
                  <ul id="target">
                    <li />
                  </ul>
                </div>,
                secondRoot,
              )}
            </div>
          );
        }
      }

      render(<Tester />, container);

      expect(container.innerHTML).toBe('<div>Move It</div>');

      const target = secondRoot.querySelector('#target');

      expect(isDOMInsideComponent(target, instance)).toBe(true);

      render(null, container);

      expect(isDOMInsideComponent(target, instance)).toBe(false);
    });

    it('Should search through all different shapes of virtual nodes', () => {
      const secondRoot = document.createElement('div');

      let instance;

      function Functional({ children }) {
        return (
          <div>
            <span>{children}</span>
          </div>
        );
      }

      class Tester extends Component {
        constructor(props) {
          super(props);

          instance = this;
        }

        render(props, state) {
          return (
            <div>
              Move It
              <div>
                <div>
                  <div />
                  <div />
                </div>
              </div>
              {createPortal(
                <div>
                  <span>
                    <Functional>
                      {[<div />, 'Okay', <span id="target" />]}
                    </Functional>
                  </span>
                  <ul>
                    <li />
                  </ul>
                </div>,
                secondRoot,
              )}
            </div>
          );
        }
      }

      render(<Tester />, container);

      expect(container.innerHTML).toBe(
        '<div>Move It<div><div><div></div><div></div></div></div></div>',
      );

      const target = secondRoot.querySelector('#target');

      expect(isDOMInsideComponent(target, instance)).toBe(true);

      render(null, container);

      expect(isDOMInsideComponent(target, instance)).toBe(false);
    });

    it('Should return true if target node is the root', () => {
      let instance;

      class Tester extends Component {
        constructor(props) {
          super(props);

          instance = this;
        }

        render() {
          return (
            <div id="target">
              <span />
            </div>
          );
        }
      }

      render(<Tester />, container);

      const target = container.querySelector('#target');

      expect(isDOMInsideComponent(target, instance)).toBe(true);
    });

    it('Should return false if target is not found', () => {
      const instances = [];

      class Tester extends Component {
        constructor(props) {
          super(props);

          instances.push(this);
        }

        render() {
          return (
            <div id={this.props.id}>
              <span />
            </div>
          );
        }
      }

      render(
        <div>
          <Tester />
          <Tester id="target" />
          <Tester />
        </div>,
        container,
      );

      const target = container.querySelector('#target');

      expect(isDOMInsideComponent(target, instances[0])).toBe(false);
      expect(isDOMInsideComponent(target, instances[1])).toBe(true);
      expect(isDOMInsideComponent(target, instances[2])).toBe(false);
    });

    it('Should return false if target is detached', () => {
      const instances = [];

      class Tester extends Component {
        constructor(props) {
          super(props);

          instances.push(this);
        }

        render() {
          return (
            <div id={this.props.id}>
              <span />
            </div>
          );
        }
      }

      render(
        <div>
          <Tester key="1" />
          <Tester key="2" id="target" />
          <Tester key="3" />
        </div>,
        container,
      );

      const target = container.querySelector('#target');

      expect(isDOMInsideComponent(target, instances[0])).toBe(false);
      expect(isDOMInsideComponent(target, instances[1])).toBe(true);
      expect(isDOMInsideComponent(target, instances[2])).toBe(false);

      render(
        <div>
          <Tester key="1" />
          <Tester key="change-it" id="target" />
          <Tester key="3" />
        </div>,
        container,
      );

      expect(isDOMInsideComponent(target, instances[0])).toBe(false);
      expect(isDOMInsideComponent(target, instances[1])).toBe(false);
      expect(isDOMInsideComponent(target, instances[2])).toBe(false);
    });
  });

  describe('isDOMInsideVNode', () => {
    it('Should work same way but for vNode', () => {
      const vNode = (
        <div>
          <div id="target">Ok</div>
        </div>
      );

      render(
        <div>
          <span>Test</span>
          {vNode}
        </div>,
        container,
      );

      expect(isDOMInsideVNode(container.querySelector('#target'), vNode)).toBe(
        true,
      );
    });

    it('Should return true if that is the ndoe', () => {
      const vNode = <div id="target">Ok</div>;

      render(
        <div>
          <span>Test</span>
          {vNode}
        </div>,
        container,
      );

      expect(isDOMInsideVNode(container.querySelector('#target'), vNode)).toBe(
        true,
      );
    });
  });
});
