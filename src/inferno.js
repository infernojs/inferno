"use strict";

import Component              from './universal/class/Component';
import render                 from './browser/core/render';
import version                from './InfernoVersion';
import unmountComponentAtNode from './universal/core/unmountComponentAtNode';
import fragmentTypes          from './universal/core/fragmentTypes';
import template               from './browser/template/template';
import isBrowser              from './util/isBrowser';
import t7                     from '../t7';

// FIX ME! Should this be exposed?
import setT7Dependency        from './other/setT7Dependency';

// TODO! Find a better way
t7.setOutput(t7.Outputs.Inferno);

let Inferno = {
  Component: Component,
  render: render,
  unmountComponentAtNode: unmountComponentAtNode,
  Type: fragmentTypes,
  template: template,
  setT7Dependency:setT7Dependency,
  // current version of the library
  version: version,
};

if(isBrowser) {
    global.t7 = t7;
    global.Inferno = Inferno;
}

export default Inferno;
