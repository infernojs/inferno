var Inferno = (function() {
  "use strict";

  var BindingTypes = {
    Node: 1,
    Bind: 2,
    Repeat: 3
  };

  var BindingCategory = {
    Child: 1,
    Attribute: 2
  };

  var supportsTextContent = 'textContent' in document;

  function BindingNode(bindings, node) {
    this.bindings = bindings;
    this.node = node;
  }

  var directives = {
    bind: function(value) {
      return {
        type: BindingTypes.Bind,
        val: value,
        lastVal: ""
      };
    },
    repeat: function(value) {
      return {
        type: BindingTypes.Repeat,
        val: value,
        lastVal: ""
      };
    }
  }

  var Inferno = {}

  Inferno.mount = function(template, root) {
    //make a new instance of state
    var rootNode = template(directives);

    createNode(rootNode, root);
    //window.requestAnimationFrame(update.bind(null, rootNode, root));
    window.update = update.bind(null, rootNode, root);
  };

  Inferno.createElement = function(tag, attrs, child) {
    var bindings = [],
        key = null,
        i = 2,
        l = 0,
        item = null,
        oneChild = true,
        children = [];

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

    var node = {
      dom: null,
      children: children,
      tag: tag,
      attrs: attrs,
      type: null
    };

    //determine if we are working with a binding as a child
    if(oneChild === true && child != null && child.type !== null && child.type !== BindingTypes.Node && typeof child !== "string") {
      //we will return a list of bindings
      bindings.push({val: child, category: BindingCategory.Child});
    } else if (oneChild === false) {
      //otherwiswe we can look through our children and add the bindings that way
      for(i = 0; i < children.length; i++) {
        //we only want normal bindings, not the nodes
        if(children[i].type !== null && children[i].type !== BindingTypes.Node && typeof children[i] !== "string") {
          bindings.push({val: children[i], category: BindingCategory.Child});
        }
      }
    }

    //then check through our attrs
    if(attrs !== null) {
      for(key in attrs) {
        if(attrs[key].type != null) {
          bindings.push({val: attrs[key], category: BindingCategory.Attribute});
        }
      }
    }

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
          if(attrValue.type === BindingTypes.Bind) {
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
    var i = 0, l = 0, binding = null, val = null, textNode = null, child = null;
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
          } else if(child.type === BindingTypes.Bind) {
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
      if(node.type === BindingTypes.Bind) {
        setTextContent(parent, node.lastVal, false);
      }
    } else if(typeof node === "string") {
      setTextContent(parent, node, false);
    } else if (node.type === BindingTypes.Node) {
      //set lastVal of all the bindings
      for(l = node.bindings.length; i < l; i++) {
        binding = node.bindings[i],
        val = binding.val.val();
        if(val !== binding.val.lastVal) {
          binding.val.lastVal = val;
        }
      }
      //there is a change so let's create the node
      createNode(node.node, parent);
    } else {
      //debugger;
    }
  };

  function updateNode(node, parent) {
    var l = 0, i = 0, binding = null, val = null, child = null;
    //we need to find the Binding Nodes first
    if (node.type != null && node.type === BindingTypes.Node) {
      var updateChild = false;
      var updateAttr = false;
      //check bingings match
      for(l = node.bindings.length; i < l; i++) {
        binding = node.bindings[i],
        val = binding.val.val();
        if(val !== binding.val.lastVal) {
          binding.val.lastVal = val;
          if(binding.category === BindingCategory.Child) {
            updateChild = true;
          } else if(binding.category === BindingCategory.Attribute) {
            updateAttr = true;
          }
        }
      }

      if(updateAttr === true) {
        node.node.oldAttrs = updateAttributes(node.node.dom, node.node.tag, node.node.attrs, node.node.oldAttrs);
        //if this node has children, process them too
      }

      if(updateChild === true) {
        //check if node's child is a bind binding (text)
        if(node.node.children.type != null && node.node.children.type === BindingTypes.Bind) {
          setTextContent(node.node.dom, node.node.children.lastVal, true);
        } else {
          //check if the children is an array, then process that too
          for(i = 0, l = node.node.children.length; i < l; i++) {
            child = node.node.children[i];
            //if this is a binding value, apply value
            if(child.type != null && child.type === BindingTypes.Bind) {
              setTextContent(node.node.dom.childNodes[i], child.lastVal, true);
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
        if(typeof child !== "string") {
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

  var updateNextCycle = false;

  function update(rootNode, root) {
    updateNode(rootNode, root);
    //window.requestAnimationFrame(update.bind(null, rootNode, root));
  };

  return Inferno;
})();
