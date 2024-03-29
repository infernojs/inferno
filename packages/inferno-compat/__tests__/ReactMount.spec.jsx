/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

import React from 'inferno-compat';

const ReactDOM = React;
const mocks = {
  getMockFunction: function () {
    return jasmine.createSpy();
  },
};

describe('ReactMount', function () {
  const ReactMount = React;
  let WebComponents;

  try {
    if (WebComponents === undefined && typeof jest !== 'undefined') {
      // WebComponents = require('WebComponents');
    }
  } catch (e) {
    // Parse error expected on engines that don't support setters
    // or otherwise aren't supportable by the polyfill.
    // Leave WebComponents undefined.
  }

  it('throws when given a factory', function () {
    class Component extends React.Component {
      render() {
        return <div />;
      }
    }

    expect(function () {
      React.render(Component, document.createElement('div'));
    }).toThrow();
  });

  it('should render different components in same root', function () {
    const container = document.createElement('container');
    document.body.appendChild(container);

    ReactMount.render(<div />, container);
    expect(container.firstChild.nodeName).toBe('DIV');

    ReactMount.render(<span />, container);
    expect(container.firstChild.nodeName).toBe('SPAN');
    document.body.removeChild(container);
  });

  it('should unmount and remount if the key changes', function () {
    const container = document.createElement('container');

    const mockMount = mocks.getMockFunction();
    const mockUnmount = mocks.getMockFunction();

    class Component extends React.Component {
      componentDidMount() {
        mockMount();
      }

      componentWillUnmount() {
        mockUnmount();
      }

      render() {
        return <span>{this.props.text}</span>;
      }
    }

    expect(mockMount.calls.count()).toBe(0);
    expect(mockUnmount.calls.count()).toBe(0);

    ReactMount.render(<Component text="orange" key="A" />, container);
    expect(container.firstChild.innerHTML).toBe('orange');
    expect(mockMount.calls.count()).toBe(1);
    expect(mockUnmount.calls.count()).toBe(0);

    // If we change the key, the component is unmounted and remounted
    ReactMount.render(<Component text="green" key="B" />, container);
    expect(container.firstChild.innerHTML).toBe('green');
    expect(mockMount.calls.count()).toBe(2);
    expect(mockUnmount.calls.count()).toBe(1);

    // But if we don't change the key, the component instance is reused
    ReactMount.render(<Component text="blue" key="B" />, container);
    expect(container.firstChild.innerHTML).toBe('blue');
    expect(mockMount.calls.count()).toBe(2);
    expect(mockUnmount.calls.count()).toBe(1);
  });

  it('should reuse markup if rendering to the same target twice', function () {
    const container = document.createElement('container');
    const instance1 = ReactDOM.render(<div />, container);
    const instance2 = ReactDOM.render(<div />, container);

    expect(instance1 === instance2).toBe(true);
  });

  // it('should warn if mounting into dirty rendered markup', function() {
  //   var container = document.createElement('container');
  //   container.innerHTML = ReactDOMServer.renderToString(<div />) + ' ';

  //   spyOn(console, 'error');
  //   ReactMount.render(<div />, container);
  //   expect(console.error.calls.count()).toBe(1);

  //   container.innerHTML = ' ' + ReactDOMServer.renderToString(<div />);

  //   ReactMount.render(<div />, container);
  //   expect(console.error.calls.count()).toBe(2);
  // });

  // it('should warn when mounting into document.body', function() {
  //   var iFrame = document.createElement('iframe');
  //   document.body.appendChild(iFrame);
  //   spyOn(console, 'error');

  //   ReactMount.render(<div />, iFrame.contentDocument.body);

  //   expect(console.error.calls.count()).toBe(1);
  //   expect(console.error.calls[0].calls.argsFor(0)[0]).toContain(
  //     'Rendering components directly into document.body is discouraged'
  //   );
  // });

  // it('should account for escaping on a checksum mismatch', function() {
  //   var div = document.createElement('div');
  //   var markup = ReactDOMServer.renderToString(
  //     <div>This markup contains an nbsp entity: &nbsp; server text</div>);
  //   div.innerHTML = markup;

  //   spyOn(console, 'error');
  //   ReactDOM.render(
  //     <div>This markup contains an nbsp entity: &nbsp; client text</div>,
  //     div
  //   );
  //   expect(console.error.calls.count()).toBe(1);
  //   expect(console.error.calls[0].calls.argsFor(0)[0]).toContain(
  //     ' (client) nbsp entity: &nbsp; client text</div>\n' +
  //     ' (server) nbsp entity: &nbsp; server text</div>'
  //   );
  // });

  if (WebComponents !== undefined) {
    it('should allow mounting/unmounting to document fragment container', function () {
      let shadowRoot;
      const proto = Object.create(HTMLElement.prototype, {
        createdCallback: {
          value: function () {
            shadowRoot = this.createShadowRoot();
            ReactDOM.render(<div>Hi, from within a WC!</div>, shadowRoot);
            expect(shadowRoot.firstChild.tagName).toBe('DIV');
            ReactDOM.render(<span>Hi, from within a WC!</span>, shadowRoot);
            expect(shadowRoot.firstChild.tagName).toBe('SPAN');
          },
        },
      });
      proto.unmount = function () {
        ReactDOM.unmountComponentAtNode(shadowRoot);
      };
      document.registerElement('x-foo', { prototype: proto });
      const element = document.createElement('x-foo');
      element.unmount();
    });
  }

  it('should not crash in node cache when unmounting', function () {
    class Component extends React.Component {
      render() {
        // Add refs to some nodes so that they get traversed and cached
        return (
          <div>
            <div>b</div>
            {this.props.showC && <div>c</div>}
          </div>
        );
      }
    }

    const container = document.createElement('container');

    ReactDOM.render(
      <div>
        <Component showC={false} />
      </div>,
      container,
    );

    // Right now, A and B are in the cache. When we add C, it won't get added to
    // the cache (assuming markup-string mode).
    ReactDOM.render(
      <div>
        <Component showC={true} />
      </div>,
      container,
    );

    // Remove A, B, and C. Unmounting C shouldn't cause B to get recached.
    ReactDOM.render(<div />, container);

    // Add them back -- this shouldn't cause a cached node collision.
    ReactDOM.render(
      <div>
        <Component showC={true} />
      </div>,
      container,
    );

    ReactDOM.unmountComponentAtNode(container);
  });

  it('should not crash in node cache when unmounting, case 2', function () {
    class A extends React.Component {
      render() {
        return <a key={this.props.innerKey}>{this.props.innerKey}</a>;
      }
    }
    class Component extends React.Component {
      render() {
        return (
          <b>
            <i>{this.props.step === 1 && <q />}</i>
            {this.props.step === 1 && <A innerKey={this.props.step} />}
          </b>
        );
      }
    }

    const container = document.createElement('container');

    ReactDOM.render(<Component step={1} />, container);
    ReactDOM.render(<Component step={2} />, container);
    ReactDOM.render(<Component step={1} />, container);
    // ReactMount.getID(container.querySelector('a'));
  });
});
