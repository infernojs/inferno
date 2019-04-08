import { isFunction, isNull, isNullOrUndef, isString, isStringOrNumber, throwError, unescape } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { createVoidVNode, directClone, createVNode, getFlagsForElementVnode } from '../core/implementation';
import { VNode } from '../core/types';
import { documentCreateElement, EMPTY_OBJ, findDOMfromVNode, insertOrAppend, callAll } from './utils/common';
import { mountProps } from './props';
import { createClassComponentInstance, handleComponentInput } from './utils/componentutil';
import { validateKeys } from '../core/validate';
import { mountRef } from '../core/refs';
import { createNode, getDecoratedMarkup, nextTickWasaby } from '../wasaby/control';
// @ts-ignore
import { createWriteStream } from 'fs';
export const QUEUE = [];

export function mount(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle: Function[], isRootStart?: boolean, environment?: any, parentControlNode?: any, parentVNode?: any): void {
  const flags = (vNode.flags |= VNodeFlags.InUse);

  if (flags & VNodeFlags.Element) {
    mountElement(vNode, parentDOM, context, isSVG, nextNode, lifecycle, isRootStart, environment, parentControlNode);
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
  } else if (flags & VNodeFlags.WasabyControl || flags === 147456) {
    mountWasabyControl(vNode, parentDOM, isSVG, nextNode, lifecycle, isRootStart, environment, parentVNode);
  } else if (flags & VNodeFlags.TemplateWasabyNode) {
    mountWasabyTemplateNode(vNode, parentDOM, isSVG, nextNode, lifecycle, isRootStart, environment, parentControlNode);
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

export function mountElement(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle: Function[], isRootStart?: boolean, environment?: any, parentControlNode?: any): void {
  const flags = vNode.flags;
  const props = vNode.props;
  const className = vNode.className;
  let ref = vNode.ref;
  let children = vNode.children;
  const childFlags = vNode.childFlags;
  isSVG = isSVG || (flags & VNodeFlags.SvgElement) > 0;
  let dom = isRootStart && parentDOM ? parentDOM : documentCreateElement(vNode.type, isSVG);

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
    if (parentDOM !== nextNode) {
          insertOrAppend(parentDOM, dom, nextNode);
      } else {
          vNode.dom = nextNode;
          dom = nextNode;
      }
  }

  if (vNode.hprops && vNode.hprops.events && Object.keys(vNode.hprops.events).length > 0) {
    // @ts-ignore
    const setEventFunction = Hooks.setEventHooks(environment);
    const templateNodeEventRef = setEventFunction(vNode.type, vNode.hprops, vNode.children, vNode.key, parentControlNode, vNode.ref)
    vNode.ref = templateNodeEventRef[4];
    ref = vNode.ref;
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
      mount(children as VNode, dom, context, childrenIsSVG, null, lifecycle, parentControlNode, vNode);
    } else if (childFlags === ChildFlags.HasKeyedChildren || childFlags === ChildFlags.HasNonKeyedChildren) {
      if (dom) {
        mountArrayChildren(children, dom, context, childrenIsSVG, null, lifecycle, environment, parentControlNode, vNode);
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

export function mountArrayChildren(children, dom: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle: Function[], environment?: any, parentControlNode?: any, parentVNode?: any): void {
  for (let i = 0, len = children.length; i < len; ++i) {
    let child = children[i];

    if (child.flags & VNodeFlags.InUse) {
      children[i] = child = directClone(child);
    }
    mount(child, dom, context, isSVG, nextNode, lifecycle, false, environment, parentControlNode, parentVNode);
  }
}

export function mountClassComponent(vNode: VNode, parentDOM: Element | null, context: Object, isSVG: boolean, nextNode: Element | null, lifecycle: Function[]) {
  const instance = createClassComponentInstance(vNode, vNode.type, vNode.props || EMPTY_OBJ, context, isSVG, lifecycle);
  mount(instance.$LI, parentDOM, instance.$CX, isSVG, nextNode, lifecycle);
  mountClassComponentCallbacks(vNode.ref, instance, lifecycle);
  instance.$UPD = false;
}

function afterMountProcess(controlNode) {
  try {
      // @ts-ignore
      const afterMountValue = controlNode.control._afterMount && controlNode.control._afterMount(controlNode.options, controlNode.context);
      controlNode.control._mounted = true;
      if (controlNode.control._$needForceUpdate) {
          delete controlNode.control._$needForceUpdate;
          controlNode.control._forceUpdate();
      }
  } catch (error) {
      // Logger.catchLifeCircleErrors('_afterMount', error, controlNode.control._moduleName);
  }
}

export function mountWasabyCallback(controlNode) {
  return function () {

      // _reactiveStart means starting of monitor change in properties
      controlNode.control._reactiveStart = true;
      if (!controlNode.control._mounted && !controlNode.control._unmounted) {
          if (controlNode.hasCompound) {
              // @ts-ignore
              runDelayed.default(function () {
                  afterMountProcess(controlNode);
              });
          } else {
              afterMountProcess(controlNode);
          }
      } else {
          /**
           * TODO: удалить после синхронизации с контролами
           */
          try {
              if (!controlNode.control._destroyed) {
                // @ts-ignore
                const afterUpdateResult = controlNode.control._afterUpdate && controlNode.control._afterUpdate(controlNode.oldOptions || controlNode.options, controlNode.oldContext);
              }
          } catch (error) {
              // Logger.catchLifeCircleErrors('_afterUpdate', error, controlNode.control._moduleName);
          } finally {
              // We need controlNode.oldOptions only in _afterUpdate method. Can delete them from node after using.
              delete controlNode.oldOptions;
          }
      }
  }
}


function findTopConfig(configId) {
  return (configId + '').replace('cfg-', '').split(',')[0];
}
function fillCtx(control, vnode, resolvedCtx) {
  control._saveContextObject(resolvedCtx);
  // @ts-ignore
  control.saveFullContext(ContextResolver.wrapContext(control, vnode.context || {}));
}

function getStateReadyOrCall(stateVar, control, vnode, serializer) {
  let data;
  let srec;
  // @ts-ignore
   if (AppInit.isInit()) {
     // @ts-ignore
      srec = Request.getStateReceiver();
   }
  if (srec && srec.register) {
      srec.register(stateVar, {
          getState() {
            return {};
          },
          setState(rState) {
              data = rState;
          }
      });
  }
  /* Compat layer. For page without Controls.Application */
  if (!data && window["inline" + stateVar]) {
      data = JSON.parse(window["inline" + stateVar], serializer.deserialize);
      if (window["inline" + stateVar]) {
          window["inline" + stateVar] = undefined;
      }
  }
  // @ts-ignore
  const ctx = ContextResolver.resolveContext(control.constructor, vnode.context || {}, control);
  let res;
  try {
      res = data ? control._beforeMountLimited(vnode.controlProperties, ctx, data) : control._beforeMountLimited(vnode.controlProperties, ctx);
  }
  catch (error) {
      // Logger.catchLifeCircleErrors('_beforeMount', error, control._moduleName);
  }
  if (res && res.then) {
      res.then(function (resultDef) {
          fillCtx(control, vnode, ctx);
          return resultDef;
      });
  }
  else {
      fillCtx(control, vnode, ctx);
  }
  if (!vnode.inheritOptions) {
      vnode.inheritOptions = {};
  }
  // @ts-ignore
  OptionsResolver.resolveInheritOptions(vnode.controlClass, vnode, vnode.controlProperties);
  control.saveInheritOptions(vnode.inheritOptions);
  if (srec && srec.unregister) {
      srec.unregister(stateVar);
  }
  return res;
}

function updateWasabyControl(controlNode, parentDOM, lifecycle) {
  let shouldUp;
  try {
      let resolvedContext;
      //  Logger.log('DirtyChecking (update node with changed)', [
      //      '',
      //      '',
      //      changedOptions || changedInternalOptions || changedAttrs || changedContext
      //  ]);
      controlNode.environment.setRebuildIgnoreId(controlNode.id);
      // @ts-ignore
      OptionsResolver.resolveInheritOptions(controlNode.controlClass, controlNode, controlNode.options);
      controlNode.control.saveInheritOptions(controlNode.inheritOptions);
      // @ts-ignore
      resolvedContext = ContextResolver.resolveContext(controlNode.controlClass, controlNode.context, controlNode.control);
      // Forbid force update in the time between _beforeUpdate and _afterUpdate

      // @ts-ignore
      ReactiveObserver.pauseReactive(controlNode.control, () => {
        // Forbid force update in the time between _beforeUpdate and _afterUpdate
        // @ts-ignore
        const beforeUpdateResults = controlNode.control._beforeUpdate && controlNode.control.__beforeUpdate(controlNode.control._options, resolvedContext);
      });
      // controlNode.control._options = newOptions;
      // @ts-ignore
      const shouldUpdate = (controlNode.control._shouldUpdate ? controlNode.control._shouldUpdate(controlNode.control._options, resolvedContext) : true);
      // controlNode.control._setInternalOptions(changedInternalOptions || {});
      controlNode.oldOptions = controlNode.options; // TODO Для afterUpdate подумать, как еще можно передать
      // TODO Для afterUpdate подумать, как еще можно передать
      controlNode.oldContext = controlNode.context; // TODO Для afterUpdate подумать, как еще можно передать
      // TODO Для afterUpdate подумать, как еще можно передать
      // controlNode.attributes = nextVNode.controlAttributes;
      // controlNode.events = nextVNode.controlEvents;
      controlNode.control._saveContextObject(resolvedContext);
      // @ts-ignore
      controlNode.control.saveFullContext(ContextResolver.wrapContext(controlNode.control, controlNode.control._context));
  }
  finally {
      /**
       * TODO: удалить после синхронизации с контролами
       */
      shouldUp = controlNode.control._shouldUpdate ? controlNode.control._shouldUpdate(controlNode.control._options, controlNode.context) : true;
  }
  if (shouldUp) {
      // @ts-ignore
      const nextInput = getDecoratedMarkup(controlNode, false);
      // nextVNode.instance = controlNode;
      nextInput.ref = controlNode.markup.ref;
      // @ts-ignore
      patch(controlNode.markup, nextInput, parentDOM, {}, false, controlNode, lifecycle, controlNode.environment, controlNode);
      controlNode.markup = nextInput;
      controlNode.fullMarkup = controlNode.markup;
      lifecycle.push(mountWasabyCallback(controlNode));
  }
}

function applyWasabyState(component, pNode?) {
  const lifecycle = [];
  updateWasabyControl(component, (component.control._container && (component.control._container[0] || component.control._container) ) || pNode, lifecycle);
  // @ts-ignore
  if (QUEUE.indexOf(component) === -1 && QUEUE.push(component) === 1) {
    nextTickWasaby(rerenderWasaby);
  }
  if (lifecycle.length > 0) {
    callAll(lifecycle);
  }
  // @ts-ignore
  const ind = QUEUE.indexOf(component);
  QUEUE.splice(ind, 1);
}
// @ts-ignore
export function queueWasabyControlChanges(controlNode, pNode?) {
  if (QUEUE.length === 0) {
      applyWasabyState(controlNode, pNode);
      return;
  }
  // @ts-ignore
  if (QUEUE.indexOf(controlNode) === -1 && QUEUE.push(controlNode) === 1) {
    nextTickWasaby(rerenderWasaby);
  }
}
function rerenderWasaby() {
  let component;
  while ((component = QUEUE.pop())) {
    applyWasabyState(component);
  }
}

function setWasabyControlNodeHooks(controlNode, vNode, parentVNode, isRootStart, parentDOM, lifecycle, environment) {
  let setHookFunction;
  let controlNodeRef; 
  let setEventFunction;
  let controlNodeEventRef;
 // @ts-ignore
 controlNode.markup = getDecoratedMarkup(controlNode, isRootStart);
 if (controlNode.markup && controlNode.markup.type && controlNode.markup.type === 'invisible-node') {
    // @ts-ignore
    setHookFunction = Hooks.setControlNodeHook(controlNode);
    if (controlNode.markup.ref && parentVNode.ref) {
       const cnmRef = controlNode.markup.ref;
       controlNode.markup.ref = function (domNode) {
          cnmRef(domNode);
          parentVNode.ref(domNode);
       }
    }
    controlNodeRef = setHookFunction(controlNode.markup.type, controlNode.markup.props, controlNode.markup.children, controlNode.key, controlNode, parentVNode.ref || controlNode.markup.ref);
    parentVNode.ref = controlNodeRef[4];
    // @ts-ignore
    setEventFunction = Hooks.setEventHooks(environment);
    controlNodeEventRef = setEventFunction(controlNode.markup.type, {
       attributes: vNode.controlAttributes,
       events: (controlNode.markup.hprops && controlNode.markup.hprops.events) || vNode.controlEvents
    }, controlNode.markup.children, controlNode.key, controlNode, parentVNode.ref);
    parentVNode.ref = controlNodeEventRef[4];
    controlNode.fullMarkup = controlNode.markup;
    vNode.instance = controlNode;
    vNode.instance.parentDOM = parentDOM;
    vNode.ref = parentVNode.ref;
    mountRef(parentVNode.ref, parentVNode.dom || parentVNode.element || parentDOM, lifecycle);
 }
 else {
    // @ts-ignore
    setHookFunction = Hooks.setControlNodeHook(controlNode);
    if (controlNode.markup.ref && vNode.ref) {
       const cnmRef = controlNode.markup.ref;
       controlNode.markup.ref = function (domNode) {
          cnmRef(domNode);
          vNode.ref(domNode);
       }
    }
    controlNodeRef = setHookFunction(controlNode.markup.type, controlNode.markup.props, controlNode.markup.children, controlNode.key, controlNode, controlNode.markup.ref || vNode.ref);
    controlNode.markup.ref = controlNodeRef[4];
    // @ts-ignore
    setEventFunction = Hooks.setEventHooks(environment);
    controlNodeEventRef = setEventFunction(controlNode.markup.type, {
       attributes: vNode.controlAttributes,
       events: (controlNode.markup.hprops && controlNode.markup.hprops.events) || vNode.controlEvents
    }, controlNode.markup.children, controlNode.key, controlNode, controlNode.markup.ref);
    vNode.instance = controlNode;
    vNode.instance.parentDOM = parentDOM;
    vNode.instance.markup.ref = controlNodeEventRef[4];
 }
 return vNode;
};

// @ts-ignore
export function createWasabyControlInstance(vNode, parentDOM, isSVG, nextNode, lifecycle, isRootStart, environment?, parentControlNode?, parentVNode?, fromHyd?) {
  let controlNode;
  let carrier;
  let setHookFunction;
  let setEventFunction;
  let controlNodeEventRef;
  let controlNodeRef;
  if (vNode && !vNode.instance) {
    controlNode = createNode(vNode.controlClass, {
      attributes: vNode.controlAttributes,
      events: vNode.controlEvents,
      internal: vNode.controlInternalProperties,
      user: vNode.controlProperties
    }, vNode.key, environment, vNode.parentNode, vNode.serialized, vNode);
    if (!controlNode.compound) {
      if (!controlNode.control._mounted && !controlNode.control._unmounted) {
        const control = controlNode.control;
        const rstate = controlNode.key ? findTopConfig(controlNode.key) : '';
        if (control._beforeMountLimited) {
            carrier = getStateReadyOrCall(rstate, control, vNode, {});
        }
        if (carrier) {
            controlNode.receivedState = carrier;
        }
        if (controlNode.control.saveOptions) {
            controlNode.control.saveOptions(controlNode.options, controlNode);
        }
        else {
            /**
              * Поддержка для совместимости версий контролов
             */
            controlNode.control._options = controlNode.options;
            controlNode.control._container = controlNode.element;
            controlNode.control._setInternalOptions(vNode.controlInternalProperties || {});
        }
      }
    }
  } else {
    controlNode = vNode.instance;
  }
  if (carrier && carrier.then) {
    controlNode.markup = createVNode(getFlagsForElementVnode('span'), 'span', '', [], 0, controlNode.attributes, controlNode.key);
    vNode.instance = controlNode;
    vNode.instance.parentDOM = parentDOM;
    vNode.carrier = carrier;
  } else {
    controlNode.markup = getDecoratedMarkup(controlNode, isRootStart);
    if (controlNode.markup && controlNode.markup.type && controlNode.markup.type === 'invisible-node') {
      // @ts-ignore
      setHookFunction = Hooks.setControlNodeHook(controlNode);
      if (controlNode.markup.ref && parentVNode.ref) {
          const cnmRef = controlNode.markup.ref; 
          controlNode.markup.ref = function (domNode) {
              cnmRef(domNode);
              parentVNode.ref(domNode);
          }
      }
      controlNodeRef = setHookFunction(controlNode.markup.type, controlNode.markup.props, controlNode.markup.children, controlNode.key, controlNode, parentVNode.ref || controlNode.markup.ref);
      parentVNode.ref = controlNodeRef[4];
      // @ts-ignore
      setEventFunction = Hooks.setEventHooks(environment);
      controlNodeEventRef = setEventFunction(controlNode.markup.type, {
          attributes: vNode.controlAttributes,
          events: (controlNode.markup.hprops && controlNode.markup.hprops.events) || vNode.controlEvents
      }, controlNode.markup.children, controlNode.key, controlNode, parentVNode.ref);
      parentVNode.ref = controlNodeEventRef[4];
      controlNode.fullMarkup = controlNode.markup;
      vNode.instance = controlNode;
      vNode.instance.parentDOM = parentDOM;
      vNode.ref = parentVNode.ref;
      mountRef(parentVNode.ref, parentVNode.dom || parentVNode.element || parentDOM, lifecycle);
    } else {
      // @ts-ignore
      setHookFunction = Hooks.setControlNodeHook(controlNode);
      if (controlNode.markup.ref && vNode.ref) {
          const cnmRef = controlNode.markup.ref; 
          controlNode.markup.ref = function (domNode) {
              cnmRef(domNode);
              vNode.ref(domNode);
          }
      }
      controlNodeRef = setHookFunction(controlNode.markup.type, controlNode.markup.props, controlNode.markup.children, controlNode.key, controlNode, controlNode.markup.ref || vNode.ref);
      controlNode.markup.ref = controlNodeRef[4];
      // @ts-ignore
      setEventFunction = Hooks.setEventHooks(environment);
      controlNodeEventRef = setEventFunction(controlNode.markup.type, {
          attributes: vNode.controlAttributes,
          events: (controlNode.markup.hprops && controlNode.markup.hprops.events) || vNode.controlEvents
      }, controlNode.markup.children, controlNode.key, controlNode, controlNode.markup.ref);
      vNode.instance = controlNode;
      vNode.instance.parentDOM = parentDOM;
      vNode.instance.markup.ref = controlNodeEventRef[4];
    }
  }
  return vNode;
}

// var Slr = new Serializer();

export function mountWasabyControl(vNode: any, parentDOM: Element | null, isSVG: boolean, nextNode: Element | null, lifecycle: Function[], isRootStart?: boolean, environment?: any, parentVNode?: any) {
  let VirtualNode = createWasabyControlInstance(vNode, parentDOM, isSVG, nextNode, lifecycle, isRootStart, environment, undefined, parentVNode);
  if (VirtualNode.carrier && VirtualNode.carrier.then) {
     if (VirtualNode.instance.control && VirtualNode.instance.control._forceUpdate) {
        VirtualNode.instance.control._forceUpdate = function (memo) {
            // var lifecycle = [];
           // @ts-ignore
           if (memo === 'mount') {
              if (VirtualNode.compound || (VirtualNode.instance.markup && VirtualNode.instance.markup.type !== 'invisible-node')) {
                 VirtualNode = setWasabyControlNodeHooks(VirtualNode.instance, VirtualNode, parentVNode, isRootStart, parentDOM, lifecycle, environment);
                 mount(VirtualNode.instance.markup, parentDOM, {}, isSVG, nextNode, lifecycle, isRootStart, environment, VirtualNode.instance);
              }
              if (lifecycle.length > 0) {
                 let listener;
                 while ((listener = lifecycle.shift()) !== undefined) {
                    listener();
                 }
              }
           } else {
              queueWasabyControlChanges(VirtualNode.instance);
           }
        };
        VirtualNode.carrier.then(function (data) {
           VirtualNode.instance.receivedState = data;
           VirtualNode.carrier = undefined;
           VirtualNode.instance.control._forceUpdate('mount');
        }, function (error) {
           console.log("MOUNT error: ", error, VirtualNode.instance.control._moduleName);
        });
     }
  } else {
     if (VirtualNode.instance.control && VirtualNode.instance.control._forceUpdate) {
        VirtualNode.instance.control._forceUpdate = function () {
           // @ts-ignore
           queueWasabyControlChanges(VirtualNode.instance);
        };
     }
     if (VirtualNode.compound || (VirtualNode.instance.markup && VirtualNode.instance.markup.type !== 'invisible-node')) {
        mount(VirtualNode.instance.markup, parentDOM, {}, isSVG, nextNode, lifecycle, isRootStart, environment, VirtualNode.instance);
     }
  }

  lifecycle.push(mountWasabyCallback(VirtualNode.instance));
}

export function getMarkupForTemplatedNode(vNode) {
  return vNode.parentControl
  ? vNode.template.call(vNode.parentControl, vNode.controlProperties, vNode.attributes, vNode.context, true)
  : vNode.template(vNode.controlProperties, vNode.attributes, vNode.context, true);
}

// @ts-ignore
export function createWasabyTemplateNode(vNode, parentDOM, isSVG, nextNode, lifecycle, isRootStart, environment, parentControlNode) {
  vNode.markup = getMarkupForTemplatedNode(vNode);
  vNode.markup.forEach(function (node) {
      if (node.hprops) {
          // @ts-ignore
          const setEventFunction = Hooks.setEventHooks(environment);
          const templateNodeEventRef = setEventFunction(node.type, node.hprops, node.children, node.key, parentControlNode, node.ref);
          node.ref = templateNodeEventRef[4];
      }
  });
  return vNode;
}

// @ts-ignore
function mountWasabyTemplateNode(vNode, parentDOM, isSVG, nextNode, lifecycle, isRootStart, environment, parentControlNode) {
  const yVNode = createWasabyTemplateNode(vNode, parentDOM, isSVG, nextNode, lifecycle, isRootStart, environment, parentControlNode);
  mountArrayChildren(yVNode.markup, parentDOM, {}, isSVG, nextNode, lifecycle, environment, parentControlNode);
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
