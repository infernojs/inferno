/*
 * Copyright (c) 2015, Dominic Gannaway
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";

var Inferno = require("./inferno.js");
var t7 = require("../t7");

t7.setOutput(t7.Outputs.Inferno);

if(typeof window != "undefined") {
  window.Inferno = Inferno;
  window.t7 = t7;
} else {
  module.exports = Inferno;
}
