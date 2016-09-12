import { isUndefined, isArray, isNull, isNullOrUndef } from './utils';
import createStaticVElementClone from './createStaticVElementClone';
export var NodeTypes;
(function (NodeTypes) {
    NodeTypes[NodeTypes["ELEMENT"] = 1] = "ELEMENT";
    NodeTypes[NodeTypes["OPT_ELEMENT"] = 2] = "OPT_ELEMENT";
    NodeTypes[NodeTypes["TEXT"] = 3] = "TEXT";
    NodeTypes[NodeTypes["FRAGMENT"] = 4] = "FRAGMENT";
    NodeTypes[NodeTypes["OPT_BLUEPRINT"] = 5] = "OPT_BLUEPRINT";
    NodeTypes[NodeTypes["COMPONENT"] = 6] = "COMPONENT";
    NodeTypes[NodeTypes["PLACEHOLDER"] = 7] = "PLACEHOLDER";
})(NodeTypes || (NodeTypes = {}));
;
export var ValueTypes;
(function (ValueTypes) {
    ValueTypes[ValueTypes["CHILDREN"] = 0] = "CHILDREN";
    ValueTypes[ValueTypes["PROP_CLASS_NAME"] = 1] = "PROP_CLASS_NAME";
    ValueTypes[ValueTypes["PROP_STYLE"] = 2] = "PROP_STYLE";
    ValueTypes[ValueTypes["PROP_DATA"] = 3] = "PROP_DATA";
    ValueTypes[ValueTypes["PROP_REF"] = 4] = "PROP_REF";
    ValueTypes[ValueTypes["PROP_SPREAD"] = 5] = "PROP_SPREAD";
    ValueTypes[ValueTypes["PROP_VALUE"] = 6] = "PROP_VALUE";
    ValueTypes[ValueTypes["PROP"] = 7] = "PROP";
})(ValueTypes || (ValueTypes = {}));
;
export var ChildrenTypes;
(function (ChildrenTypes) {
    ChildrenTypes[ChildrenTypes["NON_KEYED"] = 0] = "NON_KEYED";
    ChildrenTypes[ChildrenTypes["KEYED"] = 1] = "KEYED";
    ChildrenTypes[ChildrenTypes["NODE"] = 2] = "NODE";
    ChildrenTypes[ChildrenTypes["TEXT"] = 3] = "TEXT";
    ChildrenTypes[ChildrenTypes["UNKNOWN"] = 4] = "UNKNOWN";
})(ChildrenTypes || (ChildrenTypes = {}));
;
;
;
export function clonePropsChildren(props) {
    const children = props.children;
    if (!isUndefined(children)) {
        props.children = cloneVNode(children);
    }
}
export function convertVOptElementToVElement(optVElement) {
    const bp = optVElement.bp;
    const staticElement = bp.staticVElement;
    const vElement = createVElement(staticElement.tag, null, null, optVElement.key, null, null);
    const bp0 = bp.v0;
    const staticChildren = staticElement.children;
    const staticProps = staticElement.props;
    if (!isNull(staticChildren)) {
        vElement.children = staticChildren;
    }
    if (!isNull(staticProps)) {
        vElement.props = staticProps;
    }
    if (!isNull(bp0)) {
        attachOptVElementValue(vElement, optVElement, bp0, optVElement.v0, bp.d0);
        const bp1 = bp.v1;
        if (!isNull(bp1)) {
            attachOptVElementValue(vElement, optVElement, bp1, optVElement.v1, bp.d1);
            const bp2 = bp.v2;
            if (!isNull(bp2)) {
                attachOptVElementValue(vElement, optVElement, bp2, optVElement.v2, bp.d2);
                const bp3 = bp.v3;
                if (!isNull(bp3)) {
                    const v3 = optVElement.v3;
                    const d3 = bp.d3;
                    const bp3 = bp.v3;
                    for (let i = 0; i < bp3.length; i++) {
                        attachOptVElementValue(vElement, optVElement, bp3[i], v3[i], d3[i]);
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
export function cloneVNode(vNodeToClone, props, ..._children) {
    let children = _children;
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
    let newVNode;
    if (isArray(vNodeToClone)) {
        newVNode = vNodeToClone.map(vNode => cloneVNode(vNode));
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
export function createOptVElement(bp, key, v0, v1, v2, v3) {
    return {
        bp,
        dom: null,
        key,
        type: NodeTypes.OPT_ELEMENT,
        v0,
        v1,
        v2,
        v3
    };
}
export function createOptBlueprint(staticVElement, v0, d0, v1, d1, v2, d2, v3, d3) {
    const bp = {
        clone: null,
        svgClone: null,
        d0,
        d1,
        d2,
        d3,
        pools: {
            nonKeyed: [],
            keyed: new Map()
        },
        staticVElement,
        type: NodeTypes.OPT_BLUEPRINT,
        v0,
        v1,
        v2,
        v3
    };
    createStaticVElementClone(bp, false);
    return bp;
}
export function createVComponent(component, props, key, hooks, ref) {
    return {
        component,
        dom: null,
        hooks: hooks || null,
        instance: null,
        key,
        props,
        ref: ref || null,
        type: NodeTypes.COMPONENT
    };
}
export function createVText(text) {
    return {
        dom: null,
        text,
        type: NodeTypes.TEXT
    };
}
export function createVElement(tag, props, children, key, ref, childrenType) {
    return {
        children,
        childrenType: childrenType || ChildrenTypes.UNKNOWN,
        dom: null,
        key,
        props,
        ref: ref || null,
        tag,
        type: NodeTypes.ELEMENT
    };
}
export function createStaticVElement(tag, props, children) {
    return {
        children,
        props,
        tag,
        type: NodeTypes.ELEMENT
    };
}
export function createVFragment(children, childrenType) {
    return {
        children,
        childrenType: childrenType || ChildrenTypes.UNKNOWN,
        dom: null,
        pointer: null,
        type: NodeTypes.FRAGMENT
    };
}
export function createVPlaceholder() {
    return {
        dom: null,
        type: NodeTypes.PLACEHOLDER
    };
}
export function isVElement(o) {
    return o.type === NodeTypes.ELEMENT;
}
export function isOptVElement(o) {
    return o.type === NodeTypes.OPT_ELEMENT;
}
export function isVComponent(o) {
    return o.type === NodeTypes.COMPONENT;
}
export function isVText(o) {
    return o.type === NodeTypes.TEXT;
}
export function isVFragment(o) {
    return o.type === NodeTypes.FRAGMENT;
}
export function isVPlaceholder(o) {
    return o.type === NodeTypes.PLACEHOLDER;
}
export function isVNode(o) {
    return !isUndefined(o.type);
}
export function isUnknownChildrenType(o) {
    return o === ChildrenTypes.UNKNOWN;
}
export function isKeyedListChildrenType(o) {
    return o === ChildrenTypes.KEYED;
}
export function isNonKeyedListChildrenType(o) {
    return o === ChildrenTypes.NON_KEYED;
}
export function isTextChildrenType(o) {
    return o === ChildrenTypes.TEXT;
}
export function isNodeChildrenType(o) {
    return o === ChildrenTypes.NODE;
}
//# sourceMappingURL=shapes.js.map