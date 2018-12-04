import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { combineFrom, isArray, isFunction, isInvalid, isNull, isNullOrUndef, isString, isStringOrNumber, isUndefined, throwError } from 'inferno-shared';
import { throwIfObjectIsNotVNode, validateVNodeElementChildren } from './validate';
import { Fragment, options } from './../DOM/utils/common';
import { ForwardRef, IComponent, InfernoNode, Props, Ref, Refs, VNode } from './types';

const keyPrefix = '$';

function V(childFlags: ChildFlags, children, className: string | null | undefined, flags: VNodeFlags, key, props, ref, type, markup?: any) {
  if (process.env.NODE_ENV !== 'production') {
    this.isValidated = false;
  }

  this.childFlags = childFlags;
  this.children = children;
  this.className = className;
  this.dom = null;
  this.flags = flags;
  this.key = key === void 0 ? null : key;
  this.props = props === void 0 ? null : props;
  this.ref = ref === void 0 ? null : ref;
  this.type = type;
  this.markup = markup;
}

export function createVNode<P>(
  flags: VNodeFlags,
  type: string,
  className?: string | null,
  children?: InfernoNode,
  childFlags?: ChildFlags,
  props?: Props<P> & P | null,
  key?: string | number | null,
  ref?: Ref | Refs<P> | null,
  markup?: any
): VNode {
  if (process.env.NODE_ENV !== 'production') {
    if (flags & VNodeFlags.Component) {
      throwError('Creating Component vNodes using createVNode is not allowed. Use Inferno.createComponentVNode method.');
    }
  }
  const childFlag: ChildFlags = childFlags === void 0 ? ChildFlags.HasInvalidChildren : (childFlags as ChildFlags);
  const vNode = new V(childFlag, children, className, flags, key, props, ref, type, markup) as VNode;

  const optsVNode = options.createVNode;

  if (isFunction(optsVNode)) {
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

export function createComponentVNode<P>(
  flags: VNodeFlags,
  type: Function | IComponent<any, any> | ForwardRef,
  props?: Props<P> & P | null,
  key?: null | string | number,
  ref?: Ref | Refs<P> | null
) {
  if (process.env.NODE_ENV !== 'production') {
    if (flags & VNodeFlags.HtmlElement) {
      throwError('Creating element vNodes using createComponentVNode is not allowed. Use Inferno.createVNode method.');
    }
  }

  if ((flags & VNodeFlags.ComponentUnknown) !== 0) {
    if ((type as any).prototype && (type as any).prototype.render) {
      flags = VNodeFlags.ComponentClass;
    } else if ((type as any).render) {
      flags = VNodeFlags.ForwardRefComponent;
      type = (type as ForwardRef).render;
    } else {
      flags = VNodeFlags.ComponentFunction;
    }
  }

  // set default props
  const defaultProps = (type as any).defaultProps;

  if (!isNullOrUndef(defaultProps)) {
    if (!props) {
      (props as any) = {}; // Props can be referenced and modified at application level so always create new object
    }
    for (const prop in defaultProps) {
      if (isUndefined(props![prop])) {
        props![prop] = defaultProps[prop];
      }
    }
  }

  if ((flags & VNodeFlags.ComponentFunction) > 0 && (flags & VNodeFlags.ForwardRef) === 0) {
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

  const vNode = new V(ChildFlags.HasInvalidChildren, null, null, flags, key, props, ref, type) as VNode;
  const optsVNode = options.createVNode;

  if (isFunction(optsVNode)) {
    optsVNode(vNode);
  }

  return vNode;
}

export function createTextVNode(text?: string | number, key?: string | number | null): VNode {
  return new V(ChildFlags.HasInvalidChildren, isNullOrUndef(text) ? '' : text, null, VNodeFlags.Text, key, null, null, null) as VNode;
}

export function createFragment(children: any, childFlags: ChildFlags, key?: string | number | null): VNode {
  const fragment = createVNode(VNodeFlags.Fragment, VNodeFlags.Fragment as any, null, children, childFlags, null, key, null);

  switch (fragment.childFlags) {
    case ChildFlags.HasInvalidChildren:
      fragment.children = createVoidVNode();
      fragment.childFlags = ChildFlags.HasVNodeChildren;
      break;
    case ChildFlags.HasTextChildren:
      fragment.children = [createTextVNode(children)];
      fragment.childFlags = ChildFlags.HasNonKeyedChildren;
      break;
    default:
      break;
  }

  return fragment;
}

export function normalizeProps(vNode) {
  const props = vNode.props;

  if (props) {
    const flags = vNode.flags;

    if (flags & VNodeFlags.Element) {
      if (props.children !== void 0 && isNullOrUndef(vNode.children)) {
        normalizeChildren(vNode, props.children);
      }
      if (props.className !== void 0) {
        vNode.className = props.className || null;
        props.className = undefined;
      }
    }
    if (props.key !== void 0) {
      vNode.key = props.key;
      props.key = undefined;
    }
    if (props.ref !== void 0) {
      if (flags & VNodeFlags.ComponentFunction) {
        vNode.ref = combineFrom(vNode.ref, props.ref);
      } else {
        vNode.ref = props.ref as any;
      }

      props.ref = undefined;
    }
  }

  return vNode;
}

/*
 * Fragment is different than normal vNode,
 * because when it needs to be cloned we need to clone its children too
 * But not normalize, because otherwise those possibly get KEY and re-mount
 */
function cloneFragment(vNodeToClone) {
  let clonedChildren;
  const oldChildren = vNodeToClone.children;
  const childFlags = vNodeToClone.childFlags;

  if (childFlags === ChildFlags.HasVNodeChildren) {
    clonedChildren = directClone(oldChildren as VNode);
  } else if (childFlags & ChildFlags.MultipleChildren) {
    clonedChildren = [];

    for (let i = 0, len = oldChildren.length; i < len; ++i) {
      clonedChildren.push(directClone(oldChildren[i]));
    }
  }

  return createFragment(clonedChildren, childFlags, vNodeToClone.key);
}

export function directClone(vNodeToClone: VNode): VNode {
  const flags = vNodeToClone.flags & VNodeFlags.ClearInUseNormalized;
  let props = vNodeToClone.props;

  if (flags & VNodeFlags.Component) {
    if (!isNull(props)) {
      const propsToClone = props;
      props = {};
      for (const key in propsToClone) {
        props[key] = propsToClone[key];
      }
    }
  }
  if (!flags && typeof vNodeToClone.markup === 'string' /* RawMarkupNode Type WS bugfix */) {
    return vNodeToClone;
  }
  if ((flags & VNodeFlags.Fragment) === 0) {
    return new V(
      vNodeToClone.childFlags,
      vNodeToClone.children,
      vNodeToClone.className,
      flags,
      vNodeToClone.key,
      props,
      vNodeToClone.ref,
      vNodeToClone.type
    ) as VNode;
  }
  return cloneFragment(vNodeToClone);
}

export function createVoidVNode(): VNode {
  return createTextVNode('', null);
}

export function createPortal(children, container) {
  return createVNode(
    VNodeFlags.Portal,
    VNodeFlags.Portal as any,
    null,
    children,
    ChildFlags.UnknownChildren,
    null,
    isInvalid(children) ? null : children.key,
    container
  );
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
          if (process.env.NODE_ENV !== 'production') {
            throwIfObjectIsNotVNode(n);
          }
          const oldKey = n.key;
          const isPrefixedKey = isString(oldKey) && oldKey[0] === keyPrefix;

          if (n.flags & VNodeFlags.InUseOrNormalized || isPrefixedKey) {
            n = directClone(n);
          }

          n.flags |= VNodeFlags.Normalized;

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
  switch (type) {
    case 'svg':
      return VNodeFlags.SvgElement;
    case 'input':
      return VNodeFlags.InputElement;
    case 'select':
      return VNodeFlags.SelectElement;
    case 'textarea':
      return VNodeFlags.TextareaElement;
    case Fragment:
      return VNodeFlags.Fragment;
    default:
      return VNodeFlags.HtmlElement;
  }
}

export function normalizeChildren(vNode: VNode, children) {
  let newChildren: any;
  let newChildFlags: ChildFlags = ChildFlags.HasInvalidChildren;

  // Don't change children to match strict equal (===) true in patching
  if (isInvalid(children)) {
    newChildren = children;
  } else if (isStringOrNumber(children)) {
    newChildFlags = ChildFlags.HasTextChildren;
    newChildren = children;
  } else if (isArray(children)) {
    const len = children.length;

    for (let i = 0; i < len; ++i) {
      let n = children[i];

      if (isInvalid(n) || isArray(n)) {
        newChildren = newChildren || children.slice(0, i);

        _normalizeVNodes(children, newChildren, i, '');
        break;
      } else if (isStringOrNumber(n)) {
        newChildren = newChildren || children.slice(0, i);
        newChildren.push(createTextVNode(n, keyPrefix + i));
      } else {
        if (process.env.NODE_ENV !== 'production') {
          throwIfObjectIsNotVNode(n);
        }
        const key = n.key;
        const needsCloning: boolean = (n.flags & VNodeFlags.InUseOrNormalized) > 0;
        const isNullKey: boolean = isNull(key);
        const isPrefixed: boolean = !isNullKey && isString(key) && key[0] === keyPrefix;

        if (needsCloning || isNullKey || isPrefixed) {
          newChildren = newChildren || children.slice(0, i);
          if (needsCloning || isPrefixed) {
            n = directClone(n);
          }
          if (isNullKey || isPrefixed) {
            n.key = keyPrefix + i;
          }
          newChildren.push(n);
        } else if (newChildren) {
          newChildren.push(n);
        }

        n.flags |= VNodeFlags.Normalized;
      }
    }
    newChildren = newChildren || children;
    if (newChildren.length === 0) {
      newChildFlags = ChildFlags.HasInvalidChildren;
    } else {
      newChildFlags = ChildFlags.HasKeyedChildren;
    }
  } else {
    newChildren = children;
    newChildren.flags |= VNodeFlags.Normalized;

    if (children.flags & VNodeFlags.InUseOrNormalized) {
      newChildren = directClone(children as VNode);
    }
    newChildFlags = ChildFlags.HasVNodeChildren;
  }

  vNode.children = newChildren;
  vNode.childFlags = newChildFlags;

  return vNode;
}
