/// <reference path="bobril.d.ts"/>
if (typeof DEBUG === "undefined")
    DEBUG = true;
// IE8 [].map polyfill Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
    Array.prototype.map = function (callback, thisArg) {
        var a, k;
        // ReSharper disable once ConditionIsAlwaysConst
        if (DEBUG && this == null) {
            throw new TypeError("this==null");
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (DEBUG && typeof callback != "function") {
            throw new TypeError(callback + " isn't func");
        }
        a = new Array(len);
        k = 0;
        while (k < len) {
            var kValue, mappedValue;
            if (k in o) {
                kValue = o[k];
                mappedValue = callback.call(thisArg, kValue, k, o);
                a[k] = mappedValue;
            }
            k++;
        }
        return a;
    };
}
// Object create polyfill
if (!Object.create) {
    Object.create = function (o) {
        function f() {
        }
        f.prototype = o;
        return new f();
    };
}
// Object keys polyfill
if (!Object.keys) {
    Object.keys = (function (obj) {
        var keys = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                keys.push(i);
            }
        }
        return keys;
    });
}
// Array isArray polyfill
if (!Array.isArray) {
    var objectToString = {}.toString;
    Array.isArray = (function (a) { return objectToString.call(a) === "[object Array]"; });
}
b = (function (window, document) {
    function assert(shoudBeTrue, messageIfFalse) {
        if (DEBUG && !shoudBeTrue)
            throw Error(messageIfFalse || "assertion failed");
    }
    var isArray = Array.isArray;
    var objectKeys = Object.keys;
    function createTextNode(content) {
        return document.createTextNode(content);
    }
    function createElement(name) {
        return document.createElement(name);
    }
    var hasTextContent = "textContent" in createTextNode("");
    var hasRemovePropertyInStyle = "removeProperty" in createElement("a").style;
    function isObject(value) {
        return typeof value === "object";
    }
    var inNamespace = false;
    var inSvg = false;
    var updateCall = [];
    var updateInstance = [];
    var setValueCallback = function (el, node, newValue, oldValue) {
        if (newValue !== oldValue)
            el["value"] = newValue;
    };
    function setSetValue(callback) {
        var prev = setValueCallback;
        setValueCallback = callback;
        return prev;
    }
    function newHashObj() {
        return Object.create(null);
    }
    var vendors = ["webkit", "Moz", "ms", "o"];
    var testingDivStyle = document.createElement("div").style;
    function testPropExistence(name) {
        return typeof testingDivStyle[name] === "string";
    }
    var mapping = newHashObj();
    function renamer(newName) {
        return function (style, value, oldName) {
            style[newName] = value;
            style[oldName] = undefined;
        };
    }
    ;
    function ieVersion() {
        return document.documentMode;
    }
    if (ieVersion() === 8) {
        mapping.cssFloat = renamer("styleFloat");
    }
    function shimStyle(newValue) {
        var k = Object.keys(newValue);
        for (var i = 0, l = k.length; i < l; i++) {
            var ki = k[i];
            var mi = mapping[ki];
            var vi = newValue[ki];
            if (vi === undefined)
                continue; // don't want to map undefined
            if (mi === undefined) {
                if (DEBUG) {
                    if (ki === "float" && window.console && console.error)
                        console.error("In style instead of 'float' you have to use 'cssFloat'");
                    if (/-/.test(ki) && window.console && console.warn)
                        console.warn("Style property " + ki + " contains dash (must use JS props instead of css names)");
                }
                if (testPropExistence(ki)) {
                    mi = null;
                }
                else {
                    var titleCaseKi = ki.replace(/^\w/, function (match) { return match.toUpperCase(); });
                    for (var j = 0; j < vendors.length; j++) {
                        if (testPropExistence(vendors[j] + titleCaseKi)) {
                            mi = renamer(vendors[j] + titleCaseKi);
                            break;
                        }
                    }
                    if (mi === undefined) {
                        mi = null;
                        if (DEBUG && window.console && console.warn)
                            console.warn("Style property " + ki + " is not supported in this browser");
                    }
                }
                mapping[ki] = mi;
            }
            if (mi !== null)
                mi(newValue, vi, ki);
        }
    }
    function removeProperty(s, name) {
        if (hasRemovePropertyInStyle)
            s[name] = "";
        else
            s.removeAttribute(name);
    }
    function updateStyle(n, el, newStyle, oldStyle) {
        var s = el.style;
        if (isObject(newStyle)) {
            shimStyle(newStyle);
            var rule;
            if (isObject(oldStyle)) {
                for (rule in oldStyle) {
                    if (!(rule in newStyle))
                        removeProperty(s, rule);
                }
                for (rule in newStyle) {
                    var v = newStyle[rule];
                    if (v !== undefined) {
                        if (oldStyle[rule] !== v)
                            s[rule] = v;
                    }
                    else {
                        removeProperty(s, rule);
                    }
                }
            }
            else {
                if (oldStyle)
                    s.cssText = "";
                for (rule in newStyle) {
                    var v = newStyle[rule];
                    if (v !== undefined)
                        s[rule] = v;
                }
            }
        }
        else if (newStyle) {
            s.cssText = newStyle;
        }
        else {
            if (isObject(oldStyle)) {
                for (rule in oldStyle) {
                    removeProperty(s, rule);
                }
            }
            else if (oldStyle) {
                s.cssText = "";
            }
        }
    }
    function setClassName(el, className) {
        if (inNamespace)
            el.setAttribute("class", className);
        else
            el.className = className;
    }
    function updateElement(n, el, newAttrs, oldAttrs) {
        var attrName, newAttr, oldAttr, valueOldAttr, valueNewAttr;
        for (attrName in newAttrs) {
            newAttr = newAttrs[attrName];
            oldAttr = oldAttrs[attrName];
            if (attrName === "value" && !inNamespace) {
                valueOldAttr = oldAttr;
                valueNewAttr = newAttr;
                oldAttrs[attrName] = newAttr;
                continue;
            }
            if (oldAttr !== newAttr) {
                oldAttrs[attrName] = newAttr;
                if (inNamespace) {
                    if (attrName === "href")
                        el.setAttributeNS("http://www.w3.org/1999/xlink", "href", newAttr);
                    else
                        el.setAttribute(attrName, newAttr);
                }
                else if (attrName in el && !(attrName === "list" || attrName === "form")) {
                    el[attrName] = newAttr;
                }
                else
                    el.setAttribute(attrName, newAttr);
            }
        }
        for (attrName in oldAttrs) {
            if (oldAttrs[attrName] !== undefined && !(attrName in newAttrs)) {
                oldAttrs[attrName] = undefined;
                el.removeAttribute(attrName);
            }
        }
        if (valueNewAttr !== undefined) {
            setValueCallback(el, n, valueNewAttr, valueOldAttr);
        }
        return oldAttrs;
    }
    function pushInitCallback(c, aupdate) {
        var cc = c.component;
        if (cc) {
            if (cc[aupdate ? "postUpdateDom" : "postInitDom"]) {
                updateCall.push(aupdate);
                updateInstance.push(c);
            }
        }
    }
    function createNode(n, parentNode) {
        var c = n;
        var backupInNamespace = inNamespace;
        var backupInSvg = inSvg;
        var component = c.component;
        if (component) {
            c.ctx = { data: c.data || {}, me: c };
            if (component.init) {
                component.init(c.ctx, n);
            }
            if (component.render) {
                component.render(c.ctx, n);
            }
        }
        var el;
        if (n.tag === "") {
            c.element = createTextNode(c.children);
            return c;
        }
        else if (n.tag === "/") {
            return c;
        }
        else if (inSvg || n.tag === "svg") {
            el = document.createElementNS("http://www.w3.org/2000/svg", n.tag);
            inNamespace = true;
            inSvg = true;
        }
        else {
            el = createElement(n.tag);
        }
        c.element = el;
        createChildren(c);
        if (component) {
            if (component.postRender) {
                component.postRender(c.ctx, n);
            }
        }
        if (c.attrs)
            c.attrs = updateElement(c, el, c.attrs, {});
        if (c.style)
            updateStyle(c, el, c.style, undefined);
        var className = c.className;
        if (className)
            setClassName(el, className);
        inNamespace = backupInNamespace;
        inSvg = backupInSvg;
        pushInitCallback(c, false);
        c.parent = parentNode;
        return c;
    }
    function normalizeNode(n) {
        var t = typeof n;
        if (t === "string") {
            return { tag: "", children: n };
        }
        if (t === "boolean")
            return null;
        return n;
    }
    function createChildren(c) {
        var ch = c.children;
        var element = c.element;
        if (!ch)
            return;
        if (!isArray(ch)) {
            if (typeof ch === "string") {
                if (hasTextContent) {
                    element.textContent = ch;
                }
                else {
                    element.innerText = ch;
                }
                return;
            }
            ch = [ch];
        }
        ch = ch.slice(0);
        var i = 0, l = ch.length;
        while (i < l) {
            var item = ch[i];
            if (isArray(item)) {
                ch.splice.apply(ch, [i, 1].concat(item));
                l = ch.length;
                continue;
            }
            item = normalizeNode(item);
            if (item == null) {
                ch.splice(i, 1);
                l--;
                continue;
            }
            var j = ch[i] = createNode(item, c);
            if (j.tag === "/") {
                var before = element.lastChild;
                c.element.insertAdjacentHTML("beforeend", j.children);
                j.element = [];
                if (before) {
                    before = before.nextSibling;
                }
                else {
                    before = element.firstChild;
                }
                while (before) {
                    j.element.push(before);
                    before = before.nextSibling;
                }
            }
            else {
                element.appendChild(j.element);
            }
            i++;
        }
        c.children = ch;
    }
    function destroyNode(c) {
        var ch = c.children;
        if (isArray(ch)) {
            for (var i = 0, l = ch.length; i < l; i++) {
                destroyNode(ch[i]);
            }
        }
        var component = c.component;
        if (component) {
            if (component.destroy)
                component.destroy(c.ctx, c, c.element);
        }
    }
    function removeNode(c) {
        destroyNode(c);
        var el = c.element;
        c.parent = null;
        if (isArray(el)) {
            var pa = el[0].parentNode;
            if (pa) {
                for (var i = 0; i < el.length; i++) {
                    pa.removeChild(el[i]);
                }
            }
        }
        else {
            var p = el.parentNode;
            if (p)
                p.removeChild(el);
        }
    }
    var rootFactory;
    var rootCacheChildren = [];
    function vdomPath(n) {
        var res = [];
        if (n == null)
            return res;
        var root = document.getElementById('gridcontainer');
        var nodeStack = [];
        while (n && n !== root) {
            nodeStack.push(n);
            n = n.parentNode;
        }
        if (!n)
            return res;
        var currentCacheArray = rootCacheChildren;
        while (nodeStack.length) {
            var currentNode = nodeStack.pop();
            if (currentCacheArray)
                for (var i = 0, l = currentCacheArray.length; i < l; i++) {
                    var bn = currentCacheArray[i];
                    if (bn.element === currentNode) {
                        res.push(bn);
                        currentCacheArray = bn.children;
                        currentNode = null;
                        break;
                    }
                }
            if (currentNode) {
                res.push(null);
                break;
            }
        }
        return res;
    }
    function getCacheNode(n) {
        var s = vdomPath(n);
        if (s.length == 0)
            return null;
        return s[s.length - 1];
    }
    function updateNode(n, c) {
        var component = n.component;
        var backupInNamespace = inNamespace;
        var backupInSvg = inSvg;
        var bigChange = false;
        if (component && c.ctx != null) {
            if (component.id !== c.component.id) {
                bigChange = true;
            }
            else {
                if (component.shouldChange)
                    if (!component.shouldChange(c.ctx, n, c))
                        return c;
                c.ctx.data = n.data || {};
                c.component = component;
                if (component.render)
                    component.render(c.ctx, n, c);
            }
        }
        var el;
        if (bigChange || (component && c.ctx == null)) {
        }
        else if (n.tag === "/") {
            el = c.element;
            if (isArray(el))
                el = el[0];
            var elprev = el.previousSibling;
            var removeEl = false;
            var parent = el.parentNode;
            if (!el.insertAdjacentHTML) {
                el = parent.insertBefore(createElement("i"), el);
                removeEl = true;
            }
            el.insertAdjacentHTML("beforebegin", n.children);
            if (elprev) {
                elprev = elprev.nextSibling;
            }
            else {
                elprev = parent.firstChild;
            }
            var newElements = [];
            while (elprev !== el) {
                newElements.push(elprev);
                elprev = elprev.nextSibling;
            }
            n.element = newElements;
            if (removeEl) {
                parent.removeChild(el);
            }
            removeNode(c);
            return n;
        }
        else if (n.tag === c.tag && (inSvg || !inNamespace)) {
            if (n.tag === "") {
                if (c.children !== n.children) {
                    c.children = n.children;
                    el = c.element;
                    if (hasTextContent) {
                        el.textContent = c.children;
                    }
                    else {
                        el.nodeValue = c.children;
                    }
                }
                return c;
            }
            else {
                if (n.tag === "svg") {
                    inNamespace = true;
                    inSvg = true;
                }
                updateChildrenNode(n, c);
                if (component) {
                    if (component.postRender) {
                        component.postRender(c.ctx, n, c);
                    }
                }
                el = c.element;
                if (c.attrs || n.attrs)
                    c.attrs = updateElement(c, el, n.attrs || {}, c.attrs || {});
                updateStyle(c, el, n.style, c.style);
                c.style = n.style;
                var className = n.className;
                if (className !== c.className) {
                    setClassName(el, className || "");
                    c.className = className;
                }
                c.data = n.data;
                inNamespace = backupInNamespace;
                inSvg = backupInSvg;
                pushInitCallback(c, true);
                return c;
            }
        }
        var r = createNode(n, c.parent);
        var pn = c.element.parentNode;
        if (pn) {
            pn.insertBefore(r.element, c.element);
        }
        removeNode(c);
        return r;
    }
    function callPostCallbacks() {
        var count = updateInstance.length;
        for (var i = 0; i < count; i++) {
            var n = updateInstance[i];
            if (updateCall[i]) {
                n.component.postUpdateDom(n.ctx, n, n.element);
            }
            else {
                n.component.postInitDom(n.ctx, n, n.element);
            }
        }
        updateCall = [];
        updateInstance = [];
    }
    function updateChildren(element, newChildren, cachedChildren, parentNode) {
        if (newChildren == null)
            newChildren = [];
        if (!isArray(newChildren)) {
            if ((typeof newChildren === "string") && !isArray(cachedChildren)) {
                if (newChildren === cachedChildren)
                    return cachedChildren;
                if (hasTextContent) {
                    element.textContent = newChildren;
                }
                else {
                    element.innerText = newChildren;
                }
                return newChildren;
            }
            newChildren = [newChildren];
        }
        if (cachedChildren == null)
            cachedChildren = [];
        if (!isArray(cachedChildren)) {
            if (element.firstChild)
                element.removeChild(element.firstChild);
            cachedChildren = [];
        }
        newChildren = newChildren.slice(0);
        var newLength = newChildren.length;
        var cachedLength = cachedChildren.length;
        var newIndex;
        for (newIndex = 0; newIndex < newLength;) {
            var item = newChildren[newIndex];
            if (isArray(item)) {
                newChildren.splice.apply(newChildren, [newIndex, 1].concat(item));
                newLength = newChildren.length;
                continue;
            }
            item = normalizeNode(item);
            if (item == null) {
                newChildren.splice(newIndex, 1);
                newLength--;
                continue;
            }
            newChildren[newIndex] = item;
            newIndex++;
        }
        var newEnd = newLength;
        var cachedEnd = cachedLength;
        newIndex = 0;
        var cachedIndex = 0;
        while (newIndex < newEnd && cachedIndex < cachedEnd) {
            if (newChildren[newIndex].key === cachedChildren[cachedIndex].key) {
                cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
                newIndex++;
                cachedIndex++;
                continue;
            }
            while (true) {
                if (newChildren[newEnd - 1].key === cachedChildren[cachedEnd - 1].key) {
                    newEnd--;
                    cachedEnd--;
                    cachedChildren[cachedEnd] = updateNode(newChildren[newEnd], cachedChildren[cachedEnd]);
                    if (newIndex < newEnd && cachedIndex < cachedEnd)
                        continue;
                }
                break;
            }
            if (newIndex < newEnd && cachedIndex < cachedEnd) {
                if (newChildren[newIndex].key === cachedChildren[cachedEnd - 1].key) {
                    element.insertBefore(cachedChildren[cachedEnd - 1].element, cachedChildren[cachedIndex].element);
                    cachedChildren.splice(cachedIndex, 0, cachedChildren[cachedEnd - 1]);
                    cachedChildren.splice(cachedEnd, 1);
                    cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
                    newIndex++;
                    cachedIndex++;
                    continue;
                }
                if (newChildren[newEnd - 1].key === cachedChildren[cachedIndex].key) {
                    element.insertBefore(cachedChildren[cachedIndex].element, cachedEnd === cachedLength ? null : cachedChildren[cachedEnd].element);
                    cachedChildren.splice(cachedEnd, 0, cachedChildren[cachedIndex]);
                    cachedChildren.splice(cachedIndex, 1);
                    cachedEnd--;
                    newEnd--;
                    cachedChildren[cachedEnd] = updateNode(newChildren[newEnd], cachedChildren[cachedEnd]);
                    continue;
                }
            }
            break;
        }
        if (cachedIndex === cachedEnd) {
            if (newIndex === newEnd) {
                return cachedChildren;
            }
            while (newIndex < newEnd) {
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode));
                cachedIndex++;
                cachedEnd++;
                cachedLength++;
                element.insertBefore(cachedChildren[newIndex].element, cachedEnd === cachedLength ? null : cachedChildren[cachedEnd].element);
                newIndex++;
            }
            return cachedChildren;
        }
        if (newIndex === newEnd) {
            while (cachedIndex < cachedEnd) {
                cachedEnd--;
                removeNode(cachedChildren[cachedEnd]);
                cachedChildren.splice(cachedEnd, 1);
            }
            return cachedChildren;
        }
        // order of keyed nodes ware changed => reorder keyed nodes first
        var cachedKeys = newHashObj();
        var newKeys = newHashObj();
        var key;
        var node;
        var backupNewIndex = newIndex;
        var backupCachedIndex = cachedIndex;
        var deltaKeyless = 0;
        for (; cachedIndex < cachedEnd; cachedIndex++) {
            node = cachedChildren[cachedIndex];
            key = node.key;
            if (key != null) {
                assert(!(key in cachedKeys));
                cachedKeys[key] = cachedIndex;
            }
            else
                deltaKeyless--;
        }
        var keyLess = -deltaKeyless - deltaKeyless;
        for (; newIndex < newEnd; newIndex++) {
            node = newChildren[newIndex];
            key = node.key;
            if (key != null) {
                assert(!(key in newKeys));
                newKeys[key] = newIndex;
            }
            else
                deltaKeyless++;
        }
        keyLess += deltaKeyless;
        var delta = 0;
        newIndex = backupNewIndex;
        cachedIndex = backupCachedIndex;
        var cachedKey;
        while (cachedIndex < cachedEnd && newIndex < newEnd) {
            if (cachedChildren[cachedIndex] === null) {
                cachedChildren.splice(cachedIndex, 1);
                cachedEnd--;
                cachedLength--;
                delta--;
                continue;
            }
            cachedKey = cachedChildren[cachedIndex].key;
            if (cachedKey == null) {
                cachedIndex++;
                continue;
            }
            key = newChildren[newIndex].key;
            if (key == null) {
                newIndex++;
                while (newIndex < newEnd) {
                    key = newChildren[newIndex].key;
                    if (key != null)
                        break;
                    newIndex++;
                }
                if (key == null)
                    break;
            }
            var akpos = cachedKeys[key];
            if (akpos === undefined) {
                // New key
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode));
                element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
                delta++;
                newIndex++;
                cachedIndex++;
                cachedEnd++;
                cachedLength++;
                continue;
            }
            if (!(cachedKey in newKeys)) {
                // Old key
                removeNode(cachedChildren[cachedIndex]);
                cachedChildren.splice(cachedIndex, 1);
                delta--;
                cachedEnd--;
                cachedLength--;
                continue;
            }
            if (cachedIndex === akpos + delta) {
                // Inplace update
                cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
                newIndex++;
                cachedIndex++;
            }
            else {
                // Move
                cachedChildren.splice(cachedIndex, 0, cachedChildren[akpos + delta]);
                delta++;
                cachedChildren[akpos + delta] = null;
                element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
                cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
                cachedIndex++;
                cachedEnd++;
                cachedLength++;
                newIndex++;
            }
        }
        while (cachedIndex < cachedEnd) {
            if (cachedChildren[cachedIndex] === null) {
                cachedChildren.splice(cachedIndex, 1);
                cachedEnd--;
                cachedLength--;
                continue;
            }
            if (cachedChildren[cachedIndex].key != null) {
                removeNode(cachedChildren[cachedIndex]);
                cachedChildren.splice(cachedIndex, 1);
                cachedEnd--;
                cachedLength--;
                continue;
            }
            cachedIndex++;
        }
        while (newIndex < newEnd) {
            key = newChildren[newIndex].key;
            if (key != null) {
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode));
                cachedEnd++;
                cachedLength++;
                element.insertBefore(cachedChildren[cachedIndex].element, cachedEnd === cachedLength ? null : cachedChildren[cachedEnd].element);
                delta++;
                cachedIndex++;
            }
            newIndex++;
        }
        // Without any keyless nodes we are done
        if (!keyLess)
            return cachedChildren;
        // calculate common (old and new) keyless
        keyLess = (keyLess - Math.abs(deltaKeyless)) >> 1;
        // reorder just nonkeyed nodes
        newIndex = backupNewIndex;
        cachedIndex = backupCachedIndex;
        while (newIndex < newEnd) {
            if (cachedIndex < cachedEnd) {
                cachedKey = cachedChildren[cachedIndex].key;
                if (cachedKey != null) {
                    cachedIndex++;
                    continue;
                }
            }
            key = newChildren[newIndex].key;
            if (newIndex < cachedEnd && key === cachedChildren[newIndex].key) {
                if (key != null) {
                    newIndex++;
                    continue;
                }
                cachedChildren[newIndex] = updateNode(newChildren[newIndex], cachedChildren[newIndex]);
                keyLess--;
                newIndex++;
                cachedIndex = newIndex;
                continue;
            }
            if (key != null) {
                assert(newIndex === cachedIndex);
                if (keyLess === 0 && deltaKeyless < 0) {
                    while (true) {
                        removeNode(cachedChildren[cachedIndex]);
                        cachedChildren.splice(cachedIndex, 1);
                        cachedEnd--;
                        cachedLength--;
                        deltaKeyless++;
                        assert(cachedIndex !== cachedEnd, "there still need to exist key node");
                        if (cachedChildren[cachedIndex].key != null)
                            break;
                    }
                    continue;
                }
                while (cachedChildren[cachedIndex].key == null)
                    cachedIndex++;
                assert(key === cachedChildren[cachedIndex].key);
                cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]);
                cachedChildren.splice(cachedIndex + 1, 1);
                element.insertBefore(cachedChildren[newIndex].element, cachedChildren[newIndex + 1].element);
                newIndex++;
                cachedIndex = newIndex;
                continue;
            }
            if (cachedIndex < cachedEnd) {
                element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[newIndex].element);
                cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]);
                cachedChildren.splice(cachedIndex + 1, 1);
                cachedChildren[newIndex] = updateNode(newChildren[newIndex], cachedChildren[newIndex]);
                keyLess--;
                newIndex++;
                cachedIndex++;
            }
            else {
                cachedChildren.splice(newIndex, 0, createNode(newChildren[newIndex], parentNode));
                cachedEnd++;
                cachedLength++;
                element.insertBefore(cachedChildren[newIndex].element, newIndex + 1 === cachedLength ? null : cachedChildren[newIndex + 1].element);
                newIndex++;
                cachedIndex++;
            }
        }
        while (cachedEnd > newIndex) {
            cachedEnd--;
            removeNode(cachedChildren[cachedEnd]);
            cachedChildren.splice(cachedEnd, 1);
        }
        return cachedChildren;
    }
    function updateChildrenNode(n, c) {
        c.children = updateChildren(c.element, n.children, c.children, c);
    }
    var hasNativeRaf = false;
    var nativeRaf = window.requestAnimationFrame;
    if (nativeRaf) {
        nativeRaf(function (param) {
            if (param === +param)
                hasNativeRaf = true;
        });
    }
    var now = Date.now || (function () { return (new Date).getTime(); });
    var startTime = now();
    var lastTickTime = 0;
    function requestAnimationFrame(callback) {
        if (hasNativeRaf) {
            nativeRaf(callback);
        }
        else {
            var delay = 50 / 3 + lastTickTime - now();
            if (delay < 0)
                delay = 0;
            window.setTimeout(function () {
                lastTickTime = now();
                callback(lastTickTime - startTime);
            }, delay);
        }
    }
    var ctxInvalidated = "$invalidated";
    var fullRecreateRequested = false;
    var scheduled = false;
    var uptime = 0;
    var frame = 0;
    var regEvents = {};
    var registryEvents = {};
    function addEvent(name, priority, callback) {
        var list = registryEvents[name] || [];
        list.push({ priority: priority, callback: callback });
        registryEvents[name] = list;
    }
    function emitEvent(name, ev, target, node) {
        var events = regEvents[name];
        if (events)
            for (var i = 0; i < events.length; i++) {
                if (events[i](ev, target, node))
                    return true;
            }
        return false;
    }
    function addListener(el, name) {
        if (name[0] == "!")
            return;
        function enhanceEvent(ev) {
            ev = ev || window.event;
            var t = ev.target || ev.srcElement || el;
            var n = getCacheNode(t);
            emitEvent(name, ev, t, n);
        }
        if (("on" + name) in window)
            el = window;
        if (el.addEventListener) {
            el.addEventListener(name, enhanceEvent);
        }
        else {
            el.attachEvent("on" + name, enhanceEvent);
        }
    }
    var eventsCaptured = false;
    function initEvents() {
        if (eventsCaptured)
            return;
        eventsCaptured = true;
        var eventNames = objectKeys(registryEvents);
        for (var j = 0; j < eventNames.length; j++) {
            var eventName = eventNames[j];
            var arr = registryEvents[eventName];
            arr = arr.sort(function (a, b) { return a.priority - b.priority; });
            regEvents[eventName] = arr.map(function (v) { return v.callback; });
        }
        registryEvents = null;
        var body = document.getElementById('gridcontainer');
        for (var i = 0; i < eventNames.length; i++) {
            addListener(body, eventNames[i]);
        }
    }
    function selectedUpdate(cache) {
        for (var i = 0; i < cache.length; i++) {
            var node = cache[i];
            if (node.ctx != null && node.ctx[ctxInvalidated] === frame) {
                cache[i] = updateNode(cloneNode(node), node);
            }
            else if (isArray(node.children)) {
                selectedUpdate(node.children);
            }
        }
    }
    var afterFrameCallback = function () {
    };
    function setAfterFrame(callback) {
        var res = afterFrameCallback;
        afterFrameCallback = callback;
        return res;
    }
    function update(time) {
        initEvents();
        frame++;
        uptime = time;
        scheduled = false;
        if (fullRecreateRequested) {
            fullRecreateRequested = false;
            var newChildren = rootFactory();
            rootCacheChildren = updateChildren(document.getElementById('gridcontainer'), newChildren, rootCacheChildren, null);
        }
        else {
            selectedUpdate(rootCacheChildren);
        }
        callPostCallbacks();
        afterFrameCallback(rootCacheChildren);
    }
    function invalidate(ctx) {
        if (fullRecreateRequested)
            return;
        if (ctx != null) {
            ctx[ctxInvalidated] = frame + 1;
        }
        else {
            fullRecreateRequested = true;
        }
        if (scheduled)
            return;
        scheduled = true;
        requestAnimationFrame(update);
    }
    function init(factory) {
        if (rootCacheChildren.length) {
            rootCacheChildren = updateChildren(document.getElementById('gridcontainer'), [], rootCacheChildren, null);
        }
        rootFactory = factory;
        invalidate();
    }
    function bubbleEvent(node, name, param) {
        while (node) {
            var c = node.component;
            if (c) {
                var m = c[name];
                if (m) {
                    if (m.call(c, node.ctx, param))
                        return true;
                }
                m = c.shouldStopBubble;
                if (m) {
                    if (m.call(c, node.ctx, name, param))
                        break;
                }
            }
            node = node.parent;
        }
        return false;
    }
    function merge(f1, f2) {
        var _this = this;
        return function () {
            var result = f1.apply(_this, arguments);
            if (result)
                return result;
            return f2.apply(_this, arguments);
        };
    }
    var emptyObject = {};
    function mergeComponents(c1, c2) {
        var res = Object.create(c1);
        for (var i in c2) {
            if (!(i in emptyObject)) {
                var m = c2[i];
                var origM = c1[i];
                if (i === "id") {
                    res[i] = ((origM != null) ? origM : "") + "/" + m;
                }
                else if (typeof m === "function" && origM != null && typeof origM === "function") {
                    res[i] = merge(origM, m);
                }
                else {
                    res[i] = m;
                }
            }
        }
        return res;
    }
    function preEnhance(node, methods) {
        var comp = node.component;
        if (!comp) {
            node.component = methods;
            return node;
        }
        node.component = mergeComponents(methods, comp);
        return node;
    }
    function postEnhance(node, methods) {
        var comp = node.component;
        if (!comp) {
            node.component = methods;
            return node;
        }
        node.component = mergeComponents(comp, methods);
        return node;
    }
    function assign(target, source) {
        if (target == null)
            target = {};
        if (source != null)
            for (var propname in source) {
                if (!source.hasOwnProperty(propname))
                    continue;
                target[propname] = source[propname];
            }
        return target;
    }
    function preventDefault(event) {
        var pd = event.preventDefault;
        if (pd)
            pd.call(event);
        else
            event.returnValue = false;
    }
    function cloneNodeArray(a) {
        a = a.slice(0);
        for (var i = 0; i < a.length; i++) {
            var n = a[i];
            if (isArray(n)) {
                a[i] = cloneNodeArray(n);
            }
            else if (isObject(n)) {
                a[i] = cloneNode(n);
            }
        }
        return a;
    }
    function cloneNode(node) {
        var r = b.assign({}, node);
        if (r.attrs) {
            r.attrs = b.assign({}, r.attrs);
        }
        if (isObject(r.style)) {
            r.style = b.assign({}, r.style);
        }
        var ch = r.children;
        if (ch) {
            if (isArray(ch)) {
                r.children = cloneNodeArray(ch);
            }
            else if (isObject(ch)) {
                r.children = cloneNode(ch);
            }
        }
        return r;
    }
    return {
        createNode: createNode,
        updateNode: updateNode,
        updateChildren: updateChildren,
        callPostCallbacks: callPostCallbacks,
        setSetValue: setSetValue,
        setStyleShim: function (name, action) { return mapping[name] = action; },
        init: init,
        setAfterFrame: setAfterFrame,
        isArray: isArray,
        uptime: function () { return uptime; },
        now: now,
        frame: function () { return frame; },
        assign: assign,
        ieVersion: ieVersion,
        invalidate: invalidate,
        preventDefault: preventDefault,
        vmlNode: function () { return inNamespace = true; },
        vdomPath: vdomPath,
        deref: getCacheNode,
        addEvent: addEvent,
        emitEvent: emitEvent,
        bubble: bubbleEvent,
        preEnhance: preEnhance,
        postEnhance: postEnhance,
        cloneNode: cloneNode
    };
})(window, document);
//# sourceMappingURL=bobril.js.map
