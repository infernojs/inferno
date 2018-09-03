import { isFunction, isNull, isNullOrUndef, isString, isStringOrNumber, throwError } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { createVoidVNode, directClone, VNode } from '../core/implementation';
import { documentCreateElement, EMPTY_OBJ, findDOMfromVNode, insertOrAppend, LIFECYCLE } from './utils/common';
import { mountProps } from './props';
import { createClassComponentInstance, handleComponentInput } from './utils/componentutil';
import { validateKeys } from '../core/validate';

export function mount(vNode: VNode, parentDom: Element | null, context: Object, isSVG: boolean, nextNode: Element | null): void {
  const flags = vNode.flags |= VNodeFlags.InUse;

  if (flags & VNodeFlags.Element) {
    mountElement(vNode, parentDom, context, isSVG, nextNode);
  } else if (flags & VNodeFlags.Component) {
    mountComponent(vNode, parentDom, context, isSVG, (flags & VNodeFlags.ComponentClass) > 0, nextNode);
  } else if (flags & VNodeFlags.Void || flags & VNodeFlags.Text) {
    mountText(vNode, parentDom, nextNode);
  } else if (flags & VNodeFlags.Fragment) {
    mountFragment(vNode, parentDom, context, isSVG, nextNode);
  } else if (flags & VNodeFlags.Portal) {
    mountPortal(vNode, context, parentDom, nextNode);
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

function mountPortal(vNode, context, parentDom: Element | null, nextNode: Element | null) {
  mount(vNode.children as VNode, vNode.ref, context, false, null);

  const placeHolderVNode = createVoidVNode();

  mountText(placeHolderVNode, parentDom, nextNode);

  vNode.dom = placeHolderVNode.dom;
}

function mountFragment(vNode, parentDom, context, isSVG, nextNode): void {
  const children = vNode.children;

  if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
    mountText(children as VNode, parentDom, nextNode);
    vNode.dom = children.dom;
  } else {
    mountArrayChildren(children, parentDom, context, isSVG, nextNode);
    vNode.dom = children[0].dom;
  }
}

export function mountText(vNode: VNode, parentDom: Element | null, nextNode: Element | null): void {
  const dom = (vNode.dom = document.createTextNode(vNode.children as string) as any);

  if (!isNull(parentDom)) {
    insertOrAppend(parentDom, dom, nextNode);
  }
}

export function mountTextContent(dom: Element, children: string): void {
  dom.textContent = children as string;
}

export function mountElement(vNode: VNode, parentDom: Element | null, context: Object, isSVG: boolean, nextNode: Element | null): void {
  const flags = vNode.flags;
  const children = vNode.children;
  const props = vNode.props;
  const className = vNode.className;
  const ref = vNode.ref;
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
      mount(children as VNode, dom, context, childrenIsSVG, null);
    } else if (childFlags === ChildFlags.HasKeyedChildren || childFlags === ChildFlags.HasNonKeyedChildren) {
      mountArrayChildren(children, dom, context, childrenIsSVG, null);
    }
  }

  if (!isNull(parentDom)) {
    insertOrAppend(parentDom, dom, nextNode);
  }

  if (!isNull(props)) {
    mountProps(vNode, flags, props, dom, isSVG);
  }

  if (process.env.NODE_ENV !== 'production') {
    if (isString(ref)) {
      throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
    }
  }
  if (ref) {
    if (isFunction(ref)) {
      mountRef(dom, ref);
    } else if (ref.current !== void 0) {
      ref.current = dom;
    }
  }
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

export function mountComponent(vNode: VNode, parentDom: Element | null, context: Object, isSVG: boolean, isClass: boolean, nextNode: Element | null): void {
  const type = vNode.type as Function;
  const props = vNode.props || EMPTY_OBJ;
  const ref = vNode.ref;

  if (isClass) {
    const instance = createClassComponentInstance(vNode, type, props, context);
    mount(instance.$LI, parentDom, instance.$CX, isSVG, nextNode);
    mountClassComponentCallbacks(ref, instance);
    instance.$UPD = false;
  } else {
    const input = handleComponentInput(vNode.flags & VNodeFlags.ForwardRef ? type(props, ref, context) : type(props, context));
    vNode.children = input;
    mount(input, parentDom, context, isSVG, nextNode);
    mountFunctionalComponentCallbacks(props, ref, vNode);
  }
}

function createClassMountCallback(instance) {
  return () => {
    instance.$UPD = true;
    instance.componentDidMount();
    instance.$UPD = false;
  };
}

export function mountClassComponentCallbacks(ref, instance) {
  if (isFunction(ref)) {
    ref(instance);
  } else if (ref && ref.current !== void 0) {
    ref.current = instance;
  } else {
    if (process.env.NODE_ENV !== 'production') {
      if (isStringOrNumber(ref)) {
        throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
      } else if (!isNullOrUndef(ref) && typeof ref === 'object' && ref.current === void 0) {
        throwError('functional component lifecycle events are not supported on ES2015 class components.');
      }
    }
  }

  if (isFunction(instance.componentDidMount)) {
    LIFECYCLE.push(createClassMountCallback(instance));
  }
}

function createOnMountCallback(ref, dom, props) {
  return () => ref.onComponentDidMount(dom, props);
}

export function mountFunctionalComponentCallbacks(props, ref, vNode: VNode) {
  if (!isNullOrUndef(ref)) {
    if (isFunction(ref.onComponentWillMount)) {
      ref.onComponentWillMount(props);
    }
    if (isFunction(ref.onComponentDidMount)) {
      LIFECYCLE.push(createOnMountCallback(ref, findDOMfromVNode(vNode), props));
    }
  }
}

export function mountRef(dom: Element, value) {
  LIFECYCLE.push(() => value(dom));
}
