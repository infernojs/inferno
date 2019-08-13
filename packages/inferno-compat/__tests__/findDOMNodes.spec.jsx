import { Component, findDOMNode, render } from 'inferno-compat';

describe('findDOMNodes (JSX)', () => {
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

  describe('various tests to see if the DOM node is right for the component', () => {
    let instance1;
    let instance2;
    let instance3;
    let ref;
    const refFunc = dom => {
      if (dom) {
        ref = dom;
      }
    };

    class Example1 extends Component {
      render() {
        instance1 = this;
        return <div id="example1" />;
      }
    }

    class Example2 extends Component {
      render() {
        instance2 = this;
        return <div id="example2" />;
      }
    }

    class Example3 extends Component {
      render() {
        instance3 = this;
        return (
          <div id="example3" ref={refFunc}>
            <Example2 />
            <Example1 />
          </div>
        );
      }
    }

    it('simple findDOMNodes', () => {
      render(<Example1 />, container);
      expect(findDOMNode(instance1)).toBe(document.getElementById('example1'));
      render(null, container);
      expect(findDOMNode(instance1)).toBe(null);
      render(<Example2 />, container);
      expect(findDOMNode(instance2) === document.getElementById('example2')).toBe(true);
      render(<Example1 />, container);
      expect(findDOMNode(instance1) === document.getElementById('example1')).toBe(true);
      render(<Example3 />, container);
      expect(findDOMNode(instance3) === document.getElementById('example3')).toBe(true);
      expect(findDOMNode(instance2) === document.getElementById('example2')).toBe(true);
      expect(findDOMNode(instance1) === document.getElementById('example1')).toBe(true);
      render(null, container);
      expect(findDOMNode(instance1)).toBe(null);
      expect(findDOMNode(instance2)).toBe(null);
      expect(findDOMNode(instance3)).toBe(null);
      expect(findDOMNode(ref) === ref).toBe(true);
    });

    it('Non existent ref should return null', () => {
      expect(findDOMNode(null)).toBe(null);
      expect(findDOMNode({})).toBe(null);
    });

    it('finds the first child when a component returns a fragment', () => {
      class FragmentTester extends Component {
        render() {
          return [<div key="a" />, <span key="b" />];
        }
      }

      let instance = null;
      render(<FragmentTester ref={ref => (instance = ref)} />, container);

      expect(container.childNodes.length).toBe(2);

      const firstNode = findDOMNode(instance);
      expect(firstNode).toBe(container.firstChild);
      expect(firstNode.tagName).toBe('DIV');
    });

    it('finds the first child even when fragment is nested', () => {
      class Wrapper extends Component {
        render() {
          return this.props.children;
        }
      }

      class FragmentTester extends Component {
        render() {
          return [
            <Wrapper key="a">
              <div />
            </Wrapper>,
            <span key="b" />
          ];
        }
      }

      let instance = null;
      render(<FragmentTester ref={ref => (instance = ref)} />, container);

      expect(container.childNodes.length).toBe(2);

      const firstNode = findDOMNode(instance);
      expect(firstNode).toBe(container.firstChild);
      expect(firstNode.tagName).toBe('DIV');
    });

    it('finds the first child even when first child renders null', () => {
      class NullComponent extends Component {
        render() {
          return null;
        }
      }

      class FragmentTester extends Component {
        render() {
          return [<NullComponent key="a" />, <div key="b" />, <span key="c" />];
        }
      }

      let instance = null;
      ReactDOM.render(<FragmentTester ref={ref => (instance = ref)} />, container);

      expect(container.childNodes.length).toBe(3);

      const firstNode = findDOMNode(instance);
      expect(firstNode).toBe(container.firstChild);
      // expect(firstNode.tagName).toBe('DIV'); This is components placeholder
    });
  });
});
