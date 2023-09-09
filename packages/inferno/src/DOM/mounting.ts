import type { VNode, ContextObject } from '../core/types';
import {
  isFunction,
  isNull,
  isNullOrUndef,
  isString,
  isStringOrNumber,
  throwError,
} from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import {
  createVoidVNode,
  directClone,
  normalizeRoot,
} from '../core/implementation';
import {
  AnimationQueues,
  documentCreateElement,
  EMPTY_OBJ,
  findDOMFromVNode,
  insertOrAppend,
  safeCall1,
  setTextContent,
} from './utils/common';
import { mountProps } from './props';
import {
  createClassComponentInstance,
  renderFunctionalComponent,
} from './utils/componentUtil';
import { validateKeys } from '../core/validate';
import { mountRef } from '../core/refs';

export function mount(
  vNode: VNode,
  parentDOM: Element | null,
  context: ContextObject,
  isSVG: boolean,
  nextNode: Element | null,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  const flags = (vNode.flags |= VNodeFlags.InUse);

  if ((flags & VNodeFlags.Element) !== 0) {
    mountElement(
      vNode,
      parentDOM,
      context,
      isSVG,
      nextNode,
      lifecycle,
      animations,
    );
  } else if ((flags & VNodeFlags.ComponentClass) !== 0) {
    mountClassComponent(
      vNode,
      parentDOM,
      context,
      isSVG,
      nextNode,
      lifecycle,
      animations,
    );
  } else if (flags & VNodeFlags.ComponentFunction) {
    mountFunctionalComponent(
      vNode,
      parentDOM,
      context,
      isSVG,
      nextNode,
      lifecycle,
      animations,
    );
  } else if (flags & VNodeFlags.Text) {
    mountText(vNode, parentDOM, nextNode);
  } else if (flags & VNodeFlags.Fragment) {
    mountFragment(
      vNode,
      context,
      parentDOM,
      isSVG,
      nextNode,
      lifecycle,
      animations,
    );
  } else if (flags & VNodeFlags.Portal) {
    mountPortal(vNode, context, parentDOM, nextNode, lifecycle, animations);
  } else if (process.env.NODE_ENV !== 'production') {
    // Development validation, in production we don't need to throw because it crashes anyway
    if (typeof vNode === 'object') {
      throwError(
        `mount() received an object that's not a valid VNode, you should stringify it first, fix createVNode flags or call normalizeChildren. Object: "${JSON.stringify(
          vNode,
        )}".`,
      );
    } else {
      throwError(
        `mount() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`,
      );
    }
  }
}

function mountPortal(
  vNode,
  context,
  parentDOM: Element | null,
  nextNode: Element | null,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  mount(
    vNode.children as VNode,
    vNode.ref,
    context,
    false,
    null,
    lifecycle,
    animations,
  );

  const placeHolderVNode = createVoidVNode();

  mountText(placeHolderVNode, parentDOM, nextNode);

  vNode.dom = placeHolderVNode.dom;
}

function mountFragment(
  vNode,
  context,
  parentDOM: Element | null,
  isSVG,
  nextNode,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  let children = vNode.children;
  let childFlags = vNode.childFlags;

  // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
  // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements
  if (childFlags & ChildFlags.MultipleChildren && children.length === 0) {
    childFlags = vNode.childFlags = ChildFlags.HasVNodeChildren;
    children = vNode.children = createVoidVNode();
  }

  if (childFlags === ChildFlags.HasVNodeChildren) {
    mount(
      children as VNode,
      parentDOM,
      context,
      isSVG,
      nextNode,
      lifecycle,
      animations,
    );
  } else {
    mountArrayChildren(
      children,
      parentDOM,
      context,
      isSVG,
      nextNode,
      lifecycle,
      animations,
    );
  }
}

export function mountText(
  vNode: VNode,
  parentDOM: Element | null,
  nextNode: Element | null,
): void {
  const dom = (vNode.dom = document.createTextNode(
    vNode.children as string,
  ) as any);

  if (!isNull(parentDOM)) {
    insertOrAppend(parentDOM, dom, nextNode);
  }
}

export function mountElement(
  vNode: VNode,
  parentDOM: Element | null,
  context: ContextObject,
  isSVG: boolean,
  nextNode: Element | null,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  const flags = vNode.flags;
  const props = vNode.props;
  const className = vNode.className;
  const childFlags = vNode.childFlags;
  const dom = (vNode.dom = documentCreateElement(
    vNode.type,
    (isSVG = isSVG || (flags & VNodeFlags.SvgElement) > 0),
  ));
  let children = vNode.children;

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
      mount(
        children as VNode,
        dom,
        context,
        childrenIsSVG,
        null,
        lifecycle,
        animations,
      );
    } else if (
      childFlags === ChildFlags.HasKeyedChildren ||
      childFlags === ChildFlags.HasNonKeyedChildren
    ) {
      mountArrayChildren(
        children,
        dom,
        context,
        childrenIsSVG,
        null,
        lifecycle,
        animations,
      );
    }
  }

  if (!isNull(parentDOM)) {
    insertOrAppend(parentDOM, dom, nextNode);
  }

  if (!isNull(props)) {
    mountProps(vNode, flags, props, dom, isSVG, animations);
  }

  if (process.env.NODE_ENV !== 'production') {
    if (isString(vNode.ref)) {
      throwError(
        'string "refs" are not supported in Inferno 1.0. Use callback ref or Inferno.createRef() API instead.',
      );
    }
  }
  mountRef(vNode.ref, dom, lifecycle);
}

export function mountArrayChildren(
  children,
  dom: Element | null,
  context: ContextObject,
  isSVG: boolean,
  nextNode: Element | null,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  for (let i = 0; i < children.length; ++i) {
    let child = children[i];

    if (child.flags & VNodeFlags.InUse) {
      children[i] = child = directClone(child);
    }
    mount(child, dom, context, isSVG, nextNode, lifecycle, animations);
  }
}

export function mountClassComponent(
  vNode: VNode,
  parentDOM: Element | null,
  context: ContextObject,
  isSVG: boolean,
  nextNode: Element | null,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  const instance = createClassComponentInstance(
    vNode,
    vNode.type,
    vNode.props || EMPTY_OBJ,
    context,
    isSVG,
    lifecycle,
  );

  // If we have a componentDidAppear on this component, we shouldn't allow children to animate so we're passing an dummy animations queue
  let childAnimations = animations;
  if (isFunction(instance.componentDidAppear)) {
    childAnimations = new AnimationQueues();
  }
  mount(
    instance.$LI,
    parentDOM,
    instance.$CX,
    isSVG,
    nextNode,
    lifecycle,
    childAnimations,
  );
  mountClassComponentCallbacks(vNode.ref, instance, lifecycle, animations);
}

export function mountFunctionalComponent(
  vNode: VNode,
  parentDOM: Element | null,
  context: ContextObject,
  isSVG: boolean,
  nextNode: Element | null,
  lifecycle,
  animations: AnimationQueues,
): void {
  const ref = vNode.ref;
  // If we have a componentDidAppear on this component, we shouldn't allow children to animate so we're passing an dummy animations queue
  let childAnimations = animations;
  if (!isNullOrUndef(ref) && isFunction(ref.onComponentDidAppear)) {
    childAnimations = new AnimationQueues();
  }

  mount(
    (vNode.children = normalizeRoot(renderFunctionalComponent(vNode, context))),
    parentDOM,
    context,
    isSVG,
    nextNode,
    lifecycle,
    childAnimations,
  );
  mountFunctionalComponentCallbacks(vNode, lifecycle, animations);
}

function createClassMountCallback(instance) {
  return () => {
    instance.componentDidMount();
  };
}

function addAppearAnimationHookClass(
  animations: AnimationQueues,
  instance,
  dom: Element,
): void {
  animations.componentDidAppear.push(() => {
    instance.componentDidAppear(dom);
  });
}

function addAppearAnimationHookFunctional(
  animations: AnimationQueues,
  ref,
  dom: Element,
  props,
): void {
  animations.componentDidAppear.push(() => {
    ref.onComponentDidAppear(dom, props);
  });
}

export function mountClassComponentCallbacks(
  ref,
  instance,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  mountRef(ref, instance, lifecycle);

  if (process.env.NODE_ENV !== 'production') {
    if (isStringOrNumber(ref)) {
      throwError(
        'string "refs" are not supported in Inferno 1.0. Use callback ref or Inferno.createRef() API instead.',
      );
    } else if (
      !isNullOrUndef(ref) &&
      typeof ref === 'object' &&
      ref.current === void 0
    ) {
      throwError(
        'functional component lifecycle events are not supported on ES2015 class components.',
      );
    }
  }

  if (isFunction(instance.componentDidMount)) {
    lifecycle.push(createClassMountCallback(instance));
  }
  if (isFunction(instance.componentDidAppear)) {
    addAppearAnimationHookClass(animations, instance, instance.$LI.dom);
  }
}

function createOnMountCallback(ref, vNode) {
  return () => {
    ref.onComponentDidMount(
      findDOMFromVNode(vNode, true),
      vNode.props || EMPTY_OBJ,
    );
  };
}

export function mountFunctionalComponentCallbacks(
  vNode: VNode,
  lifecycle: Array<() => void>,
  animations: AnimationQueues,
): void {
  const ref = vNode.ref;

  if (!isNullOrUndef(ref)) {
    safeCall1(ref.onComponentWillMount, vNode.props || EMPTY_OBJ);
    if (isFunction(ref.onComponentDidMount)) {
      lifecycle.push(createOnMountCallback(ref, vNode));
    }
    if (isFunction(ref.onComponentDidAppear)) {
      addAppearAnimationHookFunctional(
        animations,
        ref,
        findDOMFromVNode(vNode, true) as Element,
        vNode.props,
      );
    }
  }
}
