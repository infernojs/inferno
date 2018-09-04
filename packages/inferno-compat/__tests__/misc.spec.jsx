import { innerHTML } from 'inferno-utils';
import React, {
  __spread,
  Children,
  cloneElement,
  Component,
  createClass,
  createElement,
  render,
  hydrate,
  isValidElement,
  PropTypes,
  unstable_renderSubtreeIntoContainer
} from 'inferno-compat';

describe('MISC', () => {
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

  describe('PropTypes', () => {
    it('PropTypes should exists in inferno-compat', () => {
      expect(typeof PropTypes).toBe('object');
      expect(PropTypes.any()).toBeTruthy();
      expect(typeof PropTypes.any().isRequired).toBe('function');
      expect(PropTypes.any().isRequired()).toBeUndefined();
    });

    it('checkPropTypes should return null', () => {
      expect(PropTypes.checkPropTypes()).toBeNull();
    });
  });

  describe('React Synthetic event simulation', () => {
    it('should have isPropagationStopped and isDefaultPrevented defined in Event prototype', () => {
      const spyObj = {
        foo: event => {
          expect(event.isDefaultPrevented()).toBe(false);
          expect(event.isPropagationStopped()).toBe(false);

          event.preventDefault();
          expect(event.isDefaultPrevented()).toBe(true);

          event.stopPropagation();
          expect(event.isPropagationStopped()).toBe(true);
        }
      };
      spyOn(spyObj, 'foo').and.callThrough();

      render(<div onClick={spyObj.foo} />, container);

      container.firstChild.click();

      expect(spyObj.foo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Children Only', () => {
    it('Should return first of array', () => {
      const divOne = <div />;
      const children = [divOne];

      expect(Children.only(children)).toBe(divOne);
    });

    it('Should two if children length is not one', () => {
      const divOne = <div />;
      const children = [divOne, 'two', 3];

      expect(() => Children.only(children)).toThrow();
    });
  });

  describe('Children toArray', () => {
    it('Should return child in array', () => {
      const divOne = <div />;

      expect(Children.toArray(divOne)).toEqual([divOne]);
    });

    it('Should return array if its already array', () => {
      const children = [<div />];

      expect(Children.toArray(children)).toEqual(children);
    });

    it('Should return empty array if its null/undef', () => {
      const children = null;

      expect(Children.toArray(children)).toEqual([]);
    });
  });

  describe('render()', () => {
    it('should be exported', () => {
      expect(React.render).toBe(render);
    });

    it('should replace isomorphic content', () => {
      let ce = type => document.createElement(type);
      let Text = text => document.createTextNode(text);
      let root = ce('div');
      let initialChild = ce('div');
      initialChild.appendChild(Text('initial content'));
      root.appendChild(initialChild);

      hydrate(<div>dynamic content</div>, root);
      expect(root.textContent).toEqual('dynamic content');
    });

    it('hydrate should remove extra elements', () => {
      let ce = type => document.createElement(type);
      let Text = text => document.createTextNode(text);
      let root = ce('div');

      let c1 = ce('div');
      c1.appendChild(Text('isomorphic content'));
      root.appendChild(c1);

      let c2 = ce('div');
      c2.appendChild(Text('extra content'));
      root.appendChild(c2);

      hydrate(<div>dynamic content</div>, root);
      expect(root.textContent).toEqual('dynamic content');
    });

    it('should remove text nodes', () => {
      let ce = type => document.createElement(type);
      let Text = text => document.createTextNode(text);
      let root = ce('div');

      root.appendChild(Text('Text Content in the root'));
      root.appendChild(Text('More Text Content'));

      hydrate(<div>dynamic content</div>, root);
      expect(root.textContent).toEqual('dynamic content');
    });

    it('should support defaultValue', () => {
      let div2 = document.createElement('div');
      (document.body || document.documentElement).appendChild(div2);
      render(<input defaultValue="foo" />, div2);
      expect(div2.firstElementChild.value).toBe('foo');

      render(null, div2);
      document.body.removeChild(div2);
    });
  });

  describe('createClass()', () => {
    it('should be exported', () => {
      expect(React.createClass).toBe(createClass);
    });

    it('should not bind blacklisted methods', () => {
      let constructor = () => {};
      let render = () => null;
      const C = createClass({
        constructor,
        render
      });
      let c = new C();
      expect(c.constructor).toBe(constructor);
      expect(c.render).toBe(render);
    });

    it('should copy statics', () => {
      let def = {
        statics: {
          foo: 'bar',
          baz() {}
        }
      };
      let c = createClass(def);
      expect(c.foo).toEqual(def.statics.foo);
      expect(c.baz).toEqual(def.statics.baz);
    });
  });

  describe('createElement()', () => {
    it('should be exported', () => {
      expect(React.createElement).toBe(createElement);
    });
  });

  describe('Component', () => {
    it('should be exported', () => {
      expect(React.Component).toEqual(Component);
    });
  });

  describe('cloneElement', () => {
    it('should clone elements', () => {
      let element = (
        <foo a="b" c="d">
          a<span>b</span>
        </foo>
      );
      expect(JSON.stringify(cloneElement(element).children)).toEqual(JSON.stringify(element.children));
    });

    it('should support props.children', () => {
      let element = <foo children={<span>b</span>} />;
      let clone = cloneElement(element);
      expect(JSON.stringify(clone)).toEqual(JSON.stringify(element));
      expect(cloneElement(clone).props.children).toEqual(element.props.children);
    });

    it('children take precedence over props.children', () => {
      let element = (
        <foo children={<span>c</span>}>
          <div>b</div>
        </foo>
      );
      let clone = cloneElement(element);
      expect(JSON.stringify(clone)).toEqual(JSON.stringify(element));
    });

    it('should support children in prop argument', () => {
      let element = <foo />;
      let children = [<span>b</span>];
      let clone = cloneElement(element, { children });
      expect(JSON.stringify(clone.children)).toEqual(JSON.stringify(children));
    });

    it('children argument takes precedence over props.children', () => {
      let element = <foo />;
      let childrenA = [<span>b</span>];
      let childrenB = [<div>c</div>];
      let clone = cloneElement(element, { children: childrenA }, childrenB);
      expect(JSON.stringify(clone.children)).toEqual(JSON.stringify(childrenB));
    });

    it('children argument takes precedence over props.children even if falsey', () => {
      let element = <foo />;
      let childrenA = [<span>b</span>];
      let clone = cloneElement(element, { children: childrenA }, undefined);
      expect(clone.children).toEqual(null);
    });
  });

  describe('unstable_renderSubtreeIntoContainer', () => {
    class Inner extends Component {
      render() {
        return null;
      }
      getNode() {
        return 'inner';
      }
    }

    it('should export instance', () => {
      class App extends Component {
        render() {
          return null;
        }
        componentDidMount() {
          this.renderInner();
        }
        renderInner() {
          const wrapper = document.createElement('div');
          this.inner = unstable_renderSubtreeIntoContainer(this, <Inner />, wrapper);
        }
      }
      const root = document.createElement('div');
      const app = render(<App />, root);
      expect(typeof app.inner.getNode === 'function').toEqual(true);
    });

    it('should there must be a context in callback', () => {
      class App extends Component {
        render() {
          return null;
        }
        componentDidMount() {
          this.renderInner();
        }
        renderInner() {
          const wrapper = document.createElement('div');
          const self = this;
          unstable_renderSubtreeIntoContainer(this, <Inner />, wrapper, function() {
            self.inner = this;
          });
        }
      }
      const root = document.createElement('div');
      const app = render(<App />, root);
      expect(typeof app.inner.getNode === 'function').toEqual(true);
    });
  });
});
