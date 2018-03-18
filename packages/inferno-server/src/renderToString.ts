import { EMPTY_OBJ } from 'inferno';
import { combineFrom, isFunction, isInvalid, isNull, isNullOrUndef, isNumber, isString, isTrue, throwError } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { renderStylesToString } from './prop-renderers';
import { escapeText, voidElements } from './utils';

function renderVNodeToString(vNode, parent, context, firstChild): string | undefined {
  const flags = vNode.flags;
  const type = vNode.type;
  const props = vNode.props || EMPTY_OBJ;
  const children = vNode.children;

  if ((flags & VNodeFlags.Component) > 0) {
    const isClass = flags & VNodeFlags.ComponentClass;

    if (isClass) {
      const instance = new type(props, context);
      instance.$BS = false;
      let childContext;
      if (isFunction(instance.getChildContext)) {
        childContext = instance.getChildContext();
      }

      if (isNullOrUndef(childContext)) {
        childContext = context;
      } else {
        childContext = combineFrom(context, childContext);
      }
      if (instance.props === EMPTY_OBJ) {
        instance.props = props;
      }
      instance.context = context;
      instance.$UN = false;
      if (isFunction(instance.componentWillMount)) {
        instance.$BR = true;
        instance.componentWillMount();
        instance.$BR = false;
      }
      if (instance.$PSS) {
        const state = instance.state;
        const pending = instance.$PS;

        if (state === null) {
          instance.state = pending;
        } else {
          for (const key in pending) {
            state[key] = pending[key];
          }
        }
        instance.$PSS = false;
        instance.$PS = null;
      }
      const renderOutput = instance.render(props, instance.state, instance.context);
      // In case render returns invalid stuff
      if (isInvalid(renderOutput)) {
        return '<!--!-->';
      }
      if (isString(renderOutput)) {
        return escapeText(renderOutput);
      }
      if (isNumber(renderOutput)) {
        return renderOutput + '';
      }
      return renderVNodeToString(renderOutput, vNode, childContext, true);
    } else {
      const renderOutput = type(props, context);

      if (isInvalid(renderOutput)) {
        return '<!--!-->';
      }
      if (isString(renderOutput)) {
        return escapeText(renderOutput);
      }
      if (isNumber(renderOutput)) {
        return renderOutput + '';
      }
      return renderVNodeToString(renderOutput, vNode, context, true);
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

        switch (prop) {
          case 'dangerouslySetInnerHTML':
            html = value.__html;
            break;
          case 'style':
            if (!isNullOrUndef(props.style)) {
              renderedString += ` style="${renderStylesToString(props.style)}"`;
            }
            break;
          case 'children':
          case 'className':
            // Ignore
            break;
          case 'defaultValue':
            // Use default values if normal values are not present
            if (!props.value) {
              renderedString += ` value="${isString(value) ? escapeText(value) : value}"`;
            }
            break;
          case 'defaultChecked':
            // Use default values if normal values are not present
            if (!props.checked) {
              renderedString += ` checked="${value}"`;
            }
            break;
          default:
            if (isString(value)) {
              renderedString += ` ${prop}="${escapeText(value)}"`;
            } else if (isNumber(value)) {
              renderedString += ` ${prop}="${value}"`;
            } else if (isTrue(value)) {
              renderedString += ` ${prop}`;
            }
            break;
        }
      }
      if (type === 'option' && typeof props.value !== 'undefined' && props.value === parent.props.value) {
        // Parent value sets children value
        renderedString += ` selected`;
      }
    }
    if (isVoidElement) {
      renderedString += `>`;
    } else {
      renderedString += `>`;
      const childFlags = vNode.childFlags;

      if (childFlags & ChildFlags.HasVNodeChildren) {
        renderedString += renderVNodeToString(children, vNode, context, true);
      } else if (childFlags & ChildFlags.MultipleChildren) {
        for (let i = 0, len = children.length; i < len; i++) {
          renderedString += renderVNodeToString(children[i], vNode, context, i === 0);
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
    return (firstChild ? '' : '<!---->') + (children === '' ? ' ' : escapeText(children));
  } else {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof vNode === 'object') {
        throwError(`renderToString() received an object that's not a valid VNode, you should stringify it first. Object: "${JSON.stringify(vNode)}".`);
      } else {
        throwError(`renderToString() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`);
      }
    }
    throwError();
  }
  return undefined;
}

export function renderToString(input: any): string {
  return renderVNodeToString(input, {}, {}, true) as string;
}
