import { render } from 'inferno';
import { h } from 'inferno-hyperscript';
import { innerHTML } from 'inferno-utils';
import sinon from 'sinon';
import { Component } from '../../inferno/src';

describe('HyperScript (non-JSX)', () => {
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

  it('Should handle a basic example', () => {
    render(h('div'), container);
    expect(container.innerHTML).toBe(innerHTML('<div></div>'));
  });

  it('Should handle a basic example #2', () => {
    render(h('div', 'Hello world!'), container);
    expect(container.innerHTML).toBe(innerHTML('<div>Hello world!</div>'));
  });

  it('Should handle a basic example #3', () => {
    render(h('div', { className: 'foo' }, 'Hello world!'), container);
    expect(container.innerHTML).toBe(innerHTML('<div class="foo">Hello world!</div>'));
  });

  const StatelessComponent = () => h('div', 'Hello world!');

  describe('Class Component hooks', function() {
    it('Should trigger ref callback when component is mounting and unmounting', () => {
      const container = document.createElement('div');
      class FooBar extends Component {
        render() {
          return h('div');
        }
      }
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, 'fn');
      const node = h(FooBar, { ref: spyObj.fn });

      render(node, container);

      expect(sinonSpy.callCount).toBe(1);
      expect(sinonSpy.getCall(0).args.length).toBe(1);
      expect(sinonSpy.getCall(0).args[0]).not.toEqual(null);

      render(null, container);

      expect(sinonSpy.callCount).toBe(2);
      expect(sinonSpy.getCall(1).args.length).toBe(1);
      expect(sinonSpy.getCall(1).args[0]).toEqual(null);
    });
  });

  it('Should handle a basic example #4', () => {
    render(h(StatelessComponent), container);
    expect(container.innerHTML).toBe(innerHTML('<div>Hello world!</div>'));
  });

  it('Should handle a hooks example #1', () => {
    const Component = ({ children }) => {
      return h('div', children);
    };
    const ComponentHooks = () =>
      h(Component, {
        hooks: {
          onComponentDidUnmount() {}
        },
        children: 'Hello world!'
      });

    render(h(ComponentHooks), container);
    expect(container.innerHTML).toBe(innerHTML('<div>Hello world!</div>'));
  });

  it('Should handle children as third argument', () => {
    const Component = ({ children }) => {
      return h('div', children);
    };
    const ComponentHooks = () => h(Component, null, 'Hello world!');

    render(h(ComponentHooks), container);
    expect(container.innerHTML).toBe(innerHTML('<div>Hello world!</div>'));
  });

  it('Should handle different props (key, class, id, ref, children)', () => {
    const ComponentHooks = () =>
      h('div#myId.test', {
        onComponentDidMount() {},
        key: 'myKey',
        ref: c => c,
        className: 'myClass',
        children: 'Hello world!'
      });

    render(h(ComponentHooks), container);
    expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div class="test myClass" id="myId">Hello world!</div>'));
  });

  it('Should handle tag with no name', () => {
    const ComponentHooks = () => h('', { children: 'Hello world!' });
    render(h(ComponentHooks), container);
    expect(container.innerHTML).toBe(innerHTML('<div>Hello world!</div>'));
  });

  it('Should be possible to create textarea with hyperscript', () => {
    const ComponentHooks = () => h('textarea', { id: 'test' });
    render(h(ComponentHooks), container);
    expect(innerHTML(container.innerHTML)).toBe(innerHTML('<textarea id="test"></textarea>'));
  });

  it('Should be possible to create select element with hyperscript', () => {
    const ComponentHooks = () => h('select', { id: 'select' }, [h('option', { value: 1 }, '1'), h('option', { value: 2 }, '2')]);
    render(h(ComponentHooks), container);
    expect(innerHTML(container.innerHTML)).toBe(innerHTML('<select id="select"><option value="1">1</option><option value="2">2</option></select>'));
  });

  it('Should handle tag with no tag name but id is present', () => {
    const ComponentHooks = () => h('#myId');
    render(h(ComponentHooks), container);
    expect(container.innerHTML).toBe(innerHTML('<div id="myId"></div>'));
  });

  it('Should support lifecycle methods on functional components willMount', () => {
    const callbackSpy = sinon.spy();
    const ComponentHooks = () => h('#myId');
    render(h(ComponentHooks, { onComponentWillMount: callbackSpy }), container);
    expect(container.innerHTML).toBe(innerHTML('<div id="myId"></div>'));
    expect(callbackSpy.calledOnce).toBe(true);
  });

  it('Should support lifecycle methods on functional components didMount', () => {
    const callbackSpy = sinon.spy();
    const ComponentHooks = () => h('#myId');
    render(h(ComponentHooks, { onComponentDidMount: callbackSpy }), container);
    expect(container.innerHTML).toBe(innerHTML('<div id="myId"></div>'));
    expect(callbackSpy.calledOnce).toBe(true);
  });

  it('Should pass classNames through', () => {
    function Test1({ children, ...props }) {
      return h('div.test1', props, children);
    }

    function Test2({ children, ...props }) {
      return h('div', props, children);
    }

    function Test3({ children, ...props }) {
      return h('div', { className: 'test3' }, children);
    }

    function Test4({ children, className, ...props }) {
      return h('div', { className, ...props }, children);
    }

    render(
      h('div', {}, [h(Test1, { className: 'test1prop' }), h(Test2, { className: 'test2prop' }), h(Test3), h(Test4, { className: 'test4prop' })]),
      container
    );

    const children = container.firstChild.childNodes;

    expect(children[0].className).toBe('test1 test1prop');
    expect(children[1].className).toBe('test2prop');
    expect(children[2].className).toBe('test3');
    expect(children[3].className).toBe('test4prop');
  });

  if (typeof global !== 'undefined' && !global.usingJSDOM) {
    it('Should not lower case SVG tags', () => {
      render(h('svg', null, h('filter', { id: 'blur' }, h('feGaussianBlur', { in: 'SourceGraphic' }))), container);

      expect(container.firstChild.firstChild.firstChild.tagName).toEqual('feGaussianBlur'); // tag name is case sensitive
      expect(container.firstChild.firstChild.tagName).toEqual('filter');
      expect(container.firstChild.tagName).toEqual('svg');
    });
  }

  describe('CreateElement variations (non-JSX)', () => {
    it('Should handle events correctly when having multiple children', () => {
      let triggered = false;

      const App = () => {
        return h('div', null, [
          h('div', { className: 'title' }, 'Example'),
          h(
            'button',
            {
              type: 'button',
              onClick: () => {
                triggered = !triggered;
              }
            },
            'Do a thing'
          )
        ]);
      };

      // eslint-disable-next-line
      render(App(), container);
      expect(container.innerHTML).toBe(innerHTML('<div><div class="title">Example</div><button type="button">Do a thing</button></div>'));
      expect(triggered).toBe(false);

      const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
      buttons.forEach(button => button.click());

      expect(triggered).toBe(true);
    });

    it('Should handle events correctly when having single child', () => {
      let triggered = false;

      const app = () => {
        return h(
          'div',
          null,
          h(
            'button',
            {
              type: 'button',
              onClick: () => {
                triggered = !triggered;
              }
            },
            'Do a thing'
          )
        );
      };

      render(app(), container);
      expect(container.innerHTML).toBe(innerHTML('<div><button type="button">Do a thing</button></div>'));
      expect(triggered).toBe(false);

      const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
      buttons.forEach(button => button.click());

      expect(triggered).toBe(true);
    });

    it('Should allow passing childs through "children" property (native component)', () => {
      const app = () => {
        return h(
          'div',
          null,
          h('button', {
            type: 'button',
            children: ['Do a thing']
          })
        );
      };

      render(app(), container);
      expect(container.innerHTML).toBe(innerHTML('<div><button type="button">Do a thing</button></div>'));
    });

    it('Should allow passing childs through "children" property (custom component)', () => {
      const Button = props => h('button', props);
      const app = () => {
        return h(
          'div',
          null,
          h(Button, {
            type: 'button',
            children: ['Do a thing']
          })
        );
      };

      render(app(), container);
      expect(container.innerHTML).toBe(innerHTML('<div><button type="button">Do a thing</button></div>'));
    });

    it('Should handle node with hooks and key', done => {
      const node = () => h('div', { key: 'key2' }, 'Hooks');
      const app = h(node, {
        key: 'key1',
        onComponentDidMount(domNode) {
          expect(app.key).toBe('key1');
          expect(domNode.tagName).toBe('DIV');
          done();
        }
      });

      render(app, container);
      expect(container.innerHTML).toBe(innerHTML('<div>Hooks</div>'));
    });

    it('Should handle node with children but no props', () => {
      const node = () => h('div', null, 'Hooks');
      const app = h(node, null, 'Hooks');

      render(app, container);
      expect(container.innerHTML).toBe(innerHTML('<div>Hooks</div>'));
    });

    it('Should handle node with refs', done => {
      let myRef = 'myRef';

      const app = () => {
        const node = () =>
          h('a', {
            ref: c => (myRef = c)
          });
        return h(node, {
          onComponentDidMount() {
            expect(myRef.tagName).toBe('A');
            done();
          }
        });
      };
      render(h(app, null), container);
    });

    let shouldUpdate = false;

    class Test2 extends Component {
      shouldComponentUpdate() {
        return shouldUpdate;
      }

      render() {
        return h('div', { contenteditable: true }, this.props.foo);
      }
    }

    it('Should not fail contenteditable if text node has external change Github#1207 - createElement', () => {
      shouldUpdate = false;
      render(<Test2 foo="bar" />, container);
      expect(container.innerHTML).toBe(innerHTML('<div contenteditable="true">bar</div>'));
      render(<Test2 foo="yar" />, container);
      expect(container.innerHTML).toBe(innerHTML('<div contenteditable="true">bar</div>'));

      container.firstChild.removeChild(container.firstChild.firstChild); // When div is contentEditable user can remove whole text content
      expect(container.innerHTML).toBe(innerHTML('<div contenteditable="true"></div>'));

      shouldUpdate = true;
      render(<Test2 foo="foo" />, container);
      expect(container.innerHTML).toBe(innerHTML('<div contenteditable="true">foo</div>'));
      render(null, container);
      expect(container.innerHTML).toBe('');
    });
  });
});
