/**
 * @module Inferno
 */ /** TypeDoc Comment */

import VNodeFlags from "inferno-vnode-flags";
import {
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isNumber,
  isStatefulComponent,
  isStringOrNumber,
  isUndefined,
  warning
} from "inferno-shared";
import { EMPTY_OBJ } from "../DOM/utils/common";

export interface VNode {
  children: InfernoChildren;
  dom: Element | null;
  className: string | null;
  flags: number;
  key: any;
  parentVNode: VNode | null;
  props: Props | null;
  ref: Ref | Refs | null;
  type: any;
}
export type InfernoInput = VNode | null | string | number;
export type Ref = (node?: Element | null) => void;
export type InfernoChildren =
  | string
  | number
  | boolean
  | undefined
  | VNode
  | Array<string | number | VNode>
  | null;

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

export function createVNode(
  flags: number,
  type,
  className?: string | null,
  children?: InfernoChildren,
  props?: Props | null,
  key?: any,
  ref?: Ref | Refs | null,
  noNormalise?: boolean
): VNode {
  if ((flags & VNodeFlags.ComponentUnknown) > 0) {
    flags = isStatefulComponent(type)
      ? VNodeFlags.ComponentClass
      : VNodeFlags.ComponentFunction;
  }

  const vNode: VNode = {
    children: children === void 0 ? null : children,
    className: className === void 0 ? null : className,
    dom: null,
    flags,
    key: key === void 0 ? null : key,
    parentVNode: null,
    props: props === void 0 ? null : props,
    ref: ref === void 0 ? null : ref,
    type
  };
  if (noNormalise !== true) {
    normalize(vNode);
  }
  if (isFunction(options.createVNode)) {
    options.createVNode(vNode);
  }

  return vNode;
}

export function directClone(vNodeToClone: VNode): VNode {
  let newVNode;
  const flags = vNodeToClone.flags;

  if (flags & VNodeFlags.Component) {
    let props;
    const propsToClone = vNodeToClone.props;

    if (isNull(propsToClone)) {
      props = EMPTY_OBJ;
    } else {
      props = {};
      for (const key in propsToClone) {
        props[key] = propsToClone[key];
      }
    }
    newVNode = createVNode(
      flags,
      vNodeToClone.type,
      null,
      null,
      props,
      vNodeToClone.key,
      vNodeToClone.ref,
      true
    );
    const newProps = newVNode.props;

    const newChildren = newProps.children;
    // we need to also clone component children that are in props
    // as the children may also have been hoisted
    if (newChildren) {
      if (isArray(newChildren)) {
        const len = newChildren.length;
        if (len > 0) {
          const tmpArray: any[] = [];

          for (let i = 0; i < len; i++) {
            const child = newChildren[i];

            if (isStringOrNumber(child)) {
              tmpArray.push(child);
            } else if (!isInvalid(child) && isVNode(child)) {
              tmpArray.push(directClone(child));
            }
          }
          newProps.children = tmpArray;
        }
      } else if (isVNode(newChildren)) {
        newProps.children = directClone(newChildren);
      }
    }

    newVNode.children = null;
  } else if (flags & VNodeFlags.Element) {
    const children = vNodeToClone.children;

    newVNode = createVNode(
      flags,
      vNodeToClone.type,
      vNodeToClone.className,
      children,
      vNodeToClone.props,
      vNodeToClone.key,
      vNodeToClone.ref,
      !children
    );
  } else if (flags & VNodeFlags.Text) {
    newVNode = createTextVNode(
      vNodeToClone.children as string,
      vNodeToClone.key
    );
  } else if (flags & VNodeFlags.Portal) {
    newVNode = vNodeToClone;
  }

  return newVNode;
}

export function createVoidVNode(): VNode {
  return createVNode(VNodeFlags.Void, null, null, "", null, null, null, true);
}

export function createTextVNode(text: string | number, key): VNode {
  return createVNode(VNodeFlags.Text, null, null, text, null, key, null, true);
}

export function isVNode(o: VNode): boolean {
  return isNumber(o.flags);
}

function applyKey(key: string, vNode: VNode) {
  vNode.key = key;

  return vNode;
}

function applyKeyIfMissing(key: string | number, vNode: VNode): VNode {
  if (isNull(vNode.key) || vNode.key[0] === ".") {
    return applyKey(isNumber(key) ? `.${key}` : key as string, vNode);
  }
  return vNode;
}

function applyKeyPrefix(key: string, vNode: VNode): VNode {
  vNode.key = key + vNode.key;

  return vNode;
}

function _normalizeVNodes(
  nodes: any[],
  result: VNode[],
  index: number,
  currentKey
) {
  for (const len = nodes.length; index < len; index++) {
    let n = nodes[index];

    if (!isInvalid(n)) {
      const key = `${currentKey}.${index}`;

      if (isArray(n)) {
        _normalizeVNodes(n, result, 0, key);
      } else {
        if (isStringOrNumber(n)) {
          n = createTextVNode(n, null);
        } else if (!isNull(n.dom) || (n.key && n.key[0] === ".")) {
          n = directClone(n);
        }
        if (isNull(n.key) || n.key[0] === ".") {
          n = applyKey(key, n as VNode);
        } else {
          n = applyKeyPrefix(currentKey, n as VNode);
        }

        result.push(n);
      }
    }
  }
}

export function normalizeVNodes(nodes: any[]): VNode[] {
  let newNodes;

  // we assign $ which basically means we've flagged this array for future note
  // if it comes back again, we need to clone it, as people are using it
  // in an immutable way
  // tslint:disable
  if (nodes["$"] === true) {
    nodes = nodes.slice();
  }
  // tslint:enable
  for (let i = 0, len = nodes.length; i < len; i++) {
    const n = nodes[i];

    if (isInvalid(n) || isArray(n)) {
      const result = (newNodes || nodes).slice(0, i) as VNode[];

      _normalizeVNodes(nodes, result, i, ``);
      return result;
    } else if (isStringOrNumber(n)) {
      if (!newNodes) {
        newNodes = nodes.slice(0, i) as VNode[];
      }
      newNodes.push(applyKeyIfMissing(i, createTextVNode(n, null)));
    } else if (!isNull(n.dom) || isNull(n.key) && (n.flags & VNodeFlags.HasNonKeyedChildren) === 0) {
      if (!newNodes) {
        newNodes = nodes.slice(0, i) as VNode[];
      }
      newNodes.push(applyKeyIfMissing(i, isNull(n.dom) ? n : directClone(n)));
    } else if (newNodes) {
      newNodes.push(applyKeyIfMissing(i, n));
    }
  }

  const foo = newNodes || (nodes as VNode[]);

  foo.$ = true;

  return foo;
}

function normalizeChildren(children: InfernoChildren | null) {
  if (isArray(children)) {
    return normalizeVNodes(children as any[]);
  } else if (isVNode(children as VNode) && !isNull((children as VNode).dom)) {
    return directClone(children as VNode);
  }

  return children;
}

function normalizeProps(vNode: VNode, props: Props, children: InfernoChildren) {
  if (vNode.flags & VNodeFlags.Element) {
    if (isNullOrUndef(children) && !isUndefined(props.children)) {
      vNode.children = props.children;
    }
    if (!isUndefined(props.className)) {
      vNode.className = props.className || null;
      delete props.className;
    }
  }
  if (!isUndefined(props.ref)) {
    vNode.ref = props.ref as any;
    delete props.ref;
  }
  if (!isUndefined(props.key)) {
    vNode.key = props.key;
    delete props.key;
  }
}

export function getFlagsForElementVnode(type: string): number {
  if (type === "svg") {
    return VNodeFlags.SvgElement;
  }
  if (type === "input") {
    return VNodeFlags.InputElement;
  }
  if (type === "select") {
    return VNodeFlags.SelectElement;
  }
  if (type === "textarea") {
    return VNodeFlags.TextareaElement;
  }
  if (type === "media") {
    return VNodeFlags.MediaElement;
  }
  return VNodeFlags.HtmlElement;
}

export function normalize(vNode: VNode): void {
  let props = vNode.props;
  const children = vNode.children;

  // convert a wrongly created type back to element
  // Primitive node doesn't have defaultProps, only Component
  if (vNode.flags & VNodeFlags.Component) {
    // set default props
    const type = vNode.type;
    const defaultProps = (type as any).defaultProps;

    if (!isNullOrUndef(defaultProps)) {
      if (!props) {
        props = vNode.props = defaultProps; // Create new object if only defaultProps given
      } else {
        for (const prop in defaultProps) {
          if (isUndefined(props[prop])) {
            props[prop] = defaultProps[prop];
          }
        }
      }
    }
  }

  if (props) {
    normalizeProps(vNode, props, children);
    if (!isInvalid(props.children)) {
      props.children = normalizeChildren(props.children);
    }
  }
  if (!isInvalid(children)) {
    vNode.children = normalizeChildren(children);
  }

  if (process.env.NODE_ENV !== "production") {
    // This code will be stripped out from production CODE
    // It helps users to track errors in their applications.

    const verifyKeys = function(vNodes) {
      const keyValues = vNodes.map(function(vnode) {
        return vnode.key;
      });
      keyValues.some(function(item, idx) {
        const hasDuplicate = keyValues.indexOf(item) !== idx;

        if (hasDuplicate) {
          warning(
            "Inferno normalisation(...): Encountered two children with same key, all keys must be unique within its siblings. Duplicated key is:" +
            item
          );
        }

        return hasDuplicate;
      });
    };

    if (vNode.children && Array.isArray(vNode.children)) {
      verifyKeys(vNode.children);
    }
  }
}

export const options: {
  afterMount: null | Function;
  afterRender: null | Function;
  afterUpdate: null | Function;
  beforeRender: null | Function;
  beforeUnmount: null | Function;
  createVNode: null | Function;
  defaultContext: null | Object | Function;
  findDOMNodeEnabled: boolean;
  roots: Map<any, any>;
} = {
  afterMount: null,
  afterRender: null,
  afterUpdate: null,
  beforeRender: null,
  beforeUnmount: null,
  createVNode: null,
  defaultContext: null,
  findDOMNodeEnabled: false,
  roots: new Map<any, any>()
};
