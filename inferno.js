var Inferno = (function() {
  "use strict";

  var supportsTextContent = 'textContent' in document;


  var Inferno = {};


  Inferno.append = function appendToDom(template, state, computed, root) {
    var rootNode = template(state, computed);
    createNode(rootNode, null, root, state, computed);

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
    for(i = 0; i < keys.length; i++) {
      if(state[keys[i]] === value) {
        return keys[i];
      }
    }
  };

  //we want to build a value tree, rather than a node tree, ideally, for faster lookups
  function createNode(node, parentNode, parentDom, state, computed, stateIndex) {
    var i = 0, l = 0, subNode = null, val = null, textNode = null;

    if(node.tag != null) {
      node.dom = document.createElement(node.tag);
      parentDom.appendChild(node.dom);
    }
    //see if we have any attributes to add
    if(node.attrs != null) {
      for(i = 0, l = node.attrs.length; i < l; i++) {
        if(typeof node.attrs[i].value !== "string") {
          val = node.attrs[i].value(state, computed);
          node.attrs[i].lastVal = val;
          handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, val);
        } else {
          handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, node.attrs[i].value);
        }
      }
    }

    if(node.children != null) {
      //lets find out what is in side
      if(typeof node.children === "function") {
        val = node.children(state, computed);
        if(typeof val === "string" || typeof val === "number") {
          //likely a binding
          node.children = new Text(val, node.children);
          createNode(node.children, node, node.dom, state, computed, stateIndex);
          textNode = document.createTextNode(val);
          node.dom.appendChild(textNode);
          return;
        } else {
          node.children = val;
        }
      }

      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i++) {
          if(typeof node.children[i].children === "text") {
            textNode = document.createTextNode(node.children[i].children);
            node.dom.appendChild(textNode);
          } else {
            createNode(node.children[i], node, node.dom, state, computed, stateIndex);
          }
        }
      } else if(node.children instanceof Text) {

      } else if(node.children instanceof Map) {
        node.map = node.children;
        node.children = [];
        node.scope = findScopeNameFromeState(state, node.map.value);
        for(i = 0; i < node.map.value.length; i++) {
          val = node.map.value[i];
          subNode = node.map.constructor(val, computed);
          node.children.push(subNode);
          createNode(subNode, node, node.dom, val, computed, i);
        }
      } else {
        if(typeof node.children === "text") {

        } else {
          createNode(node.children, node, node.dom, state, computed, stateIndex);
        }
      }
    }
  };


  function updateNode(node, parentNode, parentDom, state, computed) {
    var i = 0, l = 0, val = "";

    if(node.scope != null) {
      state = state[node.scope];
    }

    if(node.attrs != null) {
      for(i = 0; i < node.attrs.length; i++) {
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

    if(node.children != null) {
      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i++) {
          if(node.map) {
            updateNode(node.children[i], node, node.dom, state[i], computed);
          } else {
            updateNode(node.children[i], node, node.dom, state, computed);
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
        updateNode(node.children, node, node.dom, state, computed);
      }
    }
  };


  return Inferno;
})();
