var Template = require('./Template.js');

function CustomTag(tag, data) {
  this._element = null;
  this._tag = tag;
  this._tagClass = null;
  this._template = new Template(data.template);
  this._initCustomElement(data.class);
};

CustomTag.prototype._convertNamedNodeMapToObject = function(namedNodeMap) {
  var obj = {};
  for(var key in namedNodeMap) {
    if(namedNodeMap[key].nodeName != null) {
      obj[namedNodeMap[key].nodeName] = namedNodeMap[key].value;
    }
  }
  return obj;
};

CustomTag.prototype._initCustomElement = function(tagClass) {
  //keep a copy of this so we can pass it down the closures
  var self = this;
  //create a new HTML custom element
  this._element = Object.create(HTMLElement.prototype);
  //setup the customElement functions
  this._element.createdCallback = function() {

  };
  this._element.attachedCallback = function() {
    var attributes = self._convertNamedNodeMapToObject(this.attributes);
    tagClass = new tagClass(attributes);
    self._tagClass = tagClass;
    self._element.tagClass = tagClass;
    self._template.mount(this);
  };
  //register the custom element
  document.registerElement(this._tag,
    { prototype: this._element })
};

module.exports = CustomTag;
