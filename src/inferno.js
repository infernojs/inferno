"use strict";

import Component from './universal/class/Component';
import render from './universal/core/render';
import version from './InfernoVersion';
import t7 from '../t7';

t7.setOutput(t7.Outputs.Inferno);

var Inferno = {
  Component: Component,
  version: version,
  render: render
};

if(typeof window != "undefined") {
    global.t7 = t7;
    global.Inferno = Inferno;
}

export default Inferno;
