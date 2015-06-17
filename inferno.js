var Inferno = (function() {
  "use strict";

  var BindingTypes = {
    Bind: "Bind",
    Repeat: "Repeat"
  };

  var BindingCategory = {
    Child: "Child",
    Attribute: "Attribute"
  };

  var supportsTextContent = 'textContent' in document;

  function Binding(type, val) {
    this.type = type;
    this.val = val;
    this.oldVal = null;
  }

  function BindingNode(bindings, node) {
    this.bindings = bindings;
    this.node = node;
  }

  var directives = {
    bind: function(value) {
      return new Binding(BindingTypes.Bind, value);
    },
    repeat: function(value) {
      return new Binding(BindingTypes.Repeat, value);
    }
  }

  var Inferno = {}

  Inferno.mount = function(template, root) {
    //make a new instance of state
    var rootNode = template(directives);

    createNode(rootNode, root);
    window.requestAnimationFrame(update.bind(null, rootNode, root));
  };

  Inferno.createElement = function(tag, attrs, children) {
    var bindings = [],
        key = null,
        i = 2,
        l = 0,
        item = null,
        oneChild = true;

    if(arguments.length > 3) {
      children = [];
      for(l = arguments.length; i < l; i++) {
        item = arguments[i];
        children.push(item);
      }
      oneChild = false;
    }

    var node = {
      dom: null,
      children: children,
      tag: tag,
      attrs: attrs
    };

    //determine if we are working with a binding as a child
    if(oneChild === true && children instanceof Binding) {
      //we will return a list of bindings
      bindings.push({val: children, category: BindingCategory.Child});
    } else if (oneChild === false) {
      //otherwiswe we can look through our children and add the bindings that way
      for(i = 0; i < l; i++) {
        if(children[i] instanceof Binding) {
          bindings.push({val: children[i], category: BindingCategory.Child});
        }
      }
    }

    //then check through our attrs
    if(attrs !== null) {
      for(key in attrs) {
        if(attrs[key] instanceof Binding) {
          bindings.push({val: attrs[key], category: BindingCategory.Attribute});
        }
      }
    }

    if(bindings.length === 0) {
      return node;
    } else {
      return new BindingNode(bindings, node);
    }
  };

  // TODO find solution without empty text placeholders
  function emptyTextNode() {
      return document.createTextNode('');
  }

  function isInputProperty(tag, attrName) {
    switch (tag) {
      case 'input':
        return attrName === 'value' || attrName === 'checked';
      case 'textarea':
        return attrName === 'value';
      case 'select':
        return attrName === 'value' || attrName === 'selectedIndex';
      case 'option':
        return attrName === 'selected';
    }
  }

  function updateAttribute(domElement, name, value) {
    if (value === false) {
      domElement.removeAttribute(name);
    } else {
      if (value === true) {
        value = '';
      }
      var colonIndex = name.indexOf(':'), ns;
      if (colonIndex !== -1) {
        var prefix = name.substr(0, colonIndex);
        switch (prefix) {
          case 'xlink':
            ns = 'http://www.w3.org/1999/xlink';
            break;
        }
      }
      domElement.setAttribute(name, value);
    }
  }

  function updateAttributes(domElement, tag, attrs, oldAttrs) {
    var changes, attrName, newAttrs = {};
    if (attrs) {
      for (attrName in attrs) {
        var attrValue = attrs[attrName];

        //if it's a binding, lets get it
        if(attrValue instanceof Binding) {
          if(attrValue.type === BindingTypes.Bind) {
            attrValue = attrValue.val();
          }
        }

        newAttrs[attrName] = attrValue;

        if (attrName === 'style') {
          var oldAttrValue = oldAttrs && oldAttrs[attrName];
          if (oldAttrValue !== attrValue) {
            updateStyle(domElement, oldAttrValue, attrs, attrValue);
          }
        } else if (isInputProperty(tag, attrName)) {
          if (domElement[attrName] !== attrValue) {
            domElement[attrName] = attrValue;
          }
        } else if (!oldAttrs || oldAttrs[attrName] !== attrValue) {
          if (attrName === 'class') {
            domElement.className = attrValue;
          } else {
            updateAttribute(domElement, attrName, attrValue);
          }
        }
      }
    }
    if (oldAttrs) {
      for (attrName in oldAttrs) {
        if ((!attrs || attrs[attrName] === undefined)) {
          if (attrName === 'class') {
            domElement.className = '';
          } else if (!isInputProperty(tag, attrName)) {
            domElement.removeAttribute(attrName);
          }
        }
      }
    }
    return newAttrs;
  }

  function setTextContent(domElement, text, update) {
    if (text) {
      if (supportsTextContent) {
        domElement.textContent = text;
      } else {
        domElement.innerText = text;
      }
    } else {
      if (update) {
        while (domElement.firstChild) {
          domElement.removeChild(domElement.firstChild);
        }
      }
      domElement.appendChild(emptyTextNode());
    }
  };

  function createNode(node, parent) {
    var i = 0, l = 0, noChange = true, binding = null, val = null;
    if(node.tag != null) {
      if(node.dom == null) {
        node.dom = document.createElement(node.tag)
      }
      parent.appendChild(node.dom);
      if(node.attrs != null) {
        node.oldAttrs = updateAttributes(node.dom, node.tag, node.attrs, null);
      }
      if(node.children instanceof Array) {
        for(l = node.children.length; i < l; i++) {
          createNode(node.children[i], node.dom);
        }
      } else {
        createNode(node.children, node.dom);
      }
    } else if(node instanceof Array) {

    } else if(node instanceof Binding) {
      //if its a function, it's most likely our getter/setter
      if(node.type === BindingTypes.Bind) {
        setTextContent(parent, node.val(), false);
      }
    } else if (node instanceof BindingNode) {
      //check bingings match
      for(l = node.bindings.length; i < l; i++) {
        binding = node.bindings[i],
        val = binding.val.val();
        if(val !== binding.oldVal) {
          binding.oldVal = val;
          noChange = false;
        }
      }
      if(noChange === false) {
        //there is a change so let's create the node
        createNode(node.node, parent);
      }
    } else {
      debugger;
    }
  };

  function updateNode(node, parent, updateChild, updateAttr) {
    var l = 0, i = 0, noChange = true, binding = null, val = null;
    //we need to find nodes that have bindings (we don't touch static nodes)
    if (node instanceof BindingNode) {
      //check bingings match
      updateChild = false;
      updateAttr = false;
      for(l = node.bindings.length; i < l; i++) {
        binding = node.bindings[i],
        val = binding.val.val();
        if(val !== binding.oldVal) {
          binding.oldVal = val;
          noChange = false;
          if(binding.category === BindingCategory.Child) {
            updateChild = true;
          } else if(binding.category === BindingCategory.Attribute) {
            updateAttr = true;
          }
        }
      }
      if(noChange === false) {
        //there is a change so let's create the node
        updateNode(node.node, parent, updateChild, updateAttr);
      }
    } else if(node instanceof Binding) {
      //if its a function, it's most likely our getter/setter
      if(updateChild === true && node.type === BindingTypes.Bind) {
        setTextContent(parent, node.val(), true);
      }
    } else if(node.children instanceof Array) {
      //we loop through all children and update them
      for(l = node.children.length; i < l; i++) {
        updateNode(node.children[i], node.dom);
      }
    } else if(node.children != null && node.dom != null) {
      //update the attrs
      if(updateAttr === true && node.attrs != null) {
        node.oldAttrs = updateAttributes(node.dom, node.tag, node.attrs, node.oldAttrs);
      }
      //otherwise we look into the single child
      updateNode(node.children, node.dom, updateChild, updateAttr);
    }
  };

  function update(rootNode, root) {
    updateNode(rootNode, root, false, false);
    window.requestAnimationFrame(update.bind(null, rootNode, root));
  };

  return Inferno;
})();
