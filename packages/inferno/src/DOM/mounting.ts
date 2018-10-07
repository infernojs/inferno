import { isFunction, isNull, isNullOrUndef, isString, isStringOrNumber, throwError } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { createVoidVNode, directClone } from '../core/implementation';
import { VNode } from '../core/types';
import { documentCreateElement, EMPTY_OBJ, findDOMfromVNode, insertOrAppend, LIFECYCLE } from './utils/common';
import { mountProps } from './props';
import { createClassComponentInstance, handleComponentInput } from './utils/componentutil';
import { validateKeys } from '../core/validate';
import { mountRef } from '../core/refs';

export function mount(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null): void {
  const flags = (vNode.flags |= VNodeFlags.InUse);

  if (flags & VNodeFlags.Element) {
    mountElement(vNode, parentDOM, context, isSVG, nextNode);
  } else if (flags & VNodeFlags.ComponentClass) {
    mountClassComponent(vNode, parentDOM, context, isSVG, nextNode);
  } else if (flags & VNodeFlags.ComponentFunction) {
    mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode);
  } else if (flags & VNodeFlags.Void || flags & VNodeFlags.Text) {
    mountText(vNode, parentDOM, nextNode);
  } else if (flags & VNodeFlags.Fragment) {
    mountFragment(vNode, parentDOM, context, isSVG, nextNode);
  } else if (flags & VNodeFlags.Portal) {
    mountPortal(vNode, context, parentDOM, nextNode);
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

function mountPortal(vNode, context, parentDOM: Element | null, nextNode: Element | null) {
  mount(vNode.children as VNode, vNode.ref, context, false, null);

  const placeHolderVNode = createVoidVNode();

  mountText(placeHolderVNode, parentDOM, nextNode);

  vNode.dom = placeHolderVNode.dom;
}

function mountFragment(vNode, parentDOM, context, isSVG, nextNode): void {
  const children = vNode.children;

  if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
    mountText(children as VNode, parentDOM, nextNode);
  } else {
    mountArrayChildren(children, parentDOM, context, isSVG, nextNode);
  }
}

export function mountText(vNode: VNode, parentDOM: Element | null, nextNode: Element | null): void {
  const dom = (vNode.dom = document.createTextNode(vNode.children as string) as any);

  if (!isNull(parentDOM)) {
    insertOrAppend(parentDOM, dom, nextNode);
  }
}

export function mountTextContent(dom: Element, children: string): void {
  dom.textContent = children as string;
}

export function mountElement(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null): void {
  const flags = vNode.flags;
  const props = vNode.props;
  const className = vNode.className;
  const ref = vNode.ref;
  let children = vNode.children;
  const childFlags = vNode.childFlags;
  isSVG = isSVG || (flags & VNodeFlags.SvgElement) > 0;
  const dom = documentCreateElement(vNode.type, isSVG);

  vNode.dom = dom;

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
    mountTextContent(dom, children as string);
  } else if (childFlags !== ChildFlags.HasInvalidChildren) {
    const childrenIsSVG = isSVG && vNode.type !== 'foreignObject';

    if (childFlags === ChildFlags.HasVNodeChildren) {
      if ((children as VNode).flags & VNodeFlags.InUse) {
        vNode.children = children = directClone(children as VNode);
      }
      mount(children as VNode, dom, context, childrenIsSVG, null);
    } else if (childFlags === ChildFlags.HasKeyedChildren || childFlags === ChildFlags.HasNonKeyedChildren) {
      mountArrayChildren(children, dom, context, childrenIsSVG, null);
    }
  }

  if (!isNull(parentDOM)) {
    insertOrAppend(parentDOM, dom, nextNode);
  }

  if (!isNull(props)) {
    mountProps(vNode, flags, props, dom, isSVG);
  }

  if (process.env.NODE_ENV !== 'production') {
    if (isString(ref)) {
      throwError('string "refs" are not supported in Inferno 1.0. Use callback ref or Inferno.createRef() API instead.');
    }
  }
  mountRef(ref, dom);
}

export function mountArrayChildren(children, dom: Element | null, context: Object, isSVG: boolean, nextNode: Element | null): void {
  for (let i = 0, len = children.length; i < len; i++) {
    let child = children[i];

    if (child.flags & VNodeFlags.InUse) {
      children[i] = child = directClone(child);
    }
    mount(child, dom, context, isSVG, nextNode);
  }
}

export function mountClassComponent(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null) {
  const instance = createClassComponentInstance(vNode, vNode.type, vNode.props || EMPTY_OBJ, context);
  mount(instance.$LI, parentDOM, instance.$CX, isSVG, nextNode);
  mountClassComponentCallbacks(vNode.ref, instance);
  instance.$UPD = false;
}

export function mountFunctionalComponent(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null): void {
  const type = vNode.type;
  const props = vNode.props || EMPTY_OBJ;
  const ref = vNode.ref;

  const input = handleComponentInput(vNode.flags & VNodeFlags.ForwardRef ? type(props, ref, context) : type(props, context));
  vNode.children = input;
  mount(input, parentDOM, context, isSVG, nextNode);
  mountFunctionalComponentCallbacks(props, ref, vNode);
}

function createClassMountCallback(instance) {
  return () => {
    instance.$UPD = true;
    instance.componentDidMount();
    instance.$UPD = false;
  };
}

export function mountClassComponentCallbacks(ref, instance) {
  mountRef(ref, instance);

  if (process.env.NODE_ENV !== 'production') {
    if (isStringOrNumber(ref)) {
      throwError('string "refs" are not supported in Inferno 1.0. Use callback ref or Inferno.createRef() API instead.');
    } else if (!isNullOrUndef(ref) && typeof ref === 'object' && ref.current === void 0) {
      throwError('functional component lifecycle events are not supported on ES2015 class components.');
    }
  }

  if (isFunction(instance.componentDidMount)) {
    LIFECYCLE.push(createClassMountCallback(instance));
  }
}

function createOnMountCallback(ref, vNode, props) {
  return () => ref.onComponentDidMount(findDOMfromVNode(vNode), props);
}

export function mountFunctionalComponentCallbacks(props, ref, vNode: VNode) {
  if (!isNullOrUndef(ref)) {
    if (isFunction(ref.onComponentWillMount)) {
      ref.onComponentWillMount(props);
    }
    if (isFunction(ref.onComponentDidMount)) {
      LIFECYCLE.push(createOnMountCallback(ref, vNode, props));
    }
  }
}
