import { EMPTY_OBJ } from 'inferno';
import {
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isNumber,
  isString,
  throwError,
} from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { renderStyleAttribute } from './prop-renderers';
import {
  arrayToFragment,
  createDerivedState,
  escapeText,
  getChildContext,
  getChildSelectValue,
  getTextareaContent,
  isAttributeNameSafe,
  isEmptyFragment,
  isSelectedOption,
  renderFunctionalComponent,
  usesNewAPI,
  validateTagName,
  voidElements,
} from './utils';

// selectValue is the value of the nearest <select>, see isSelectedOption
function renderVNodeToString(vNode, context, selectValue?: unknown): string {
  vNode = arrayToFragment(vNode);
  const flags = vNode.flags;
  const type = vNode.type;
  const props = vNode.props || EMPTY_OBJ;
  const children = vNode.children;

  if ((flags & VNodeFlags.Component) !== 0) {
    const isClass = flags & VNodeFlags.ComponentClass;

    if (isClass) {
      const instance = new type(props, context);
      const hasNewAPI = usesNewAPI(type, instance);
      instance.$BS = false;
      instance.$SSR = true;
      if (instance.props === EMPTY_OBJ) {
        instance.props = props;
      }
      instance.context = context;
      if (!hasNewAPI && isFunction(instance.componentWillMount)) {
        instance.$BR = true;
        instance.componentWillMount();
        instance.$BR = false;
        const pending = instance.$PS;

        if (pending) {
          const state = instance.state;

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
      }
      if (hasNewAPI) {
        instance.state = createDerivedState(instance, props, instance.state);
      }
      const renderOutput = instance.render(
        props,
        instance.state,
        instance.context,
      );
      const childContext = getChildContext(instance, context);
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
      return renderVNodeToString(renderOutput, childContext, selectValue);
    } else {
      const renderOutput = renderFunctionalComponent(vNode, context);

      if (isInvalid(renderOutput)) {
        return '<!--!-->';
      }
      if (isString(renderOutput)) {
        return escapeText(renderOutput);
      }
      if (isNumber(renderOutput)) {
        return renderOutput + '';
      }
      return renderVNodeToString(renderOutput, context, selectValue);
    }
  } else if ((flags & VNodeFlags.Element) !== 0) {
    validateTagName(type);

    let renderedString = `<${type}`;
    let html;

    const isVoidElement = voidElements.has(type);
    const isTextarea = type === 'textarea';
    const className = vNode.className;

    if (isString(className)) {
      renderedString += ` class="${escapeText(className)}"`;
    } else if (isNumber(className)) {
      renderedString += ` class="${className}"`;
    }

    if (!isNull(props)) {
      for (const prop in props) {
        const value = props[prop];

        if (isTextarea && (prop === 'value' || prop === 'defaultValue')) {
          continue; // Rendered as the content
        }
        switch (prop) {
          case 'dangerouslySetInnerHTML':
            html = value?.__html;
            break;
          case 'style':
            if (!isNullOrUndef(props.style)) {
              renderedString += renderStyleAttribute(props.style);
            }
            break;
          case 'children':
          case 'className':
            // Ignore
            break;
          case 'defaultValue':
            // Use default values if normal values are not present
            if (isNullOrUndef(props.value)) {
              renderedString += ` value="${
                isString(value) ? escapeText(value) : value
              }"`;
            }
            break;
          case 'defaultChecked':
            // Use default values if normal values are not present
            if (isNullOrUndef(props.checked) && value === true) {
              renderedString += ` checked="${value}"`;
            }
            break;
          default:
            if (isAttributeNameSafe(prop)) {
              if (isString(value)) {
                renderedString += ` ${prop}="${escapeText(value)}"`;
              } else if (isNumber(value)) {
                renderedString += ` ${prop}="${value}"`;
              } else if (value === true) {
                renderedString += ` ${prop}`;
              }
            }

            break;
        }
      }
      if (isSelectedOption(type, props, selectValue)) {
        renderedString += ` selected`;
      }
      if (isTextarea) {
        html = getTextareaContent(props) ?? html;
      }
    }
    if (isVoidElement) {
      renderedString += `>`;
    } else {
      renderedString += `>`;
      const childFlags = vNode.childFlags;
      const childSelectValue = getChildSelectValue(type, props, selectValue);

      // The html wins over children, as on the client
      if (html) {
        renderedString += html;
      } else if (childFlags === ChildFlags.HasVNodeChildren) {
        renderedString += renderVNodeToString(
          children,
          context,
          childSelectValue,
        );
      } else if (childFlags & ChildFlags.MultipleChildren) {
        for (let i = 0, len = children.length; i < len; ++i) {
          const child = children[i];
          renderedString += renderVNodeToString(
            child,
            context,
            childSelectValue,
          );
        }
      } else if (childFlags === ChildFlags.HasTextChildren) {
        renderedString += children === '' ? ' ' : escapeText(children);
      }
      if (!isVoidElement) {
        renderedString += `</${type}>`;
      }
    }

    return renderedString;
  } else if ((flags & VNodeFlags.Text) !== 0) {
    return children === '' ? ' ' : escapeText(children);
  } else if ((flags & VNodeFlags.Fragment) !== 0) {
    if (isEmptyFragment(vNode)) {
      return '<!--!-->';
    }
    if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
      return renderVNodeToString(children, context, selectValue);
    }
    let renderedString = '';

    for (let i = 0, len = children.length; i < len; ++i) {
      const child = children[i];
      renderedString += renderVNodeToString(child, context, selectValue);
    }

    return renderedString;
  } else {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof vNode === 'object') {
        throwError(
          `renderToString() received an object that's not a valid VNode, you should stringify it first. Object: "${JSON.stringify(
            vNode,
          )}".`,
        );
      } else {
        throwError(
          `renderToString() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`,
        );
      }
    }
    throwError();
  }

  return '';
}

export function renderToString(input: any): string {
  return renderVNodeToString(input, {});
}
