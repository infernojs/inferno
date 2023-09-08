/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

import React from 'inferno-compat';

describe('onlyChild', function () {
  let onlyChild;
  class WrapComponent extends React.Component {
    render() {
      return (
        <div>{onlyChild(this.props.children, this.props.mapFn, this)}</div>
      );
    }
  }

  beforeEach(function () {
    onlyChild = React.Children.only;
  });

  it('should fail when passed two children', function () {
    expect(function () {
      const instance = (
        <WrapComponent>
          <div />
          <span />
        </WrapComponent>
      );
      onlyChild(instance.props.children);
    }).toThrow();
  });

  it('should fail when passed nully values', function () {
    expect(function () {
      const instance = <WrapComponent>{null}</WrapComponent>;
      onlyChild(instance.props.children);
    }).toThrow();

    expect(function () {
      const instance = <WrapComponent>{undefined}</WrapComponent>;
      onlyChild(instance.props.children);
    }).toThrow();
  });

  it('should not fail when passed interpolated single child', function () {
    expect(function () {
      const instance = <WrapComponent>{<span />}</WrapComponent>;
      onlyChild(instance.props.children);
    }).not.toThrow();
  });

  it('should return the only child', function () {
    expect(function () {
      const instance = (
        <WrapComponent>
          <span />
        </WrapComponent>
      );
      onlyChild(instance.props.children);
    }).not.toThrow();
  });
});
