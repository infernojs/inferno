var tt = (function (window) {
    'use strict';

    var range = document.createRange();

    var templates = {},
        placeholder = '~~~';

    function replaceAttrPlaceholders(node, attr, args, argIndexRef) {
        var value = attr.value;
        if (value === placeholder) {
            var arg = args[argIndexRef.i++];
            if (typeof arg === 'function') {
                node[attr.name] = arg;
            } else {
                attr.value = '' + arg;
            }
        } else {
            var phi = 0;
            while ((phi = value.indexOf(placeholder, phi)) !== -1) {
                var arg = '' + args[argIndexRef.i++];
                value = value.substr(0, phi) + arg + value.substr(phi + placeholder.length);
                phi = phi - placeholder.length + arg.length;           
            }
            attr.value = value;
        }
    }

    function replaceTextPlaceholders(node, args, argIndexRef) {
        var value = node.data,
            phi = 0;
        while ((phi = value.indexOf(placeholder, phi)) !== -1) {
            var arg = args[argIndexRef.i++];
            var valueAfter = value.substr(phi + placeholder.length);
            var isArray = Array.isArray(arg);
            if (isArray || arg instanceof Node) {
                node = node.splitText(phi);
                node.data = value = valueAfter;
                var parentNode = node.parentNode;
                if (isArray) {
                    for (var ai = 0; ai < arg.length; ai++) {
                        var argNode = arg[ai];
                        if (!(argNode instanceof Node)) {
                            argNode = document.createTextNode(argNode);
                        }
                        parentNode.insertBefore(argNode, node);
                    }
                } else {
                    node.insertBefore(arg);
                }
                phi = 0;
            } else {
                arg = '' + arg;
                value = value.substr(0, phi) + arg + valueAfter;
                phi = phi - placeholder.length + arg.length;
            }            
        }
        node.data = value;
    }

    function insertArgs(node, args, argIndexRef) {
        var child = node.firstChild;
        while (child) {
            var nextChild = child.nextSibling;
            switch (child.nodeType) {
                case Node.TEXT_NODE:
                    replaceTextPlaceholders(child, args, argIndexRef)
                    break;
                case Node.ELEMENT_NODE:
                    var attrs = child.attributes;
                    for (var i = 0; i < attrs.length; i++) {
                        replaceAttrPlaceholders(child, attrs[i], args, argIndexRef);
                    }
                    insertArgs(child, args, argIndexRef);
                    break;
            }
            child = nextChild;
        }
    }

    function tt(strings) {
        var html = strings.join(placeholder),
            template = templates[html];
        if (!template) {
            templates[html] = template = range.createContextualFragment(html);
        }
        var fragment = template.cloneNode(true);
        fragment.firstChild._first = true;
        fragment.lastChild._last = true;
        var args = [].slice.call(arguments, 1);
        insertArgs(fragment, args, {i: 0});
        return fragment;
    };

    tt.update = function (func, args, event) {
        // TODO keep focus/selection or update only diff

        var node = event.target,
            fragment = func.apply(null, args);

        var firstNode = node, lastNode = node,
            templateId = 0;
        while (!firstNode._first) {
            firstNode = firstNode.previousSibling ? firstNode.previousSibling : firstNode.parentNode;
        }
        templateId = 0;
        while (!lastNode._last) {
            lastNode = lastNode.nextSibling ? lastNode.nextSibling : lastNode.parentNode;
        }
        var parentNode = firstNode.parentNode;        
        while (firstNode !== lastNode) {
            var prevLastNode = lastNode.previousSibling;
            parentNode.removeChild(lastNode);
            lastNode = prevLastNode;
        }
        parentNode.replaceChild(fragment, firstNode);
    };

    return tt;

})(window);