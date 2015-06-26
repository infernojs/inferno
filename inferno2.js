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

  function ValueNode(value, valueKey) {
    this.value = value;
    this.valueKey = valueKey;
  }

  var Inferno = {};

  Inferno.createComponent = function(internals) {
    var instance =  InfernoComponent;
    var element = Object.create(HTMLElement.prototype);
    var component = null;
    var rootNode = null;

    //add some functions to the element prototype
    element.setAttributes = function() {

    };

    element.createdCallback = function() {
      //TODO, add some logic here?
      component = new InfernoComponent(internals, this);
    };

    element.attachedCallback = function() {
      //call the component constructor
      internals.constructor.call(component, component.props);
      //now append it to DOM
      rootNode = Inferno.append(internals.render, component, this);
    };

    element.attributeChangedCallback = function(name, oldVal, newVal) {
      if(internals.onAttrChange != null) {
        internals.onAttrChange.call(component, oldVal, newVal);
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

  Inferno.update = function updateRootNode(rootNode, root, context, values) {
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
  function createNode(node, parentNode, parentDom, state, values, index, clipBoxes) {
    var i = 0, l = 0,
        subNode = null,
        val = null,
        textNode = null,
        hasDynamicAttrs = false,
        wasChildDynamic = false;

    if(node.tag != null) {
      node.dom = document.createElement(node.tag);
      parentDom.appendChild(node.dom);
    }

    if(node.attrs != null) {
      for(i = 0; i < node.attrs.length; i = i + 1|1) {
        //check if this is a dynamic attribute
        if(node.attrs[i].value instanceof ValueNode) {
          node.hasDynamicAttrs = true;
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
        for(i = 0; i < node.children.length; i = i + 1|1) {
          if(typeof node.children[i] === "string" || typeof node.children[i] === "number" || typeof node.children[i] === "undefined") {
            textNode = document.createTextNode(node.children[i]);
            node.dom.appendChild(textNode);
          } else if(node.children[i] instanceof ValueNode) {
            //if it has a valueKey then it means that its dynamic
            if(node.children[i].valueKey != null) {
              node.children[i].lastValue = values[node.children[i].valueKey];
            }
            textNode = document.createTextNode(node.children[i].value);
            node.dom.appendChild(textNode);
          } else {
            createNode(node.children[i], node, node.dom, state, values, i, clipBoxes);
          }
        }
      } else if(typeof node.children === "string") {
        textNode = document.createTextNode(node.children);
        node.dom.appendChild(textNode);
      } else if(node.children instanceof ValueNode) {
        //if it has a valueKey then it means that its dynamic
        if(node.children.valueKey != null) {
          node.children.lastValue = values[node.children.valueKey];
        }
        textNode = document.createTextNode(node.children.value);
        node.dom.appendChild(textNode);
      }
    }
  };


  function updateNode(node, parentNode, parentDom, state, values) {
    var i = 0, l = 0, val = "";

    if(node.children != null) {
      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i = i + 1|1) {
          if(node.children[i] instanceof ValueNode) {
            //check if the value has changed
            val = values[node.children[i].valueKey];
            if(val !== node.children[i].lastValue) {
              node.children[i].lastValue = val;
              //update the text
              setTextContent(node.dom.childNodes[i], val, true);
            }
          } else {
            updateNode(node.children[i], node, node.dom, state, values);
          }
        }
      }
    } else if(node.children instanceof ValueNode) {
      debugger;
    }
  };

  return Inferno;
})();
