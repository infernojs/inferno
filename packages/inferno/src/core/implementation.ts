import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import {
  isArray,
  isDefined,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isNumber,
  isString,
  isStringOrNumber,
  isUndefined,
  throwError
} from 'inferno-shared';
import { validateVNodeElementChildren } from './validate';

const keyPrefix = '$';

export interface VNode {
  children: InfernoChildren;
  childFlags: ChildFlags;
  dom: Element | null;
  className: string | null | undefined;
  flags: VNodeFlags;
  isValidated?: boolean;
  key: null | number | string;
  parentVNode: VNode | null;
  props: Props | null;
  ref: Ref | Refs | null;
  type: any;
}
export type InfernoInput = VNode | null | string | number;
export type Ref = (node?: Element | null) => any;
export type InfernoChildren = string | number | boolean | undefined | VNode | Array<string | number | VNode> | null;

export interface Props {
  children?: InfernoChildren;
  ref?: Ref | null;
  key?: any;
  className?: string;
  [k: string]: any;
}

export interface Refs {
  onComponentDidMount?: (domNode: Element) => void;
  onComponentWillMount?(): void;
  onComponentShouldUpdate?(lastProps, nextProps): boolean;
  onComponentWillUpdate?(lastProps, nextProps): void;
  onComponentDidUpdate?(lastProps, nextProps): void;
  onComponentWillUnmount?(domNode: Element): void;
}

function getVNode(childFlags: ChildFlags, children, className: string | null | undefined, flags: VNodeFlags, key, props, ref, type): VNode {
  if (process.env.NODE_ENV !== 'production') {
    return {
      childFlags,
      children,
      className,
      dom: null,
      flags,
      isValidated: false,
      key: key === void 0 ? null : key,
      parentVNode: null,
      props: props === void 0 ? null : props,
      ref: ref === void 0 ? null : ref,
      type
    };
  }

  return {
    childFlags,
    children,
    className,
    dom: null,
    flags,
    key: key === void 0 ? null : key,
    parentVNode: null,
    props: props === void 0 ? null : props,
    ref: ref === void 0 ? null : ref,
    type
  };
}

export function createVNode(
  flags: VNodeFlags,
  type,
  className?: string | null,
  children?: InfernoChildren,
  childFlags?: ChildFlags,
  props?: Props | null,
  key?: string | number | null,
  ref?: Ref | Refs | null
): VNode {
  if (process.env.NODE_ENV !== 'production') {
    if (flags & VNodeFlags.Component) {
      throwError('Creating Component vNodes using createVNode is not allowed. Use Inferno.createComponentVNode method.');
    }
  }
  const childFlag = childFlags === void 0 ? ChildFlags.HasInvalidChildren : childFlags;
  const vNode = getVNode(childFlag, children, className, flags, key, props, ref, type);

  const optsVNode = options.createVNode;

  if (typeof optsVNode === 'function') {
    optsVNode(vNode);
  }

  if (childFlag === ChildFlags.UnknownChildren) {
    normalizeChildren(vNode, vNode.children);
  }

  if (process.env.NODE_ENV !== 'production') {
    validateVNodeElementChildren(vNode);
  }

  return vNode;
}

export function createComponentVNode(flags: VNodeFlags, type, props?: Props | null, key?: null | string | number, ref?: Ref | Refs | null) {
  if (process.env.NODE_ENV !== 'production') {
    if (flags & VNodeFlags.HtmlElement) {
      throwError('Creating element vNodes using createComponentVNode is not allowed. Use Inferno.createVNode method.');
    }
  }

  if ((flags & VNodeFlags.ComponentUnknown) > 0) {
    flags = isDefined(type.prototype) && isFunction(type.prototype.render) ? VNodeFlags.ComponentClass : VNodeFlags.ComponentFunction;
  }

  // set default props
  const defaultProps = (type as any).defaultProps;

  if (!isNullOrUndef(defaultProps)) {
    if (!props) {
      props = {}; // Props can be referenced and modified at application level so always create new object
    }
    for (const prop in defaultProps) {
      if (isUndefined(props[prop])) {
        props[prop] = defaultProps[prop];
      }
    }
  }

  if ((flags & VNodeFlags.ComponentFunction) > 0) {
    const defaultHooks = (type as any).defaultHooks;

    if (!isNullOrUndef(defaultHooks)) {
      if (!ref) {
        // As ref cannot be referenced from application level, we can use the same refs object
        ref = defaultHooks;
      } else {
        for (const prop in defaultHooks) {
          if (isUndefined(ref[prop])) {
            ref[prop] = defaultHooks[prop];
          }
        }
      }
    }
  }

  const vNode = getVNode(ChildFlags.HasInvalidChildren, null, null, flags, key, props, ref, type);
  const optsVNode = options.createVNode;

  if (isFunction(optsVNode)) {
    optsVNode(vNode);
  }

  return vNode;
}

export function createTextVNode(text?: string | number, key?: string | number | null): VNode {
  return getVNode(ChildFlags.HasInvalidChildren, isNullOrUndef(text) ? '' : text, null, VNodeFlags.Text, key, null, null, null);
}

export function normalizeProps(vNode) {
  const props = vNode.props;

  if (props) {
    if (vNode.flags & VNodeFlags.Element) {
      if (isDefined(props.children) && isNullOrUndef(vNode.children)) {
        normalizeChildren(vNode, props.children);
      }
      if (isDefined(props.className)) {
        vNode.className = props.className || null;
        props.className = undefined;
      }
    }
    if (isDefined(props.key)) {
      vNode.key = props.key;
      props.key = undefined;
    }
    if (isDefined(props.ref)) {
      vNode.ref = props.ref as any;
      props.ref = undefined;
    }
  }

  return vNode;
}

export function directClone(vNodeToClone: VNode): VNode {
  let newVNode;
  const flags = vNodeToClone.flags;

  if (flags & VNodeFlags.Component) {
    let props;
    const propsToClone = vNodeToClone.props;

    if (!isNull(propsToClone)) {
      props = {};
      for (const key in propsToClone) {
        props[key] = propsToClone[key];
      }
    }
    newVNode = createComponentVNode(flags, vNodeToClone.type, props, vNodeToClone.key, vNodeToClone.ref);
  } else if (flags & VNodeFlags.Element) {
    const children = vNodeToClone.children;

    newVNode = createVNode(
      flags,
      vNodeToClone.type,
      vNodeToClone.className,
      children,
      ChildFlags.UnknownChildren,
      vNodeToClone.props,
      vNodeToClone.key,
      vNodeToClone.ref
    );
  } else if (flags & VNodeFlags.Text) {
    newVNode = createTextVNode(vNodeToClone.children as string, vNodeToClone.key);
  } else if (flags & VNodeFlags.Portal) {
    newVNode = vNodeToClone;
  }

  return newVNode;
}

export function createVoidVNode(): VNode {
  return createTextVNode('', null);
}

export function _normalizeVNodes(nodes: any[], result: VNode[], index: number, currentKey: string) {
  for (const len = nodes.length; index < len; index++) {
    let n = nodes[index];

    if (!isInvalid(n)) {
      const newKey: string = currentKey + keyPrefix + index;

      if (isArray(n)) {
        _normalizeVNodes(n, result, 0, newKey);
      } else {
        if (isStringOrNumber(n)) {
          n = createTextVNode(n, newKey);
        } else {
          const oldKey = n.key;
          const isPrefixedKey = isString(oldKey) && oldKey[0] === keyPrefix;

          if (!isNull(n.dom) || isPrefixedKey) {
            n = directClone(n);
          }
          if (isNull(oldKey) || isPrefixedKey) {
            n.key = newKey;
          } else {
            n.key = currentKey + oldKey;
          }
        }

        result.push(n);
      }
    }
  }
}

export function getFlagsForElementVnode(type: string): VNodeFlags {
  if (type === 'svg') {
    return VNodeFlags.SvgElement;
  }
  if (type === 'input') {
    return VNodeFlags.InputElement;
  }
  if (type === 'select') {
    return VNodeFlags.SelectElement;
  }
  if (type === 'textarea') {
    return VNodeFlags.TextareaElement;
  }

  return VNodeFlags.HtmlElement;
}

export function normalizeChildren(vNode: VNode, children) {
  let newChildren: any;
  let newChildFlags: number = ChildFlags.HasInvalidChildren;

  // Don't change children to match strict equal (===) true in patching
  if (isInvalid(children)) {
    newChildren = children;
  } else if (isString(children)) {
    newChildFlags = ChildFlags.HasVNodeChildren;
    newChildren = createTextVNode(children);
  } else if (isNumber(children)) {
    newChildFlags = ChildFlags.HasVNodeChildren;
    newChildren = createTextVNode(children + '');
  } else if (isArray(children)) {
    const len = children.length;

    if (len === 0) {
      newChildren = null;
      newChildFlags = ChildFlags.HasInvalidChildren;
    } else {
      // we assign $ which basically means we've flagged this array for future note
      // if it comes back again, we need to clone it, as people are using it
      // in an immutable way
      // tslint:disable-next-line
      if (Object.isFrozen(children) || children['$'] === true) {
        children = children.slice();
      }

      newChildFlags = ChildFlags.HasKeyedChildren;

      for (let i = 0; i < len; i++) {
        let n = children[i];

        if (isInvalid(n) || isArray(n)) {
          newChildren = newChildren || children.slice(0, i);

          _normalizeVNodes(children, newChildren, i, '');
          break;
        } else if (isStringOrNumber(n)) {
          newChildren = newChildren || children.slice(0, i);
          newChildren.push(createTextVNode(n, keyPrefix + i));
        } else {
          const key = n.key;
          const isNullDom = isNull(n.dom);
          const isNullKey = isNull(key);
          const isPrefixed = !isNullKey && key[0] === keyPrefix;

          if (!isNullDom || isNullKey || isPrefixed) {
            newChildren = newChildren || children.slice(0, i);
            if (!isNullDom || isPrefixed) {
              n = directClone(n);
            }
            if (isNullKey || isPrefixed) {
              n.key = keyPrefix + i;
            }
            newChildren.push(n);
          } else if (newChildren) {
            newChildren.push(n);
          }
        }
      }
      newChildren = newChildren || children;
      newChildren.$ = true;
    }
  } else {
    newChildren = children;

    if (!isNull((children as VNode).dom)) {
      newChildren = directClone(children as VNode);
    }
    newChildFlags = ChildFlags.HasVNodeChildren;
  }

  vNode.children = newChildren;
  vNode.childFlags = newChildFlags;

  if (process.env.NODE_ENV !== 'production') {
    validateVNodeElementChildren(vNode);
  }

  return vNode;
}

export const options: {
  afterMount: null | Function;
  afterRender: null | Function;
  afterUpdate: null | Function;
  beforeRender: null | Function;
  beforeUnmount: null | Function;
  createVNode: null | Function;
  roots: any[];
} = {
  afterMount: null,
  afterRender: null,
  afterUpdate: null,
  beforeRender: null,
  beforeUnmount: null,
  createVNode: null,
  roots: []
};
