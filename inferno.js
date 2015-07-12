var Inferno = (function() {
  "use strict";

  var supportsTextContent = 'textContent' in document;
  var registeredComponents = {};

  var events = {
    "onClick": "click"
  };

  function ValueNode(value, valueKey) {
    //detect if the value is actually a new node tree
    if(value && value.tag != null) {
      this.isRoot = true;
    }
    //if its an array, this is due to a function returining an array (for example: a map)
    else if(value && value instanceof Array) {
      this.isRoot = true;
    }
    this.value = value;
    this.valueKey = valueKey;
  }

  function RenderList(array, constructor) {
    this.lastValue = null;
    this.array = array;
    this.constructor = constructor;
  }

  var Inferno = {};

  class Component {
    constructor() {}
    render() {}
    update() {}
  }

  Inferno.Component = Component;

  Inferno.createValueNode = function(value, valueKey) {
    return new ValueNode(value, valueKey);
  };

  Inferno.register = function(elementName, Component) {
    var element = Object.create(HTMLElement.prototype);
    var instances = new WeakMap();

    element.createdCallback = function() {
      var component = new Component();
      component.update = Inferno.render.bind(null, component.render.bind(component), this, null);

      instances.set(this, {
        component: component,
        hasAttached: false,
        props: {},
        listeners: null,
        lastProps: {}
      })
    };

    element.sendData = function(data) {
      var instance = instances.get(this);

      instance.lastProps = instance.props;
      instance.props = data;
      if(instance.hasAttached === true) {
        if(instance.component.beforeRender) {
          //TODO check if the props are the same and skip this
          instance.component.beforeRender(instance.props);
          Inferno.render(instance.component.render.bind(instance.component), this, instance.listeners);
          if(instance.component.afterRender) {
            instance.component.afterRender();
          }
        }
      }
    };

    element.attachedCallback = function() {
      var instance = instances.get(this);
      instance.component.element = this;
      instance.hasAttached = true;
      if(instance.component.attached) {
        instance.component.attached(instance.props);
      }
      //add listeners
      instance.listeners = addRootDomEventListerners(this)
      //initial render
      Inferno.render(instance.component.render.bind(instance.component), this, instance.listeners);
      if(instance.component.afterRender) {
        instance.component.afterRender();
      }
    };

    element.detachedCallback = function() {
      var instance = instances.get(this);
      instance.hasAttached = false;
      //TODO remove listeners
      if(instance.component.detached) {
        instance.component.detached();
      }
    };

    registeredComponents[elementName] = Component;
    document.registerElement(elementName, {prototype: element});
  };

  Inferno.render = function(render, dom, listeners) {
    var rootNode = null;
    var values = [];
    //we check if we have a root on the dom node, if not we need to build up the render
    if(dom.rootNode == null) {
      if(typeof render === "function") {
        values = render();
        rootNode = t7.getTemplateFromCache(values.templateKey, values.values);
      } else if(render.templateKey) {
        values = render;
        rootNode = t7.getTemplateFromCache(values.templateKey, values.values);
      }
      createNode(rootNode, null, dom, values, null, null, listeners);
      dom.rootNode = [rootNode];
    }
    //otherwise we progress with an update
    else {
      if(typeof render === "function") {
        values = render();
      } else if(render.templateKey) {
        values = render;
      }
      updateNode(dom.rootNode[0], dom.rootNode, dom, values, 0, listeners);
    }
  };

  // TODO find solution without empty text placeholders
  function emptyTextNode() {
      return document.createTextNode('');
  };

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
  };

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
  };

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
  };

  function handleNodeAttributes(tag, domElement, attrName, attrValue) {
    if (attrName === 'style') {
      updateStyle(domElement, oldAttrValue, attrs, attrValue);
    } else if (isInputProperty(tag, attrName)) {
      if (domElement[attrName] !== attrValue) {
        domElement[attrName] = attrValue;
      }
    } else if (attrName === 'class') {
      domElement.className = attrValue;
    } else {
      updateAttribute(domElement, attrName, attrValue);
    }
  };

  function convertAttrsToProps(attrs, values) {
    var props = {};
    for(var i = 0; i < attrs.length; i = i + 1 | 0) {
      if(attrs[i].value instanceof ValueNode) {
        var val = values[attrs[i].value.valueKey];
        if(attrs[i].value.lastVal !== val) {
          attrs[i].value.lastVal = val;
          props[attrs[i].name] = val;
        }
      } else {
        props[attrs[i].name] = attrs[i].value;
      }

    }
    return props;
  };

  function addRootDomEventListerners(domNode) {
    var listeners = {
      click: []
    };
    domNode.addEventListener("click", function(e) {
      debugger;
    });
    return listeners;
  };

  //we want to build a value tree, rather than a node tree, ideally, for faster lookups
  function createNode(node, parentNode, parentDom, values, index, insertAtIndex, listeners) {
    var i = 0, l = 0, ii = 0,
        subNode = null,
        val = null,
        textNode = null,
        hasDynamicAttrs = false,
        wasChildDynamic = false;

    //we need to get the actual values and the templatekey
    if(!(values instanceof Array)) {
      node.templateKey = values.templateKey;
      values = values.values;
    }

    if(node.tag != null) {
      node.dom = document.createElement(node.tag);
      if(registeredComponents[node.tag] != null) {
        node.isComponent = true;
        node.isDynamic = true;
        //we also give the element some props
        node.dom.sendData(convertAttrsToProps(node.attrs, values));
      }
      if(!insertAtIndex) {
        parentDom.appendChild(node.dom);
      } else {
        parentDom.insertBefore(node.dom, parentDom.childNodes[insertAtIndex]);
      }
    }

    if(!node.isComponent) {
      if(node.attrs != null) {
        for(i = 0; i < node.attrs.length; i = i + 1 | 0) {
          //check if the name matches an event type
          if(events[node.attrs[i].name] != null) {
            node.attrs[i].value.lastValue = values[node.attrs[i].value.valueKey];
            listeners[events[node.attrs[i].name]].push({
              target: node.dom,
              callback: node.attrs[i].value.value
            })
            node.hasDynamicAttrs = true;
            node.isDynamic = true;
          } else {
            //check if this is a dynamic attribute
            if(node.attrs[i].value instanceof ValueNode) {
              node.hasDynamicAttrs = true;
              node.isDynamic = true;
              //assign the last value
              node.attrs[i].value.lastValue = values[node.attrs[i].value.valueKey];
              handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, node.attrs[i].value.value);
            } else {
              handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, node.attrs[i].value);
            }
          }
        }
      }
    }

    if(node.children != null) {
      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i = i + 1 | 0) {
          if(typeof node.children[i] === "string" || typeof node.children[i] === "number" || typeof node.children[i] === "undefined") {
            textNode = document.createTextNode(node.children[i]);
            node.dom.appendChild(textNode);
          } else if(node.children[i] instanceof ValueNode) {
            node.children[i].lastValue = values[node.children[i].valueKey];
            if(node.children[i].lastValue != null && node.children[i].lastValue.templateKey != null) {
              node.children[i].templateKey = node.children[i].lastValue.templateKey;
              node.children[i].lastValue = node.children[i].lastValue.values;
            }
            node.isDynamic = true;
            node.children[i].isDynamic = true;
            //check if we're dealing with a root node
            if(node.children[i].isRoot === true) {
              node.children[i].isDynamic = true;
              if(node.children[i].value instanceof Array) {
                if(node.children[i].templateKey != null) {
                  for(ii = 0; ii < node.children[i].value.length; ii = ii + 1 | 0) {
                    createNode(node.children[i].value[ii], node.children[i], node.dom, values[node.children[i].valueKey].values, ii, null, listeners);
                  }
                } else {
                  for(ii = 0; ii < node.children[i].value.length; ii = ii + 1 | 0) {
                    createNode(node.children[i].value[ii], node.children[i], node.dom, values[node.children[i].valueKey][ii], ii, null, listeners);
                  }
                }
              } else {
                createNode(node.children[i].value, node.children[i], node.dom, values[node.children[i].valueKey], null, null, listeners);
              }
            } else {
              textNode = document.createTextNode(node.children[i].value);
              node.dom.appendChild(textNode);
            }
          } else {
            wasChildDynamic = createNode(node.children[i], node, node.dom, values, i, null, listeners);
            if(wasChildDynamic === true ) {
              node.children[i].isDynamic = true;
              node.isDynamic = true;
            }
          }
        }
      } else if(typeof node.children === "string") {
        textNode = document.createTextNode(node.children);
        node.dom.appendChild(textNode);
      } else if(node.children instanceof ValueNode && node.children.isRoot === true) {
        //we are on a new root node, so we'll need to go through its children and apply the values
        //based off the valueKey index
        if(node.children.value instanceof Array) {
          for(i = 0; i < node.children.value.length; i = i + 1 | 0) {
            createNode(node.children.value[i], node, node.dom, values[node.children.valueKey], i, null, listeners);
          }
        } else {
          createNode(node.children.value, node, node.dom, values[node.children.valueKey], null, null, listeners);
        }
        node.children.isDynamic = true;
        node.children.lastValue = values[node.children.valueKey];
        return true;
      } else if(node.children instanceof ValueNode) {
        //if it has a valueKey then it means that its dynamic
        node.children.lastValue = values[node.children.valueKey];
        textNode = document.createTextNode(node.children.lastValue);
        node.dom.appendChild(textNode);
        node.isDynamic = true;
      }
    }

    if(!node.isDynamic) {
      return false;
    }
    return true;
  };

  function cloneAttrs(attrs) {
    var cloneAttrs = [];
    //TODO: need to actually do this
    return cloneAttrs;
  };

  function cloneNode(node, parentDom) {
    var i = 0;
    var textNode = null;
    var clonedNode = {
      tag: node.tag,
      dom: node.dom.cloneNode(false),
      attrs: cloneAttrs(node.attrs)
    }

    if(node.isDynamic === true) {
      clonedNode.isDynamic = true;
    }

    if(node.children instanceof ValueNode) {
      clonedNode.children = new ValueNode(node.children.value, node.children.valueKey);
    } else if(node.children instanceof Array) {
      clonedNode.children = [];
      //TODO: need to actually finish this
      for(i = 0; i < node.children.length; i = i + 1 | 0) {
        if(node.children[i] instanceof ValueNode) {
          textNode = document.createTextNode(node.children[i].value);
          clonedNode.dom.appendChild(textNode);
          clonedNode.children.push(new ValueNode(node.children[i].value, node.children[i].valueKey));
        } else if (typeof node.children[i] === "string" || typeof node.children[i] === "number") {
          textNode = document.createTextNode(node.children[i]);
          clonedNode.dom.appendChild(textNode);
          clonedNode.children.push(node.children[i]);
        } else {
          cloneNode(node.children[i], clonedNode.dom);
        }
        if(node.children[i].isDynamic === true) {
          clonedNode.children[i].isDynamic = true;
        }
      }
    }

    //append the new cloned DOM node to its parentDom
    parentDom.appendChild(clonedNode.dom);
    return clonedNode;
  };

  function removeNode(node, parentDom) {
    parentDom.removeChild(node.dom);
  };

  function updateNode(node, parentNode, parentDom, values, index, listeners) {
    var i = 0, s = 0, l = 0, val = "", childNode = null;

    if(node.isDynamic === false) {
      return;
    }

    //we need to get the actual values and the templatekey
    if(!(values instanceof Array)) {
      if(node.templateKey !== values.templateKey) {
        //remove node
        removeNode(node, parentDom);
        //and then we want to create the new node (we can simply get it from t7 cache)
        node = t7.getTemplateFromCache(values.templateKey, values.values);
        createNode(node, parentNode, parentDom, values.values, null, null, listeners);
        parentNode[index] = node;
        node.templateKey = values.templateKey;
      }
      values = values.values;
    }

    if(node.isComponent === true) {
      //get the attrs for this element and pass it over
      node.dom.sendData(convertAttrsToProps(node.attrs, values));
    }

    if(!node.isComponent) {
      if(node.attrs != null && node.hasDynamicAttrs === true) {
        for(i = 0; i < node.attrs.length; i = i + 1 | 0) {
          if(node.attrs[i].value instanceof ValueNode) {
            val = values[node.attrs[i].value.valueKey];
            if(val !== node.attrs[i].value.lastValue) {
              node.attrs[i].value.lastValue = val;
              handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, val);
            }
          }
        }
      }
    }

    if(node.children != null) {
      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i = i + 1 | 0) {
          if(node.children[i].isDynamic === true) {
            if(node.children[i] instanceof ValueNode && !node.children[i].isRoot) {
              val = values[node.children[i].valueKey];
              if(val != null && val.templateKey != null) {
                node.children[i].templateKey = val.templateKey;
                val = values;
              }
              if(val !== node.children[i].lastValue) {
                node.children[i].lastValue = val;
                //update the text
                setTextContent(node.dom.childNodes[i], val, true);
              }
            } else {
              updateNode(node.children[i], node, node.dom, values, i, listeners);
            }
          }
        }
      } else if(node.children instanceof ValueNode && node.children.isRoot === true) {
        //check if the value has changed
        val = values[node.children.valueKey];
        if(val != null && val.templateKey != null) {
          //check to see if the template has changed

          if(node.children.templateKey !== val.templateKey) {
            //we want to remove the DOM current node
            //TODO for optimisation do we want to clone this? and if possible, re-use the clone rather than
            //asking t7 for a fresh template??
            removeNode(node.children.value, node.dom);
            //and then we want to create the new node (we can simply get it from t7 cache)
            node.children.value = t7.getTemplateFromCache(val.templateKey, val.values);
            createNode(node.children.value, node.children, node.dom, val, null, i, listeners);
            //then we want to set the new templatekey
            node.children.templateKey = val.templateKey;
            node.children.lastValue = val.values;
          }
          val = val.values;
        }
        if(val !== node.children.lastValue) {
          if(val instanceof Array) {
            //check if the sizes have changed
            //in this case, our new array has more items so we'll need to add more children
            if(val.length > node.children.lastValue.length) {
              //easiest way to add another child is to clone the node, so let's clone the first child
              //TODO check the templates coming back have the same code?
              for(s = 0; s < val.length - node.children.lastValue.length; s = s + 1 | 0) {
                childNode = cloneNode(node.children.value[0], node.dom);
                node.children.value.push(childNode);
              }
            } else if(val.length < node.children.lastValue.length) {
              //we need to remove the last node here (unless we add in index functionality)
              for(s = 0; s < node.children.lastValue.length - val.length; s = s + 1 | 0) {
                removeNode(node.children.value[node.children.value.length - 1], node.dom);
                node.children.value.pop();
              }
            }
            for(i = 0; i < node.children.value.length; i = i + 1 | 0) {
              if(typeof node.children.value[i] === "string") {
                //TODO - finish
              } else {
                updateNode(node.children.value[i], node.children.value, node.dom, val[i], i, listeners);
              }
            }
          }
          node.children.lastValue = val;
        }
      } else if(node.children instanceof ValueNode) {
        val = values[node.children.valueKey];
        if(val != null && val.templateKey != null) {
          node.templateKey = val.templateKey;
          val = values;
        }
        if(val !== node.children.lastValue) {
          node.children.lastValue = val;
          if(typeof val === "string" || typeof val === "number") {
            setTextContent(node.dom, val, true);
          }
        }
      }
    }
  };

  return Inferno;
})();
