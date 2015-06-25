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

  var Inferno = {};

  Inferno.createComponent = function(internals) {
    var instance =  InfernoComponent;
    var element = Object.create(HTMLElement.prototype);
    var component = null;
    var rootNode = null;

    element.createdCallback = function() {
      //TODO, add some logic here?
      component = new InfernoComponent(internals, this);
    };

    element.attachedCallback = function() {
      var attributes = Array.prototype.slice.call(this.attributes);
      //build up proos
      for(var i = 0; i < attributes.length; i = i + 1 | 1) {
        component.props[attributes[i].name] = attributes[i].value;
      }
      //call the component constructor
      internals.constructor.call(component, component.props);
      //now append it to DOM
      rootNode = Inferno.append(internals.template, component, this);
    };

    element.attributeChangedCallback = function(prop, oldVal, newVal) {
      if(component.props[prop] == null || component.props[prop] !== newVal) {
        component.props[prop] = newVal;
        //fire off to component
        var returnObj = {}
        returnObj[prop] = component.props[prop];
        internals.onPropChange.call(component, returnObj);
        //finally update the node
        Inferno.update(rootNode, component, this);
      }
    };

    return {
      instance: instance,
      element: element
    }
  };

  Inferno.registerComponent = function(elementName, component) {
    //cache item?
    document.registerElement(elementName, {prototype: component.element });
  };

  Inferno.append = function appendToDom(template, context, root) {
    var template = template.call(context);
    var clipBoxes = [];
    var checkClipBoxes = false;
    var rootNode = template.rootNode();

    createNode(rootNode, null, root, context, template.bindings(), null, clipBoxes);
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

  Inferno.update = function updateRootNode(rootNode, root, context) {
    updateNode(rootNode, null, root, context, context);
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

  function Map(value, constructor) {
    this.value = value;
    this.constructor = constructor;
  }

  function Text(value, constructor) {
    this.value = value;
    this.constructor = constructor || null;
  };

  Inferno.TemplateBindings = {
    map: function(value, constructor) {
      return new Map(value, constructor);
    },
    text: function(value) {
      return new Text(value);
    },
    ClipBox: {
      StaticHeight: 1,
      StaticWidth: 2,
      StaticWidthAndHeight: 3,
      VariableWidthAndHeight: 4 //will be expensive
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

  //Experimental feature, use it by applying: clipBox to a node with a valid value from Inferno.TemplateBindings.ClipBox
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
  function createNode(node, parentNode, parentDom, state, bindings, index, clipBoxes) {
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

    if(node.children != null) {
      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i = i + 1|1) {
          createNode(node.children[i], node, node.dom, state, bindings, i, clipBoxes);
        }
      } else if(typeof node.children === "string") {
        textNode = document.createTextNode(node.children);
        node.dom.appendChild(textNode);
      }
    }

  };


  function updateNode(node, parentNode, parentDom, state, context) {
    var i = 0, l = 0, val = "";


  };

  return Inferno;
})();
