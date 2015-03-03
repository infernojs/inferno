var cito = require("./cito.js");
var Compiler = require("./Compiler.js");

function Template(templatePath) {
  this._compiledTemplate = null;
  this._root = null;
  this._mounted = false;

  Inferno.loadFile("/EngineJS/example/demo.html").then(function(text) {
    this._compiledTemplate = Compiler.compile(text);
  }.bind(this))
};

Template.prototype.hasMounted = function() {
  return this._mounted;
};

Template.prototype.mount = function(root) {
  if(this._compiledTemplate != null) {
    this._root = root;
    this._mounted = true;
    var tempRoot = {tag: 'div', children: this._compiledTemplate.call(this._root.tagClass)};
    cito.vdom.append(this._root, tempRoot);
  }
};

module.exports = Template;
