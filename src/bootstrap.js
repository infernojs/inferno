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
