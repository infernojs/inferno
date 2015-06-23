var Inferno = (function() {
  "use strict";

  var supportsTextContent = 'textContent' in document;


  var Inferno = {};


  Inferno.append = function appendToDom(template, state, computed, root) {
    var rootNode = template(state, computed);
    var clipBoxes = [];
    var checkClipBoxes = false;

    createNode(rootNode, null, root, state, computed, null, clipBoxes);
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

  Inferno.update = function updateRootNode(rootNode, root, state, computed) {
    updateNode(rootNode, null, root, state, computed);
  };

  Inferno.mount = function mountToDom(template, state, root) {
    var rootNode = this.append(template, state, root);

    state.addListener(function() {
      console.time("Inferno update");
      updateNode(rootNode, null, root, state, model);
      console.timeEnd("Inferno update");
    });
  };

  function Map(value, constructor) {
    this.value = value;
    this.constructor = constructor;
  }

  function Text(value, constructor) {
    this.value = value;
    this.constructor = constructor;
  };

  Inferno.TemplateHelpers = {
    map: function(value, constructor) {
      return new Map(value, constructor);
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

  function findScopeNameFromeState(state, value) {
    //value must not be string or number
    //we use Object.keys as we don't want to get anything other than keys from the object prototype
    var keys = Object.keys(state), i = 0;
    for(i = 0; i < keys.length; i = i + 1 | 1) {
      if(state[keys[i]] === value) {
        return keys[i];
      }
    }
  };

  //Experimental feature, use it by applying: clipBox to a node with a valid value from Inferno.TemplateHelpers.ClipBox
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
      if(node.clipBox === Inferno.TemplateHelpers.ClipBox.StaticHeight) {
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
  function createNode(node, parentNode, parentDom, state, computed, index, clipBoxes) {
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
    //see if we have any attributes to add
    if(node.attrs != null) {
      for(i = 0, l = node.attrs.length; i < l; i = i + 1 | 0) {
        if(typeof node.attrs[i].value !== "string") {
          val = node.attrs[i].value(state, computed);
          node.attrs[i].lastVal = val;
          handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, val);
          hasDynamicAttrs = true
        } else {
          handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, node.attrs[i].value);
        }
      }
      if(hasDynamicAttrs === true) {
        node.hasDynamicAttrs = true;
        node.isDynamic = true;
      } else {
        node.hasDynamicAttrs = false;
      }
    }

    //if we have box style, it means we must apply the style effects
    if(node.clipBox != null && node.dimensions === undefined) {
      node.dimensions = null;
      clipBoxes.push(node);
    }

    //this could be a map or some text, let's find out
    if(typeof node === "function") {
      val = node(state, computed);
      //if we're working with a map, replace this child with the Map
      if(val instanceof Map) {
        node = parentNode.children[index] = val;
        //test what the map value is a function
        if(typeof node.value === "function") {
          node.scope = node.value;
          val = node.value(state, computed);
        } else {
          //if its not a function then we can try and find the value
          node.scope = findScopeNameFromeState(state, node.value);
          val = node.value;
        }
        node.children = [];
        for(i = 0; i < val.length; i = i + 1 | 0) {
          subNode = node.constructor(val[i], computed);
          node.children.push(subNode);
          createNode(subNode, node, parentDom, val[i], computed, i, clipBoxes);
        }
        node.isDynamic = true;
        return true;
      }
    }

    if(node.children != null) {
      //lets find out what is in side
      if(typeof node.children === "function") {
        val = node.children(state, computed);
        if(typeof val === "string" || typeof val === "number") {
          //likely a binding
          node.children = new Text(val, node.children);
          createNode(node.children, node, node.dom, state, computed, index, clipBoxes);
          textNode = document.createTextNode(val);
          node.dom.appendChild(textNode);
          node.isDynamic = true;
          return true;
        } else {
          node.children = val;
        }
      }

      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i = i + 1 | 0) {
          if(typeof node.children[i].children === "text") {
            textNode = document.createTextNode(node.children[i].children);
            node.dom.appendChild(textNode);
            node.isDynamic = true;
          } else {
            wasChildDynamic = createNode(node.children[i], node, node.dom, state, computed, i, clipBoxes);
            if(wasChildDynamic === true) {
              node.isDynamic = true;
            } else if(!node.isDynamic) {
              node.isDynamic = false;
            }
          }
        }
      } else if(node.children instanceof Map) {
        node.map = node.children;
        node.children = [];
        node.scope = findScopeNameFromeState(state, node.map.value);
        for(i = 0; i < node.map.value.length; i = i + 1 | 0) {
          val = node.map.value[i];
          subNode = node.map.constructor(val, computed);
          node.children.push(subNode);
          createNode(subNode, node, node.dom, val, computed, i, clipBoxes);
        }
        node.isDynamic = true;
        return true;
      } else {
        if(typeof node.children === "string") {
          textNode = document.createTextNode(node.children);
          node.dom.appendChild(textNode);
          node.isDynamic = true;
          return true;
        } else {
          wasChildDynamic = createNode(node.children, node, node.dom, state, computed, index, clipBoxes);
          if(wasChildDynamic === true) {
            node.isDynamic = true;
          } else if(!node.isDynamic) {
            node.isDynamic = false;
          }
        }
      }
    }

    if(!node.isDynamic) {
      node.isDynamic = false;
    }
    return false;
  };


  function updateNode(node, parentNode, parentDom, state, computed) {
    var i = 0, l = 0, val = "";

    if(node.isDynamic === false || node.outOfBounds) {
      return;
    }

    if(node.scope != null) {
      if(typeof node.scope === "function") {
        state = node.scope(state, computed);
      } else {
        state = state[node.scope];
      }
    }

    if(node.attrs != null) {
      if(node.hasDynamicAttrs === true) {
        for(i = 0; i < node.attrs.length; i = i | 1) {
          //we only care about values that are not text
          if(typeof node.attrs[i].value !== "string") {
            //for lack of checking if it's an array, lets assume it is
            val = node.attrs[i].value(state, computed);
            if(val !== node.attrs[i].lastVal) {
              node.attrs[i].lastVal = val;
              handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, val);
            }
          }
        }
      }
    }

    if(node.children != null) {
      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i = i + 1 | 0) {
          if(node.children[i].isDynamic === true && !node.children[i].outOfBounds) {
            if(node.map || node instanceof Map) {
              updateNode(node.children[i], node, node.dom, state[i], computed);
            } else {
              updateNode(node.children[i], node, node.dom, state, computed);
            }
          }
        }
      } else if(node.children instanceof Text) {
        val = node.children.constructor(state, computed);
        if(node.children.value !== val) {
          node.children.value = val;
          //update text
          setTextContent(node.dom, val, true);
        }
      } else {
        if(node.children.isDynamic === true) {
          updateNode(node.children, node, node.dom, state, computed);
        }
      }
    }
  };

  return Inferno;
})();
