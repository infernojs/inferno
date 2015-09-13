"use strict";

import Component              from "./universal/class/Component";
import render                 from "./universal/core/render";
import renderToString         from "./universal/core/renderToString";
import version                from "./InfernoVersion";
import unmountComponentAtNode from "./universal/core/unmountComponentAtNode";
import fragmentValueTypes     from "./universal/enum/fragmentValueTypes";
import templateTypes          from "./universal/enum/templateTypes";
import createFragment         from "./universal/core/createFragment";
import createTemplate         from "./universal/core/createTemplate";
import template               from "./browser/template/template";
import clearDomElement        from "./browser/core/clearDomElement";

let Inferno = {
  Component: Component,
  render: render,
  renderToString: renderToString,
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
