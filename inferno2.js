var Inferno = (function() {
  "use strict";

  var supportsTextContent = 'textContent' in document;

  function InfernoComponent(internals, element) {
    var excludeFunctions = ["constructor", "template"];

    this.element = element;
    this.state = {};
    this.props = {};

    //apply any other functions to this from the internals
    for(var key in internals) {
      if(excludeFunctions.indexOf(key) === -1) {
        this[key] = internals[key].bind(this);
      }
    }
  };

  InfernoComponent.prototype.setProps = function(props) {
    this.onPropsChange(props);
    for(var key in props ){
      this.props[key] = props[key];
    }
    this.render();
  };

  InfernoComponent.prototype.setState = function(state) {
    for(var key in state ){
      this.state[key] = state[key];
    }
  };

  InfernoComponent.prototype.constructor = function(props) {};
  InfernoComponent.prototype.onPropsChange = function(props) {};

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

  Inferno.createComponent = function(internals) {
    var instance =  InfernoComponent;
    var element = Object.create(HTMLElement.prototype);
    var component = null;
    var rootNode = null;

    //add some functions to the element prototype
    element.setProps = function(props) {
      component.setProps(props);
    };

    element.createdCallback = function() {
      //TODO, add some logic here?
      component = new InfernoComponent(internals, this);
    };

    element.attachedCallback = function() {
      //call the component constructor
      component.constructor = internals.constructor.bind(component);
      component.constructor(component.props);
      //now append it to DOM
      rootNode = Inferno.append(internals.render, component, this);

      component.render = Inferno.update.bind(component, rootNode, this, component, internals.render);
      if(internals.onPropsChange) {
        component.onPropsChange = internals.onPropsChange.bind(component);
      }
    };

    element.attributeChangedCallback = function(name, oldVal, newVal) {
      if(internals.onAttributeChange != null) {
        internals.onAttributeChange.call(component, oldVal, newVal);
      }
    };

    return {
      instance: instance,
      element: element
    }
  };

  Inferno.createValueNode = function(value, valueKey) {
    return new ValueNode(value, valueKey);
  };

  Inferno.registerComponent = function(elementName, component) {
    //cache item?
    document.registerElement(elementName, {prototype: component.element });
  };

  Inferno.append = function appendToDom(renderFunction, context, root) {
    var rootNode = null;
    var values = [];
    var clipBoxes = [];
    var checkClipBoxes = false;

    //make sure we set t7 output to Inferno when rendering the rootNode
    t7.setOutput(t7.Outputs.Inferno);
    rootNode = renderFunction.call(context);
    //make sure we set t7 output to ValuesOnly when rendering the values
    t7.setOutput(t7.Outputs.ValuesOnly);
    values = renderFunction.call(context);

    createNode(rootNode, null, root, context, values, null, clipBoxes);
    //update all the clipBoxes properties
    handleClipBoxes(clipBoxes);
    window.addEventListener("scroll", function (e) {
      checkClipBoxes = true;
    });
    window.addEventListener("resize", function (e) {
      checkClipBoxes = true;
    });

    var checkedHasScrolled = function() {
      if(checkClipBoxes === true) {
        checkClipBoxes = false;
        handleClipBoxes(clipBoxes);
      };
      window.requestAnimationFrame(checkedHasScrolled);
    };
    checkedHasScrolled();
    //return the root node
    return rootNode;
  };

  Inferno.update = function updateRootNode(rootNode, root, context, renderFunction) {
    //make sure we set t7 output to ValuesOnly when rendering the values
    t7.setOutput(t7.Outputs.ValuesOnly);
    var values = renderFunction.call(context);
    updateNode(rootNode, null, root, context, values);
  };

  // Inferno.mount = function mountToDom(template, state, root) {
  //   var rootNode = this.append(template, state, root);
  //
  //   state.addListener(function() {
  //     console.time("Inferno update");
  //     updateNode(rootNode, null, root, state, model);
  //     console.timeEnd("Inferno update");
  //   });
  // };

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

  //Experimental feature
  //this needs to fire when window resizes, window scrolls (or parent container with overflow scrolls?)
  //also needs to be called on when amount of items in DOM changes?
  //also needs to be called on when items in the DOM are display none?
  function handleClipBoxes(clipBoxes) {
    var i = 0,
        clipBox = null,
        boundingRect = null,
        docWidth = document.body.clientWidth,
        docHeight = document.body.clientHeight,
        docScrollTop = document.body.scrollTop,
        docScrollLeft = document.body.scrollLeft;

    for(i = 0; i < clipBoxes.length; i = i + 1 | 0) {
      clipBox = clipBoxes[i];
      //if it's missing dimensions, lets add them
      if(clipBox.dimensions === null) {
        boundingRect = clipBox.dom.getBoundingClientRect();
        clipBox.dimensions = {
          height: boundingRect.height,
          width: boundingRect.width,
          top: boundingRect.top + docScrollTop,
          left: boundingRect.left + docScrollLeft
        }
      }
      //if it has staticheight, that means it has variable width
      if(clipBox.clipBox === Inferno.TemplateBindings.ClipBox.StaticHeight) {
      }
      //find out if the element is not on screen
      if(clipBox.dimensions.top - docScrollTop > docHeight
        || clipBox.dimensions.top + clipBox.dimensions.height - docScrollTop < 0) {
        clipBox.outOfBounds = true;
      } else {
        clipBox.outOfBounds = false;
      }
    }
  };

  //we want to build a value tree, rather than a node tree, ideally, for faster lookups
  function createNode(node, parentNode, parentDom, state, values, index, clipBoxes, insertAtIndex) {
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
      if(!insertAtIndex) {
        parentDom.appendChild(node.dom);
      } else {
        parentDom.insertBefore(node.dom, parentDom.childNodes[insertAtIndex]);
      }
    } else if(node.children instanceof ValueNode && node.isRoot === true) {
      //we are on a new root node, so we'll need to go through its children and apply the values
      //based off the valueKey index
      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i = i + 1 | 0) {
          createNode(node.value[i], node, parentDom, state, values[node.valueKey], i, clipBoxes);
        }
      } else {
        createNode(node.value, node, parentDom, state, values[node.valueKey], null, clipBoxes);
      }
      node.children.isDynamic = true;
      return true;
    }

    if(node.attrs != null) {
      for(i = 0; i < node.attrs.length; i = i + 1 | 0) {
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
                for(ii = 0; ii < node.children[i].value.length; ii = ii + 1 | 0) {
                  createNode(node.children[i].value[ii], node.children[i], node.dom, state, values[node.children[i].valueKey][ii], ii, clipBoxes);
                }
              } else {
                createNode(node.children[i].value, node.children[i], node.dom, state, values[node.children[i].valueKey], null, clipBoxes);
              }
            } else {
              textNode = document.createTextNode(node.children[i].value);
              node.dom.appendChild(textNode);
            }
          } else {
            wasChildDynamic = createNode(node.children[i], node, node.dom, state, values, i, clipBoxes);
            if(wasChildDynamic === true ) {
              node.isDynamic = true;
            }
          }
        }
      } else if(typeof node.children === "string") {
        textNode = document.createTextNode(node.children);
        node.dom.appendChild(textNode);
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

  function updateNode(node, parentNode, parentDom, state, values) {
    var i = 0, ii = 0, s = 0, l = 0, val = "", childNode = null;
    if(node.isDynamic === false) {
      return;
    }

    //we need to get the actual values and the templatekey
    if(!(values instanceof Array)) {
      node.templateKey = values.templateKey;
      values = values.values;
    }

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
    if(node.children != null) {
      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i = i + 1 | 0) {
          if(node.children[i].isDynamic === true) {
            if(node.children[i] instanceof ValueNode) {
              //check if the value has changed
              val = values[node.children[i].valueKey];
              if(val != null && val.templateKey != null) {
                //check to see if the template has changed
                if(node.children[i].templateKey !== val.templateKey) {
                  //we want to remove the DOM current node
                  //TODO for optimisation do we want to clone this? and if possible, re-use the clone rather than
                  //asking t7 for a fresh template??
                  removeNode(node.children[i].value, node.dom);
                  //and then we want to create the new node (we can simply get it from t7 cache)
                  node.children[i].value = t7.getTemplateFromCache(val.templateKey, val.values);
                  createNode(node.children[i].value, node.children[i], node.dom, state, val, null, null, i);
                  //then we want to set the new templatekey
                  node.children[i].templateKey = val.templateKey;
                  node.children[i].lastValue = val.values;
                }
                val = val.values;
              }
              if(val !== node.children[i].lastValue) {
                if(val instanceof Array) {
                  //check if the sizes have changed
                  //in this case, our new array has more items so we'll need to add more children
                  if(val.length > node.children[i].lastValue.length) {
                    //easiest way to add another child is to clone the node, so let's clone the first child
                    //TODO check the templates coming back have the same code?
                    for(s = 0; s < val.length - node.children[i].lastValue.length; s = s + 1 | 0) {
                      childNode = cloneNode(node.children[i].value[0], node.dom);
                      node.children[i].value.push(childNode);
                    }
                  } else if(val.length < node.children[i].lastValue.length) {
                    //we need to remove the last node here (unless we add in index functionality)
                    for(s = 0; s < node.children[i].lastValue.length - val.length; s = s + 1 | 0) {
                      removeNode(node.children[i].value[node.children[i].value.length - 1], node.dom);
                      node.children[i].value.pop();
                    }
                  }
                  for(ii = 0; ii < node.children[i].value.length; ii = ii + 1 | 0) {
                    if(typeof node.children[i].value[ii] === "string") {
                      //TODO - finish
                    } else {
                      updateNode(node.children[i].value[ii], node.children[i], node.dom, state, val[ii]);
                    }
                  }
                } else {
                  if(val != null && val.templateKey != null) {
                    node.children[i].templateKey = val.templateKey;
                    val = values;
                  }
                  if(val !== node.children[i].lastValue) {
                    node.children[i].lastValue = val;
                    //update the text
                    setTextContent(node.dom.childNodes[i], val, true);
                  }
                }
                node.children[i].lastValue = val;
              }
            } else {
              updateNode(node.children[i], node, node.dom, state, values);
            }
          }
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
