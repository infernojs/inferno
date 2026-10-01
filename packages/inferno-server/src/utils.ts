import {
  createFragment,
  EMPTY_OBJ,
  type InfernoNode,
  type VNode,
} from 'inferno';
import { isArray, isFunction, isNullOrUndef, throwError } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

const rxUnescaped = /["'&<>]/;

export function escapeText(text: string): string {
  /* Much faster when there is no unescaped characters */
  if (!rxUnescaped.test(text)) {
    return text;
  }

  let result = '';
  // assigning empty string here tells JIT this is text
  // eslint-disable-next-line no-useless-assignment
  let escape = '';
  let start = 0;
  let i = 0;
  for (; i < text.length; ++i) {
    switch (text.charCodeAt(i)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 39: // '
        escape = '&#039;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }
    if (i > start) {
      result += text.slice(start, i);
    }
    result += escape;
    start = i + 1;
  }
  return result + text.slice(start, i);
}

const uppercasePattern = /[A-Z]/g;

const CssPropCache = {};

export function getCssPropertyName(str): string {
  if (CssPropCache[str] !== void 0) {
    return CssPropCache[str];
  }
  return (CssPropCache[str] =
    str.replace(uppercasePattern, '-$&').toLowerCase() + ':');
}

const ATTRIBUTE_NAME_START_CHAR =
  ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';

const ATTRIBUTE_NAME_CHAR =
  ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';

export const VALID_ATTRIBUTE_NAME_REGEX = new RegExp(
  // eslint-disable-next-line no-misleading-character-class
  '^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$',
);

const rxUnsafeTagName = /[\s\n/='"\0<>]/;

// Called before anything of the element is rendered, so an unsafe tag never reaches the output
export function validateTagName(type: string): void {
  if (rxUnsafeTagName.test(type)) {
    throwError(`Invalid tag name <${type}>`);
  }
}

// selectValue is the value of the nearest <select>, which selects the options that have the same value.
// An array value of a multiple select selects every option in it, as on the client.
export function isSelectedOption(type, props, selectValue): boolean {
  if (type !== 'option' || typeof props.value === 'undefined') {
    return false;
  }

  return (
    props.value === selectValue ||
    (isArray(selectValue) && selectValue.includes(props.value))
  );
}

// Like the client on mount, the select falls back to its defaultValue
export function getChildSelectValue(type, props, selectValue): unknown {
  if (type !== 'select') {
    return selectValue;
  }

  return isNullOrUndef(props?.value) ? props?.defaultValue : props.value;
}

const illegalAttributeNameCache = {};
const validatedAttributeNameCache = {};

export function isAttributeNameSafe(attributeName: string): boolean {
  if (validatedAttributeNameCache[attributeName] !== void 0) {
    return true;
  }
  if (illegalAttributeNameCache[attributeName] !== void 0) {
    return false;
  }
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
    validatedAttributeNameCache[attributeName] = true;
    return true;
  }
  illegalAttributeNameCache[attributeName] = true;
  if (process.env.NODE_ENV !== 'production') {
    console.log('Invalid attribute name: ' + attributeName);
  }
  return false;
}

export const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

// Same check as the client: these components skip the legacy lifecycles
export function usesNewAPI(type, instance): boolean {
  return Boolean(
    type.getDerivedStateFromProps || instance.getSnapshotBeforeUpdate,
  );
}

// Called after render, the same as on the client, so it sees the state set before render
export function getChildContext(instance, context): Record<string, unknown> {
  const childContext = isFunction(instance.getChildContext)
    ? instance.getChildContext()
    : null;

  return isNullOrUndef(childContext)
    ? context
    : { ...context, ...childContext };
}

export function createDerivedState(
  instance,
  nextProps,
  state,
): Record<string, unknown> {
  if (instance.constructor.getDerivedStateFromProps) {
    return {
      ...state,
      ...instance.constructor.getDerivedStateFromProps(nextProps, state),
    };
  }

  return state;
}

// Arrays are rendered as the Fragments they are normalized to in the browser
export function arrayToFragment(vNode) {
  return isArray(vNode)
    ? createFragment(vNode, ChildFlags.UnknownChildren)
    : vNode;
}

// Fragment without DOM nodes renders a placeholder, which hydration replaces with an empty text node
export function isEmptyFragment(vNode: VNode): boolean {
  const children = vNode.children as any;

  if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
    return (children.flags & VNodeFlags.Text) !== 0 && children.children === '';
  }
  return children.length === 0;
}

export function renderFunctionalComponent(vNode: VNode, context): InfernoNode {
  const props = vNode.props || EMPTY_OBJ;
  return vNode.flags & VNodeFlags.ForwardRef
    ? vNode.type.render(props, vNode.ref, context)
    : vNode.type(props, context);
}
