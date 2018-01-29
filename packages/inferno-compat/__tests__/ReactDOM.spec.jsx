/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

import React from 'inferno-compat';
import { createComponentVNode, render } from 'inferno';
import { Wrapper } from 'inferno-test-utils';
import { VNodeFlags } from 'inferno-vnode-flags';

var ReactDOM = React;
var div = React.createFactory('div');

describe('ReactDOM', function() {
  let container;

  function renderIntoDocument(input) {
    return render(createComponentVNode(VNodeFlags.ComponentClass, Wrapper, { children: input }), container);
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  // TODO: uncomment this test once we can run in phantom, which
  // supports real submit events.
  /*
  it('should bubble onSubmit', function() {
    var count = 0;
    var form;
    var Parent = React.createClass({
      handleSubmit: function() {
        count++;
        return false;
      },
      render: function() {
        return <Child />;
      }
    });
    var Child = React.createClass({
      render: function() {
        return <form><input type="submit" value="Submit" /></form>;
      },
      componentDidMount: function() {
        form = ReactDOM.findDOMNode(this);
      }
    });
    var instance = ReactTestUtils.renderIntoDocument(<Parent />);
    form.submit();
    expect(count).toEqual(1);
  });
  */

  it('allows a DOM element to be used with a string', function() {
    var element = React.createElement('div', { className: 'foo' });
    var instance = renderIntoDocument(element);
    expect(ReactDOM.findDOMNode(instance).tagName).toBe('DIV');
  });

  it('should allow children to be passed as an argument', function() {
    var argDiv = renderIntoDocument(div(null, 'child'));
    var argNode = ReactDOM.findDOMNode(argDiv);
    expect(argNode.innerHTML).toBe('child');
  });

  it('should overwrite props.children with children argument', function() {
    var conflictDiv = renderIntoDocument(div({ children: 'fakechild' }, 'child'));
    var conflictNode = ReactDOM.findDOMNode(conflictDiv);
    expect(conflictNode.innerHTML).toBe('child');
  });

  /**
   * We need to make sure that updates occur to the actual node that's in the
   * DOM, instead of a stale cache.
   */
  it('should purge the DOM cache when removing nodes', function() {
    var myDiv = renderIntoDocument(
      <div>
        <div key="theDog" className="dog" />
        <div key="theBird" className="bird" />
      </div>
    );
    // Warm the cache with theDog
    myDiv = renderIntoDocument(
      <div>
        <div key="theDog" className="dogbeforedelete" />
        <div key="theBird" className="bird" />
      </div>
    );
    // Remove theDog - this should purge the cache
    myDiv = renderIntoDocument(
      <div>
        <div key="theBird" className="bird" />
      </div>
    );
    // Now, put theDog back. It's now a different DOM node.
    myDiv = renderIntoDocument(
      <div>
        <div key="theDog" className="dog" />
        <div key="theBird" className="bird" />
      </div>
    );
    // Change the className of theDog. It will use the same element
    myDiv = renderIntoDocument(
      <div>
        <div key="theDog" className="bigdog" />
        <div key="theBird" className="bird" />
      </div>
    );

    var root = ReactDOM.findDOMNode(myDiv);
    var dog = root.childNodes[0];
    expect(dog.className).toBe('bigdog');
  });

  it('allow React.DOM factories to be called without warnings', function() {
    spyOn(console, 'error');
    var element = div();
    expect(element.type).toBe('div');
    expect(console.error.calls.count()).toBe(0);
  });
});
