(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Volumes/StorageVol/Sites/www/EngineJS/example/Inferno/Compiler.js":[function(require,module,exports){

function getTagData(tagText) {
  var parts = [];
  var char = '';
  var lastChar = '';
  var i = 0;
  var s = 0;
  var currentString = '';
  var literalString = '';
  var inQuotes = false;
  var attrs = [];
  var attrParts = [];
  var attr = {};
  var inLiteral = false;
  for(i = 0; i < tagText.length; i++) {
    char = tagText[i];
    if(char === " " && inQuotes === false) {
      parts.push(currentString);
      currentString = '';
    } else if(char === "'") {
      inQuotes = !inQuotes;
    } else if(char === '"') {
        inQuotes = !inQuotes;
    } else {
      currentString += char;
    }
  }
  if(currentString !== "") {
    parts.push(currentString);
  }
  currentString = '';
  for(i = 1; i < parts.length; i++) {
    //find the frist "=", exclude things inside literal tags
    attrParts = [];
    for(s = 0; s < parts[i].length; s++) {
      char = parts[i][s];
      if(char === "=" && inLiteral === false) {
        attrParts.push('"' + currentString + '"');
        currentString = '';
      } else if(char === "{" && lastChar === "$" && inLiteral === false) {
        inLiteral = true;
      } else if(char === "}" && inLiteral === true) {
        inLiteral = false;
        currentString = currentString.substring(0, currentString.length - 1);
        currentString += '" + ' + literalString + ' + "';
        literalString = '';
      } else if(inLiteral === true) {
        literalString += char;
      } else {
        currentString += char;
        lastChar = char;
      }
    }
    if(currentString != "") {
      attrParts.push('"' + currentString + '"');
    }
    if(attrParts.length > 1) {
      attr = {};
      attr[attrParts[0]] = attrParts[1];
      attrs.push(attr);
    }
  }
  return {
    tag: parts[0],
    attrs: attrs
  }
};

function buildChildren(root, tagParams, childrenProp) {
  var childrenText = [];
  var i = 0;
  if(root.children != null && Array.isArray(root.children)) {
    childrenText.push("[");
    for(i = 0; i < root.children.length; i++) {
      buildFunction(root.children[i], childrenText, i === root.children.length - 1)
    }
    childrenText.push("]");
    tagParams.push((childrenProp ? "children: " : "") + childrenText.join(""));
  } else if(root.children != null) {
    tagParams.push((childrenProp ? "children: " : "") + "'" + root.children + "'");
  }
};

function buildFunction(root, functionText, isLast) {
  var i = 0;
  var tagParams = [];
  var literalParts = [];
  if(Array.isArray(root)) {
    functionText.push("[");
    for(i = 0; i < root.length; i++) {
      buildFunction(root[i], functionText, i === root.length - 1);
    }
    functionText.push("]");
  } else {
    if(root.tag === "if") {
      functionText.push("(function() {");
      functionText.push("if(");
      functionText.push(root.expression);
      functionText.push("){");
      buildChildren(root, tagParams, false);
      functionText.push("return " + tagParams.join(','));
      functionText.push("}")
      functionText.push("return [];");
      functionText.push("}.bind(this))()");
    } else if(root.tag === "for") {
      //strip uneeded space and double spaces and then split
      literalParts = root.expression
                        .trim()
                        .replace(", ", ",")
                        .replace(" ,", ",")
                        .replace("(", "")
                        .replace(")", "")
                        .replace(/ +(?= )/g,'')
                        .split(" ");
      functionText.push("(function() {");
      functionText.push("var result = [];");
      functionText.push("var " + literalParts[0].split(",")[0] + " = null;");
      functionText.push("var " + literalParts[0].split(",")[1] + " = 0;");
      functionText.push("for(var i = 0; i < " + literalParts[2] + ".length; i++){");
      functionText.push(literalParts[0].split(",")[0] + " = " + literalParts[2] + "[i];");
      functionText.push(literalParts[0].split(",")[1] + " = i;");
      buildChildren(root, tagParams, false);
      functionText.push("result.push(" + tagParams.join(',') + ")");
      functionText.push("}");
      functionText.push("return result;");
      functionText.push("}.bind(this))()");
    } else {
      functionText.push("{");
      tagParams.push("tag: '" + root.tag + "'");
      buildChildren(root, tagParams, true);
      functionText.push(tagParams.join(','));
      functionText.push("}");
    }
    if(isLast === false) {
      functionText.push(",");
    }
  }
};

function compile(text) {
  var char = '';
  var lastChar = '';
  var i = 0, s = 0;
  var root = [];
  var insideTag = false;
  var tagContent = '';
  var tagName = '';
  var vElement = null;
  var childText = '';
  var literalText = '';
  var parent = root;
  var objectLiteral = false;
  var tagData = [];

  for(i = 0; i < text.length; i++) {
    char = text[i];

    if(char === "<" && objectLiteral === false) {
      insideTag = true;
    } else if(char === ">" && insideTag === true && objectLiteral === false) {
      //check if first character is a close tag
      if(tagContent[0] === "/") {
        if(childText.trim() !== "") {
          parent.children = childText;
        }
        parent = parent.parent;
      } else {
        //check if there any spaces in the tagContent, if not, we have our tagName
        if(tagContent.indexOf(" ") === -1) {
          tagName = tagContent;
        } else {
          tagData = getTagData(tagContent);
          tagName = tagData.tag;
        }
        //now we create out vElement
        if(tagName === "for" || tagName === "if") {
          vElement = {
            tag: tagName,
            expression: literalText,
            children: []
          };
        } else {
          vElement = {
            tag: tagName,
            attrs: tagName.attrs || [],
            children: []
          };
        }
        if(Array.isArray(parent)) {
          parent.push(vElement);
        } else {
          parent.children.push(vElement);
        }
        vElement.parent = parent;
        parent = vElement;
      }
      insideTag = false;
      tagContent = '';
      childText = '';
    } else if (char === "{" && lastChar === "$" && objectLiteral === false ) {
      objectLiteral = true;
      literalText = '';
    } else if (char === "}" && objectLiteral === true && insideTag === false) {
      objectLiteral = false;
      childText = childText.substring(0, childText.length - 1);
      childText += "' + " + literalText + " + '";
    } else if (char === "}" && objectLiteral === true && insideTag === true) {
      objectLiteral = false;
      tagContent = tagContent.substring(0, tagContent.length - 1);
      //a property
      tagContent += '"${' + literalText.trim() + '}"';
    } else if (insideTag === true && objectLiteral === false) {
      tagContent += char;
      lastChar = char;
    } else if (objectLiteral === true) {
      literalText += char;
    } else {
      if(lastChar === " " && char === " ") {
      } else {
        childText += char;
      }
      lastChar = char;
    }
  }
  //then convert the root data to a new Function()
  var functionText = [];
  //then return the virtual dom object
  functionText.push("return ");
  //build our functionText
  buildFunction(root, functionText, false);
  //convert to a string
  functionText = functionText.join('');
  //make the funcitonText into a function
  return new Function(functionText);
};

var Compiler = {
  compile: function(text) {
    //strip new lines
    text = text.replace(/(\r\n|\n|\r)/gm,"");
    return compile(text);
  },
};

module.exports = Compiler;

},{}],"/Volumes/StorageVol/Sites/www/EngineJS/example/Inferno/CustomTag.js":[function(require,module,exports){

function CustomTag(tag, tagClass) {
  this._element = null;
  this._tag = tag;
  this._tagClass = null;
  this._root = null;
  this._initCustomElement(tagClass);
};

CustomTag.prototype._convertNamedNodeMapToObject = function(namedNodeMap) {
  var obj = {};
  for(var key in namedNodeMap) {
    if(namedNodeMap[key].nodeName != null) {
      obj[namedNodeMap[key].nodeName] = namedNodeMap[key].value;
    }
  }
  return obj;
};

CustomTag.prototype._initCustomElement = function(tagClass) {
  //keep a copy of this so we can pass it down the closures
  var self = this;
  //create a new HTML custom element
  this._element = Object.create(HTMLElement.prototype);
  //setup the customElement functions
  this._element.createdCallback = function() {
    self._root = this;
  };
  this._element.attachedCallback = function() {
    var attributes = self._convertNamedNodeMapToObject(this.attributes);
    tagClass = new tagClass(attributes);
    self._tagClass = tagClass;
    self._element.tagClass = tagClass;
    self.render();
  };
  //register the custom element
  document.registerElement(this._tag,
    { prototype: this._element })
};

CustomTag.prototype.render = function() {
  //call the render function on the class
  if(this._tagClass.render != null) {
    var template = this._tagClass.render();
    if(template != null && template.hasMounted() === false) {
      template.mount(this._root);
    }
  }
  requestAnimationFrame(this.render.bind(this));
}

module.exports = CustomTag;

},{}],"/Volumes/StorageVol/Sites/www/EngineJS/example/Inferno/Template.js":[function(require,module,exports){
var cito = require("./cito.js");
var Compiler = require("./Compiler.js");

function Template(templatePath) {
  this._compiledTemplate = null;
  this._root = null;
  this._mounted = false;

  Inferno.loadFile("/EngineJS/example/demo.html").then(function(text) {
    this._compiledTemplate = Compiler.compile(text);
  }.bind(this))
};

Template.prototype.hasMounted = function() {
  return this._mounted;
};

Template.prototype.mount = function(root) {
  if(this._compiledTemplate != null) {
    this._root = root;
    this._mounted = true;
    var tempRoot = {tag: 'div', children: this._compiledTemplate.call(this._root.tagClass)};
    cito.vdom.append(this._root, tempRoot);
  }
};

module.exports = Template;

},{"./Compiler.js":"/Volumes/StorageVol/Sites/www/EngineJS/example/Inferno/Compiler.js","./cito.js":"/Volumes/StorageVol/Sites/www/EngineJS/example/Inferno/cito.js"}],"/Volumes/StorageVol/Sites/www/EngineJS/example/Inferno/cito.js":[function(require,module,exports){
/*
 * Copyright (c) 2015, Joel Richard
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var cito = window.cito || {};
(function (cito, window, undefined) {
    'use strict';

    var document = window.document,
        navigator = window.navigator,
        noop = function () {},
        console = window.console || {warn: noop, error: noop};

    var userAgent = navigator.userAgent,
        isWebKit = userAgent.indexOf('WebKit') !== -1,
        isFirefox = userAgent.indexOf('Chrome') !== -1,
        isTrident = userAgent.indexOf('Trident') !== -1;

    var helperDiv = document.createElement('div'),
        supportsTextContent = 'textContent' in document,
        supportsEventListener = 'addEventListener' in document,
        supportsRange = 'createRange' in document,
        supportsCssSetProperty = 'setProperty' in helperDiv.style;

    function isString(value) {
        return typeof value === 'string';
    }

    function isArray(value) {
        return value instanceof Array;
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function isPromise(value) {
        return value.then !== undefined;
    }

    function norm(node, oldNode) {
        var type = typeof node;
        if (type === 'string') {
            node = {tag: '#', children: node};
        } else if (type === 'function') {
            node = node(oldNode);
            node = (node === undefined) ? oldNode : norm(node, oldNode);
        }
        return node;
    }

    function normIndex(children, i, oldChild) {
        var origChild = children[i], child;
        if (origChild && isPromise(origChild)) {
            child = {};
            var immediate = true;
            origChild.then(function (newChild) {
                if (immediate) {
                    child = norm(newChild, oldChild);
                } else if (children[i] === child) {
                    vdom.update(child, newChild);
                }
            });
            immediate = false;
        } else {
            child = norm(origChild, oldChild);
        }
        if (origChild !== child) {
            children[i] = child;
        }
        return child;
    }

    function normChildren(node, children, oldChildren) {
        var origChildren = children;
        if (children) {
            // TODO move promise support into utility function
            if (isPromise(children)) {
                children = [];
                var immediate = true;
                origChildren.then(function (newChildren) {
                    if (immediate) {
                        children = normChildren(node, newChildren, oldChildren);
                    }
                    // TODO if the parent has been updated too, then this is misleading
                    else if (node.children === children) {
                        vdom.updateChildren(node, newChildren);
                    }
                });
                immediate = false;
            } else if (isFunction(children)) {
                children = children(oldChildren);
                if (children === undefined) {
                    children = oldChildren;
                }
            }
        }

        // TODO convert to array only after only child optimization
        var childrenIsArray = isArray(children),
            hasOnlyChild, onlyChild;
        if (!childrenIsArray) {
            hasOnlyChild = true;
            onlyChild = children;
        } else if (children.length === 1) {
            hasOnlyChild = true;
            onlyChild = children[0];
        } else {
            hasOnlyChild = false;
        }
        if (hasOnlyChild) {
            // Ignore falsy and empty text/html nodes because no node would be created for them
            if (!onlyChild || (!onlyChild.children && (onlyChild.tag === '#' || onlyChild.tag === '<'))) {
                children = [];
            } else if (!childrenIsArray) {
                children = [onlyChild];
            }
        }

        if (origChildren !== children) {
            node.children = children;
        }
        return children;
    }

    function moveChild(domElement, child, nextChild) {
        var domChild = child.dom, domLength = child.domLength || 1,
            domNextChild,
            domRefChild = nextChild && nextChild.dom;
        if (domChild !== domRefChild) {
            while (domLength--) {
                domNextChild = (domLength > 0) ? domChild.nextSibling : null;
                if (domRefChild) {
                    domElement.insertBefore(domChild, domRefChild);
                } else {
                    domElement.appendChild(domChild);
                }
                domChild = domNextChild;
            }
        }
    }

    var iah_el = document.createElement('p'), iah_normalizes, iah_ignoresEmptyText;
    if (iah_el.insertAdjacentHTML) {
        iah_el.appendChild(document.createTextNode('a'));
        iah_el.insertAdjacentHTML('beforeend', 'b');
        iah_normalizes = (iah_el.childNodes.length === 1);

        iah_el = document.createElement('p');
        iah_el.appendChild(document.createTextNode(''));
        iah_el.insertAdjacentHTML('beforeend', '<b>');
        iah_ignoresEmptyText = (iah_el.firstChild.nodeType !== 3);
    }

    function insertAdjacentHTML(node, position, htmlContent) {
        if (node.insertAdjacentHTML) {
            var prevText, prevTextLength, prevTextEmpty;
            if (iah_normalizes || iah_ignoresEmptyText) {
                var prevNode = (position === 'beforebegin') ? node.previousSibling
                    : (position === 'beforeend') ? node.lastChild : null;
                if (prevNode && prevNode.nodeType === 3) {
                    prevText = prevNode;
                    if (iah_ignoresEmptyText && prevNode.length === 0) {
                        prevTextEmpty = true;
                        prevNode.nodeValue = ' ';
                    }
                    if (iah_normalizes) {
                        prevTextLength = prevNode.length;
                    }
                }
            }
            node.insertAdjacentHTML(position, htmlContent);
            if (prevText) {
                // Split previous text node if it was updated instead of a new one inserted (IE/FF)
                if (iah_normalizes && prevText.length !== prevTextLength) {
                    prevText.splitText(prevTextLength);
                }
                if (iah_ignoresEmptyText && prevTextEmpty) {
                    prevText.nodeValue = '';
                }
            }
        } else {
            var child;
            helperDiv.innerHTML = htmlContent;
            if (position === 'beforebegin') {
                var parentNode = node.parentNode;
                while (child = helperDiv.firstChild) { // jshint ignore:line
                    parentNode.insertBefore(child, node);
                }
            } else if (position === 'beforeend') {
                while (child = helperDiv.firstChild) { // jshint ignore:line
                    node.appendChild(child);
                }
            }
        }
    }

    function insertChild(domParent, domNode, nextChild, replace) {
        if (nextChild) {
            var domNextChild = nextChild.dom;
            if (replace) {
                var domLength = nextChild.domLength || 1;
                if (domLength === 1) {
                    destroyNode(nextChild);
                    domParent.replaceChild(domNode, domNextChild);
                } else {
                    domParent.insertBefore(domNode, domNextChild);
                    removeChild(domParent, nextChild);
                }
            } else {
                domParent.insertBefore(domNode, domNextChild);
            }
        } else {
            domParent.appendChild(domNode);
        }
    }

    function createNode(node, domParent, parentNs, hasDomSiblings, nextChild, replace) {
        // TODO evaluate when else to use
        if (isTrident) {
            return insertNodeHTML(node, domParent, nextChild, replace);
        }

        var domNode, tag = node.tag, children = node.children;
        if (!tag) {
            createFragment(node, children, domParent, parentNs, hasDomSiblings, nextChild, replace);
        } else {
            // Element
            switch (tag) {
                case '#':
                    domNode = document.createTextNode(children);
                    break;
                case '!':
                    domNode = document.createComment(children);
                    break;
                case '<':
                    if (children) {
                        var domChildren = domParent.childNodes,
                            prevLength = domChildren.length;
                        if (nextChild) {
                            var domNextChild = nextChild.dom,
                                domPrevChild = domNextChild.previousSibling;
                            insertAdjacentHTML(domNextChild, 'beforebegin', children);
                            domNode = domPrevChild ? domPrevChild.nextSibling : domParent.firstChild;
                        } else {
                            insertAdjacentHTML(domParent, 'beforeend', children);
                            domNode = domChildren[prevLength];
                        }
                        node.dom = domNode;
                        node.domLength = domChildren.length - prevLength;
                        if (replace && nextChild) {
                            removeChild(domParent, nextChild);
                        }
                        return;
                    } else {
                        // TODO find solution without dom placeholder
                        domNode = document.createTextNode('');
                    }
                    break;
                default:
                    var ns;
                    switch (tag) {
                        case 'svg': ns = 'http://www.w3.org/2000/svg'; break;
                        case 'math': ns = 'http://www.w3.org/1998/Math/MathML'; break;
                        default: ns = parentNs; break;
                    }
                    if (ns) {
                        node.ns = ns;
                        domNode = document.createElementNS(ns, tag);
                    } else {
                        domNode = document.createElement(tag);
                    }
                    node.dom = domNode;
                    children = normChildren(node, children);
                    if (isTrident && domParent) {
                        insertChild(domParent, domNode, nextChild, replace);
                    }
                    createChildren(domNode, node, ns, children, 0, children.length, children.length > 1);
                    updateElement(domNode, null, null, node, tag, node.attrs, node.events);
                    if (!isTrident && domParent) {
                        insertChild(domParent, domNode, nextChild, replace);
                    }
                    return;
            }
            node.dom = domNode;
            if (domParent) {
                insertChild(domParent, domNode, nextChild, replace);
            }
        }
    }

    // TODO do not use in loop
    function insertNodeHTML(node, domParent, nextChild, replace) {
        var html = createNodeHTML(node), domNode;
        if (domParent) {
            var prevNode;
            if (!nextChild && !domParent.hasChildNodes()) {
                domParent.innerHTML = html;
                domNode = domParent.firstChild;
            } else {
                if (nextChild) {
                    prevNode = nextChild.dom.previousSibling;
                    insertAdjacentHTML(nextChild.dom, 'beforebegin', html);
                    if (replace) {
                        // TODO use outerHTML if possible
                        removeChild(domParent, nextChild);
                    }
                } else {
                    prevNode = domParent.lastChild;
                    insertAdjacentHTML(domParent, 'beforeend', html);
                }
                domNode = prevNode ? prevNode.nextSibling : domParent.firstChild;
            }
        } else {
            // TODO better parsing
            helperDiv.innerHTML = html;
            domNode = helperDiv.removeChild(helperDiv.firstChild);
        }
        if (node.tag) {
            postCreateNodeHTML(domNode, node, 0);
        } else {
            var domTestNode = domParent.firstChild, domIndex = 0;
            while (domTestNode !== domNode) {
                domTestNode = domTestNode.nextSibling;
                domIndex++;
            }
            postCreateFragmentHTML(domParent, node, domIndex);
        }
    }

    var endOfText = '\u0003';

    // TODO fix namespace issue in FF
    // TODO omit all unnecessary endOfText
    function createNodeHTML(node, context) {
        var tag = node.tag, children = node.children;
        switch (tag) {
            case '#':
                return escapeContent(children) + endOfText;
            case '!':
                return '<!--' + escapeComment(children) + '-->';
            case '<':
                return children + endOfText;
            default:
                var html;
                if (tag) {
                    var attrs = node.attrs;
                    if (tag === 'select' && attrs) {
                        context = {selectedIndex: attrs.selectedIndex, value: attrs.value, optionIndex: 0};
                    } else if (tag === 'option' && context) {
                        if ((context.value && context.value === attrs.value) ||
                            (context.selectedIndex !== undefined && context.selectedIndex === context.optionIndex)) {
                            attrs.selected = true;
                        }
                        context.optionIndex++;
                    }
                    // TODO validate tag name
                    html = '<' + tag;
                    if (attrs) {
                        html += ' ';
                        for (var attrName in attrs) {
                            var attrValue = attrs[attrName];
                            if (attrValue === false ||
                                (tag === 'select' && (attrName === 'value' || attrName === 'selectedIndex'))) {
                                continue;
                            } else if (tag === 'textarea' && attrName === 'value') {
                                children = attrValue;
                                continue;
                            } else if (attrValue === true) {
                                attrValue = '';
                            } else if (attrName === 'style' && !isString(attrValue)) {
                                var style = '';
                                for (var propName in attrValue) {
                                    style += propName + ': ' + attrValue[propName] + '; ';
                                }
                                attrValue = style;
                            }
                            html += ' ' + escapedAttr(attrName, attrValue);
                        }
                    }
                } else {
                    html = '';
                }

                children = normChildren(node, children);
                var childrenLength = children.length;
                if (tag) {
                    html += '>';
                }
                if (childrenLength === 1 && isString(children[0])) {
                    html += escapeContent(children[0]);
                    if (!tag) {
                        html += endOfText;
                    }
                } else if (childrenLength === 0 && !tag) {
                    html += endOfText;
                } else {
                    for (var i = 0; i < childrenLength; i++) {
                        html += createNodeHTML(normIndex(children, i), context);
                    }
                }
                if (tag) {
                    // TODO close only required tags explicitly
                    html += '</' + tag + '>';
                }
                return html;
        }
    }

    // TODO avoid using childNodes if possible
    // TODO merge both post together
    function postCreateNodeHTML(domNode, node, domIndex) {
        node.dom = domNode;
        var text, endIndex;
        switch (node.tag) {
            case '#':
                text = domNode.nodeValue;
                endIndex = text.indexOf(endOfText);
                if (endIndex !== -1) {
                    if (endIndex + 1 < text.length) {
                        domNode.splitText(endIndex + 1);
                    }
                    domNode.nodeValue = text.substr(0, endIndex);
                }
                break;
            case '!': break;
            case '<':
                var domLength = 0;
                for (; domNode; domNode = domNode.nextSibling) {
                    domLength++;
                    if (domNode.nodeType === 3) {
                        text = domNode.nodeValue;
                        if (domLength > 1 && text === endOfText) {
                            domNode.parentNode.removeChild(domNode);
                            domLength--;
                        } else {
                            endIndex = text.indexOf(endOfText);
                            if (endIndex !== -1) {
                                if (endIndex + 1 < text.length) {
                                    domNode.splitText(endIndex + 1);
                                }
                                domNode.nodeValue = text.substr(0, endIndex);
                                break;
                            }
                        }
                    }
                }
                node.domLength = domLength;
                return domIndex + domLength;
            default:
                var children = node.children,
                    childrenLength = children.length;
                if (childrenLength !== 1 || !isString(children[0])) {
                    var domChildren = domNode.childNodes;
                    for (var i = 0, childDomIndex = 0; i < childrenLength; i++) {
                        var child = children[i];
                        childDomIndex = child.tag ? postCreateNodeHTML(domChildren[childDomIndex], child, childDomIndex)
                            : postCreateFragmentHTML(domNode, child, childDomIndex);
                    }
                }
                var events = node.events;
                if (events) {
                    createEventHandlers(domNode, node, events);
                }
                break;
        }
        return domIndex + 1;
    }

    function postCreateFragmentHTML(domParent, node, domIndex) {
        var children = node.children,
            domChildren = domParent.childNodes;
        if (children.length === 0) {
            var domNode = domChildren[domIndex];
            if (domNode.length > 1) {
                domNode.splitText(1);
            }
            domNode.nodeValue = '';
            node.dom = domNode;
            domIndex++;
        } else {
            if (children.length === 1) {
                normIndex(children, 0);
            }
            var startDomIndex = domIndex;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                domIndex = child.tag ? postCreateNodeHTML(domChildren[domIndex], child, domIndex)
                    : postCreateFragmentHTML(domParent, child, domIndex);
            }
            node.dom = children[0].dom;
            node.domLength = domIndex - startDomIndex;
        }
        return domIndex;
    }

    function escapeContent(value) {
        value = '' + value;
        if (isWebKit) {
            helperDiv.innerText = value;
            value = helperDiv.innerHTML;
        } else if (isFirefox) {
            value = value.split('<').join('&lt;').split('>').join('&gt;').split('&').join('&amp;');
        } else {
            value = value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
        }
        return value;
    }

    function escapeComment(value) {
        value = '' + value;
        // TODO print warning if value contains --
        return value.replace(/-{2,}/g, '-');
    }

    function escapedAttr(name, value) {
        var type = typeof value;
        value = '' + value;
        if (type !== 'number') {
            if (isFirefox) {
                value = value.split('"').join('&quot;').split('&').join('&amp;');
            } else {
                value = value.replace(/"/g, '&quot;').replace(/&/g, '&amp;');
            }
        }
        return name + '="' + value + '"';
    }

    function createFragment(node, children, domParent, parentNs, hasDomSiblings, nextChild, replace) {
        children = normChildren(node, children);
        var domNode, domLength,
            childrenLength = children.length;
        if (parentNs) {
            node.ns = parentNs;
        }
        if (childrenLength === 0) {
            // TODO find solution without dom placeholder
            domNode = document.createTextNode('');
            insertChild(domParent, domNode, nextChild, replace);
        } else {
            hasDomSiblings = hasDomSiblings || childrenLength > 1;
            domLength = 0;
            for (var i = 0; i < childrenLength; i++) {
                var child = normIndex(children, i);
                createNode(child, domParent, parentNs, hasDomSiblings, nextChild, false);
                domLength += child.domLength || 1;
            }
            domNode = children[0].dom;
            if (replace) {
                removeChild(domParent, nextChild);
            }
        }
        node.dom = domNode;
        node.domLength = domLength;
    }

    function updateElement(domElement, oldAttrs, oldEvents, element, tag, attrs, events) {
        // Attributes
        var attrName;
        if (attrs) {
            for (attrName in attrs) {
                var attrValue = attrs[attrName];
                if (attrName === 'style') {
                    var oldAttrValue = oldAttrs && oldAttrs[attrName];
                    if (oldAttrValue !== attrValue) {
                        updateStyle(domElement, oldAttrValue, attrs, attrValue);
                    }
                } else if (attrName === 'class') {
                    domElement.className = attrValue;
                } else if (isInputProperty(tag, attrName)) {
                    if (domElement[attrName] !== attrValue) {
                        domElement[attrName] = attrValue;
                    }
                } else if (!oldAttrs || oldAttrs[attrName] !== attrValue) {
                    updateAttribute(domElement, attrName, attrValue);
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

        // Events
        if (events) {
            createEventHandlers(domElement, element, events, oldEvents);
        }
        if (oldEvents) {
            for (var eventType in oldEvents) {
                if (!events || !events[eventType]) {
                    removeEventHandler(domElement, eventType);
                }
            }
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
            if (ns) {
                domElement.setAttributeNS(ns, name, value);
            } else {
                domElement.setAttribute(name, value);
            }
        }
    }

    function updateStyle(domElement, oldStyle, attrs, style) {
        var propName;
        if (!isString(style) && (!supportsCssSetProperty || !oldStyle || isString(oldStyle))) {
            var styleStr = '';
            if (style) {
                for (propName in style) {
                    styleStr += propName + ': ' + style[propName] + '; ';
                }
            }
            style = styleStr;
            if (!supportsCssSetProperty) {
                attrs.style = style;
            }
        }
        var domStyle = domElement.style;
        if (isString(style)) {
            domStyle.cssText = style;
        } else {
            if (style) {
                for (propName in style) {
                    // TODO should important properties even be supported?
                    var propValue = style[propName];
                    if (!oldStyle || oldStyle[propName] !== propValue) {
                        var importantIndex = propValue.indexOf('!important');
                        if (importantIndex !== -1) {
                            domStyle.setProperty(propName, propValue.substr(0, importantIndex), 'important');
                        } else {
                            if (oldStyle) {
                                var oldPropValue = oldStyle[propName];
                                if (oldPropValue && oldPropValue.indexOf('!important') !== -1) {
                                    domStyle.removeProperty(propName);
                                }
                            }
                            domStyle.setProperty(propName, propValue, '');
                        }
                    }
                }
            }
            if (oldStyle) {
                for (propName in oldStyle) {
                    if (!style || style[propName] === undefined) {
                        domStyle.removeProperty(propName);
                    }
                }
            }
        }
    }

    function createEventHandlers(domElement, element, events, oldEvents) {
        domElement.virtualNode = element;
        for (var eventType in events) {
            if (!oldEvents || !oldEvents[eventType]) {
                addEventHandler(domElement, eventType);
            }
        }
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

    function addEventHandler(domElement, type) {
        if (supportsEventListener) {
            domElement.addEventListener(type, eventHandler, false);
        } else {
            var onType = 'on' + type;
            if (onType in domElement) {
                domElement[onType] = eventHandler;
            } else {
                // TODO bind element to event handler + tests
                domElement.attachEvent(onType, eventHandler);
            }
        }
    }

    function removeEventHandler(domElement, type) {
        if (supportsEventListener) {
            domElement.removeEventListener(type, eventHandler, false);
        } else {
            var onType = 'on' + type;
            if (onType in domElement) {
                domElement[onType] = null;
            } else {
                domElement.detachEvent(onType, eventHandler);
            }
        }
    }

    function getTextIfTextNode(node) {
        return isString(node) ? node : (node.tag === '#') ? node.children : null;
    }

    function createChildren(domElement, element, parentNs, children, i, to, hasDomSiblings, nextChild) {
        if (i === 0 && to === 1 && !hasDomSiblings) {
            var onlyChild = children[0],
                onlyChildText = getTextIfTextNode(onlyChild);
            if (onlyChildText !== null) {
                setTextContent(domElement, onlyChildText);
                return;
            } else if (onlyChild.tag === '<') {
                domElement.innerHTML = onlyChild.children;
                return;
            }
        }
        for (; i < to; i++) {
            if(isArray(children[i])) {
              createChildren(domElement, element, parentNs, children[i], 0, children[i].length, hasDomSiblings, nextChild);
            } else {
              createNode(normIndex(children, i), domElement, parentNs, hasDomSiblings, nextChild);
            }
        }
    }

    var range = supportsRange ? document.createRange() : null;

    function removeChildren(domElement, children, i, to) {
        if (i === 0 && to === 1 && children.length === 1) {
            var onlyChild = children[0];
            if (!onlyChild.dom) {
                for (var domChild; domChild = domElement.firstChild;) { // jshint ignore:line
                    domElement.removeChild(domChild);
                }
                return;
            }
        }
        for (; i < to; i++) {
            removeChild(domElement, children[i]);
        }
        // TODO use range for better performance with many children
        // TODO use setStartBefore/setEndAfter for faster range delete
        /*
         } else if (hasRange && count === children.length) {
            for (i = from; i < to; i++) {
                destroyNode(children[i]);
            }
            range.selectNodeContents(domElement);
            range.deleteContents();
         */
    }

    function removeChild(domElement, child) {
        destroyNode(child);
        var domChild = child.dom, domLength = child.domLength || 1,
            domNextChild;
        while (domLength--) {
            domNextChild = (domLength > 0) ? domChild.nextSibling : null;
            domElement.removeChild(domChild);
            domChild = domNextChild;
        }
    }

    function setTextContent(domElement, text) {
        if (supportsTextContent) {
            domElement.textContent = text;
        } else {
            domElement.innerText = text;
        }
    }

    function updateOnlyChild(domElement, oldChildren, oldEndIndex, children) {
        var child = children[0], oldChild = oldChildren[0],
            childText = getTextIfTextNode(child),
            update = (oldEndIndex !== 0),
            sameType = false;
        if (childText !== null) {
            if (!update) {
                var oldChildText = getTextIfTextNode(oldChild);
                sameType = (oldChildText !== null);
                update = (childText !== oldChildText);
            }
            if (update) {
                if (!sameType) {
                    destroyNodes(oldChildren);
                }
                setTextContent(domElement, childText);
            }
        } else if (child.tag === '<') {
            if (!update) {
                sameType = (oldChild.tag === '<');
                update = !sameType || (child.children !== oldChild.children);
            }
            if (update) {
                if (!sameType) {
                    destroyNodes(oldChildren);
                }
                domElement.innerHTML = child.children;
            }
        } else {
            update = false;
        }
        return update || sameType;
    }

    function updateChildren(domElement, element, ns, oldChildren, children, hasDomSiblings, outerNextChild) {
        children = normChildren(element, children, oldChildren);
        if (children === oldChildren) {
            return;
        }

        var oldEndIndex = oldChildren.length - 1,
            endIndex = children.length - 1;
        hasDomSiblings = hasDomSiblings || endIndex > 0;
        if (endIndex === 0 && !hasDomSiblings && updateOnlyChild(domElement, oldChildren, oldEndIndex, children)) {
            return;
        }

        if (oldEndIndex === 0) {
            var oldOnlyChild = normIndex(oldChildren, 0);
            if (!oldOnlyChild.dom) {
                oldOnlyChild.dom = domElement.firstChild;
                if (oldOnlyChild.tag === '<') {
                    oldOnlyChild.domLength = domElement.childNodes.length;
                }
            }
        }

        var oldStartIndex = 0, startIndex = 0,
            successful = true,
            nextChild;
        outer: while (successful && oldStartIndex <= oldEndIndex && startIndex <= endIndex) {
            successful = false;
            var oldStartChild, oldEndChild, startChild, endChild;

            oldStartChild = oldChildren[oldStartIndex];
            startChild = normIndex(children, startIndex, oldStartChild);
            while (oldStartChild.key === startChild.key) {
                nextChild = oldChildren[oldStartIndex + 1] || outerNextChild;
                updateNode(oldStartChild, startChild, domElement, ns, hasDomSiblings, nextChild);
                oldStartIndex++; startIndex++;
                if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
                    break outer;
                }
                oldStartChild = oldChildren[oldStartIndex];
                startChild = normIndex(children, startIndex, oldStartChild);
                successful = true;
            }
            oldEndChild = oldChildren[oldEndIndex];
            endChild = normIndex(children, endIndex);
            while (oldEndChild.key === endChild.key) {
                nextChild = children[endIndex + 1] || outerNextChild;
                updateNode(oldEndChild, endChild, domElement, ns, hasDomSiblings, nextChild);
                oldEndIndex--; endIndex--;
                if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
                    break outer;
                }
                oldEndChild = oldChildren[oldEndIndex];
                endChild = normIndex(children, endIndex);
                successful = true;
            }
            while (oldStartChild.key === endChild.key) {
                nextChild = children[endIndex + 1] || outerNextChild;
                updateNode(oldStartChild, endChild, domElement, ns, hasDomSiblings, nextChild);
                moveChild(domElement, endChild, nextChild);
                oldStartIndex++; endIndex--;
                if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
                    break outer;
                }
                oldStartChild = oldChildren[oldStartIndex];
                endChild = normIndex(children, endIndex);
                successful = true;
            }
            while (oldEndChild.key === startChild.key) {
                nextChild = oldChildren[oldStartIndex] || outerNextChild;
                updateNode(oldEndChild, startChild, domElement, ns, nextChild);
                moveChild(domElement, startChild, nextChild);
                oldEndIndex--; startIndex++;
                if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
                    break outer;
                }
                oldEndChild = oldChildren[oldEndIndex];
                startChild = normIndex(children, startIndex);
                successful = true;
            }
        }

        if (oldStartIndex > oldEndIndex) {
            nextChild = normIndex(children, endIndex + 1) || outerNextChild;
            createChildren(domElement, element, ns, children, startIndex, endIndex + 1, hasDomSiblings, nextChild);
        } else if (startIndex > endIndex) {
            removeChildren(domElement, oldChildren, oldStartIndex, oldEndIndex + 1);
        } else {
            var i, oldChild,
                oldNextChild = oldChildren[oldEndIndex + 1],
                oldChildrenMap = {};
            for (i = oldEndIndex; i >= oldStartIndex; i--) {
                oldChild = oldChildren[i];
                oldChild.next = oldNextChild;
                oldChildrenMap[oldChild.key] = oldChild;
                oldNextChild = oldChild;
            }
            nextChild = normIndex(children, endIndex + 1) || outerNextChild;
            for (i = endIndex; i >= startIndex; i--) {
                var child = children[i],
                    key = child.key;
                oldChild = oldChildrenMap[key];
                if (oldChild) {
                    oldChildrenMap[key] = null;
                    oldNextChild = oldChild.next;
                    updateNode(oldChild, child, domElement, ns, hasDomSiblings, nextChild);
                    if ((oldNextChild && oldNextChild.key) !== (nextChild && nextChild.key)) {
                        moveChild(domElement, child, nextChild);
                    }
                } else {
                    createNode(child, domElement, ns, hasDomSiblings, nextChild);
                }
                nextChild = child;
            }
            for (i = oldStartIndex; i <= oldEndIndex; i++) {
                oldChild = oldChildren[i];
                if (oldChildrenMap[oldChild.key] !== null) {
                    removeChild(domElement, oldChild);
                }
            }
        }
    }

    var stopImmediate = false;

    function eventHandler(event) {
        event = getFixedEvent(event, this); // jshint ignore:line
        var currentTarget = event.currentTarget,
            eventHandlers = currentTarget.virtualNode.events[event.type];
        if (isArray(eventHandlers)) {
            for (var i = 0, len = eventHandlers.length; i < len; i++) {
                callEventHandler(eventHandlers[i], currentTarget, event);
                if (stopImmediate) {
                    stopImmediate = false;
                    break;
                }
            }
        } else {
            callEventHandler(eventHandlers, currentTarget, event);
        }
    }

    // jshint ignore:start
    function preventDefault() {
        this.defaultPrevented = true;
        this.returnValue = false;
    }
    function stopPropagation() {
        this.cancelBubble = true;
    }
    function stopImmediatePropagation() {
        stopImmediate = true;
        this.stopPropagation();
    }
    // jshint ignore:end

    function getFixedEvent(event, thisArg) {
        if (!event) {
            event = window.event;
            if (!event.preventDefault) {
                event.preventDefault = preventDefault;
                event.stopPropagation = stopPropagation;
                event.defaultPrevented = (event.returnValue === false);
                event.target = event.srcElement;
            }
            event.currentTarget = thisArg.nodeType ? thisArg : event.target; // jshint ignore:line
            // TODO further event normalization
        }
        event.stopImmediatePropagation = stopImmediatePropagation;
        return event;
    }

    function callEventHandler(eventHandler, currentTarget, event) {
        try {
            if (eventHandler.call(currentTarget, event) === false) {
                event.preventDefault();
            }
        } catch (e) {
            console.error(e.stack || e);
        }
    }

    function updateNode(oldNode, node, domParent, parentNs, hasDomSiblings, nextChild) {
        if (node === oldNode) {
            return;
        }

        var domNode, tag = node.tag,
            oldChildren = oldNode.children, children = node.children;
        if (oldNode.tag !== tag) {
            createNode(node, domParent, parentNs, hasDomSiblings, oldNode, true);
        } else if (!tag) {
            updateFragment(oldNode, oldChildren, node, children, domParent, parentNs, hasDomSiblings, nextChild);
        } else {
            // Element
            domNode = oldNode.dom;
            switch (tag) {
                case '#':
                case '!':
                    if (oldChildren !== children) {
                        domNode.nodeValue = children;
                    }
                    node.dom = domNode;
                    break;
                case '<':
                    if (oldChildren !== children) {
                        createNode(node, domParent, ns, hasDomSiblings, oldNode, true);
                    } else {
                        node.dom = oldNode.dom;
                        node.domLength = oldNode.domLength;
                    }
                    break;
                default:
                    var ns = oldNode.ns;
                    if (ns) node.ns = ns;
                    node.dom = domNode;
                    updateChildren(domNode, node, ns, oldChildren, children, false);
                    updateElement(domNode, oldNode.attrs, oldNode.events, node, tag, node.attrs, node.events);
                    break;
            }
        }
    }

    function updateFragment(oldNode, oldChildren, node, children, domParent, parentNs, hasDomSiblings, nextChild) {
        children = normChildren(node, children, oldChildren);
        if (children === oldChildren) {
            return;
        }

        var domNode, domLength,
            oldChildrenLength = oldChildren.length,
            childrenLength = children.length;
        if (parentNs) {
            node.ns = parentNs;
        }
        hasDomSiblings = hasDomSiblings || childrenLength > 1;
        if (childrenLength === 0) {
            if (oldChildrenLength === 0) {
                domNode = oldNode.dom;
            } else {
                removeChildren(domParent, oldChildren, 0, oldChildren.length);
                // TODO find solution without dom placeholder
                domNode = document.createTextNode('');
                insertChild(domParent, domNode, nextChild);
            }
        } else if (oldChildrenLength === 0) {
            domParent.removeChild(oldNode.dom);
            createFragment(node, children, domParent, parentNs, hasDomSiblings, nextChild);
        } else {
            updateChildren(domParent, node, parentNs, oldChildren, children, hasDomSiblings, nextChild);
            if (childrenLength > 0) {
                domNode = children[0].dom;
                domLength = 0;
                // TODO should be done without extra loop/lazy
                for (var i = 0; i < childrenLength; i++) {
                    domLength += children[i].domLength || 1;
                }
            }
        }
        node.dom = domNode;
        node.domLength = domLength;
    }

    function destroyNode(node) {
        if (!isString(node)) {
            var domNode = node.dom;
            if (domNode) {
                var events = node.events;
                if (events) {
                    for (var eventType in events) {
                        removeEventHandler(domNode, eventType);
                    }
                }
                if (domNode.virtualNode) {
                    domNode.virtualNode = undefined;
                }
            }
            // TODO call callback
            var children = node.children;
            if (!isString(children)) {
                destroyNodes(children);
            }
        }
    }

    function destroyNodes(nodes) {
        for (var i = 0, len = nodes.length; i < len; i++) {
            destroyNode(nodes[i]);
        }
    }

    function copyObjectProps(source, target) {
        var key;
        for (key in source) {
            target[key] = source[key];
        }
        for (key in target) {
            if (source[key] === undefined) {
                target[key] = undefined;
            }
        }
    }

    var vdom = cito.vdom = {
        create: function (node) {
            node = norm(node);
            createNode(node);
            return node;
        },
        append: function (domParent, node) { // TODO params order
            node = norm(node);
            createNode(node, domParent);
            return node;
        },
        update: function (oldNode, node) {
            node = norm(node, oldNode);
            // TODO should detect first whether the node has already been rendered
            updateNode(oldNode, node, oldNode.dom.parentNode);
            copyObjectProps(node, oldNode);
            return oldNode;
        },
        updateChildren: function (element, children) {
            var oldChildren = element.children;
            children = normChildren(element, children, oldChildren);
            updateChildren(element.dom, element, element.ns, oldChildren, children);
            element.children = children;
        },
        remove: function (node) {
            var domParent = node.dom.parentNode;
            removeChild(domParent, node);
        }
    };

})(cito, window);

module.exports = cito;

},{}],"/Volumes/StorageVol/Sites/www/EngineJS/example/Inferno/inferno-src.js":[function(require,module,exports){
var CustomTag = require('./CustomTag.js');
var Template = require('./Template.js');

var components = {};
var templates = {};

function registerTag(tag, tagClass) {
  if(components[tag] == null) {
    components[tag] = new CustomTag(tag, tagClass);
  } else {
    throw Error(
      "Inferno component has already been registered to the tag \"" + tag + "\""
    );
  }
};

function loadFile(path) {
  return new Promise(function(approve, reject) {

    function reqListener () {
      approve(this.responseText);
    }

    var oReq = new XMLHttpRequest();
    oReq.onload = reqListener;
    oReq.open("get", path, true);
    oReq.send();
  });
};

function getTemplateFromFile(path) {
  if(templates[path] != null) {
    return templates[path];
  } else {
    templates[path] = new Template(path);
    return templates[path];
  }
};

window.Inferno = {
  registerTag: registerTag,
  getTemplateFromFile: getTemplateFromFile,
  loadFile: loadFile
};

},{"./CustomTag.js":"/Volumes/StorageVol/Sites/www/EngineJS/example/Inferno/CustomTag.js","./Template.js":"/Volumes/StorageVol/Sites/www/EngineJS/example/Inferno/Template.js"}]},{},["/Volumes/StorageVol/Sites/www/EngineJS/example/Inferno/inferno-src.js"]);
