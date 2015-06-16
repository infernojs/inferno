var Inferno = (function() {

  var BindingTypes = {
    Text: "Text",
    Each: "Each"
  };

  function Binding() {

  };

  function BindingManager(context) {
    this._context = context;
    this._bindings = [];
  };

  BindingManager.prototype.text = function(stateValue) {
    var self = this;
    return function(root) {
      var binding = new Binding(root, stateValue, BindingTypes.Text);
      self._bindings.push(binding);
      return binding;
    }
  };

  BindingManager.prototype.each = function(stateValue) {
    var self = this;
    return function(root) {
      var binding = new Binding(root, stateValue, BindingTypes.Each);
      self._bindings.push(binding);
      return binding;
    }
  };

  var Inferno = {}

  Inferno.createBindingManager = function(context) {
    return new BindingManager(context);
  }

  Inferno.mount = function(State, Template, root) {
    //make a new instance of state
    var state = new State();
    var bindingManager = Inferno.createBindingManager(this);

    var rootNode = Template.call(null, bindingManager, state);

    createNode(rootNode, root);
  };

  Inferno.createElement = function(tag, attrs) {
    var l = arguments.length, i = 2;
    var domNode = document.createElement(tag);

    var node = {
      tag: tag,
      dom: domNode,
      children: []
    }

    for(; i < l; i++) {
      if(typeof arguments[i] === "function") {
        node.children.push(arguments[i](node));
      } else {
        node.children.push(arguments[i]);
      }
    }

    return node;
  };

  function createNode(node, root) {
    root.appendChild(node.dom);
  }

  return Inferno;
})();
