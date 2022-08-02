import { render } from 'inferno';
import { createElement } from 'inferno-create-element';

describe('Basic event tests', () => {
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

  it('should attach basic click events', (done) => {
    const template = (val) =>
      createElement('div', {
        id: 'test',
        onclick: val
      });

    let calledFirstTest = false;

    function test() {
      calledFirstTest = true;
    }

    // different event
    let calledSecondTest = false;

    function test2() {
      calledSecondTest = true;
    }

    render(template(test), container);

    let divs = container.querySelectorAll('div');
    divs.forEach((div) => div.click());
    expect(calledFirstTest).toBe(true);

    // reset
    calledFirstTest = false;

    render(template(test2), container);
    divs = container.querySelectorAll('div');
    divs.forEach((div) => div.click());

    expect(calledFirstTest).toBe(false);
    expect(calledSecondTest).toBe(true);

    // reset
    calledFirstTest = false;
    calledSecondTest = false;

    render(null, container);
    divs = container.querySelectorAll('div');
    divs.forEach((div) => div.click());

    expect(calledFirstTest).toBe(false);
    expect(calledSecondTest).toBe(false);
    done();
  });

  it('should update events', () => {
    let data = {
      count: 0
    };

    function onClick(d) {
      return function (e) {
        data = { count: d.count + 1 };

        renderIt();
      };
    }

    function App(d) {
      return createElement(
        'button',
        {
          onclick: onClick(d)
        },
        'Count ',
        d.count
      );
    }

    function renderIt() {
      // eslint-disable-next-line
      render(App(data), container);
    }

    renderIt();
    const buttons = container.querySelectorAll('button');

    expect(container.firstChild.innerHTML).toBe('Count 0');
    expect(data.count).toBe(0);
    buttons.forEach((button) => button.click());
    expect(container.firstChild.innerHTML).toBe('Count 1');
    expect(data.count).toBe(1);
    buttons.forEach((button) => button.click());
    expect(container.firstChild.innerHTML).toBe('Count 2');
    expect(data.count).toBe(2);
  });

  it('should not trigger click at all if target is disabled', () => {
    let data = {
      count: 0
    };

    function onClick(d) {
      return function (e) {
        data = { count: d.count + 1 };

        renderIt();
      };
    }

    function App(d) {
      return createElement(
        'button',
        {
          disabled: 'disabled',
          onClick: onClick(d)
        },
        createElement('span', null, 'Count ', d.count)
      );
    }

    function renderIt() {
      // eslint-disable-next-line
      render(App(data), container);
    }

    renderIt();
    const buttons = container.querySelectorAll('span');

    expect(container.firstChild.innerHTML).toBe('<span>Count 0</span>');
    expect(data.count).toBe(0);
    buttons.forEach((button) => button.click());
    expect(container.firstChild.innerHTML).toBe('<span>Count 0</span>');
  });

  it('should not leak memory', () => {
    const eventHandler = function () {};

    function AppTwo() {
      return createElement('button', null, [2]);
    }

    function App() {
      return createElement(
        'button',
        {
          onsubmit: eventHandler
        },
        ['1']
      );
    }

    // eslint-disable-next-line
    render(App(), container);
    expect(container.firstChild.innerHTML).toBe('1');

    // eslint-disable-next-line
    render(App(), container);
    expect(container.firstChild.innerHTML).toBe('1');

    // eslint-disable-next-line
    render(AppTwo(), container);
    expect(container.firstChild.innerHTML).toBe('2');
  });

  it('should not leak memory #2', () => {
    const eventHandler = function () {};

    function App({ toggle }) {
      return createElement(
        'button',
        {
          onsubmit: toggle ? eventHandler : null
        },
        ['1']
      );
    }

    // eslint-disable-next-line
    render(App({ toggle: true }), container);
    expect(container.firstChild.innerHTML).toBe('1');

    // eslint-disable-next-line
    render(App({ toggle: false }), container);
    expect(container.firstChild.innerHTML).toBe('1');
  });

  it('should not leak memory when child changes', () => {
    const eventHandler = function () {};

    function smallComponent() {
      return createElement(
        'div',
        {
          onkeyup: eventHandler
        },
        '2'
      );
    }

    const childrenArray = [smallComponent(), smallComponent(), smallComponent()];

    function AppTwo() {
      return createElement('p', null, ['2']);
    }

    function App(children) {
      return createElement(
        'p',
        {
          onkeydown: eventHandler
        },
        children.slice(0)
      );
    }

    // eslint-disable-next-line
    render(App(childrenArray), container);
    expect(container.innerHTML).toBe('<p><div>2</div><div>2</div><div>2</div></p>');

    childrenArray.pop();
    // eslint-disable-next-line
    render(App(childrenArray), container);
    expect(container.innerHTML).toBe('<p><div>2</div><div>2</div></p>');

    // eslint-disable-next-line
    render(AppTwo(), container);
    expect(container.innerHTML).toBe('<p>2</p>');
  });

  describe('Event Propagation', () => {
    it('Should stop propagating Synthetic event to document', (done) => {
      const eventHandlerSpy = jasmine.createSpy('spy');
      const eventHandler = function (event) {
        eventHandlerSpy();
        event.stopPropagation();
      };

      function SmallComponent() {
        return createElement(
          'div',
          {
            onClick: eventHandler,
            id: 'tester'
          },
          '2'
        );
      }

      render(<SmallComponent />, container);

      const bodySpy = jasmine.createSpy('spy');
      document.addEventListener('click', bodySpy);

      container.querySelector('#tester').click();
      setTimeout(function () {
        expect(eventHandlerSpy.calls.count()).toBe(1);
        expect(bodySpy.calls.count()).toBe(0);
        document.removeEventListener('click', bodySpy);
        done();
      }, 20);
    });

    it('Should stop propagating Synthetic event to parentElement with synthetic event', (done) => {
      const eventHandlerSpy = jasmine.createSpy('spy');
      const eventHandler = function (event) {
        eventHandlerSpy();
        event.stopPropagation();
      };

      const eventHandlerSpy2 = jasmine.createSpy('spy');
      const eventHandler2 = function (event) {
        eventHandlerSpy2();
      };

      function SmallComponent() {
        return createElement(
          'div',
          {
            onClick: eventHandler2,
            id: 'parent'
          },
          createElement(
            'div',
            {
              onClick: eventHandler,
              id: 'tester'
            },
            '2'
          )
        );
      }

      render(<SmallComponent />, container);

      container.querySelector('#tester').click();
      setTimeout(function () {
        expect(eventHandlerSpy.calls.count()).toBe(1);
        expect(eventHandlerSpy2.calls.count()).toBe(0);
        done();
      }, 20);
    });

    // React does not block propagating synthetic event to parent with normal event either.
    it('Should NOT stop propagating Synthetic event to parentElement with normal event', (done) => {
      const eventHandlerSpy = jasmine.createSpy('spy');
      const eventHandler = function (event) {
        eventHandlerSpy();
        event.stopPropagation();
      };

      const eventHandlerSpy2 = jasmine.createSpy('spy');
      const eventHandler2 = function (event) {
        eventHandlerSpy2();
      };

      function SmallComponent() {
        return createElement(
          'div',
          {
            onclick: eventHandler2,
            id: 'parent'
          },
          createElement(
            'div',
            {
              onClick: eventHandler,
              id: 'tester'
            },
            '2'
          )
        );
      }

      render(<SmallComponent />, container);

      container.querySelector('#tester').click();
      setTimeout(function () {
        expect(eventHandlerSpy.calls.count()).toBe(1);
        expect(eventHandlerSpy2.calls.count()).toBe(1);
        done();
      }, 20);
    });

    // https://github.com/infernojs/inferno/issues/979
    it('Should trigger child elements synthetic event even if parent Element has null listener', () => {
      const spy1 = jasmine.createSpy('spy');
      const spy2 = jasmine.createSpy('spy');

      function FooBarCom({ test }) {
        return (
          <div onClick={test !== '1' ? null : spy1}>
            <div onClick={null}>
              <span onClick={spy2}>test</span>
            </div>
          </div>
        );
      }

      render(<FooBarCom test="1" />, container);
      container.querySelector('span').click();
      expect(spy2.calls.count()).toBe(1);
      expect(spy1.calls.count()).toBe(1);

      render(<FooBarCom test="2" />, container);
      container.querySelector('span').click();
      expect(spy2.calls.count()).toBe(2);
      expect(spy1.calls.count()).toBe(1);

      render(<FooBarCom test="3" />, container);
      container.querySelector('span').click();
      expect(spy2.calls.count()).toBe(3);
      expect(spy1.calls.count()).toBe(1);
    });

    it('Should remove synthetic listener if patched to null/undef', () => {
      const spy1 = jasmine.createSpy('spy');
      const spy2 = jasmine.createSpy('spy');

      function FooBarCom({ test }) {
        return (
          <div>
            {test ? (
              <div onClick={spy1}>
                <span onClick={spy2}>test</span>
              </div>
            ) : (
              <div>
                <span onClick={spy2}>test</span>
              </div>
            )}
          </div>
        );
      }

      render(<FooBarCom test={true} />, container);
      container.querySelector('span').click();
      expect(spy2.calls.count()).toBe(1);
      expect(spy1.calls.count()).toBe(1);

      render(<FooBarCom test={false} />, container);
      container.querySelector('span').click();
      expect(spy2.calls.count()).toBe(2);
      expect(spy1.calls.count()).toBe(1);

      render(<FooBarCom test={true} />, container);
      container.querySelector('span').click();
      expect(spy2.calls.count()).toBe(3);
      expect(spy1.calls.count()).toBe(2);
    });

    it('Should remove native listener if patched to null/undef', () => {
      const spy1 = jasmine.createSpy('spy');
      const spy2 = jasmine.createSpy('spy');

      function FooBarCom({ test }) {
        return (
          <div>
            {test ? (
              <div onclick={spy1}>
                <span onclick={spy2}>test</span>
              </div>
            ) : (
              <div>
                <span onclick={spy2}>test</span>
              </div>
            )}
          </div>
        );
      }

      render(<FooBarCom test={true} />, container);
      container.querySelector('span').click();
      expect(spy2.calls.count()).toBe(1);
      expect(spy1.calls.count()).toBe(1);

      render(<FooBarCom test={false} />, container);
      container.querySelector('span').click();
      expect(spy2.calls.count()).toBe(2);
      expect(spy1.calls.count()).toBe(1);

      render(<FooBarCom test={true} />, container);
      container.querySelector('span').click();
      expect(spy2.calls.count()).toBe(3);
      expect(spy1.calls.count()).toBe(2);
    });

    it('Should stop propagating normal event to document', () => {
      const eventHandlerSpy = jasmine.createSpy('spy');
      const eventHandler = function (event) {
        eventHandlerSpy();
        event.stopPropagation();
      };

      function SmallComponent() {
        return createElement(
          'div',
          {
            onclick: eventHandler,
            id: 'tester'
          },
          '2'
        );
      }

      render(<SmallComponent />, container);
      const bodySpy = jasmine.createSpy('spy');
      document.addEventListener('click', bodySpy);

      container.querySelector('#tester').click();

      expect(eventHandlerSpy.calls.count()).toBe(1);
      expect(bodySpy.calls.count()).toBe(0);
      document.removeEventListener('click', bodySpy);
    });

    it('Should stop propagating normal event to parentElement with synthetic event', (done) => {
      const eventHandlerSpy = jasmine.createSpy('spy');
      const eventHandler = function (event) {
        eventHandlerSpy();
        event.stopPropagation();
      };

      const eventHandlerSpy2 = jasmine.createSpy('spy');
      const eventHandler2 = function (event) {
        eventHandlerSpy2();
      };

      function SmallComponent() {
        return createElement(
          'div',
          {
            onClick: eventHandler2,
            id: 'parent'
          },
          createElement(
            'div',
            {
              onclick: eventHandler,
              id: 'tester'
            },
            '2'
          )
        );
      }

      render(<SmallComponent />, container);

      container.querySelector('#tester').click();
      setTimeout(function () {
        expect(eventHandlerSpy.calls.count()).toBe(1);
        expect(eventHandlerSpy2.calls.count()).toBe(0);
        done();
      }, 20);
    });

    it('Should stop propagating normal event to normal event', (done) => {
      const eventHandlerSpy = jasmine.createSpy('spy');
      const eventHandler = function (event) {
        eventHandlerSpy();
        event.stopPropagation();
      };

      const eventHandlerSpy2 = jasmine.createSpy('spy');
      const eventHandler2 = function () {
        eventHandlerSpy2();
      };

      function SmallComponent() {
        return createElement(
          'div',
          {
            onclick: eventHandler2,
            id: 'parent'
          },
          createElement(
            'div',
            {
              onclick: eventHandler,
              id: 'tester'
            },
            '2'
          )
        );
      }

      render(<SmallComponent />, container);

      container.querySelector('#tester').click();
      setTimeout(function () {
        expect(eventHandlerSpy.calls.count()).toBe(1);
        expect(eventHandlerSpy2.calls.count()).toBe(0);
        done();
      }, 20);
    });
  });

  it('Should work with spread attributes', (done) => {
    function SmallComponent(props) {
      return (
        <div id="testClick" {...props}>
          FooBar
        </div>
      );
    }

    const obj = {
      test: function () {
        done();
      }
    };

    render(<SmallComponent className="testing" onClick={obj.test} />, container);

    container.querySelector('#testClick').click();
  });

  it('Synthetic Events - Should not reduce listener count when nothing was removed', () => {
    const spy = jasmine.createSpy('spy');
    const root1 = document.createElement('div');
    const root2 = document.createElement('div');
    const root3 = document.createElement('div');
    const root4 = document.createElement('div');

    document.body.appendChild(root1);
    document.body.appendChild(root2);
    document.body.appendChild(root3);
    document.body.appendChild(root4);

    render(<div onClick={spy} />, root1);
    render(<div onClick={undefined} />, root2);
    render(<div onClick={void 0} />, root3);
    render(<div onClick={null} />, root4);

    root1.firstChild.click();
    root2.firstChild.click();
    root3.firstChild.click();
    root4.firstChild.click();

    expect(spy.calls.count()).toBe(1);

    render(null, root1);
    render(null, root2);
    render(null, root3);
    render(null, root4);

    document.body.removeChild(root1);
    document.body.removeChild(root2);
    document.body.removeChild(root3);
    document.body.removeChild(root4);
  });

  describe('currentTarget', () => {
    it('Should have currentTarget', (done) => {
      function verifyCurrentTarget(event) {
        expect(event.currentTarget).toBe(container.firstChild);
        done();
      }

      render(<div onClick={verifyCurrentTarget} />, container);

      container.firstChild.click();
    });

    it('Current target should not be the clicked element, but the one with listener', () => {
      let called = false;

      function verifyCurrentTarget(event) {
        expect(event.currentTarget).toBe(container.firstChild);
        called = true;
      }

      render(
        <div onClick={verifyCurrentTarget}>
          <span>test</span>
        </div>,
        container
      );

      container.querySelector('span').click();

      expect(called).toBe(true);
    });

    it('Should work with deeply nested tree', (done) => {
      function verifyCurrentTarget(event) {
        expect(event.currentTarget).toBe(container.querySelector('#test'));
        done();
      }

      render(
        <div>
          <div>
            <div>
              <div>
                <div>1</div>
                <div id="test" onClick={verifyCurrentTarget}>
                  <div>foo</div>
                  <span>2</span>
                </div>
              </div>
            </div>
          </div>
          <span>test</span>
        </div>,
        container
      );

      container.querySelector('span').click();
    });

    it('currentTarget should propagate work with multiple levels of children', (done) => {
      function verifyCurrentTarget(event) {
        expect(event.currentTarget).toBe(container.querySelector('#test'));
        done();
      }

      render(
        <div>
          <div>
            <div>
              <div>
                <div>1</div>
                <div id="test" onClick={verifyCurrentTarget}>
                  <div>foo</div>
                  <div>
                    <div>
                      <div>
                        <div>
                          <span>test</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>1</div>
                </div>
              </div>
            </div>
          </div>
          <span>test</span>
        </div>,
        container
      );

      container.querySelector('span').click();
    });
  });

  describe('Event removal', () => {
    it('Should remove events when parent changes', () => {
      const spy = jasmine.createSpy('spy');
      render(
        <div>
          <div id="test" onClick={spy}>
            1
          </div>
        </div>,
        container
      );

      expect(spy.calls.count()).toBe(0);
      container.querySelector('#test').click();
      expect(spy.calls.count()).toBe(1);

      render(
        <div>
          <div id="test">2</div>
        </div>,
        container
      );

      container.querySelector('#test').click();
      expect(spy.calls.count()).toBe(1);
    });

    it('Should NOT remove events when listener remains there', () => {
      const spy = jasmine.createSpy('spy');
      render(
        <div>
          <div id="test" onClick={spy}>
            1
          </div>
        </div>,
        container
      );

      expect(spy.calls.count()).toBe(0);
      container.querySelector('#test').click();
      expect(spy.calls.count()).toBe(1);

      render(
        <div>
          <div id="test" onClick={spy}>
            2
          </div>
        </div>,
        container
      );

      container.querySelector('#test').click();
      expect(spy.calls.count()).toBe(2);
    });

    it('Should remove events when listener is nulled', () => {
      const spy = jasmine.createSpy('spy');
      render(
        <div>
          <div id="test" onClick={spy}>
            1
          </div>
        </div>,
        container
      );

      expect(spy.calls.count()).toBe(0);
      container.querySelector('#test').click();
      expect(spy.calls.count()).toBe(1);

      render(
        <div>
          <div id="test" onClick={null}>
            2
          </div>
        </div>,
        container
      );

      container.querySelector('#test').click();
      expect(spy.calls.count()).toBe(1);
    });
  });
});
