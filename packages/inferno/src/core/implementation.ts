import type {
  ForwardRef,
  InfernoNode,
  ParentDOM,
  Ref,
  Refs,
  VNode,
} from './types';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import {
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isString,
  isStringOrNumber,
  throwError,
} from 'inferno-shared';
import {
  throwIfObjectIsNotVNode,
  validateChildFlags,
  validateVNodeElementChildren,
} from './validate';
import {
  childFlagsToBit,
  Fragment,
  mergeUnsetProperties,
  options,
} from './../DOM/utils/common';
import { type Component, type ComponentType } from './component';

const keyPrefix = '$';
// Index keys are shared, so comparing a normalized key to the same index key is a reference check
const indexKeys: string[] = [];

function getIndexKey(index: number): string {
  let key = indexKeys[index];

  if (key === void 0) {
    key = indexKeys[index] = keyPrefix + index;
  }
  return key;
}

function V(
  children,
  className: string | null | undefined,
  flags: VNodeFlags,
  key,
  props,
  ref,
  type,
): void {
  this.children = children;
  this.className = className;
  this.dom = null;
  this.flags = flags;
  this.key = key === void 0 ? null : key;
  this.props = props === void 0 ? null : props;
  this.ref = ref === void 0 ? null : ref;
  this.type = type;
}

// The child bits are packed in the flags, flags without a child bit have unknown children that get normalized
export function newVNode<P>(
  flags: VNodeFlags,
  type: string,
  className?: string | null,
  children?: InfernoNode,
  props?: Readonly<P> | null,
  key?: string | number | null,
  ref?: Ref | Refs<P> | null,
): VNode {
  if (process.env.NODE_ENV !== 'production') {
    if (flags & VNodeFlags.Component) {
      throwError(
        'Creating Component vNodes using newVNode is not allowed. Use Inferno.newComponentVNode method.',
      );
    }
  }
  const vNode = new V(
    children,
    className,
    flags,
    key,
    props,
    ref,
    type,
  ) as VNode;

  if (options.createVNode) {
    options.createVNode(vNode);
  }

  const hasUnknownChildren = (flags & VNodeFlags.ChildFlagsMask) === 0;

  if (hasUnknownChildren) {
    normalizeChildren(vNode, vNode.children);
  }

  if (process.env.NODE_ENV !== 'production') {
    if (!hasUnknownChildren) {
      validateChildFlags(vNode);
    }
    validateVNodeElementChildren(vNode);
  }

  return vNode;
}

/**
 * @deprecated Use newVNode, its flags include the child bit: `VNodeFlags.HasTextChildren` for `ChildFlags.HasTextChildren` and so on.
 */
export function createVNode<P>(
  flags: VNodeFlags,
  type: string,
  className?: string | null,
  children?: InfernoNode,
  childFlags?: ChildFlags,
  props?: Readonly<P> | null,
  key?: string | number | null,
  ref?: Ref | Refs<P> | null,
): VNode {
  return newVNode(
    // The flags can be copied from another vNode (cloneVNode does), its children and validation do not apply
    (flags & VNodeFlags.ClearOnCopy) | childFlagsToBit(childFlags),
    type,
    className,
    children,
    props,
    key,
    ref,
  );
}

function mergeDefaultHooks(flags, type, ref) {
  if (flags & VNodeFlags.ComponentClass) {
    return ref;
  }

  const defaultHooks = (flags & VNodeFlags.ForwardRef ? type.render : type)
    .defaultHooks;

  if (isNullOrUndef(defaultHooks)) {
    return ref;
  }

  if (isNullOrUndef(ref)) {
    return defaultHooks;
  }

  return mergeUnsetProperties(ref, defaultHooks);
}

function mergeDefaultProps(flags, type, props) {
  // set default props
  const defaultProps = (flags & VNodeFlags.ForwardRef ? type.render : type)
    .defaultProps;

  if (isNullOrUndef(defaultProps)) {
    return props;
  }

  if (isNullOrUndef(props)) {
    return { ...defaultProps };
  }

  return mergeUnsetProperties(props, defaultProps);
}

function resolveComponentFlags(type): VNodeFlags {
  if (type.prototype?.render) {
    return VNodeFlags.ComponentClass | VNodeFlags.HasInvalidChildren;
  }

  if (type.render) {
    return VNodeFlags.ForwardRefComponent | VNodeFlags.HasInvalidChildren;
  }

  return VNodeFlags.ComponentFunction | VNodeFlags.HasInvalidChildren;
}

// Flags of a known component type are kept as they are, they include VNodeFlags.HasInvalidChildren
export function newComponentVNode<P>(
  flags: VNodeFlags,
  type:
    | Function
    | ComponentType<P>
    | Component<P, unknown>
    | ForwardRef<P, unknown>,
  props?: Readonly<P> | null,
  key?: null | string | number,
  ref?: Ref | Refs<P> | null,
): VNode {
  if (process.env.NODE_ENV !== 'production') {
    if ((flags & VNodeFlags.HtmlElement) !== 0) {
      throwError(
        'Creating element vNodes using newComponentVNode is not allowed. Use Inferno.newVNode method.',
      );
    }
    if (
      (flags & VNodeFlags.ComponentKnown) !== 0 &&
      (flags & VNodeFlags.ChildFlagsMask) !== VNodeFlags.HasInvalidChildren
    ) {
      throwError(
        'newComponentVNode flags of a known component type must have VNodeFlags.HasInvalidChildren as their only child bit.',
      );
    }
  }

  if ((flags & VNodeFlags.ComponentKnown) === 0) {
    flags = resolveComponentFlags(type);
  }

  const vNode = new V(
    null,
    null,
    flags,
    key,
    mergeDefaultProps(flags, type, props),
    mergeDefaultHooks(flags, type, ref),
    type,
  ) as VNode;

  if (isFunction(options.createVNode)) {
    options.createVNode(vNode);
  }

  return vNode;
}

/**
 * @deprecated Use newComponentVNode, its flags of a known component type include `VNodeFlags.HasInvalidChildren`.
 */
export function createComponentVNode<P>(
  flags: VNodeFlags,
  type:
    | Function
    | ComponentType<P>
    | Component<P, unknown>
    | ForwardRef<P, unknown>,
  props?: Readonly<P> | null,
  key?: null | string | number,
  ref?: Ref | Refs<P> | null,
): VNode {
  return newComponentVNode(
    // The flags can be copied from another vNode (inferno-router Switch does), its validation does not apply
    (flags & VNodeFlags.ClearOnCopy) | VNodeFlags.HasInvalidChildren,
    type,
    props,
    key,
    ref,
  );
}

export function newTextVNode(
  text?: string | boolean | null | number,
  key?: string | number | null,
): VNode {
  return new V(
    isInvalid(text) ? '' : text,
    null,
    VNodeFlags.Text | VNodeFlags.HasInvalidChildren,
    key,
    null,
    null,
    null,
  ) as VNode;
}

/**
 * @deprecated Use newTextVNode, it takes the same arguments.
 */
export function createTextVNode(
  text?: string | boolean | null | number,
  key?: string | number | null,
): VNode {
  return newTextVNode(text, key);
}

// The flags are VNodeFlags.Fragment and the child bit, a fragment without a child bit has unknown children
export function newFragment(
  flags: VNodeFlags,
  children: any,
  key?: string | number | null,
): VNode {
  if (process.env.NODE_ENV !== 'production') {
    if ((flags & VNodeFlags.Fragment) === 0) {
      throwError('newFragment flags must include VNodeFlags.Fragment.');
    }
  }
  const fragment = newVNode(
    flags,
    VNodeFlags.Fragment as any,
    null,
    children,
    null,
    key,
    null,
  );

  flags = fragment.flags;

  switch (flags & VNodeFlags.ChildFlagsMask) {
    case VNodeFlags.HasInvalidChildren:
      fragment.children = createVoidVNode();
      fragment.flags =
        (flags & VNodeFlags.ClearChildFlags) | VNodeFlags.HasVNodeChildren;
      break;
    case VNodeFlags.HasTextChildren:
      fragment.children = [newTextVNode(children)];
      fragment.flags =
        (flags & VNodeFlags.ClearChildFlags) | VNodeFlags.HasNonKeyedChildren;
      break;
    default:
      break;
  }

  return fragment;
}

/**
 * @deprecated Use newFragment, its flags are `VNodeFlags.Fragment` and the child bit, `VNodeFlags.HasTextChildren` for `ChildFlags.HasTextChildren` and so on.
 */
export function createFragment(
  children: any,
  childFlags: ChildFlags,
  key?: string | number | null,
): VNode {
  return newFragment(
    VNodeFlags.Fragment | childFlagsToBit(childFlags),
    children,
    key,
  );
}

export function normalizeProps(vNode: VNode): VNode {
  const props = vNode.props;

  if (props) {
    const flags = vNode.flags;

    if (flags & VNodeFlags.Element) {
      if (props.children !== void 0 && isNullOrUndef(vNode.children)) {
        normalizeChildren(vNode, props.children);
      }
      if (props.className !== void 0) {
        if (isNullOrUndef(vNode.className)) {
          vNode.className = props.className || null;
        }
        props.className = undefined;
      }
    }
    if (props.key !== void 0) {
      vNode.key = props.key;
      props.key = undefined;
    }
    if (props.ref !== void 0) {
      if (flags & VNodeFlags.ForwardRef) {
        // The ref is forwarded as is. vNode.ref holds the hooks given as props and the defaultHooks,
        // they are added to the ref the same way mergeDefaultHooks adds the defaultHooks.
        vNode.ref =
          isNullOrUndef(props.ref) || isNullOrUndef(vNode.ref)
            ? (props.ref ?? vNode.ref)
            : mergeUnsetProperties(props.ref, vNode.ref);
      } else if (flags & VNodeFlags.ComponentFunction) {
        vNode.ref = { ...vNode.ref, ...props.ref };
      } else {
        vNode.ref = props.ref;
      }

      props.ref = undefined;
    }
  }

  return vNode;
}

/*
 * Fragment is different from normal vNode,
 * because when it needs to be cloned we need to clone its children too
 * But not normalize, because otherwise those possibly get KEY and re-mount
 */
function cloneFragment(vNodeToClone: VNode): VNode {
  const oldChildren = vNodeToClone.children;

  const flags = vNodeToClone.flags;

  return newFragment(
    VNodeFlags.Fragment | (flags & VNodeFlags.ChildFlagsMask),
    (flags & VNodeFlags.HasVNodeChildren) !== 0
      ? directClone(oldChildren as VNode)
      : (oldChildren as VNode[]).map(directClone),
    vNodeToClone.key,
  );
}

export function directClone(vNodeToClone: VNode): VNode {
  // The clone is not mounted yet, and development validates it again
  const flags = vNodeToClone.flags & VNodeFlags.ClearOnClone;
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
  if ((flags & VNodeFlags.Fragment) === 0) {
    let children = vNodeToClone.children;

    // Mounting and patching write clones into the children array, so the clone needs its own array
    if (flags & VNodeFlags.MultipleChildren) {
      children = (children as VNode[]).slice();
    }
    return new V(
      children,
      vNodeToClone.className,
      flags,
      vNodeToClone.key,
      props,
      vNodeToClone.ref,
      vNodeToClone.type,
    ) as VNode;
  }

  return cloneFragment(vNodeToClone);
}

/*
 * vNode can be referenced outside of render and passed to Inferno again,
 * but it holds the state of its mounted position, so it can be mounted only once.
 * lastVNode is the vNode previously mounted in the same position, or null when mounting.
 * When they are the same, vNode can be patched against itself.
 */
export function mustCloneVNode(
  vNode: VNode,
  lastVNode: VNode | null | undefined,
): boolean {
  return (vNode.flags & VNodeFlags.InUse) !== 0 && vNode !== lastVNode;
}

export function createVoidVNode(): VNode {
  return newTextVNode('', null);
}

export function createPortal(children, container: ParentDOM): VNode {
  const normalizedRoot = normalizeRoot(children);

  // No child bit, the children are normalized
  return newVNode(
    VNodeFlags.Portal,
    VNodeFlags.Portal as any,
    null,
    normalizedRoot,
    null,
    normalizedRoot.key,
    container as any, // Should there be own prop for this?
  );
}

export function _normalizeVNodes(
  nodes: any[],
  result: VNode[],
  index: number,
  currentKey: string,
): void {
  for (const len = nodes.length; index < len; index++) {
    let n = nodes[index];

    if (!isInvalid(n)) {
      const newKey: string = currentKey + keyPrefix + index;

      if (isArray(n)) {
        _normalizeVNodes(n, result, 0, newKey);
      } else {
        if (isStringOrNumber(n)) {
          n = newTextVNode(n, newKey);
        } else {
          if (process.env.NODE_ENV !== 'production') {
            throwIfObjectIsNotVNode(n);
          }
          const oldKey = n.key;
          const isPrefixedKey = isString(oldKey) && oldKey[0] === keyPrefix;
          let nextKey = oldKey;

          if (!isPrefixedKey) {
            if (isNull(oldKey)) {
              nextKey = newKey;
            } else {
              nextKey = currentKey + oldKey;
            }
          } else if (oldKey.substring(0, currentKey.length) !== currentKey) {
            nextKey = currentKey + oldKey;
          }

          // Key of a vNode used elsewhere must not change, placing the vNode clones it when it is mounted
          if (nextKey !== oldKey) {
            if (n.flags & VNodeFlags.InUseOrNormalized || isPrefixedKey) {
              n = directClone(n);
            }
            n.key = nextKey;
          }
          n.flags |= VNodeFlags.Normalized;
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
    // @ts-expect-error Fragment is special case
    case Fragment:
      return VNodeFlags.Fragment;
    default:
      return VNodeFlags.HtmlElement;
  }
}

export function normalizeChildren(vNode: VNode, children): VNode {
  let newChildren;
  let newChildFlags = VNodeFlags.HasInvalidChildren;

  // Don't change children to match strict equal (===) true in patching
  if (isInvalid(children)) {
    newChildren = children;
  } else if (isStringOrNumber(children)) {
    newChildFlags = VNodeFlags.HasTextChildren;
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
        newChildren.push(newTextVNode(n, getIndexKey(i)));
      } else {
        if (process.env.NODE_ENV !== 'production') {
          throwIfObjectIsNotVNode(n);
        }
        const key = n.key;
        const flags = n.flags;
        const isOwned: boolean = (flags & VNodeFlags.InUseOrNormalized) > 0;
        const isNullKey: boolean = isNull(key);
        const isPrefixed: boolean = isString(key) && key[0] === keyPrefix;

        // Owned vNodes are copied to new array, so each parent has its own children array
        if (isOwned || isNullKey || isPrefixed) {
          newChildren = newChildren || children.slice(0, i);
          const nextKey = isNullKey || isPrefixed ? getIndexKey(i) : key;

          // Key of a vNode used elsewhere must not change, placing the vNode clones it when it is mounted
          if (nextKey !== key) {
            if (isOwned || isPrefixed) {
              n = directClone(n);
            }
            n.key = nextKey;
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
      newChildFlags = VNodeFlags.HasInvalidChildren;
    } else {
      newChildFlags = VNodeFlags.HasKeyedChildren;
    }
  } else {
    // Single child keeps its key, placing the vNode clones it when it is mounted
    newChildren = children;
    newChildren.flags |= VNodeFlags.Normalized;
    newChildFlags = VNodeFlags.HasVNodeChildren;
  }

  vNode.children = newChildren;
  vNode.flags = (vNode.flags & VNodeFlags.ClearChildFlags) | newChildFlags;

  return vNode;
}

export function normalizeRoot(input, lastInput?: VNode | null): VNode {
  if (isInvalid(input) || isStringOrNumber(input)) {
    return newTextVNode(input, null);
  }
  if (isArray(input)) {
    return newFragment(VNodeFlags.Fragment, input, null);
  }

  return mustCloneVNode(input, lastInput) ? directClone(input) : input;
}
