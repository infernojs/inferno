"use strict";

import Component              from './universal/class/Component';
import render                 from './browser/core/render';
import version                from './InfernoVersion';
import unmountComponentAtNode from './universal/core/unmountComponentAtNode';
import fragmentValueTypes          from './universal/enum/fragmentValueTypes';
import templateTypes          from './universal/enum/templateTypes';
import createFragment          from './universal/core/createFragment';
import createTemplate          from './universal/core/createTemplate';
import template               from './browser/template/template';
import clearDomElement      from './browser/core/clearDomElement';

let Inferno = {
  Component: Component,
  render: render,
  createFragment: createFragment,
  createTemplate: createTemplate,
  unmountComponentAtNode: unmountComponentAtNode,
  FragmentValueTypes: fragmentValueTypes,
  TemplateTypes: templateTypes,
  template: template,
  clearDomElement: clearDomElement,
  // current version of the library
  version: version,
};

export default Inferno;
