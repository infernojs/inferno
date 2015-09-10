"use strict";

import Component from './universal/class/Component';
import render from './browser/core/render';
import version from './InfernoVersion';
import t7 from '../t7';
import isBrowser from './util/isBrowser';

t7.setOutput(t7.Outputs.Inferno);

let Inferno = {
  Component: Component,
  version: version,
  render: render
};

if(isBrowser) {
    global.t7 = t7;
    global.Inferno = Inferno;
}

export default Inferno;
