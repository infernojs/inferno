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

    // TODO implement parse utility which leverages createContextualFragment

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

    function normOnly(node, origChild, oldChild) {
        var child = norm(origChild, oldChild);
        if (origChild !== child && node) {
            node.children = child;
        }
        return child;
    }

    function normOnlyOld(children, childrenType, domElement) {
        var child = normOnly(null, getOnlyChild(children, childrenType));
        if (!child.dom) {
            child.dom = domElement.firstChild;
            if (child.tag === '<') {
                child.domLength = domElement.childNodes.length;
            }
        }
        return child;
    }

    function normIndex(children, i, oldChild) {
        var origChild = children[i],
            child = norm(origChild, oldChild);
        if (origChild !== child) {
            children[i] = child;
        }
        return child;
    }

    function normChildren(node, children, oldChildren) {
        if (isFunction(children)) {
            children = children(oldChildren);
            if (children === undefined) {
                children = oldChildren;
            }
            node.children = children;
        }
        return children;
    }

    function getOnlyChild(children, childrenType) {
        return (childrenType === 1) ? children[0] : children;
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

    // TODO find solution without empty text placeholders
    function emptyTextNode() {
        return document.createTextNode('');
    }

    var iah_el = document.createElement('p'), iah_normalizes, iah_ignoresEmptyText;
    if (iah_el.insertAdjacentHTML) {
        iah_el.appendChild(document.createTextNode('a'));
        iah_el.insertAdjacentHTML('beforeend', 'b');
        iah_normalizes = (iah_el.childNodes.length === 1);

        iah_el = document.createElement('p');
        iah_el.appendChild(emptyTextNode());
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
            helperDiv.innerHTML = htmlContent;
            if (position === 'beforebegin') {
                var parentNode = node.parentNode;
                while (helperDiv.firstChild) {
                    parentNode.insertBefore(helperDiv.firstChild, node);
                }
            } else if (position === 'beforeend') {
                while (helperDiv.firstChild) {
                    node.appendChild(helperDiv.firstChild);
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

    function createNode(node, domParent, parentNs, nextChild, replace, isOnlyDomChild) {
        if (isTrident) {
            return insertNodeHTML(node, domParent, nextChild, replace);
        }

        var domNode, tag = node.tag, children = node.children;
        switch (tag) {
            case undefined:
                return createFragment(node, children, domParent, parentNs, nextChild, replace);
            case '#':
                if (isOnlyDomChild) {
                    setTextContent(domParent, children);
                    return;
                } else {
                    domNode = document.createTextNode(children);
                }
                break;
            case '!':
                domNode = document.createComment(children);
                break;
            case '<':
                if (children) {
                    if (isOnlyDomChild) {
                        domParent.innerHTML = children;
                    } else {
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
                            // TODO use outerHTML instead
                            removeChild(domParent, nextChild);
                        }
                    }
                    return;
                } else {
                    domNode = emptyTextNode();
                }
                break;
            default:
                var ns;
                switch (tag) {
                    case 'svg': ns = 'http://www.w3.org/2000/svg'; break;
                    case 'math': ns = 'http://www.w3.org/1998/Math/MathML'; break;
                    default: ns = parentNs; break;
                }

                var attrs = node.attrs,
                    is = attrs && attrs.is;
                if (ns) {
                    node.ns = ns;
                    domNode = is ? document.createElementNS(ns, tag, is) : document.createElementNS(ns, tag);
                } else {
                    domNode = is ? document.createElement(tag, is) : document.createElement(tag);
                }
                node.dom = domNode;
                if (isTrident && domParent) {
                    insertChild(domParent, domNode, nextChild, replace);
                }

                if (typeof children === 'string') {
                    setTextContent(domNode, children, false);
                } else {
                    createAllChildren(domNode, node, ns, children, false);
                }

                if (attrs) {
                    updateAttributes(domNode, tag, attrs);
                }
                var events = node.events;
                if (events) {
                    updateEvents(domNode, node, events);
                }
                if (!isTrident && domParent) {
                    insertChild(domParent, domNode, nextChild, replace);
                }

                var createdHandlers = events && events.$created;
                if (createdHandlers) {
                    triggerLight(createdHandlers, '$created', domNode, node);
                }
                return;
        }
        node.dom = domNode;
        if (domParent) {
            insertChild(domParent, domNode, nextChild, replace);
        }
    }

    function triggerLight(handlers, type, domNode, node, extraProp, extraPropValue) {
        var event = {type: type, target: domNode, virtualNode: node};
        if (extraProp) {
            event[extraProp] = extraPropValue;
        }
        if (isArray(handlers)) {
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i].call(domNode, event) === false) {
                    return;
                }
            }
        } else {
            handlers.call(domNode, event);
        }
    }

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
                        // TODO use outerHTML instead
                        removeChild(domParent, nextChild);
                    }
                } else {
                    prevNode = domParent.lastChild;
                    insertAdjacentHTML(domParent, 'beforeend', html);
                }
                domNode = prevNode ? prevNode.nextSibling : domParent.firstChild;
            }
        } else {
            helperDiv.innerHTML = html;
            domNode = helperDiv.removeChild(helperDiv.firstChild);
        }
        initVirtualDOM(domNode, node);
    }

    var endOfText = '\u0003';

    // FIXME namespace issue in FF
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
                if (tag) {
                    html += '>';
                }

                children = normChildren(node, children);
                var childrenType = getChildrenType(children);
                if (childrenType > 1) {
                    for (var i = 0, childrenLength = children.length; i < childrenLength; i++) {
                        html += createNodeHTML(normIndex(children, i), context);
                    }
                } else if (childrenType !== 0) {
                    var child = getOnlyChild(children, childrenType);
                    if (isString(child)) {
                        html += escapeContent(child);
                        if (!tag || !child) {
                            html += endOfText;
                        }
                    } else {
                        html += createNodeHTML(normOnly(node, child), context);
                    }
                } else if (!tag) {
                    html += endOfText;
                }
                if (tag) {
                    // TODO close only required tags explicitly
                    html += '</' + tag + '>';
                }
                return html;
        }
    }

    // TODO only use indexOf + splitText when necessary
    function initVirtualDOM(domNode, node) {
        var tag = node.tag;
        if (tag) {
            node.dom = domNode;
            var text, endIndex;
            switch (tag) {
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
                    var domLength = 0, nextDomNode;
                    for (; domNode; domNode = domNode.nextSibling) {
                        domLength++;
                        if (domNode.nodeType === 3) {
                            text = domNode.nodeValue;
                            if (domLength > 1 && text === endOfText) {
                                nextDomNode = domNode.nextSibling;
                                domNode.parentNode.removeChild(domNode);
                                domLength--;
                                break;
                            } else {
                                endIndex = text.indexOf(endOfText);
                                if (endIndex !== -1) {
                                    if (endIndex + 1 < text.length) {
                                        domNode.splitText(endIndex + 1);
                                    }
                                    domNode.nodeValue = text.substr(0, endIndex);
                                    nextDomNode = domNode.nextSibling;
                                    break;
                                }
                            }
                        }
                    }
                    node.domLength = domLength;
                    return nextDomNode;
                default:
                    var children = node.children,
                        childrenType = getChildrenType(children);
                    if (childrenType > 1) {
                        children = node.children;
                        var childDomNode = domNode.firstChild;
                        for (var i = 0, childrenLength = children.length; i < childrenLength; i++) {
                            childDomNode = initVirtualDOM(childDomNode, children[i]);
                        }
                    } else if (childrenType !== 0) {
                        var child = getOnlyChild(children, childrenType);
                        if (!isString(child)) {
                            initVirtualDOM(domNode.firstChild, child);
                        } else if (!child) {
                            domNode.firstChild.nodeValue = '';
                        }
                    }

                    var events = node.events;
                    if (events) {
                        updateEvents(domNode, node, events);

                        var createdHandlers = events.$created;
                        if (createdHandlers) {
                            triggerLight(createdHandlers, '$created', domNode, node);
                        }
                    }
                    break;
            }
            return domNode.nextSibling;
        } else {
            return initVirtualDOMFragment(domNode, node);
        }
    }

    function initVirtualDOMFragment(domNode, node) {
        var children = node.children,
            childrenType = getChildrenType(children),
            nextDomNode;
        if (childrenType === 0) {
            if (domNode.length > 1) {
                domNode.splitText(1);
            }
            domNode.nodeValue = '';
            node.dom = domNode;
            nextDomNode = domNode.nextSibling;
        } else {
            if (childrenType > 1) {
                nextDomNode = domNode;
                for (var i = 0; i < children.length; i++) {
                    nextDomNode = initVirtualDOM(nextDomNode, children[i]);
                }
                domNode = children[0].dom;
            } else {
                var child = normOnly(node, getOnlyChild(children, childrenType));
                nextDomNode = initVirtualDOM(domNode, child);
                domNode = child.dom;
            }
            node.dom = domNode;

            var domLength = 0;
            while (domNode !== nextDomNode) {
                domLength++;
                domNode = domNode.nextSibling;
            }
            node.domLength = domLength;
        }
        return nextDomNode;
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
        // TODO validate attribute name
        return name + '="' + value + '"';
    }

    function createFragment(node, children, domParent, parentNs, nextChild, replace) {
        children = normChildren(node, children);
        var childrenType = getChildrenType(children);

        var domNode, domLength, child;
        if (parentNs) {
            node.ns = parentNs;
        }
        if (childrenType === 0) {
            domNode = emptyTextNode();
            insertChild(domParent, domNode, nextChild, replace);
        } else if (childrenType > 1) {
            domLength = 0;
            for (var i = 0, childrenLength = children.length; i < childrenLength; i++) {
                child = normIndex(children, i);
                createNode(child, domParent, parentNs, nextChild, false);
                domLength += child.domLength || 1;
            }
            domNode = children[0].dom;
            if (replace) {
                removeChild(domParent, nextChild);
            }
        } else {
            child = normOnly(node, getOnlyChild(children, childrenType));
            createNode(child, domParent, parentNs, nextChild, replace);
            domNode = child.dom;
            domLength = child.domLength;
        }
        node.dom = domNode;
        node.domLength = domLength;
    }

    function updateAttributes(domElement, tag, attrs, oldAttrs, recordChanges) {
        var changes, attrName;
        if (attrs) {
            for (attrName in attrs) {
                var changed = false,
                    attrValue = attrs[attrName];
                if (attrName === 'style') {
                    var oldAttrValue = oldAttrs && oldAttrs[attrName];
                    if (oldAttrValue !== attrValue) {
                        changed = updateStyle(domElement, oldAttrValue, attrs, attrValue);
                    }
                } else if (isInputProperty(tag, attrName)) {
                    if (domElement[attrName] !== attrValue) {
                        domElement[attrName] = attrValue;
                        changed = true;
                    }
                } else if (!oldAttrs || oldAttrs[attrName] !== attrValue) {
                    if (attrName === 'class') {
                        domElement.className = attrValue;
                    } else {
                        updateAttribute(domElement, attrName, attrValue);
                    }
                    changed = true;
                }
                if (changed && recordChanges) {
                    (changes || (changes = [])).push(attrName);
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
                    if (recordChanges) {
                        (changes || (changes = [])).push(attrName);
                    }
                }
            }
        }
        return changes;
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
        var changed = false,
            propName;
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
            changed = true;
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
                        changed = true;
                    }
                }
            }
            if (oldStyle) {
                for (propName in oldStyle) {
                    if (!style || style[propName] === undefined) {
                        domStyle.removeProperty(propName);
                        changed = true;
                    }
                }
            }
        }
        return changed;
    }

    function updateEvents(domElement, element, events, oldEvents) {
        var eventType;
        if (events) {
            domElement.virtualNode = element;
            for (eventType in events) {
                if (!oldEvents || !oldEvents[eventType]) {
                    addEventHandler(domElement, eventType);
                }
            }
        }
        if (oldEvents) {
            for (eventType in oldEvents) {
                if (!events || !events[eventType]) {
                    removeEventHandler(domElement, eventType);
                }
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
        if (type[0] !== '$') {
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
    }

    function removeEventHandler(domElement, type) {
        if (type[0] !== '$') {
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
    }

    function createAllChildren(domNode, node, ns, children, inFragment) {
        children = normChildren(node, children);
        var childrenType = getChildrenType(children);
        if (childrenType > 1) {
            for (var i = 0, childrenLength = children.length; i < childrenLength; i++) {
                createNode(normIndex(children, i), domNode, ns);
            }
        } else if (childrenType !== 0) {
            var child = getOnlyChild(children, childrenType);
            if (!inFragment && isString(child)) {
                setTextContent(domNode, child);
            } else {
                child = normOnly(node, child);
                createNode(child, domNode, ns, null, false, !inFragment);
            }
        }
    }

    function getChildrenType(children) {
        if (isArray(children)) {
            return children.length;
        } else {
            return (children || isString(children)) ? -1 : 0;
        }
    }

    var range = supportsRange ? document.createRange() : null;

    function removeAllChildren(domElement, children, childrenType) {
        if (childrenType > 1) {
            removeChildren(domElement, children, 0, children.length);
        } else if (childrenType !== 0) {
            if (isString(children)) {
                domElement.removeChild(domElement.firstChild);
            } else {
                removeChild(domElement, normOnlyOld(children, childrenType, domElement));
            }
        }
    }

    function removeChildren(domElement, children, i, to) {
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

    function setTextContent(domElement, text, update) {
        if (text) {
            if (supportsTextContent) {
                domElement.textContent = text;
            } else {
                domElement.innerText = text;
            }
        } else {
            if (update) {
                while (domElement.firstChild) {
                    domElement.removeChild(domElement.firstChild);
                }
            }
            domElement.appendChild(emptyTextNode());
        }
    }

    function updateChildren(domElement, element, ns, oldChildren, children, inFragment, outerNextChild) {
        children = normChildren(element, children, oldChildren);
        if (children === oldChildren) {
            return;
        }

        var oldChildrenType = getChildrenType(oldChildren);
        if (oldChildrenType === 0) {
            createAllChildren(domElement, element, ns, children, false);
            return;
        }

        var childrenType = getChildrenType(children),
            oldChild, child;
        if (childrenType === 0) {
            removeAllChildren(domElement, oldChildren, oldChildrenType);
            return;
        } else if (childrenType < 2) {
            child = getOnlyChild(children, childrenType);
            if (!inFragment && isString(child)) {
                if (childrenType === oldChildrenType) {
                    oldChild = getOnlyChild(oldChildren, oldChildrenType);
                    if (child === oldChild) {
                        return;
                    } else if (isString(oldChild)) {
                        domElement.firstChild.nodeValue = child;
                        return;
                    }
                }
                destroyNodes(oldChildren, oldChildrenType);
                setTextContent(domElement, child, true);
                return;
            } else if (oldChildrenType < 2) {
                oldChild = normOnlyOld(oldChildren, oldChildrenType, domElement);
                child = normOnly(element, child, oldChild);
                updateNode(oldChild, child, domElement, ns, null, 0, outerNextChild, !inFragment);
                return;
            }
        }

        if (childrenType === -1) {
            element.children = children = [children];
        }
        if (oldChildrenType < 2) {
            oldChild = normOnlyOld(oldChildren, oldChildrenType, domElement);
            if (oldChildrenType === 1) {
                oldChildren[0] = oldChild;
            } else {
                oldChildren = [oldChild];
            }
        }

        var oldChildrenLength = oldChildren.length,
            childrenLength = children.length,
            oldEndIndex = oldChildrenLength - 1,
            endIndex = children.length - 1;

        var oldStartIndex = 0, startIndex = 0,
            successful = true,
            nextChild;
        outer: while (successful && oldStartIndex <= oldEndIndex && startIndex <= endIndex) {
            successful = false;
            var oldStartChild, oldEndChild, startChild, endChild;

            oldStartChild = oldChildren[oldStartIndex];
            startChild = normIndex(children, startIndex, oldStartChild);
            while (oldStartChild.key === startChild.key) {
                updateNode(oldStartChild, startChild, domElement, ns, oldChildren, oldStartIndex + 1, outerNextChild);
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
                updateNode(oldEndChild, endChild, domElement, ns, children, endIndex + 1, outerNextChild);
                oldEndIndex--; endIndex--;
                if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
                    break outer;
                }
                oldEndChild = oldChildren[oldEndIndex];
                endChild = normIndex(children, endIndex);
                successful = true;
            }
            while (oldStartChild.key === endChild.key) {
                nextChild = (endIndex + 1 < childrenLength) ? children[endIndex + 1] : outerNextChild;
                updateNode(oldStartChild, endChild, domElement, ns, null, 0, nextChild);
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
                nextChild = (oldStartIndex < oldChildrenLength) ? oldChildren[oldStartIndex] : outerNextChild;
                updateNode(oldEndChild, startChild, domElement, ns, null, 0, nextChild);
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
            nextChild = (endIndex + 1 < childrenLength) ? normIndex(children, endIndex + 1) : outerNextChild;
            // TODO create single html string in IE for better performance
            for (i = startIndex; i <= endIndex; i++) {
                createNode(normIndex(children, i), domElement, ns, nextChild);
            }
        } else if (startIndex > endIndex) {
            removeChildren(domElement, oldChildren, oldStartIndex, oldEndIndex + 1);
        } else {
            var i, oldNextChild = oldChildren[oldEndIndex + 1],
                oldChildrenMap = {};
            for (i = oldEndIndex; i >= oldStartIndex; i--) {
                oldChild = oldChildren[i];
                oldChild.next = oldNextChild;
                oldChildrenMap[oldChild.key] = oldChild;
                oldNextChild = oldChild;
            }
            nextChild = (endIndex + 1 < childrenLength) ? normIndex(children, endIndex + 1) : outerNextChild;
            for (i = endIndex; i >= startIndex; i--) {
                child = children[i];
                var key = child.key;
                oldChild = oldChildrenMap[key];
                if (oldChild) {
                    oldChildrenMap[key] = null;
                    oldNextChild = oldChild.next;
                    updateNode(oldChild, child, domElement, ns, null, 0, nextChild);
                    if ((oldNextChild && oldNextChild.key) !== (nextChild && nextChild.key)) {
                        moveChild(domElement, child, nextChild);
                    }
                } else {
                    createNode(child, domElement, ns, nextChild);
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

    function updateNode(oldNode, node, domParent, parentNs, nextChildChildren, nextChildIndex, outerNextChild, isOnlyDomChild) {
        if (node === oldNode) {
            return;
        }
        var tag = node.tag;
        if (oldNode.tag !== tag) {
            createNode(node, domParent, parentNs, oldNode, true);
        } else {
            var domNode = oldNode.dom,
                oldChildren = oldNode.children, children = node.children;
            switch (tag) {
                case undefined:
                    var nextChild = (nextChildChildren && nextChildIndex < nextChildChildren.length) ? nextChildChildren[nextChildIndex] : outerNextChild;
                    updateFragment(oldNode, oldChildren, node, children, domParent, parentNs, nextChild);
                    break;
                case '#':
                case '!':
                    if (oldChildren !== children) {
                        domNode.nodeValue = children;
                    }
                    node.dom = domNode;
                    break;
                case '<':
                    if (oldChildren !== children) {
                        createNode(node, domParent, null, oldNode, true, isOnlyDomChild);
                    } else {
                        node.dom = oldNode.dom;
                        node.domLength = oldNode.domLength;
                    }
                    break;
                default:
                    var attrs = node.attrs, oldAttrs = oldNode.attrs;
                    if ((attrs && attrs.is) !== (oldAttrs && oldAttrs.is)) {
                        createNode(node, domParent, parentNs, oldNode, true);
                        return;
                    }

                    var ns = oldNode.ns;
                    if (ns) node.ns = ns;
                    node.dom = domNode;
                    if (children !== oldChildren) {
                        updateChildren(domNode, node, ns, oldChildren, children, false);
                    }

                    var events = node.events, oldEvents = oldNode.events;
                    if (attrs !== oldAttrs) {
                        var changedHandlers = events && events.$changed;
                        var changes = updateAttributes(domNode, tag, attrs, oldAttrs, !!changedHandlers);
                        if (changes) {
                            triggerLight(changedHandlers, '$changed', domNode, node, 'changes', changes);
                        }
                    }
                    if (events !== oldEvents) {
                        updateEvents(domNode, node, events, oldEvents);
                    }
                    break;
            }
        }
    }

    function updateFragment(oldNode, oldChildren, node, children, domParent, parentNs, nextChild) {
        children = normChildren(node, children, oldChildren);
        if (children === oldChildren) {
            return;
        }
        var childrenType = getChildrenType(children),
            oldChildrenType = getChildrenType(oldChildren),
            domNode, domLength;
        if (parentNs) {
            node.ns = parentNs;
        }
        if (childrenType === 0) {
            if (oldChildrenType === 0) {
                domNode = oldNode.dom;
            } else {
                removeAllChildren(domParent, oldChildren, oldChildrenType);
                domNode = emptyTextNode();
                insertChild(domParent, domNode, nextChild);
            }
        } else if (oldChildrenType === 0) {
            domParent.removeChild(oldNode.dom);
            createFragment(node, children, domParent, parentNs, nextChild);
            return;
        } else {
            updateChildren(domParent, node, parentNs, oldChildren, children, true, nextChild);
            children = node.children;
            if (isArray(children)) {
                domNode = children[0].dom;
                domLength = 0;
                // TODO should be done without extra loop/lazy
                for (var i = 0, childrenLength = children.length; i < childrenLength; i++) {
                    domLength += children[i].domLength || 1;
                }
            } else {
                domNode = children.dom;
                domLength = children.domLength;
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
                    var destroyedHandlers = events.$destroyed;
                    if (destroyedHandlers) {
                        triggerLight(destroyedHandlers, '$destroyed', domNode, node);
                    }
                }
                if (domNode.virtualNode) {
                    domNode.virtualNode = undefined;
                }
            }
            var children = node.children;
            if (children) {
                destroyNodes(children, getChildrenType(children));
            }
        }
    }

    function destroyNodes(nodes, nodesType) {
        if (nodesType > 1) {
            for (var i = 0, len = nodes.length; i < len; i++) {
                destroyNode(nodes[i]);
            }
        } else if (nodesType !== 0) {
            destroyNode(getOnlyChild(nodes, nodesType));
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
        append: function (domParent, node) {
            node = norm(node);
            createNode(node, domParent);
            return node;
        },
        update: function (oldNode, node) {
            node = norm(node, oldNode);
            updateNode(oldNode, node, oldNode.dom.parentNode);
            copyObjectProps(node, oldNode);
            return oldNode;
        },
        updateChildren: function (element, children) {
            var oldChildren = element.oldChildren || element.children;
            if (oldChildren !== children) {
                updateChildren(element.dom, element, element.ns, oldChildren, children, !element.tag);
            }
        },
        remove: function (node) {
            var domParent = node.dom.parentNode;
            removeChild(domParent, node);
        }
    };

    // TODO create promise utility
    /*
    function isPromise(value) {
        return value.then !== undefined;
    }

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
    }

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
    }
    */

})(cito, window);
