"use strict";

import Component              from './universal/class/Component';
import render                 from './browser/core/render';
import version                from './InfernoVersion';
import unmountComponentAtNode from './universal/core/unmountComponentAtNode';
import fragmentTypes          from './universal/core/fragmentTypes';
import template               from './browser/template/template';
import setT7Dependency        from './other/setT7Dependency';

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

export default Inferno;
