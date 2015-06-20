var Inferno = (function() {
  "use strict";

  if(typeof im7 == "undefined") {
    throw Error("Inferno requires the im7.js library for immutable objects");
    return;
  }

  var BindingTypes = {
    Node: 1,
    Text: 2,
    Map: 3
  };

  var BindingCategory = {
    Child: 1,
    Attribute: 2
  };

  var supportsTextContent = 'textContent' in document;

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

  function State(data) {
    var keys = Object.keys(data);
    this._hasChanged = false;
    for(var i = 0; i < keys.length; i++) {
      this._initProp(keys[i], data[keys[i]]);
    }
  };

  State.prototype._initProp = function(key, value) {
    var self = this;
    this["get" + capitalizeFirstLetter(key)] = function() {
      return value;
    }

    this["set" + capitalizeFirstLetter(key)] = function(val) {
      value = val;
      self._hasChanged = true;
    }
  };

  var Inferno = {};

  Inferno.GetterSetter = function(value) {
    return function GetterSetter(newVal) {
      if(newVal != null) {
        value = newVal;
      }
      return value;
    }
  };

  Inferno.createState = function(data) {
    return new State(data);
  };

  Inferno.append = function appendToDom(template, root) {
    var rootNode = null;
    rootNode = template();
    createNode(rootNode, root);
    return rootNode;
  };

  Inferno.update = function updateRootNode(rootNode, root) {
    updateNode(rootNode, root);
  };

  Inferno.mount = function mountToDom(template, state, root) {
    var rootNode = this.append(template, root);

    // watch.addListener(function() {
    //   console.time("Inferno update");
    //   updateNode(rootNode, root);
    //   console.timeEnd("Inferno update");
    // });
  };

  Inferno.TemplateHelpers = {
    map: function(array, constructor) {
      return {
        type: BindingTypes.Map,
        array: array,
        constructor: constructor,
        lastVal: null
      };
    }
  };

  Inferno.createElement = function createElementFactory(tag, attrs, child) {
    var bindings = [],
        key = null,
        i = 2,
        l = 0,
        item = null,
        oneChild = true,
        children = [],
        binding = null,
        node = null;

    if(child === undefined) {
      child = null;
    }

    if(arguments.length > 3) {
      for(l = arguments.length; i < l; i++) {
        item = arguments[i];
        children.push(item);
      }
      oneChild = false;
    } else {
      children = child;
    }

    //determine if we are working with a state function
    if(typeof child === "function") {
      //create a new text binding
      binding = {state: child, type: BindingTypes.Text, category: BindingCategory.Child, lastVal: ""};
      children = binding;
      bindings.push(binding);
    } else if(child != null && child.type === BindingTypes.Map) {
      //handle maps
      bindings.push(child);
    } else if (oneChild === false) {
      //otherwiswe we can look through our children and add the bindings that way
      for(i = 0; i < children.length; i++) {
        //we only want normal bindings, not the nodes
        if(typeof children[i] === "function") {
          binding = {state: children[i], type: BindingTypes.Text, category: BindingCategory.Child, lastVal: ""};
          children[i] = binding;
          bindings.push(binding);
        }
      }
    }

    //then check through our attrs
    if(attrs !== null) {
      for(key in attrs) {
        if(typeof attrs[key] === "function") {
          binding = {state: attrs[key], type: BindingTypes.Text, category: BindingCategory.Attribute, lastVal: ""};
          attrs[key] = binding;
          bindings.push(binding);
        }
      }
    }

    node = {
      dom: null,
      children: children,
      tag: tag,
      attrs: attrs,
      type: null
    };

    if(bindings.length === 0) {
      return node;
    } else {
      return {
        bindings: bindings,
        node: node,
        type: BindingTypes.Node
      };
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
        if(attrValue.type !== undefined) {
          if(attrValue.type === BindingTypes.Text) {
            attrValue = attrValue.lastVal;
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
    var i = 0, ii = 0, l = 0, binding = null, val = null, textNode = null, child = null;
    if(node.tag != null) {
      if(node.dom === null) {
        node.dom = document.createElement(node.tag)
      }
      parent.appendChild(node.dom);
      if(node.attrs != null) {
        node.oldAttrs = updateAttributes(node.dom, node.tag, node.attrs, null);
      }
      if(node.children instanceof Array) {
        var child = null;
        for(l = node.children.length; i < l; i++) {
          child = node.children[i];
          //given this is an array, we need to add a new text node
          if(typeof child === "string") {
            textNode = document.createTextNode(child);
            node.dom.appendChild(textNode);
          } else if(child.type === BindingTypes.Text) {
            textNode = document.createTextNode(child.lastVal);
            node.dom.appendChild(textNode);
          } else {
            createNode(child, node.dom);
          }
        }
      } else if(node.children != null) {
        createNode(node.children, node.dom);
      }
    } else if(node.type != null && node.type !== BindingTypes.Node) {
      //if its a function, it's most likely our getter/setter
      if(node.type === BindingTypes.Text) {
        setTextContent(parent, node.lastVal, false);
      } else if(node.type === BindingTypes.Map) {
        //then itteratoe of the object
        node.children = [];
        val = node.array;
        for(ii = 0; ii < val.length; ii++) {
          child = node.constructor(val[ii]);
          node.children.push(child);
          createNode(child, parent);
        }
      }
    } else if(typeof node === "string") {
      setTextContent(parent, node, false);
    } else if (node.type === BindingTypes.Node) {
      //set lastVal of all the bindings
      for(l = node.bindings.length; i < l; i++) {
        binding = node.bindings[i];
        if(binding.type === BindingTypes.Text) {
          val = binding.state();
          binding.lastVal = val;
        } else if(binding.type === BindingTypes.Map) {
          //if it's a map, get the value and store it as the lastVal
          binding.lastVal = binding.array;
        }
      }
      //there is a change so let's create the node
      createNode(node.node, parent);
    } else {
      //debugger;
    }
  };

  function updateNode(node, parent) {
    var l = 0, i = 0, binding = null, val = null, child = null, updateChild = false, updateAttr = false;

    //we need to find the Binding Nodes first
    if (node.type != null && node.type === BindingTypes.Node) {
      //check bingings match
      for(l = node.bindings.length; i < l; i++) {
        binding = node.bindings[i];
        if(binding.type === BindingTypes.Text) {
          val = binding.state();
          if(val !== binding.lastVal) {
            binding.lastVal = val;
            if(binding.category === BindingCategory.Child) {
              updateChild = true;
            } else if(binding.category === BindingCategory.Attribute) {
              updateAttr = true;
            }
          }
        } else if (binding.type === BindingTypes.Map) {
          //check if our array is not the same as the last one
          if(binding.array !== binding.lastVal) {
            //if they don't match, we need to check each of the children to see if they match
            //we will need to re-construct our children
            //debugger;
          }
        }
      }

      if(updateAttr === true) {
        node.node.oldAttrs = updateAttributes(node.node.dom, node.node.tag, node.node.attrs, node.node.oldAttrs);
        //if this node has children, process them too
      }

      if(updateChild === true) {
        //check if node's child is a bind binding (text)
        if(node.node.children.type != null) {
          if(node.node.children.type === BindingTypes.Text) {
            setTextContent(node.node.dom, node.node.children.lastVal, true);
          } else if(node.node.children.type === BindingTypes.Map) {
            //debugger;
          }
        } else {
          //check if the children is an array, then process that too
          for(i = 0, l = node.node.children.length; i < l; i++) {
            child = node.node.children[i];
            //if this is a binding value, apply value
            if(child.type != null) {
              if(child.type === BindingTypes.Text) {
                setTextContent(node.node.dom.childNodes[i], child.lastVal, true);
              } else if (child.type === BindingTypes.Map) {
                //debugger;
              }
            } else if(typeof child !== "string") {
              updateNode(child, node.node.dom);
            }
          }
        }
      } else if(node.node.children instanceof Array) {
        //go through children and see if any of them have  updated
        for(l = node.node.children.length; i < l; i++) {
          child = node.node.children[i];
          if(typeof child !== "string") {
            updateNode(child, node.dom);
          }
        }
      }
    } else if(node.children instanceof Array) {
      //we loop through all children and update them
      for(l = node.children.length; i < l; i++) {
        child = node.children[i];
        if(typeof child !== "string" && typeof child.children !== "string") {
          updateNode(child, node.dom);
        }
      }
    } else if(node.children != null && node.dom != null) {
      //otherwise we look into the single child
      if(node.children != null) {
        updateNode(node.children, node.dom);
      }
    }
  };

  return Inferno;
})();
