var Inferno = (function() {
  "use strict";

  var supportsTextContent = 'textContent' in document;


  var Inferno = {};


  Inferno.append = function appendToDom(template, state, root) {
    var rootNode = template();

    createNode(rootNode, null, root, state, state);

    return rootNode;
  };

  Inferno.update = function updateRootNode(rootNode, root) {
    console.time("Inferno update");
    updateNode(rootNode, null, root, state, state);
    console.timeEnd("Inferno update");
  };

  Inferno.mount = function mountToDom(template, state, root) {
    var rootNode = this.append(template, state, root);

    state.addListener(function() {
      console.time("Inferno update");
      updateNode(rootNode, null, root, state, state);
      console.timeEnd("Inferno update");
    });
  };

  Inferno.TemplateHelpers = {
    map: function(stateValue, constructor) {

    },
    computed: function(stateValue, computed) {

    },
    text: function(stateValue) {

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

  function deepCheckObject(object, value, paths) {
    var i = 0;
    if(object instanceof Array) {
      for(i = 0; i < object.length; i++) {
        if(object[i] === value) {
          paths.push(i);
          return true;
        }
      }
    } else if (typeof object === "object") {
      for(i in object) {
        if(object[i] === value) {
          paths.push(i);
          return true;
        }
      }
    }
  }

  function getStatePath(state, value, stateIndex) {
    //we try to find out where the value exists currently in our state
    //this is obviously easier with immutable data
    var paths = [], foundIt = false;
    if(stateIndex != null) {
      if(state[stateIndex] === value) {
        return stateIndex;
      }
      //to improve performance, lets using the state with stateIndex
      paths.push(stateIndex);
      var result = getStatePath(state[stateIndex], value, null);
      if(typeof result === "string"){
        paths.push(result);
      } else {
        paths = paths.concat(result);
      }
      return paths;
    }
    for(var path in state) {
      if(state[path] === value) {
        //easy win, return the key
        return path;
      } else if(typeof state[path] !== "string" && typeof state[path] !== "number") {
        //check if they "look" like the same object
        if(JSON.stringify(state[path]) === JSON.stringify(value)) {
          return path;
        }
        //deep check
        paths.push(path);
        foundIt = deepCheckObject(state[path], value, paths);

        if(foundIt === true) {
          return paths;
        }
        //we did not get the value, clear the paths and start again
        paths = [];
      }
    }
    //no luck
    //debugger
    return null;
  };

  function getStateValueFromPaths(state, paths) {
    //fastest way possible...
    switch(paths.length) {
      case 1:
        return state[paths[0]];
      case 2:
        return state[paths[0]][paths[1]];
      case 3:
        return state[paths[0]][paths[1]][paths[2]];
    }
  }

  function createNode(node, parentNode, parentDom, state, rootState, stateIndex) {
    var i = 0, l = 0, val = "", subNode = null, textNode = null, computedVal = "";
    if(node.tag != null) {
      node.dom = document.createElement(node.tag);
      parentDom.appendChild(node.dom);
    }
    //see if we have any attributes to add
    if(node.attrs != null) {
      for(i = 0, l = node.attrs.length; i < l; i++) {
        handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, node.attrs[i].value);
      }
    }
    //check if we have bindAttrs
    if(node.bindAttrs != null) {
      for(i = 0, l = node.bindAttrs.length; i < l; i++) {
        subNode = node.bindAttrs[i];
        subNode.statePath = getStatePath(state, subNode.initValue, stateIndex);
        if(typeof subNode.statePath === "string" || typeof subNode.statePath === "number") {
          val = state[subNode.statePath];
        } else {
          val = getStateValueFromPaths(state, subNode.statePath);
        }
        subNode.oldValue = val;
        handleNodeAttributes(node.tag, node.dom, node.bindAttrs[i].name, val);
      }
    }
    //check if we have children
    if(node.children != null) {
      if(node.children instanceof Array) {
        for(i = 0, l = node.children.length; i < l; i++) {
          //if the child node is simply text, append it
          if(typeof node.children[i] === "string") {
            textNode = document.createTextNode(node.children[i]);
            node.dom.appendChild(textNode);
          } else {
            createNode(node.children[i], node, node.dom, state, state, stateIndex);
          }
        }
      } else {
        if(typeof node.children === "string") {
          textNode = document.createTextNode(node.children);
          node.dom.appendChild(textNode);
        } else {
          createNode(node.children, node, node.dom, state, state, stateIndex);
        }
      }
    }
    //check if we have a child computed text that needs binding
    else if (node.bindComputed != null) {
      node.bindComputed.statePath = getStatePath(state, node.bindComputed.initValue, stateIndex);
      if(typeof node.bindComputed.statePath === "string" || typeof node.bindComputed.statePath === "number") {
        val = state[node.bindComputed.statePath];
      } else {
        val = getStateValueFromPaths(state, node.bindComputed.statePath);
      }
      node.bindComputed.oldValue = val;
      //now lets work out the computed value
      computedVal = node.bindComputed.computed(val);
      node.bindComputed.oldComputed = computedVal;
      setTextContent(node.dom, computedVal, false);
    }
    //check if we have a child text that needs binding
    else if (node.bindText != null) {
      //check if we have the standard bindText
      node.bindText.statePath = getStatePath(state, node.bindText.initValue, stateIndex);
      if(typeof node.bindText.statePath === "string" || typeof node.bindText.statePath === "number") {
        val = state[node.bindText.statePath];
      } else {
        val = getStateValueFromPaths(state, node.bindText.statePath);
      }
      node.bindText.oldValue = val;
      setTextContent(node.dom, val, false);
    }
    //check if we have dynamic children that are maps
    else if (node.bindMap != null) {
      node.bindMap.statePath = getStatePath(state, node.bindMap.initValue, stateIndex);
      val = state[node.bindMap.statePath];
      node.bindMap.oldValue = val;
      node.children = [];
      //then we construct each of the children
      for(i = 0, l = val.length; i < l; i++) {
        subNode = node.bindMap.constructor(val[i]);
        node.children.push(subNode);
        createNode(subNode, node.bindMap, node.dom, val, state, i);
      }
    }
  };

  //sees if two objects are the same, we may be able to do better methods than stringify
  //but its generally the quickest in most browsers until a native method comes around
  function areSame(val1, val2) {
    if(val1 === val2) {
      return true;
    }
    if(JSON.stringify(val1) === JSON.stringify(val2)) {
      return true;
    }
    return false;
  };

  function updateNode(node, parentNode, parentDom, state, rootState) {
    var i = 0, l = 0, val = null, newState = state;
    //we basically skip everything until we see a bind property
    if(node.bindAttrs != null) {
      for(i = 0, l = node.bindAttrs.length; i < l; i++) {
        if(typeof node.bindAttrs[i].statePath === "string" || typeof node.bindAttrs[i].statePath === "number") {
          val = state[node.bindAttrs[i].statePath];
        }
        if(node.bindAttrs[i].oldValue !== val) {
          //update the attr
          handleNodeAttributes(node.tag, node.dom, node.bindAttrs[i].name, val);
          node.bindAttrs[i].oldValue = val;
        }
      }
    }
    //then we keep moving through children
    if(node.children != null) {
      //bindMaps have their own value and state so we need to check this
      if(node.bindMap != null) {
        if(typeof node.bindMap.statePath === "string" || typeof node.bindMap.statePath === "number") {
          val = state[node.bindMap.statePath];
        }
        //we fist compare the size in items, if so we may need to add/remove something
        if(val.length !== node.bindMap.oldValue.length){
          //TODO need to find add/remove items accordingly
          //debugger;
        } else {
          //TODO check when sizes are the same but something insdie has changed?
          //!areSame(val, node.bindMap.oldValue)
        }
        //then apply the new state
        newState = val;
      }
      if(node.children instanceof Array) {
        for(i = 0, l = node.children.length; i < l; i++) {
          updateNode(node.children[i], node, node.dom, newState, state);
        }
      } else {
        updateNode(node.children, node, node.dom, newState, state);
      }
    }
    //handle binding on a child text
    else if (node.bindText) {
      if(typeof node.bindText.statePath === "string" || typeof node.bindText.statePath === "number") {
        val = state[node.bindText.statePath];
      } else {
        val = getStateValueFromPaths(state, node.bindText.statePath);
      }
      if(node.bindText.oldValue !== val) {
        node.bindText.oldValue = val;
        setTextContent(node.dom, val, true);
      }
    }
  };


  return Inferno;
})();
