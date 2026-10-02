/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

import React from 'inferno-compat';

const ReactDOM = React;
const mocks = {
  getMockFunction: function () {
    return jasmine.createSpy();
  },
};

describe('ReactMultiChild', function () {
  describe('reconciliation', function () {
    it('should update children when possible', function () {
      const container = document.createElement('div');

      const mockMount = mocks.getMockFunction();
      const mockUpdate = mocks.getMockFunction();
      const mockUnmount = mocks.getMockFunction();

      class MockComponent extends React.Component {
        componentDidMount() {
          mockMount();
        }

        componentDidUpdate() {
          mockUpdate();
        }

        componentWillUnmount() {
          mockUnmount();
        }

        render() {
          return <span />;
        }
      }

      expect(mockMount.calls.count()).toBe(0);
      expect(mockUpdate.calls.count()).toBe(0);
      expect(mockUnmount.calls.count()).toBe(0);

      ReactDOM.render(
        <div>
          <MockComponent />
        </div>,
        container,
      );

      expect(mockMount.calls.count()).toBe(1);
      expect(mockUpdate.calls.count()).toBe(0);
      expect(mockUnmount.calls.count()).toBe(0);

      ReactDOM.render(
        <div>
          <MockComponent />
        </div>,
        container,
      );

      expect(mockMount.calls.count()).toBe(1);
      expect(mockUpdate.calls.count()).toBe(1);
      expect(mockUnmount.calls.count()).toBe(0);
    });

    it('should replace children with different constructors', function () {
      const container = document.createElement('div');

      const mockMount = mocks.getMockFunction();
      const mockUnmount = mocks.getMockFunction();

      class MockComponent extends React.Component {
        componentDidMount() {
          mockMount();
        }

        componentWillUnmount() {
          mockUnmount();
        }

        render() {
          return <span />;
        }
      }

      expect(mockMount.calls.count()).toBe(0);
      expect(mockUnmount.calls.count()).toBe(0);

      ReactDOM.render(
        <div>
          <MockComponent />
        </div>,
        container,
      );

      expect(mockMount.calls.count()).toBe(1);
      expect(mockUnmount.calls.count()).toBe(0);

      ReactDOM.render(
        <div>
          <span />
        </div>,
        container,
      );

      expect(mockMount.calls.count()).toBe(1);
      expect(mockUnmount.calls.count()).toBe(1);
    });

    it('should NOT replace children with different owners', function () {
      const container = document.createElement('div');

      const mockMount = mocks.getMockFunction();
      const mockUnmount = mocks.getMockFunction();

      class MockComponent extends React.Component {
        componentDidMount() {
          mockMount();
        }

        componentWillUnmount() {
          mockUnmount();
        }

        render() {
          return <span />;
        }
      }

      class WrapperComponent extends React.Component {
        render() {
          return this.props.children || <MockComponent />;
        }
      }

      expect(mockMount.calls.count()).toBe(0);
      expect(mockUnmount.calls.count()).toBe(0);

      ReactDOM.render(<WrapperComponent />, container);

      expect(mockMount.calls.count()).toBe(1);
      expect(mockUnmount.calls.count()).toBe(0);

      ReactDOM.render(
        <WrapperComponent>
          <MockComponent />
        </WrapperComponent>,
        container,
      );

      expect(mockMount.calls.count()).toBe(1);
      expect(mockUnmount.calls.count()).toBe(0);
    });

    it('should replace children with different keys', function () {
      const container = document.createElement('div');

      const mockMount = mocks.getMockFunction();
      const mockUnmount = mocks.getMockFunction();

      class MockComponent extends React.Component {
        componentDidMount() {
          mockMount();
        }

        componentWillUnmount() {
          mockUnmount();
        }

        render() {
          return <span />;
        }
      }

      expect(mockMount.calls.count()).toBe(0);
      expect(mockUnmount.calls.count()).toBe(0);

      ReactDOM.render(
        <div>
          <MockComponent key="A" />
        </div>,
        container,
      );

      expect(mockMount.calls.count()).toBe(1);
      expect(mockUnmount.calls.count()).toBe(0);

      ReactDOM.render(
        <div>
          <MockComponent key="B" />
        </div>,
        container,
      );

      expect(mockMount.calls.count()).toBe(2);
      expect(mockUnmount.calls.count()).toBe(1);
    });
  });

  // describe('innerHTML', function() {
  //   var setInnerHTML;

  //   // Only run this suite if `Element.prototype.innerHTML` can be spied on.
  //   var innerHTMLDescriptor = Object.getOwnPropertyDescriptor(
  //     Element.prototype,
  //     'innerHTML'
  //   );
  //   if (!innerHTMLDescriptor) {
  //     return;
  //   }

  //   beforeEach(function() {
  //     var ReactDOMFeatureFlags = require('ReactDOMFeatureFlags');
  //     ReactDOMFeatureFlags.useCreateElement = false;

  //     Object.defineProperty(Element.prototype, 'innerHTML', {
  //       set: setInnerHTML = jasmine.createSpy().andCallFake(
  //         innerHTMLDescriptor.set
  //       ),
  //     });
  //   });

  //   it('should only set `innerHTML` once on update', function() {
  //     var container = document.createElement('div');

  //     ReactDOM.render(
  //       <div>
  //         <p><span /></p>
  //         <p><span /></p>
  //         <p><span /></p>
  //       </div>,
  //       container
  //     );
  //     // Warm the cache used by `getMarkupWrap`.
  //     ReactDOM.render(
  //       <div>
  //         <p><span /><span /></p>
  //         <p><span /><span /></p>
  //         <p><span /><span /></p>
  //       </div>,
  //       container
  //     );
  //     expect(setInnerHTML).toHaveBeenCalled();
  //     var callCountOnMount = setInnerHTML.calls.count();

  //     ReactDOM.render(
  //       <div>
  //         <p><span /><span /><span /></p>
  //         <p><span /><span /><span /></p>
  //         <p><span /><span /><span /></p>
  //       </div>,
  //       container
  //     );
  //     expect(setInnerHTML.calls.count()).toBe(callCountOnMount + 1);
  //   });
  // });
});
