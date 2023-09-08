/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

import React from 'inferno-compat';
import { createComponentVNode } from 'inferno';
import { Wrapper } from 'inferno-test-utils';
import { VNodeFlags } from 'inferno-vnode-flags';

const ReactDOM = React;
const div = React.createFactory('div');

describe('ReactDOM', function () {
  let container;

  function renderIntoDocument(input) {
    return React.render(
      createComponentVNode(VNodeFlags.ComponentClass, Wrapper, {
        children: input,
      }),
      container,
    );
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    React.render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('allows a DOM element to be used with a string', function () {
    const element = React.createElement('div', { className: 'foo' });
    const instance = renderIntoDocument(element);
    expect(ReactDOM.findDOMNode(instance).tagName).toBe('DIV');
  });

  it('should allow children to be passed as an argument', function () {
    const argDiv = renderIntoDocument(div(null, 'child'));
    const argNode = ReactDOM.findDOMNode(argDiv);
    expect(argNode.innerHTML).toBe('child');
  });

  it('should overwrite props.children with children argument', function () {
    const conflictDiv = renderIntoDocument(
      div({ children: 'fakechild' }, 'child'),
    );
    const conflictNode = ReactDOM.findDOMNode(conflictDiv);
    expect(conflictNode.innerHTML).toBe('child');
  });

  /**
   * We need to make sure that updates occur to the actual node that's in the
   * DOM, instead of a stale cache.
   */
  it('should purge the DOM cache when removing nodes', function () {
    let myDiv = renderIntoDocument(
      <div>
        <div key="theDog" className="dog" />
        <div key="theBird" className="bird" />
      </div>,
    );
    // Warm the cache with theDog
    myDiv = renderIntoDocument(
      <div>
        <div key="theDog" className="dogbeforedelete" />
        <div key="theBird" className="bird" />
      </div>,
    );
    // Remove theDog - this should purge the cache
    myDiv = renderIntoDocument(
      <div>
        <div key="theBird" className="bird" />
      </div>,
    );
    // Now, put theDog back. It's now a different DOM node.
    myDiv = renderIntoDocument(
      <div>
        <div key="theDog" className="dog" />
        <div key="theBird" className="bird" />
      </div>,
    );
    // Change the className of theDog. It will use the same element
    myDiv = renderIntoDocument(
      <div>
        <div key="theDog" className="bigdog" />
        <div key="theBird" className="bird" />
      </div>,
    );

    const root = ReactDOM.findDOMNode(myDiv);
    const dog = root.childNodes[0];
    expect(dog.className).toBe('bigdog');
  });

  it('allow React.DOM factories to be called without warnings', function () {
    spyOn(console, 'error');
    const element = div();
    expect(element.type).toBe('div');
    expect(console.error.calls.count()).toBe(0);
  });
});
