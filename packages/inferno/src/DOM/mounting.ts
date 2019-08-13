import { isFunction, isNull, isNullOrUndef, isString, isStringOrNumber, throwError } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { createVoidVNode, directClone, normalizeRoot } from '../core/implementation';
import { VNode } from '../core/types';
import { documentCreateElement, EMPTY_OBJ, findDOMfromVNode, insertOrAppend, safeCall1, setTextContent } from './utils/common';
import { mountProps } from './props';
import { createClassComponentInstance } from './utils/componentUtil';
import { validateKeys } from '../core/validate';
import { mountRef } from '../core/refs';

export function mount(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle: Function[]): void {
  const flags = (vNode.flags |= VNodeFlags.InUse);

  if (flags & VNodeFlags.Element) {
    mountElement(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
  } else if (flags & VNodeFlags.ComponentClass) {
    mountClassComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
  } else if (flags & VNodeFlags.ComponentFunction) {
    mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
    mountFunctionalComponentCallbacks(vNode, lifecycle);
  } else if (flags & VNodeFlags.Void || flags & VNodeFlags.Text) {
    mountText(vNode, parentDOM, nextNode);
  } else if (flags & VNodeFlags.Fragment) {
    mountFragment(vNode, context, parentDOM, isSVG, nextNode, lifecycle);
  } else if (flags & VNodeFlags.Portal) {
    mountPortal(vNode, context, parentDOM, nextNode, lifecycle);
  } else if (process.env.NODE_ENV !== 'production') {
    // Development validation, in production we don't need to throw because it crashes anyway
    if (typeof vNode === 'object') {
      throwError(
        `mount() received an object that's not a valid VNode, you should stringify it first, fix createVNode flags or call normalizeChildren. Object: "${JSON.stringify(
          vNode
        )}".`
      );
    } else {
      throwError(`mount() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`);
    }
  }
}

function mountPortal(vNode, context, parentDOM: Element | null, nextNode: Element | null, lifecycle: Function[]) {
  mount(vNode.children as VNode, vNode.ref, context, false, null, lifecycle);

  const placeHolderVNode = createVoidVNode();

  mountText(placeHolderVNode, parentDOM, nextNode);

  vNode.dom = placeHolderVNode.dom;
}

function mountFragment(vNode, context, parentDOM: Element | null, isSVG, nextNode, lifecycle: Function[]): void {
  let children = vNode.children;
  let childFlags = vNode.childFlags;

  // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
  // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements
  if (childFlags & ChildFlags.MultipleChildren && children.length === 0) {
    childFlags = vNode.childFlags = ChildFlags.HasVNodeChildren;
    children = vNode.children = createVoidVNode();
  }

  if (childFlags === ChildFlags.HasVNodeChildren) {
    mount(children as VNode, parentDOM, nextNode, isSVG, nextNode, lifecycle);
  } else {
    mountArrayChildren(children, parentDOM, context, isSVG, nextNode, lifecycle);
  }
}

export function mountText(vNode: VNode, parentDOM: Element | null, nextNode: Element | null): void {
  const dom = (vNode.dom = document.createTextNode(vNode.children as string) as any);

  if (!isNull(parentDOM)) {
    insertOrAppend(parentDOM, dom, nextNode);
  }
}

export function mountElement(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle: Function[]): void {
  const flags = vNode.flags;
  const props = vNode.props;
  const className = vNode.className;
  let children = vNode.children;
  const childFlags = vNode.childFlags;
  const dom = (vNode.dom = documentCreateElement(vNode.type, (isSVG = isSVG || (flags & VNodeFlags.SvgElement) > 0)));

  if (!isNullOrUndef(className) && className !== '') {
    if (isSVG) {
      dom.setAttribute('class', className);
    } else {
      dom.className = className;
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    validateKeys(vNode);
  }

  if (childFlags === ChildFlags.HasTextChildren) {
    setTextContent(dom, children as string);
  } else if (childFlags !== ChildFlags.HasInvalidChildren) {
    const childrenIsSVG = isSVG && vNode.type !== 'foreignObject';

    if (childFlags === ChildFlags.HasVNodeChildren) {
      if ((children as VNode).flags & VNodeFlags.InUse) {
        vNode.children = children = directClone(children as VNode);
      }
      mount(children as VNode, dom, context, childrenIsSVG, null, lifecycle);
    } else if (childFlags === ChildFlags.HasKeyedChildren || childFlags === ChildFlags.HasNonKeyedChildren) {
      mountArrayChildren(children, dom, context, childrenIsSVG, null, lifecycle);
    }
  }

  if (!isNull(parentDOM)) {
    insertOrAppend(parentDOM, dom, nextNode);
  }

  if (!isNull(props)) {
    mountProps(vNode, flags, props, dom, isSVG);
  }

  if (process.env.NODE_ENV !== 'production') {
    if (isString(vNode.ref)) {
      throwError('string "refs" are not supported in Inferno 1.0. Use callback ref or Inferno.createRef() API instead.');
    }
  }
  mountRef(vNode.ref, dom, lifecycle);
}

export function mountArrayChildren(children, dom: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle: Function[]): void {
  for (let i = 0; i < children.length; ++i) {
    let child = children[i];

    if (child.flags & VNodeFlags.InUse) {
      children[i] = child = directClone(child);
    }
    mount(child, dom, context, isSVG, nextNode, lifecycle);
  }
}

export function mountClassComponent(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle: Function[]) {
  const instance = createClassComponentInstance(vNode, vNode.type, vNode.props || EMPTY_OBJ, context, isSVG, lifecycle);
  mount(instance.$LI, parentDOM, instance.$CX, isSVG, nextNode, lifecycle);
  mountClassComponentCallbacks(vNode.ref, instance, lifecycle);
}

function renderFunctionalComponent(vNode: VNode, context) {
  return vNode.flags & VNodeFlags.ForwardRef ? vNode.type.render(vNode.props || EMPTY_OBJ, vNode.ref, context) : vNode.type(vNode.props || EMPTY_OBJ, context);
}

export function mountFunctionalComponent(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle): void {
  mount((vNode.children = normalizeRoot(renderFunctionalComponent(vNode, context))), parentDOM, context, isSVG, nextNode, lifecycle);
}

function createClassMountCallback(instance) {
  return () => {
    instance.componentDidMount();
  };
}

export function mountClassComponentCallbacks(ref, instance, lifecycle: Function[]) {
  mountRef(ref, instance, lifecycle);

  if (process.env.NODE_ENV !== 'production') {
    if (isStringOrNumber(ref)) {
      throwError('string "refs" are not supported in Inferno 1.0. Use callback ref or Inferno.createRef() API instead.');
    } else if (!isNullOrUndef(ref) && typeof ref === 'object' && ref.current === void 0) {
      throwError('functional component lifecycle events are not supported on ES2015 class components.');
    }
  }

  if (isFunction(instance.componentDidMount)) {
    lifecycle.push(createClassMountCallback(instance));
  }
}

function createOnMountCallback(ref, vNode) {
  return () => {
    ref.onComponentDidMount(findDOMfromVNode(vNode, true), vNode.props || EMPTY_OBJ);
  };
}

export function mountFunctionalComponentCallbacks(vNode: VNode, lifecycle: Function[]) {
  const ref = vNode.ref;

  if (!isNullOrUndef(ref)) {
    safeCall1(ref.onComponentWillMount, vNode.props || EMPTY_OBJ);
    if (isFunction(ref.onComponentDidMount)) {
      lifecycle.push(createOnMountCallback(ref, vNode));
    }
  }
}
