/**
 * @module Inferno-Server
 */ /** TypeDoc Comment */

import { EMPTY_OBJ } from "inferno";
import {
  combineFrom,
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isNumber,
  isString,
  isTrue,
  throwError
} from "inferno-shared";
import VNodeFlags from "inferno-vnode-flags";
import { renderStylesToString } from "./prop-renderers";
import { escapeText, voidElements } from "./utils";

function renderVNodeToString(
  vNode,
  parent,
  context,
  firstChild
): string | undefined {
  const flags = vNode.flags;
  const type = vNode.type;
  const props = vNode.props || EMPTY_OBJ;
  const children = vNode.children;

  if ((flags & VNodeFlags.Component) > 0) {
    const isClass = flags & VNodeFlags.ComponentClass;

    if (isClass) {
      const instance = new type(props, context);
      instance._blockSetState = false;
      let childContext;
      if (!isNullOrUndef(instance.getChildContext)) {
        childContext = instance.getChildContext();
      }

      if (!isNullOrUndef(childContext)) {
        context = combineFrom(context, childContext);
      }
      if (instance.props === EMPTY_OBJ) {
        instance.props = props;
      }
      instance.context = context;
      instance._unmounted = false;
      if (isFunction(instance.componentWillMount)) {
        instance._blockRender = true;
        instance.componentWillMount();
        if (instance._pendingSetState) {
          const state = instance.state;
          const pending = instance._pendingState;

          if (state === null) {
            instance.state = pending;
          } else {
            for (const key in pending) {
              state[key] = pending[key];
            }
          }
          instance._pendingSetState = false;
          instance._pendingState = null;
        }
        instance._blockRender = false;
      }
      const nextVNode = instance.render(props, instance.state, vNode.context);
      // In case render returns invalid stuff
      if (isInvalid(nextVNode)) {
        return "<!--!-->";
      }
      return renderVNodeToString(nextVNode, vNode, context, true);
    } else {
      const nextVNode = type(props, context);

      if (isInvalid(nextVNode)) {
        return "<!--!-->";
      }
      return renderVNodeToString(nextVNode, vNode, context, true);
    }
  } else if ((flags & VNodeFlags.Element) > 0) {
    let renderedString = `<${type}`;
    let html;
    const isVoidElement = voidElements.has(type);
    const className = vNode.className;

    if (isString(className)) {
      renderedString += ` class="${escapeText(className)}"`;
    } else if (isNumber(className)) {
      renderedString += ` class="${className}"`;
    }

    if (!isNull(props)) {
      for (const prop in props) {
        const value = props[prop];

        if (prop === "dangerouslySetInnerHTML") {
          html = value.__html;
        } else if (prop === "style") {
          renderedString += ` style="${renderStylesToString(props.style)}"`;
        } else if (prop === "children") {
          // Ignore children as prop.
        } else if (prop === "defaultValue") {
          // Use default values if normal values are not present
          if (!props.value) {
            renderedString += ` value="${isString(value)
              ? escapeText(value)
              : value}"`;
          }
        } else if (prop === "defaultChecked") {
          // Use default values if normal values are not present
          if (!props.checked) {
            renderedString += ` checked="${value}"`;
          }
        } else {
          if (isString(value)) {
            renderedString += ` ${prop}="${escapeText(value)}"`;
          } else if (isNumber(value)) {
            renderedString += ` ${prop}="${value}"`;
          } else if (isTrue(value)) {
            renderedString += ` ${prop}`;
          }
        }
      }
      if (
        type === "option" &&
        typeof props.value !== "undefined" &&
        props.value === parent.props.value
      ) {
        // Parent value sets children value
        renderedString += ` selected`;
      }
    }
    if (isVoidElement) {
      renderedString += `>`;
    } else {
      renderedString += `>`;
      if (!isInvalid(children)) {
        if (isString(children)) {
          renderedString += children === "" ? " " : escapeText(children);
        } else if (isNumber(children)) {
          renderedString += children + "";
        } else if (isArray(children)) {
          for (let i = 0, len = children.length; i < len; i++) {
            const child = children[i];
            if (isString(child)) {
              renderedString += child === "" ? " " : escapeText(child);
            } else if (isNumber(child)) {
              renderedString += child;
            } else if (!isInvalid(child)) {
              renderedString += renderVNodeToString(
                child,
                vNode,
                context,
                i === 0
              );
            }
          }
        } else {
          renderedString += renderVNodeToString(children, vNode, context, true);
        }
      } else if (html) {
        renderedString += html;
      }
      if (!isVoidElement) {
        renderedString += `</${type}>`;
      }
    }
    return renderedString;
  } else if ((flags & VNodeFlags.Text) > 0) {
    return (
      (firstChild ? "" : "<!---->") +
      (children === "" ? " " : escapeText(children))
    );
  } else {
    if (process.env.NODE_ENV !== "production") {
      if (typeof vNode === "object") {
        throwError(
          `renderToString() received an object that's not a valid VNode, you should stringify it first. Object: "${JSON.stringify(
            vNode
          )}".`
        );
      } else {
        throwError(
          `renderToString() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`
        );
      }
    }
    throwError();
  }
}

export default function renderToString(input: any): string {
  return renderVNodeToString(input, {}, {}, true) as string;
}

export function renderToStaticMarkup(input: any): string {
  return renderVNodeToString(input, {}, {}, true) as string;
}
