import { isFunction, isNull, isNullOrUndef, isString, isStringOrNumber, throwError, unescape } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { createVoidVNode, directClone } from '../core/implementation';
import { VNode } from '../core/types';
import { documentCreateElement, EMPTY_OBJ, findDOMfromVNode, insertOrAppend, options } from './utils/common';
import { mountProps } from './props';
import { createClassComponentInstance, handleComponentInput } from './utils/componentutil';
import { validateKeys } from '../core/validate';
import { mountRef } from '../core/refs';
import { createNode } from '../wasaby/control'

export function mount(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle: Function[], isRootStart?: boolean): void {
  const flags = (vNode.flags |= VNodeFlags.InUse);

  if (flags & VNodeFlags.Element) {
    mountElement(vNode, parentDOM, context, isSVG, nextNode, lifecycle, isRootStart);
  } else if (flags & VNodeFlags.ComponentClass) {
    mountClassComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
  } else if (flags & VNodeFlags.ComponentFunction) {
    mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
  } else if (flags & VNodeFlags.Void || flags & VNodeFlags.Text) {
    mountText(vNode, parentDOM, nextNode);
  } else if (flags & VNodeFlags.Fragment) {
    mountFragment(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
  } else if (flags & VNodeFlags.Portal) {
    mountPortal(vNode, context, parentDOM, nextNode, lifecycle);
    // @ts-ignore
  } else if (vNode instanceof RawMarkupNode) {
    return mountHTML(vNode, parentDOM);
  } else if (flags & VNodeFlags.WasabyControl) {
    mountWasabyControl(vNode, parentDOM, isSVG, nextNode, lifecycle, isRootStart);
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

export function mountHTML(vNode: VNode, parentDom: Element | null): any {
  // @ts-ignore
  const dom = (vNode.dom = $(vNode.markup)[0]);
  if (!isNull(parentDom)) {
    insertOrAppend(parentDom, dom, null);
  }
  return dom;

}

function mountPortal(vNode, context, parentDOM: Element | null, nextNode: Element | null, lifecycle: Function[]) {
  mount(vNode.children as VNode, vNode.ref, context, false, null, lifecycle);

  const placeHolderVNode = createVoidVNode();

  mountText(placeHolderVNode, parentDOM, nextNode);

  vNode.dom = placeHolderVNode.dom;
}

function mountFragment(vNode, parentDOM, context, isSVG, nextNode, lifecycle: Function[]): void {
  const children = vNode.children;

  if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
    mount(children as VNode, parentDOM, nextNode, isSVG, nextNode, lifecycle);
  } else {
    mountArrayChildren(children, parentDOM, context, isSVG, nextNode, lifecycle);
  }
}

export function mountText(vNode: VNode, parentDOM: Element | null, nextNode: Element | null): void {
  const dom = (vNode.dom = document.createTextNode(unescape(vNode.children as string)) as any);

  if (!isNull(parentDOM)) {
    insertOrAppend(parentDOM, dom, nextNode);
  }
}

export function mountTextContent(dom: Element, children: string): void {
  dom.textContent = children as string;
}

export function mountElement(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle: Function[], isRootStart?: boolean): void {
  const flags = vNode.flags;
  const props = vNode.props;
  const className = vNode.className;
  const ref = vNode.ref;
  let children = vNode.children;
  const childFlags = vNode.childFlags;
  isSVG = isSVG || (flags & VNodeFlags.SvgElement) > 0;
  const dom = isRootStart ? parentDOM : documentCreateElement(vNode.type, isSVG);

  vNode.dom = dom;

  if (!isNullOrUndef(className) && className !== '') {
    if (dom) {
      if (isSVG) {
        dom.setAttribute('class', className);
      } else {
        dom.className = className;
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    validateKeys(vNode);
  }

  if (!isRootStart && !isNull(parentDOM)) {
    insertOrAppend(parentDOM, dom, nextNode);
  }

  if (childFlags === ChildFlags.HasTextChildren) {
    if (dom) {
      mountTextContent(dom, children as string);
    }
  } else if (childFlags !== ChildFlags.HasInvalidChildren) {
    const childrenIsSVG = isSVG && vNode.type !== 'foreignObject';

    if (childFlags === ChildFlags.HasVNodeChildren) {
      if ((children as VNode).flags & VNodeFlags.InUse) {
        vNode.children = children = directClone(children as VNode);
      }
      mount(children as VNode, dom, context, childrenIsSVG, null, lifecycle);
    } else if (childFlags === ChildFlags.HasKeyedChildren || childFlags === ChildFlags.HasNonKeyedChildren) {
      if (dom) {
        mountArrayChildren(children, dom, context, childrenIsSVG, null, lifecycle);
      }
    }
  }

  if (!isNull(props)) {
    if (vNode.type === 'link') {
      if (dom) {
        // @ts-ignore
        if (props.href !== (dom.attributes.href && dom.attributes.href.value)) {
          mountProps(vNode, flags, props, dom, isSVG);
        }
      }
    } else {
      mountProps(vNode, flags, props, dom, isSVG);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (isString(ref)) {
      throwError('string "refs" are not supported in Inferno 1.0. Use callback ref or Inferno.createRef() API instead.');
    }
  }
  mountRef(ref, dom, lifecycle);
}

export function mountArrayChildren(children, dom: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle: Function[]): void {
  for (let i = 0, len = children.length; i < len; ++i) {
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
  instance.$UPD = false;
}

export function mountWasabyControl(vNode: any, parentDOM: Element | null, isSVG: boolean, nextNode: Element | null, lifecycle: Function[], isRootStart?: boolean) {
  const controlNode = createNode(
    vNode.controlClass,
    {
      attributes: vNode.controlAttributes,
      events: vNode.controlEvents,
      internal: vNode.controlInternalProperties,
      user: options
    },
    vNode.key,
    vNode.environment,
    vNode.parentNode,
    vNode.serialized,
    vNode
  );
  if (!controlNode.control._mounted && !controlNode.control._unmounted) {
     // let carrier = Vdom.getReceivedState(controlNode, vnode, Slr);
     // if (carrier) {
     //    controlNode.receivedState = carrier;
     // }
     if (controlNode.control.saveOptions) {
        controlNode.control.saveOptions(controlNode.options, controlNode);
     } else {
      /**
        * Поддержка для совместимости версий контролов
       */
      controlNode.control._options = controlNode.options;
      controlNode.control._container = controlNode.element;
      controlNode.control._setInternalOptions(vNode.controlInternalProperties || {});

      //  if (isJs.compat) {
      //     // @ts-ignore
      //     controlNode.control._container = $(controlNode.element);
      //  }
     }
  }

  // @ts-ignore
  controlNode.markup = VdomMarkup.getDecoratedMarkup(controlNode, isRootStart);
  mount(controlNode.markup, parentDOM, {}, isSVG, nextNode, lifecycle);
}

export function mountFunctionalComponent(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle): void {
  const type = vNode.type;
  const props = vNode.props || EMPTY_OBJ;
  const ref = vNode.ref;

  const input = handleComponentInput(vNode.flags & VNodeFlags.ForwardRef ? type(props, ref, context) : type(props, context));
  vNode.children = input;
  mount(input, parentDOM, context, isSVG, nextNode, lifecycle);
  mountFunctionalComponentCallbacks(props, ref, vNode, lifecycle);
}

function createClassMountCallback(instance) {
  return () => {
    instance.$UPD = true;
    instance.componentDidMount();
    instance.$UPD = false;
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

function createOnMountCallback(ref, vNode, props) {
  return () => {
    ref.onComponentDidMount(findDOMfromVNode(vNode, true), props);
  };
}

export function mountFunctionalComponentCallbacks(props, ref, vNode: VNode, lifecycle: Function[]) {
  if (!isNullOrUndef(ref)) {
    if (isFunction(ref.onComponentWillMount)) {
      ref.onComponentWillMount(props);
    }
    if (isFunction(ref.onComponentDidMount)) {
      lifecycle.push(createOnMountCallback(ref, vNode, props));
    }
  }
}
