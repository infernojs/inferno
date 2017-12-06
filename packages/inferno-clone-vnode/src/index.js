"use strict";
/**
 * @module Inferno-Clone-VNode
 */ /** TypeDoc Comment */
Object.defineProperty(exports, "__esModule", { value: true });
var inferno_1 = require("inferno");
var inferno_shared_1 = require("inferno-shared");
/*
 directClone is preferred over cloneVNode and used internally also.
 This function makes Inferno backwards compatible.
 And can be tree-shaked by modern bundlers

 Would be nice to combine this with directClone but could not do it without breaking change
*/
/**
 * Clones given virtual node by creating new instance of it
 * @param {VNode} vNodeToClone virtual node to be cloned
 * @param {Props=} props additional props for new virtual node
 * @param {...*} _children new children for new virtual node
 * @returns {VNode} new virtual node
 */
function cloneVNode(vNodeToClone, props) {
    var _children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        _children[_i - 2] = arguments[_i];
    }
    var children = _children;
    var childrenLen = _children.length;
    if (childrenLen > 0 && !inferno_shared_1.isUndefined(_children[0])) {
        if (!props) {
            props = {};
        }
        if (childrenLen === 1) {
            children = _children[0];
        }
        if (!inferno_shared_1.isUndefined(children)) {
            props.children = children;
        }
    }
    var newVNode;
    if (inferno_shared_1.isArray(vNodeToClone)) {
        var tmpArray = [];
        for (var i = 0, len = vNodeToClone.length; i < len; i++) {
            tmpArray.push(inferno_1.directClone(vNodeToClone[i]));
        }
        newVNode = tmpArray;
    }
    else {
        var flags = vNodeToClone.flags;
        var className = vNodeToClone.className;
        var key = vNodeToClone.key;
        var ref = vNodeToClone.ref;
        if (props) {
            if (!inferno_shared_1.isUndefined(props.className)) {
                className = props.className;
            }
            if (!inferno_shared_1.isUndefined(props.ref)) {
                ref = props.ref;
            }
            if (!inferno_shared_1.isUndefined(props.key)) {
                key = props.key;
            }
        }
        if (flags & 28 /* Component */) {
            newVNode = inferno_1.createVNode(flags, vNodeToClone.type, null, null, !vNodeToClone.props && !props
                ? inferno_1.EMPTY_OBJ
                : inferno_shared_1.combineFrom(vNodeToClone.props, props), key, ref, true);
            var newProps = newVNode.props;
            if (newProps) {
                var newChildren = newProps.children;
                // we need to also clone component children that are in props
                // as the children may also have been hoisted
                if (newChildren) {
                    if (inferno_shared_1.isArray(newChildren)) {
                        var len = newChildren.length;
                        if (len > 0) {
                            var tmpArray = [];
                            for (var i = 0; i < len; i++) {
                                var child = newChildren[i];
                                if (inferno_shared_1.isStringOrNumber(child)) {
                                    tmpArray.push(child);
                                }
                                else if (!inferno_shared_1.isInvalid(child) && (child.flags)) {
                                    tmpArray.push(inferno_1.directClone(child));
                                }
                            }
                            newProps.children = tmpArray;
                        }
                    }
                    else if (newChildren.flags) {
                        newProps.children = inferno_1.directClone(newChildren);
                    }
                }
            }
            newVNode.children = null;
        }
        else if (flags & 3970 /* Element */) {
            children =
                props && !inferno_shared_1.isUndefined(props.children)
                    ? props.children
                    : vNodeToClone.children;
            newVNode = inferno_1.createVNode(flags, vNodeToClone.type, className, children, !vNodeToClone.props && !props
                ? inferno_1.EMPTY_OBJ
                : inferno_shared_1.combineFrom(vNodeToClone.props, props), key, ref, false);
        }
        else if (flags & 1 /* Text */) {
            newVNode = inferno_1.createVNode(1 /* Text */, null, null, vNodeToClone.children, null, key, null, true);
        }
    }
    return newVNode;
}
exports.cloneVNode = cloneVNode;
