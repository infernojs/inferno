import { Component, createTextVNode, createVNode, render } from 'inferno';
import { initDevTools } from 'inferno-devtools';

describe('Devtools', () => {
  let container;
  let ComponentTree;
  let Mount;
  let Reconciler;
  let listener;

  beforeAll(function() {
    // tslint:disable-next-line
    window['__REACT_DEVTOOLS_GLOBAL_HOOK__'] = {
      inject(hooks) {
        listener = hooks._listener;
        ComponentTree = hooks.ComponentTree;

        Mount = hooks.Mount;
        spyOn(Mount, '_renderNewRootComponent');

        Reconciler = hooks.Reconciler;
        spyOn(Reconciler, 'mountComponent');
        spyOn(Reconciler, 'performUpdateIfNecessary');
        spyOn(Reconciler, 'receiveComponent');
        spyOn(Reconciler, 'unmountComponent');
      }
    };

    initDevTools();
  });

  beforeEach(function() {
    container = document.createElement('div');
    listener({
      data: {
        payload: {
          type: 'resume'
        },
        source: 'react-devtools-content-script'
      },
      source: window
    });

    document.body.appendChild(container);

    Mount._renderNewRootComponent.calls.reset();
    Reconciler.mountComponent.calls.reset();
    Reconciler.performUpdateIfNecessary.calls.reset();
    Reconciler.receiveComponent.calls.reset();
    Reconciler.unmountComponent.calls.reset();
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('Should inject the callbacks', () => {
    expect(ComponentTree).toBeDefined();
    expect(Mount).toBeDefined();
    expect(Reconciler).toBeDefined();
  });

  it('Should register root components', () => {
    class DevToolsTester extends Component {
      public render() {
        return <div>Test</div>;
      }
    }

    render(<DevToolsTester />, container);

    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(2); // Root, div
    expect(Mount._renderNewRootComponent).toHaveBeenCalledTimes(1);
    expect(Object.keys(Mount._instancesByReactRootID)).toEqual(['.0']);

    // Add another root

    const root2 = document.createElement('div');
    document.body.appendChild(root2);
    render(<DevToolsTester />, root2);

    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(4); // Root, div
    expect(Mount._renderNewRootComponent).toHaveBeenCalledTimes(2);
    expect(Object.keys(Mount._instancesByReactRootID)).toEqual(['.0', '.1']);

    // Remove first root
    render(null, container);

    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(4);
    expect(Mount._renderNewRootComponent).toHaveBeenCalledTimes(2);
    expect(Reconciler.unmountComponent).toHaveBeenCalledTimes(1);
    expect(Object.keys(Mount._instancesByReactRootID)).toEqual(['.1']);

    // Add first root back
    render(<DevToolsTester />, container);

    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(6);
    expect(Mount._renderNewRootComponent).toHaveBeenCalledTimes(3);
    expect(Reconciler.unmountComponent).toHaveBeenCalledTimes(1);
    expect(Object.keys(Mount._instancesByReactRootID)).toEqual(['.1', '.2']);

    // Remove both
    render(null, container);
    render(null, root2);

    expect(Object.keys(Mount._instancesByReactRootID)).toEqual([]);

    // Verify it does not fail on extra unmounts
    render(null, container);
    render(null, root2);

    expect(Object.keys(Mount._instancesByReactRootID)).toEqual([]);

    document.body.removeChild(root2);
  });

  it('Should handle children arrays adding & removing', () => {
    let instance;

    class TestToolTester extends Component {
      constructor(props, context) {
        super(props, context);

        this.state = {
          nodes: null
        };

        instance = this;
      }

      public render(_props, state) {
        return <div>{!state.nodes ? null : state.nodes}</div>;
      }
    }

    render(<TestToolTester />, container);

    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(2);
    expect(container.innerHTML).toEqual('<div></div>');

    let nodes: any = [<div>first</div>, <div>second</div>];

    instance.setState({
      nodes
    });

    expect(container.innerHTML).toEqual('<div><div>first</div><div>second</div></div>');
    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(4);

    nodes = [<div>first</div>, <div>middle</div>, <div>second</div>];

    instance.setState({
      nodes
    });

    expect(container.innerHTML).toEqual('<div><div>first</div><div>middle</div><div>second</div></div>');
    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(5);

    // Remove all

    nodes = null;

    instance.setState({
      nodes
    });

    expect(Reconciler.unmountComponent).toHaveBeenCalledTimes(3);

    const devToolRoot = Mount._instancesByReactRootID[Object.keys(Mount._instancesByReactRootID)[0]];

    expect(devToolRoot._renderedComponent._renderedChildren).toEqual(null);
  });

  it('Should handle adding & removing single vNode children', () => {
    let instance;

    class TestToolTester extends Component {
      constructor(props, context) {
        super(props, context);

        this.state = {
          nodes: null
        };

        instance = this;
      }

      public render(_props, state) {
        return <div>{!state.nodes ? null : state.nodes}</div>;
      }
    }

    render(<TestToolTester />, container);

    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(2);
    expect(container.innerHTML).toEqual('<div></div>');

    const devToolRoot = Mount._instancesByReactRootID[Object.keys(Mount._instancesByReactRootID)[0]];

    let nodes: any = <div>second</div>;

    // Add single
    instance.setState({
      nodes
    });

    expect(devToolRoot._renderedComponent._renderedChildren[0]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[0]._stringText).toBe('second');
    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(3);

    nodes = <div>first</div>;

    // Update
    instance.setState({
      nodes
    });

    expect(devToolRoot._renderedComponent._renderedChildren[0]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[0]._stringText).toBe('first');

    nodes = null;

    // Remove
    instance.setState({
      nodes
    });

    expect(devToolRoot._renderedComponent._renderedChildren).toBe(null);

    nodes = <div key="test1">second</div>;

    // Add single
    instance.setState({
      nodes
    });

    expect(devToolRoot._renderedComponent._renderedChildren[0]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[0]._stringText).toBe('second');

    nodes = <div key="test2">test2</div>;

    // Update by changing key
    instance.setState({
      nodes
    });

    expect(devToolRoot._renderedComponent._renderedChildren[0]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[0]._stringText).toBe('test2');

    // Update by changing type
    nodes = <span>ok</span>;

    instance.setState({
      nodes
    });

    expect(devToolRoot._renderedComponent._renderedChildren[0]._currentElement.type).toBe('span');
    expect(devToolRoot._renderedComponent._renderedChildren[0]._stringText).toBe('ok');
  });

  it('Should handle keyed child arrays', () => {
    let instance;

    class TestToolTester extends Component {
      constructor(props, context) {
        super(props, context);

        this.state = {
          nodes: null
        };

        instance = this;
      }

      public render(_props, state) {
        return <div>{!state.nodes ? null : state.nodes}</div>;
      }
    }

    render(<TestToolTester />, container);

    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(2);
    expect(container.innerHTML).toEqual('<div></div>');

    let nodes: any = [<div key="1"></div>, <div key="2"></div>];

    instance.setState({
      nodes
    });

    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(4);
    expect(Reconciler.unmountComponent).toHaveBeenCalledTimes(0);

    nodes = [<div key="1"></div>, <div key="x1"></div>, <div key="x2"></div>, <div key="x3"></div>, <div key="x4"></div>, <div key="2"></div>];

    instance.setState({
      nodes
    });

    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(9);
    expect(Reconciler.unmountComponent).toHaveBeenCalledTimes(1);

    nodes = [<div key="1"></div>, <div key="x1"></div>, <div key="x2"></div>, <div key="2"></div>];

    instance.setState({
      nodes
    });

    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(10);
    expect(Reconciler.unmountComponent).toHaveBeenCalledTimes(4);
  });

  it('Should always convert devtools numeric children to string, devTool crash if children is number', () => {
    let instance;

    class TestToolTester extends Component {
      constructor(props, context) {
        super(props, context);

        this.state = {
          nodes: null
        };

        instance = this;
      }

      public render(_props, state) {
        return <div>{!state.nodes ? null : state.nodes}</div>;
      }
    }

    render(<TestToolTester />, container);

    expect(Reconciler.mountComponent).toHaveBeenCalledTimes(2);
    expect(container.innerHTML).toEqual('<div></div>');

    instance.setState({
      nodes: [
        createVNode(1, 'div', null, 1, 16, null, '1'),
        createVNode(1, 'div', null, [1, 2], 0, null, '2'),
        createVNode(1, 'div', null, [createTextVNode(1), createTextVNode(2)], 0, null, '3'),
        createVNode(1, 'div', null, 1001, 16, null, '4')
      ]
    });

    let devToolRoot = Mount._instancesByReactRootID[Object.keys(Mount._instancesByReactRootID)[0]];

    expect(devToolRoot._renderedComponent._renderedChildren[0]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[0]._stringText).toBe('1');

    expect(devToolRoot._renderedComponent._renderedChildren[1]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[1]._renderedChildren[0]._currentElement).toBe('1');
    expect(devToolRoot._renderedComponent._renderedChildren[1]._renderedChildren[0]._stringText).toBe('1');
    expect(devToolRoot._renderedComponent._renderedChildren[1]._renderedChildren[1]._currentElement).toBe('2');
    expect(devToolRoot._renderedComponent._renderedChildren[1]._renderedChildren[1]._stringText).toBe('2');

    expect(devToolRoot._renderedComponent._renderedChildren[2]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[1]._renderedChildren[0]._currentElement).toBe('1');
    expect(devToolRoot._renderedComponent._renderedChildren[2]._renderedChildren[0]._stringText).toBe('1');
    expect(devToolRoot._renderedComponent._renderedChildren[2]._renderedChildren[1]._currentElement).toBe('2');
    expect(devToolRoot._renderedComponent._renderedChildren[2]._renderedChildren[1]._stringText).toBe('2');

    expect(devToolRoot._renderedComponent._renderedChildren[3]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[3]._stringText).toBe('1001');

    instance.setState({
      nodes: [
        createVNode(1, 'div', null, 8, 16, null, '1'),
        createVNode(1, 'div', null, [8, 9], 0, null, '2'),
        createVNode(1, 'div', null, [createTextVNode(8), createTextVNode(9)], 0, null, '3'),
        createVNode(1, 'div', null, 899, 16, null, '4')
      ]
    });

    devToolRoot = Mount._instancesByReactRootID[Object.keys(Mount._instancesByReactRootID)[0]];

    expect(devToolRoot._renderedComponent._renderedChildren[0]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[0]._stringText).toBe('8');

    expect(devToolRoot._renderedComponent._renderedChildren[1]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[1]._renderedChildren[0]._currentElement).toBe('8');
    expect(devToolRoot._renderedComponent._renderedChildren[1]._renderedChildren[0]._stringText).toBe('8');
    expect(devToolRoot._renderedComponent._renderedChildren[1]._renderedChildren[1]._currentElement).toBe('9');
    expect(devToolRoot._renderedComponent._renderedChildren[1]._renderedChildren[1]._stringText).toBe('9');

    expect(devToolRoot._renderedComponent._renderedChildren[2]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[1]._renderedChildren[0]._currentElement).toBe('8');
    expect(devToolRoot._renderedComponent._renderedChildren[2]._renderedChildren[0]._stringText).toBe('8');
    expect(devToolRoot._renderedComponent._renderedChildren[2]._renderedChildren[1]._currentElement).toBe('9');
    expect(devToolRoot._renderedComponent._renderedChildren[2]._renderedChildren[1]._stringText).toBe('9');

    expect(devToolRoot._renderedComponent._renderedChildren[3]._currentElement.type).toBe('div');
    expect(devToolRoot._renderedComponent._renderedChildren[3]._stringText).toBe('899');
  });
});
