// This file is work around for jest-environment-jsdom plugin which kills debugger
var JSDOM = require("jsdom").JSDOM;
// We want to execute all scripts, because this is for test environment only
var document = new JSDOM("<!doctype html><html><body></body></html>", {
  runScripts: "dangerously"
});
global.document = document;
global.window = document.defaultView;
global.navigator = global.window.navigator;
global.usingJSDOM = true;
