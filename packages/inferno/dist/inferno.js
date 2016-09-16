/*!
 * inferno v1.0.0-alpha9
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Inferno = factory());
}(this, (function () { 'use strict';

var NO_OP = '$NO_OP';
function isArray(obj) {
    return obj instanceof Array;
}
function isNullOrUndef(obj) {
    return isUndefined(obj) || isNull(obj);
}
function isNull(obj) {
    return obj === null;
}
function isUndefined(obj) {
    return obj === undefined;
}
function warning(condition, message) {
    if (!condition) {
        console.error(message);
    }
}

var ValueTypes = {
    CHILDREN: 1,
    PROP_CLASS_NAME: 2,
    PROP_STYLE: 3,
    PROP_DATA: 4,
    PROP_REF: 5,
    PROP_SPREAD: 6,
    PROP_VALUE: 7,
    PROP: 8
};
var ChildrenTypes = {
    NON_KEYED: 1,
    KEYED: 2,
    NODE: 3,
    TEXT: 4,
    UNKNOWN: 5
};
var NodeTypes = {
    ELEMENT: 1,
    OPT_ELEMENT: 2,
    TEXT: 3,
    FRAGMENT: 4,
    OPT_BLUEPRINT: 5,
    COMPONENT: 6,
    PLACEHOLDER: 7
};

function createOptVElement(bp, key, v0, v1, v2, v3) {
    return {
        bp: bp,
        dom: null,
        key: key,
        type: NodeTypes.OPT_ELEMENT,
        v0: v0,
        v1: v1,
        v2: v2,
        v3: v3
    };
}
function createOptBlueprint(staticVElement, v0, d0, v1, d1, v2, d2, v3, d3, renderer) {
    var bp = {
        clone: null,
        svgClone: null,
        d0: d0,
        d1: d1,
        d2: d2,
        d3: d3,
        pools: {
            nonKeyed: [],
            keyed: new Map()
        },
        staticVElement: staticVElement,
        type: NodeTypes.OPT_BLUEPRINT,
        v0: v0,
        v1: v1,
        v2: v2,
        v3: v3
    };
    if (renderer) {
        renderer.createStaticVElementClone(bp, false);
    }
    return bp;
}
function createVComponent(component, props, key, hooks, ref) {
    return {
        component: component,
        dom: null,
        hooks: hooks || null,
        instance: null,
        key: key,
        props: props,
        ref: ref || null,
        type: NodeTypes.COMPONENT
    };
}
function createVText(text) {
    return {
        dom: null,
        text: text,
        type: NodeTypes.TEXT
    };
}
function createVElement(tag, props, children, key, ref, childrenType) {
    return {
        children: children,
        childrenType: childrenType || ChildrenTypes.UNKNOWN,
        dom: null,
        key: key,
        props: props,
        ref: ref || null,
        tag: tag,
        type: NodeTypes.ELEMENT
    };
}
function createStaticVElement(tag, props, children) {
    return {
        children: children,
        props: props,
        tag: tag,
        type: NodeTypes.ELEMENT
    };
}
function createVFragment(children, childrenType) {
    return {
        children: children,
        childrenType: childrenType || ChildrenTypes.UNKNOWN,
        dom: null,
        pointer: null,
        type: NodeTypes.FRAGMENT
    };
}
function createVPlaceholder() {
    return {
        dom: null,
        type: NodeTypes.PLACEHOLDER
    };
}
function isVElement(o) {
    return o.type === NodeTypes.ELEMENT;
}
function isOptVElement(o) {
    return o.type === NodeTypes.OPT_ELEMENT;
}
function isVComponent(o) {
    return o.type === NodeTypes.COMPONENT;
}

function convertVOptElementToVElement(optVElement) {
    var bp = optVElement.bp;
    var staticElement = bp.staticVElement;
    var vElement = createVElement(staticElement.tag, null, null, optVElement.key, null, null);
    var bp0 = bp.v0;
    var staticChildren = staticElement.children;
    var staticProps = staticElement.props;
    if (!isNull(staticChildren)) {
        vElement.children = staticChildren;
    }
    if (!isNull(staticProps)) {
        vElement.props = staticProps;
    }
    if (!isNull(bp0)) {
        attachOptVElementValue(vElement, optVElement, bp0, optVElement.v0, bp.d0);
        var bp1 = bp.v1;
        if (!isNull(bp1)) {
            attachOptVElementValue(vElement, optVElement, bp1, optVElement.v1, bp.d1);
            var bp2 = bp.v2;
            if (!isNull(bp2)) {
                attachOptVElementValue(vElement, optVElement, bp2, optVElement.v2, bp.d2);
                var bp3 = bp.v3;
                if (!isNull(bp3)) {
                    var v3 = optVElement.v3;
                    var d3 = bp.d3;
                    var bp3$1 = bp.v3;
                    for (var i = 0; i < bp3$1.length; i++) {
                        attachOptVElementValue(vElement, optVElement, bp3$1[i], v3[i], d3[i]);
                    }
                }
            }
        }
    }
    return vElement;
}
function attachOptVElementValue(vElement, vOptElement, valueType, value, descriptor) {
    switch (valueType) {
        case ValueTypes.CHILDREN:
            vElement.childrenType = descriptor;
            if (isNullOrUndef(vElement.children)) {
                vElement.children = value;
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP_CLASS_NAME:
            if (!vElement.props) {
                vElement.props = { className: value };
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP_DATA:
            if (!vElement.props) {
                vElement.props = {};
            }
            vElement.props['data-' + descriptor] = value;
            break;
        case ValueTypes.PROP_STYLE:
            if (!vElement.props) {
                vElement.props = { style: value };
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP_VALUE:
            if (!vElement.props) {
                vElement.props = { value: value };
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP:
            if (!vElement.props) {
                vElement.props = {};
            }
            vElement.props[descriptor] = value;
            break;
        case ValueTypes.PROP_REF:
            vElement.ref = value;
            break;
        case ValueTypes.PROP_SPREAD:
            if (!vElement.props) {
                vElement.props = value;
            }
            else {
                debugger;
            }
            break;
    }
}
function cloneVNode(vNodeToClone, props) {
    var _children = [], len = arguments.length - 2;
    while ( len-- > 0 ) _children[ len ] = arguments[ len + 2 ];

    var children = _children;
    if (_children.length > 0 && !isNull(_children[0])) {
        if (!props) {
            props = {};
        }
        if (_children.length === 1) {
            children = _children[0];
        }
        if (isUndefined(props.children)) {
            props.children = children;
        }
        else {
            if (isArray(children)) {
                if (isArray(props.children)) {
                    props.children = props.children.concat(children);
                }
                else {
                    props.children = [props.children].concat(children);
                }
            }
            else {
                if (isArray(props.children)) {
                    props.children.push(children);
                }
                else {
                    props.children = [props.children];
                    props.children.push(children);
                }
            }
        }
    }
    else {
        children = null;
    }
    var newVNode;
    if (isArray(vNodeToClone)) {
        newVNode = vNodeToClone.map(function (vNode) { return cloneVNode(vNode); });
    }
    else if (isNullOrUndef(props) && isNullOrUndef(children)) {
        newVNode = Object.assign({}, vNodeToClone);
    }
    else {
        if (isVComponent(vNodeToClone)) {
            newVNode = createVComponent(vNodeToClone.component, Object.assign({}, vNodeToClone.props, props), vNodeToClone.key, vNodeToClone.hooks, vNodeToClone.ref);
        }
        else if (isVElement(vNodeToClone)) {
            newVNode = createVElement(vNodeToClone.tag, Object.assign({}, vNodeToClone.props, props), (props && props.children) || children || vNodeToClone.children, vNodeToClone.key, vNodeToClone.ref, ChildrenTypes.UNKNOWN);
        }
        else if (isOptVElement(vNodeToClone)) {
            newVNode = cloneVNode(convertVOptElementToVElement(vNodeToClone), props, children);
        }
    }
    newVNode.dom = null;
    return newVNode;
}

if ("development" !== 'production') {
	var testFunc = function testFn() {};
	warning(
		(testFunc.name || testFunc.toString()).indexOf('testFn') !== -1,
		'It looks like you\'re using a minified copy of the development build ' +
		'of Inferno. When deploying Inferno apps to production, make sure to use ' +
		'the production build which skips development warnings and is faster. ' +
		'See http://infernojs.org for more details.'
	);
}

var index = {
	// JSX optimisations
	createOptVElement: createOptVElement,
	createOptBlueprint: createOptBlueprint,
	createStaticVElement: createStaticVElement,

	// core shapes
	createVElement: createVElement,
	createVFragment: createVFragment,
	createVPlaceholder: createVPlaceholder,
	createVComponent: createVComponent,
	createVText: createVText,

	// cloning
	cloneVNode: cloneVNode,	

	// enums
	ValueTypes: ValueTypes,
	ChildrenTypes: ChildrenTypes,
	NodeTypes: NodeTypes,

	// TODO do we still need this? can we remove?
	NO_OP: NO_OP
};

return index;

})));