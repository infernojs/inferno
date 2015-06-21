var Inferno = (function() {
  "use strict";

  var BindingTypes = {
    Node: 1,
    Text: 2,
    Map: 3
  };

  var BindingOrigin = {
    Function: 1,
    StateObject: 2,
  };

  var BindingCategory = {
    Child: 1,
    Attribute: 2
  };

  var supportsTextContent = 'textContent' in document;

  function State(data) {
    var keys = Object.keys(data), state = null, getter = null, self = this;

    this._hasChanged = false;
    this._useStateObjects = false;
    this._listeners = [];

    for(var i = 0; i < keys.length; i++) {
      state = {
        value: data[keys[i]]
      };

      Object.defineProperty(this, keys[i], {
        get: function() {
          if(self._useStateObjects === false) {
            return this.value;
          }
          return this;
        }.bind(state),
        set: function(newVal) {
          this.value = newVal;
          self._hasChanged = true;
        }.bind(state)
      });
    }
  };

  State.prototype.toggleStateObjects = function() {
    this._useStateObjects = !this._useStateObjects;
  };

  State.prototype.addListener = function(callback) {
    //if this is our first listerner, enable to auto checker
    if(this._listeners.length === 0) {
      this._checkForChanges();
    }
    this._listeners.push(callback);
  };

  State.prototype._checkForChanges = function() {
    if(this._hasChanged === true) {
      this._hasChanged = false;
      for(var i = 0, l = this._listeners.length; i < l; i++) {
        this._listeners[i]();
      }
    }

    requestAnimationFrame(this._checkForChanges.bind(this));
  };

  State.prototype.computed = function(computedFunction) {
    //faster than bind
    var self = this;
    return function() {
      var turnBackOn = false;
      var result = null;

      if(self._useStateObjects === true) {
        turnBackOn = true;
        self._useStateObjects = false;
      }
      result = computedFunction();
      if(turnBackOn === true) {
        self._useStateObjects = true;
      }
      return result;
    }
  };

  var Inferno = {};

  Inferno.createState = function(data) {
    return new State(data);
  };

  Inferno.append = function appendToDom(template, state, root) {
    var rootNode = null;
    if(state != null) {
      state._useStateObjects = true;
    }
    rootNode = template();
    if(state != null) {
      state._useStateObjects = false;
    }
    createNode(rootNode, root);
    return rootNode;
  };

  Inferno.update = function updateRootNode(rootNode, root) {
    updateNode(rootNode, root);
  };

  Inferno.mount = function mountToDom(template, state, root) {
    var rootNode = this.append(template, state, root);

    state.addListener(function() {
      console.time("Inferno update");
      updateNode(rootNode, root);
      console.timeEnd("Inferno update");
    });
  };

  Inferno.TemplateHelpers = {
    map: function(object, constructor) {
      if(typeof object === "function") {
        return {
          type: BindingTypes.Map,
          function: object,
          origin: BindingOrigin.Function,
          constructor: constructor,
          lastVal: null
        };
      } else {
        return {
          type: BindingTypes.Map,
          state: object,
          origin: BindingOrigin.StateObject,
          constructor: constructor,
          lastVal: null
        };
      }
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

    //determine if we are working with a binding object
    if((child !== null && child.value != null) || typeof child === "function") {
      //makes a Text Binding object that has an on origin of Function
      if(typeof child === "function") {
        binding = {
          function: child,
          type: BindingTypes.Text,
          origin: BindingOrigin.Function,
          category: BindingCategory.Child,
          lastVal: ""
        };
      } else {
        binding = {
          state: child,
          type: BindingTypes.Text,
          origin: BindingOrigin.StateObject,
          category: BindingCategory.Child,
          lastVal: ""
        };
      }
      children = binding;
      bindings.push(binding);
    } else if(child != null && child.type === BindingTypes.Map) {
      //TODO handle maps
      //debugger;
      bindings.push(child);
    } else if (oneChild === false) {
      for(i = 0; i < children.length; i++) {
        //We check to see if the child looks like a binding object
        if((children[i] != null && children[i].value != null) || typeof children[i] === "function") {
          //makes a Text Binding object that has an on origin of Function
          if(typeof children[i] === "function") {
            binding = {
              function: children[i],
              type: BindingTypes.Text,
              origin: BindingOrigin.Function,
              category: BindingCategory.Child,
              lastVal: ""
            };
          } else {
            //makes a Text Binding object that has an on origin of StateObject
            binding = {
              state: children[i],
              type: BindingTypes.Text,
              origin: BindingOrigin.StateObject,
              category: BindingCategory.Child,
              lastVal: ""
            };
          }
          children[i] = binding;
          bindings.push(binding);
        }
      }
    }

    //then check through our attrs
    if(attrs !== null) {
      for(key in attrs) {
        if((attrs[key] != null && attrs[key].value != null) || typeof attrs[key] === "function") {
          if(typeof attrs[key] === "function") {
            binding = {
              function: attrs[key],
              type: BindingTypes.Text,
              origin: BindingOrigin.Function,
              category: BindingCategory.Attribute,
              lastVal: ""
            };
          } else {
            binding = {
              state: attrs[key],
              type: BindingTypes.Text,
              origin: BindingOrigin.StateObject,
              category: BindingCategory.Attribute,
              lastVal: ""
            };
          }
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
    //if (text) {
      if(update && domElement.firstChild) {
        domElement.firstChild.nodeValue = text;
      } else {
        if (supportsTextContent) {
          domElement.textContent = text;
        } else {
          domElement.innerText = text;
        }
      }
    //TODO get this working again?
    //} else {
      // if (update) {
      //   while (domElement.firstChild) {
      //     domElement.removeChild(domElement.firstChild);
      //   }
      // }
      // domElement.appendChild(emptyTextNode());
    //}
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
        if(node.origin === BindingOrigin.StateObject) {
          val = node.state.value;
        } else {
          val = node.function();
        }
        node.lastVal = val;
        for(ii = 0; ii < val.length; ii++) {
          child = node.constructor(val[ii], ii);
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
          if(binding.origin === BindingOrigin.StateObject) {
            val = binding.state.value;
          } else {
            val = binding.function();
          }
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
    var l = 0, i = 0, ii = 0, binding = null, val = null, child = null, newChild = null,
        updateChild = false, updateAttr = false, needsRebuild = false;

    //we need to find the Binding Nodes first
    if (node.type != null && node.type === BindingTypes.Node) {
      //check bingings match
      for(l = node.bindings.length; i < l; i++) {
        binding = node.bindings[i];
        if(binding.type === BindingTypes.Text) {
          if(binding.origin === BindingOrigin.StateObject) {
            val = binding.state.value;
          } else {
            val = binding.function();
          }
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
        if(node.node.children instanceof Array) {
          for(i = 0; i < node.node.children.length; i++) {
            if(typeof node.node.children[i] !== "string") {
              updateNode(node.node.children[i], node.node.dom);
            }
          }
        }
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
    } else if(node.type != null && node.type === BindingTypes.Map) {
      if(node.origin === BindingOrigin.StateObject) {
        val = node.state.value;
      } else {
        val = node.function();
      }
      if(node.lastVal !== val) {
        //check all children
        for(i = 0, l = val.length; i < l; i++) {
          //check if we have a change in the list
          if(val[i] !== node.lastVal[i]) {
            needsRebuild = true;
            //we need to update the child
            child  = node.children[i];
            //first we check if the child was a binding
            if(child != null && child.type === BindingTypes.Text) {
              //we can then update the bindings accordingly
            } else if(child != null && child.type === BindingTypes.Node) {
              updateNode(child, parent);
              needsRebuild = false;
            } else {
              //if we have no bindings, will simply look through the child
              for(ii = 0; ii < child.children.length; ii++) {
                //we need to check if all the children are strings, if so, we simply
                //need to rebuild this map binding node
                if(child.children[ii] != null && typeof child.children[ii] !== "string") {
                  updateNode(child.children[ii], child.dom);
                  needsRebuild = false;
                }
              }
            }
            //if all the children are strings and we need to rebuild, recall the constructor
            //and start again (this is likely as the mapped object has returned no StateObjects)
            if(needsRebuild === true) {
              //build a new child
              newChild = node.constructor(val[i], i);
              //replace node
              compareAndReplaceNode(child, newChild, parent);
            }
          }
        }
        //finally set lastVal to the new val
        node.lastVal = val;
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

  function compareAndReplaceNode(oldNode, newNode, parent) {
    var i = 0, l = 0;
    if(oldNode.tag === newNode.tag) {
      //check if children need re-rendering
      if(oldNode.children !== newNode.children) {
        for(i = 0, l = newNode.children.length; i < l; i++) {
          if(oldNode.children[i] !== newNode.children[i]) {
            if(typeof oldNode.children[i] === "string" && typeof newNode.children[i] === "string") {
              setTextContent(oldNode.dom.childNodes[i], newNode.children[i], true);
            }
          }
        }
      }
      //check if attributes need re-rendering

    }
  };

  return Inferno;
})();
