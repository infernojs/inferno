
function CustomTag(tag, tagClass) {
  this._element = null;
  this._tag = tag;
  this._tagClass = null;
  this._root = null;
  this._initCustomElement(tagClass);
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
    self._root = this;
  };
  this._element.attachedCallback = function() {
    var attributes = self._convertNamedNodeMapToObject(this.attributes);
    tagClass = new tagClass(attributes);
    self._tagClass = tagClass;
    self._element.tagClass = tagClass;
    self.render();
  };
  //register the custom element
  document.registerElement(this._tag,
    { prototype: this._element })
};

CustomTag.prototype.render = function() {
  //call the render function on the class
  if(this._tagClass.render != null) {
    var template = this._tagClass.render();
    if(template != null && template.hasMounted() === false) {
      template.mount(this._root);
    }
  }
  requestAnimationFrame(this.render.bind(this));
}

module.exports = CustomTag;
