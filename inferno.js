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
    map: function(statePath, constructor) {

    },
    bind: function(statePath) {

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
          debugger;
          return paths;
        }
        //we did not get the value, clear the paths and start again
        paths = [];
      }
    }
    //no luck
    debugger
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
    var i = 0, l = 0, val = "", subNode = null, textNode = null;
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
      for(i = 0, l = node.children.length; i < l; i++) {
        //if the child node is simply text, append it
        if(typeof node.children[i] === "string") {
          textNode = document.createTextNode(node.children[i]);
          node.dom.appendChild(textNode);
        } else {
          createNode(node.children[i], node, node.dom, state, state, stateIndex);
        }
      }
    }
    //check if we have a child that needs binding
    else if (node.bindChild != null) {
      node.bindChild.statePath = getStatePath(state, node.bindChild.initValue, stateIndex);
      if(typeof node.bindChild.statePath === "string" || typeof node.bindChild.statePath === "number") {
        val = state[node.bindChild.statePath];
      } else {
        val = getStateValueFromPaths(state, node.bindChild.statePath);
      }
      node.bindChild.oldValue = val;
      setTextContent(node.dom, val, false);
    }
    //check if we have dynamic children that need binding (usually a map or something similar)
    else if (node.bindChildren != null) {
      node.bindChildren.statePath = getStatePath(state, node.bindChildren.initValue, stateIndex);
      val = state[node.bindChildren.statePath];
      node.bindChildren.oldValue = val;
      node.children = [];
      //then we construct each of the children
      for(i = 0, l = val.length; i < l; i++) {
        subNode = node.bindChildren.constructor(val[i]);
        node.children.push(subNode);
        createNode(subNode, node.bindChildren, node.dom, val, state, i);
      }
    }
  };

  function updateNode(node, parentNode, parentDom, state, rootState) {
    var i = 0, l = 0, val = null;
    //we basically skip everything until we see a bind property
    if(node.bindAttrs != null) {
      for(i = 0, l = node.bindAttrs.length; i < l; i++) {
        if(typeof node.bindAttrs[i].statePath === "string") {
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
      for(i = 0, l = node.children.length; i < l; i++) {
        updateNode(node.children[i], node, node.dom, state);
      }
    }
    //handle binding on a child
    else if (node.bindChild) {
      //debugger;
    }
    //handle binded children
    else if (node.bindChildren) {
      //debugger;
    }
  };


  return Inferno;
})();
