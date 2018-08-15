import {isFunction, isNull, isNullOrUndef, isObject, isString, isStringOrNumber, throwError} from 'inferno-shared';
import {ChildFlags, VNodeFlags} from 'inferno-vnode-flags';
import {createVoidVNode, directClone, VNode} from '../core/implementation';
import {documentCreateElement, EMPTY_OBJ, insertOrAppend, LIFECYCLE} from './utils/common';
import {mountProps} from './props';
import {createClassComponentInstance, handleComponentInput} from './utils/componentutil';
import {validateKeys} from '../core/validate';

export function mount(vNode: VNode, parentDom: Element | null, context: Object, isSVG: boolean, nextNode: Element | null) {
  const flags = vNode.flags;

  if (flags & VNodeFlags.Element) {
    return mountElement(vNode, parentDom, context, isSVG, nextNode);
  }

  if (flags & VNodeFlags.Component) {
    return mountComponent(vNode, parentDom, context, isSVG, (flags & VNodeFlags.ComponentClass) > 0, nextNode);
  }

  if (flags & VNodeFlags.Void || flags & VNodeFlags.Text) {
    return mountText(vNode, parentDom, nextNode);
  }

  if (flags & VNodeFlags.Fragment) {
    return mountFragment(vNode, parentDom, context, isSVG, nextNode);
  }

  if (flags & VNodeFlags.Portal) {
    mount(vNode.children as VNode, vNode.type, context, false, null);

    return (vNode.dom = mountText(createVoidVNode(), parentDom, nextNode) as any);
  }

  // Development validation, in production we don't need to throw because it crashes anyway
  if (process.env.NODE_ENV !== 'production') {
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

function mountFragment(vNode, parentDom, context, isSVG, nextNode) {
  const children = vNode.children;
  const childFlags = vNode.childFlags;
  let dom;

  if (childFlags === ChildFlags.HasVNodeChildren) {
    dom = mountText(children as VNode, parentDom, nextNode);
  } else {
    mountArrayChildren(children, parentDom, context, isSVG, nextNode);
    dom = children[0].dom;
  }

  return (vNode.dom = dom);
}

export function mountText(vNode: VNode, parentDom: Element | null, nextNode: Element | null): any {
  const dom = (vNode.dom = document.createTextNode(vNode.children as string) as any);

  if (!isNull(parentDom)) {
    insertOrAppend(parentDom, dom, nextNode);
  }

  return dom;
}

export function mountElement(vNode: VNode, parentDom: Element | null, context: Object, isSVG: boolean, nextNode: Element | null) {
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

  if (!isNull(parentDom)) {
    insertOrAppend(parentDom, dom, nextNode);
  }

  if ((childFlags & ChildFlags.HasInvalidChildren) === 0) {
    const childrenIsSVG = isSVG === true && vNode.type !== 'foreignObject';

    if (childFlags === ChildFlags.HasVNodeChildren) {
      mount(children as VNode, dom, context, childrenIsSVG, null);
    } else if (childFlags & ChildFlags.MultipleChildren) {
      mountArrayChildren(children, dom, context, childrenIsSVG, null);
    }
  }
  if (!isNull(props)) {
    mountProps(vNode, flags, props, dom, isSVG);
  }

  if (process.env.NODE_ENV !== 'production') {
    if (isString(ref)) {
      throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
    }
  }
  if (isFunction(ref)) {
    mountRef(dom, ref);
  }
  return dom;
}

export function mountArrayChildren(children, dom: Element | null, context: Object, isSVG: boolean, nextNode: Element | null) {
  for (let i = 0, len = children.length; i < len; i++) {
    let child = children[i];

    if (!isNull(child.dom)) {
      children[i] = child = directClone(child);
    }
    mount(child, dom, context, isSVG, nextNode);
  }
}

export function mountComponent(vNode: VNode, parentDom: Element | null, context: Object, isSVG: boolean, isClass: boolean, nextNode: Element | null) {
  let dom;
  const type = vNode.type as Function;
  const props = vNode.props || EMPTY_OBJ;
  const ref = vNode.ref;

  if (isClass) {
    const instance = createClassComponentInstance(vNode, type, props, context);
    vNode.dom = dom = mount(instance.$LI, null, instance.$CX, isSVG, null);
    mountClassComponentCallbacks(vNode, ref, instance);
    instance.$UPD = false;
  } else {
    const input = handleComponentInput(type(props, context), vNode);
    vNode.children = input;
    vNode.dom = dom = mount(input, null, context, isSVG, null);
    mountFunctionalComponentCallbacks(props, ref, dom);
  }
  if (!isNull(parentDom)) {
    insertOrAppend(parentDom, dom, nextNode);
  }
  return dom;
}

function createClassMountCallback(instance) {
  return () => {
    instance.$UPD = true;
    instance.componentDidMount();
    instance.$UPD = false;
  };
}

export function mountClassComponentCallbacks(vNode: VNode, ref, instance) {
  if (isFunction(ref)) {
    ref(instance);
  } else {
    if (process.env.NODE_ENV !== 'production') {
      if (isStringOrNumber(ref)) {
        throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
      } else if (!isNullOrUndef(ref) && isObject(ref) && vNode.flags & VNodeFlags.ComponentClass) {
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

export function mountFunctionalComponentCallbacks(props, ref, dom) {
  if (!isNullOrUndef(ref)) {
    if (isFunction(ref.onComponentWillMount)) {
      ref.onComponentWillMount(props);
    }
    if (isFunction(ref.onComponentDidMount)) {
      LIFECYCLE.push(createOnMountCallback(ref, dom, props));
    }
  }
}

export function mountRef(dom: Element, value) {
  LIFECYCLE.push(() => value(dom));
}
