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

describe('ReactMount', function () {
  it('should destroy a react root upon request', function () {
    const mainContainerDiv = document.createElement('div');
    document.body.appendChild(mainContainerDiv);

    const instanceOne = <div className="firstReactDiv" />;
    const firstRootDiv = document.createElement('div');
    mainContainerDiv.appendChild(firstRootDiv);
    ReactDOM.render(instanceOne, firstRootDiv);

    const instanceTwo = <div className="secondReactDiv" />;
    const secondRootDiv = document.createElement('div');
    mainContainerDiv.appendChild(secondRootDiv);
    ReactDOM.render(instanceTwo, secondRootDiv);

    // Test that two react roots are rendered in isolation
    expect(firstRootDiv.firstChild.className).toBe('firstReactDiv');
    expect(secondRootDiv.firstChild.className).toBe('secondReactDiv');

    // Test that after unmounting each, they are no longer in the document.
    ReactDOM.unmountComponentAtNode(firstRootDiv);
    expect(firstRootDiv.firstChild).toBeNull();
    ReactDOM.unmountComponentAtNode(secondRootDiv);
    expect(secondRootDiv.firstChild).toBeNull();
    document.body.removeChild(mainContainerDiv);
  });

  // it('should warn when unmounting a non-container root node', function() {
  //   var mainContainerDiv = document.createElement('div');

  //   var component =
  //     <div>
  //       <div />
  //     </div>;
  //   ReactDOM.render(component, mainContainerDiv);

  //   // Test that unmounting at a root node gives a helpful warning
  //   var rootDiv = mainContainerDiv.firstChild;
  //   spyOn(console, 'error');
  //   ReactDOM.unmountComponentAtNode(rootDiv);
  //   expect(console.error.calls.count()).toBe(1);
  //   expect(console.error.mostRecentCall.calls.argsFor(0)).toBe(
  //     'Warning: unmountComponentAtNode(): The node you\'re attempting to ' +
  //     'unmount was rendered by React and is not a top-level container. You ' +
  //     'may have accidentally passed in a React root node instead of its ' +
  //     'container.'
  //   );
  // });

  // it('should warn when unmounting a non-container, non-root node', function() {
  //   var mainContainerDiv = document.createElement('div');

  //   var component =
  //     <div>
  //       <div>
  //         <div />
  //       </div>
  //     </div>;
  //   ReactDOM.render(component, mainContainerDiv);

  //   // Test that unmounting at a non-root node gives a different warning
  //   var nonRootDiv = mainContainerDiv.firstChild.firstChild;
  //   spyOn(console, 'error');
  //   ReactDOM.unmountComponentAtNode(nonRootDiv);
  //   expect(console.error.calls.count()).toBe(1);
  //   expect(console.error.mostRecentCall.calls.argsFor(0)).toBe(
  //     'Warning: unmountComponentAtNode(): The node you\'re attempting to ' +
  //     'unmount was rendered by React and is not a top-level container. ' +
  //     'Instead, have the parent component update its state and rerender in ' +
  //     'order to remove this component.'
  //   );
  // });
});
