import { combineFrom, isFunction, isInvalid, isNull, isNullOrUndef, isString, NO_OP, throwError, warning } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { directClone, options, VNode } from '../core/implementation';
import { mount, mountArrayChildren, mountRef } from './mounting';
import { remove, removeAllChildren, unmount } from './unmounting';
import { EMPTY_OBJ, insertOrAppend, replaceChild } from './utils/common';
import { isControlledFormElement, processElement } from './wrappers/processElement';
import { patchProp } from './props';
import { handleComponentInput } from './utils/componentutil';
import { validateKeys } from '../core/validate';

function replaceWithNewNode(lastNode, nextNode, parentDom, context: Object, isSVG: boolean) {
  unmount(lastNode);
  replaceChild(parentDom, mount(nextNode, null, context, isSVG), lastNode.dom);
}

export function patch(lastVNode: VNode, nextVNode: VNode, parentDom: Element, context: Object, isSVG: boolean) {
  if (lastVNode !== nextVNode) {
    const nextFlags = nextVNode.flags | 0;

    if (lastVNode.flags !== nextFlags || nextFlags & VNodeFlags.ReCreate) {
      replaceWithNewNode(lastVNode, nextVNode, parentDom, context, isSVG);
    } else if (nextFlags & VNodeFlags.Element) {
      patchElement(lastVNode, nextVNode, parentDom, context, isSVG);
    } else if (nextFlags & VNodeFlags.Component) {
      patchComponent(lastVNode, nextVNode, parentDom, context, isSVG, (nextFlags & VNodeFlags.ComponentClass) > 0);
    } else if (nextFlags & VNodeFlags.Text) {
      patchText(lastVNode, nextVNode, parentDom);
    } else if (nextFlags & VNodeFlags.Void) {
      nextVNode.dom = lastVNode.dom;
    } else {
      // Portal
      patchPortal(lastVNode, nextVNode, context);
    }
  }
}

function patchPortal(lastVNode: VNode, nextVNode: VNode, context) {
  const lastContainer = lastVNode.type as Element;
  const nextContainer = nextVNode.type as Element;
  const nextChildren = nextVNode.children as VNode;

  patchChildren(lastVNode.childFlags, nextVNode.childFlags, lastVNode.children as VNode, nextChildren, lastContainer as Element, context, false);

  nextVNode.dom = lastVNode.dom;

  if (lastContainer !== nextContainer && !isInvalid(nextChildren)) {
    const node = nextChildren.dom as Element;

    lastContainer.removeChild(node);
    nextContainer.appendChild(node);
  }
}

export function patchElement(lastVNode: VNode, nextVNode: VNode, parentDom: Element | null, context: Object, isSVG: boolean) {
  const nextTag = nextVNode.type;

  if (lastVNode.type !== nextTag) {
    replaceWithNewNode(lastVNode, nextVNode, parentDom, context, isSVG);
  } else {
    const dom = lastVNode.dom as Element;
    const nextFlags = nextVNode.flags;
    const lastProps = lastVNode.props;
    const nextProps = nextVNode.props;
    let isFormElement = false;
    let hasControlledValue = false;
    let nextPropsOrEmpty;

    nextVNode.dom = dom;
    isSVG = isSVG || (nextFlags & VNodeFlags.SvgElement) > 0;

    // inlined patchProps  -- starts --
    if (lastProps !== nextProps) {
      const lastPropsOrEmpty = lastProps || EMPTY_OBJ;
      nextPropsOrEmpty = nextProps || (EMPTY_OBJ as any);

      if (nextPropsOrEmpty !== EMPTY_OBJ) {
        isFormElement = (nextFlags & VNodeFlags.FormElement) > 0;
        if (isFormElement) {
          hasControlledValue = isControlledFormElement(nextPropsOrEmpty);
        }

        for (const prop in nextPropsOrEmpty) {
          const lastValue = lastPropsOrEmpty[prop];
          const nextValue = nextPropsOrEmpty[prop];
          if (lastValue !== nextValue) {
            patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue, lastVNode);
          }
        }
      }
      if (lastPropsOrEmpty !== EMPTY_OBJ) {
        for (const prop in lastPropsOrEmpty) {
          // do not add a hasOwnProperty check here, it affects performance
          if (!nextPropsOrEmpty.hasOwnProperty(prop) && !isNullOrUndef(lastPropsOrEmpty[prop])) {
            patchProp(prop, lastPropsOrEmpty[prop], null, dom, isSVG, hasControlledValue, lastVNode);
          }
        }
      }
    }
    const lastChildren = lastVNode.children;
    const nextChildren = nextVNode.children;
    const nextRef = nextVNode.ref;
    const lastClassName = lastVNode.className;
    const nextClassName = nextVNode.className;

    if (lastChildren !== nextChildren) {
      if (process.env.NODE_ENV !== 'production') {
        validateKeys(nextVNode);
      }
      patchChildren(lastVNode.childFlags, nextVNode.childFlags, lastChildren, nextChildren, dom, context, isSVG && nextTag !== 'foreignObject');
    }

    if (isFormElement) {
      processElement(nextFlags, nextVNode, dom, nextPropsOrEmpty, false, hasControlledValue);
    }
    // inlined patchProps  -- ends --
    if (lastClassName !== nextClassName) {
      if (isNullOrUndef(nextClassName)) {
        dom.removeAttribute('class');
      } else if (isSVG) {
        dom.setAttribute('class', nextClassName);
      } else {
        dom.className = nextClassName;
      }
    }
    if (isFunction(nextRef) && lastVNode.ref !== nextRef) {
      mountRef(dom as Element, nextRef);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (isString(nextRef)) {
          throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
        }
      }
    }
  }
}

function patchChildren(
  lastChildFlags: ChildFlags,
  nextChildFlags: ChildFlags,
  lastChildren,
  nextChildren,
  parentDOM: Element,
  context: Object,
  isSVG: boolean
) {
  switch (lastChildFlags) {
    case ChildFlags.HasVNodeChildren:
      switch (nextChildFlags) {
        case ChildFlags.HasVNodeChildren:
          patch(lastChildren, nextChildren, parentDOM, context, isSVG);
          break;
        case ChildFlags.HasInvalidChildren:
          remove(lastChildren, parentDOM);
          break;
        default:
          remove(lastChildren, parentDOM);
          mountArrayChildren(nextChildren, parentDOM, context, isSVG);
          break;
      }
      break;
    case ChildFlags.HasInvalidChildren:
      switch (nextChildFlags) {
        case ChildFlags.HasVNodeChildren:
          mount(nextChildren, parentDOM, context, isSVG);
          break;
        case ChildFlags.HasInvalidChildren:
          break;
        default:
          mountArrayChildren(nextChildren, parentDOM, context, isSVG);
          break;
      }
      break;
    default:
      if (nextChildFlags & ChildFlags.MultipleChildren) {
        const lastLength = lastChildren.length;
        const nextLength = nextChildren.length;

        // Fast path's for both algorithms
        if (lastLength === 0) {
          if (nextLength > 0) {
            mountArrayChildren(nextChildren, parentDOM, context, isSVG);
          }
        } else if (nextLength === 0) {
          removeAllChildren(parentDOM, lastChildren);
        } else if (nextChildFlags === ChildFlags.HasKeyedChildren && lastChildFlags === ChildFlags.HasKeyedChildren) {
          patchKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength);
        } else {
          patchNonKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength);
        }
      } else if (nextChildFlags === ChildFlags.HasInvalidChildren) {
        removeAllChildren(parentDOM, lastChildren);
      } else {
        removeAllChildren(parentDOM, lastChildren);
        mount(nextChildren, parentDOM, context, isSVG);
      }
      break;
  }
}

export function updateClassComponent(
  instance,
  nextState,
  nextVNode: VNode,
  nextProps,
  parentDom,
  context,
  isSVG: boolean,
  force: boolean,
  fromSetState: boolean
) {
  const lastState = instance.state;
  const lastProps = instance.props;
  nextVNode.children = instance;
  let renderOutput;

  if (instance.$UN) {
    if (process.env.NODE_ENV !== 'production') {
      warning(
        'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.'
      );
    }
    return;
  }
  if (lastProps !== nextProps || nextProps === EMPTY_OBJ) {
    if (!fromSetState && isFunction(instance.componentWillReceiveProps)) {
      instance.$BR = true;
      instance.componentWillReceiveProps(nextProps, context);
      // If instance component was removed during its own update do nothing...
      if (instance.$UN) {
        return;
      }
      instance.$BR = false;
    }
    if (instance.$PSS) {
      nextState = combineFrom(nextState, instance.$PS) as any;
      instance.$PSS = false;
      instance.$PS = null;
    }
  }
  /* Update if scu is not defined, or it returns truthy value or force */
  const hasSCU = Boolean(instance.shouldComponentUpdate);

  if (force || !hasSCU || (hasSCU && (instance.shouldComponentUpdate as Function)(nextProps, nextState, context))) {
    if (isFunction(instance.componentWillUpdate)) {
      instance.$BS = true;
      instance.componentWillUpdate(nextProps, nextState, context);
      instance.$BS = false;
    }

    instance.props = nextProps;
    instance.state = nextState;
    instance.context = context;

    if (isFunction(options.beforeRender)) {
      options.beforeRender(instance);
    }
    renderOutput = instance.render(nextProps, nextState, context);

    if (isFunction(options.afterRender)) {
      options.afterRender(instance);
    }

    const didUpdate = renderOutput !== NO_OP;

    let childContext;
    if (isFunction(instance.getChildContext)) {
      childContext = instance.getChildContext();
    }
    if (isNullOrUndef(childContext)) {
      childContext = context;
    } else {
      childContext = combineFrom(context, childContext);
    }
    instance.$CX = childContext;

    if (didUpdate) {
      const lastInput = instance.$LI;
      const nextInput = (instance.$LI = handleComponentInput(renderOutput, nextVNode));
      patch(lastInput, nextInput, parentDom, childContext, isSVG);
      if (isFunction(instance.componentDidUpdate)) {
        instance.componentDidUpdate(lastProps, lastState);
      }
    }
  } else {
    instance.props = nextProps;
    instance.state = nextState;
    instance.context = context;
  }
  nextVNode.dom = instance.$LI.dom;
}

function patchComponent(lastVNode, nextVNode, parentDom, context, isSVG: boolean, isClass: boolean): void {
  const nextType = nextVNode.type;
  const lastKey = lastVNode.key;
  const nextKey = nextVNode.key;

  if (lastVNode.type !== nextType || lastKey !== nextKey) {
    replaceWithNewNode(lastVNode, nextVNode, parentDom, context, isSVG);
  } else {
    const nextProps = nextVNode.props || EMPTY_OBJ;

    if (isClass) {
      const instance = lastVNode.children;
      instance.$UPD = true;
      instance.$V = nextVNode;
      updateClassComponent(instance, instance.state, nextVNode, nextProps, parentDom, context, isSVG, false, false);
      instance.$UPD = false;
    } else {
      let shouldUpdate: any = true;
      const lastProps = lastVNode.props;
      const nextHooks = nextVNode.ref;
      const nextHooksDefined = !isNullOrUndef(nextHooks);
      const lastInput = lastVNode.children;

      nextVNode.dom = lastVNode.dom;
      nextVNode.children = lastInput;

      if (nextHooksDefined && isFunction(nextHooks.onComponentShouldUpdate)) {
        shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps, nextProps);
      }

      if (shouldUpdate !== false) {
        if (nextHooksDefined && isFunction(nextHooks.onComponentWillUpdate)) {
          nextHooks.onComponentWillUpdate(lastProps, nextProps);
        }
        let nextInput = nextType(nextProps, context);

        if (nextInput !== NO_OP) {
          nextInput = handleComponentInput(nextInput, nextVNode);
          patch(lastInput, nextInput, parentDom, context, isSVG);
          nextVNode.children = nextInput;
          nextVNode.dom = nextInput.dom;
          if (nextHooksDefined && isFunction(nextHooks.onComponentDidUpdate)) {
            nextHooks.onComponentDidUpdate(lastProps, nextProps);
          }
        }
      } else if (lastInput.flags & VNodeFlags.Component) {
        lastInput.parentVNode = nextVNode;
      }
    }
  }
}

function patchText(lastVNode: VNode, nextVNode: VNode, parentDom: Element) {
  const nextText = nextVNode.children as string;
  const textNode = parentDom.firstChild;
  let dom;
  // Guard against external change on DOM node.
  if (isNull(textNode)) {
    parentDom.textContent = nextText;
    dom = parentDom.firstChild as Element;
  } else {
    dom = lastVNode.dom;
    if (nextText !== lastVNode.children) {
      (dom as Element).nodeValue = nextText;
    }
  }
  nextVNode.dom = dom;
}

function patchNonKeyedChildren(lastChildren, nextChildren, dom, context: Object, isSVG: boolean, lastChildrenLength: number, nextChildrenLength: number) {
  const commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
  let i = 0;
  let nextChild;
  let lastChild;

  for (; i < commonLength; i++) {
    nextChild = nextChildren[i];
    lastChild = lastChildren[i];

    if (nextChild.dom) {
      nextChild = nextChildren[i] = directClone(nextChild);
    }

    patch(lastChild, nextChild, dom, context, isSVG);
    lastChildren[i] = nextChild;
  }
  if (lastChildrenLength < nextChildrenLength) {
    for (i = commonLength; i < nextChildrenLength; i++) {
      nextChild = nextChildren[i];

      if (nextChild.dom) {
        nextChild = nextChildren[i] = directClone(nextChild);
      }
      mount(nextChild, dom, context, isSVG);
    }
  } else if (lastChildrenLength > nextChildrenLength) {
    for (i = commonLength; i < lastChildrenLength; i++) {
      remove(lastChildren[i], dom);
    }
  }
}

function patchKeyedChildren(a: VNode[], b: VNode[], dom, context, isSVG: boolean, aLength: number, bLength: number) {
  let aEnd = aLength - 1;
  let bEnd = bLength - 1;
  let i: number;
  let j: number = 0;
  let aNode: VNode = a[j];
  let bNode: VNode = b[j];
  let nextPos: number;

  // Step 1
  // tslint:disable-next-line
  outer: {
    // Sync nodes with the same key at the beginning.
    while (aNode.key === bNode.key) {
      if (bNode.dom) {
        b[j] = bNode = directClone(bNode);
      }
      patch(aNode, bNode, dom, context, isSVG);
      a[j] = bNode;
      j++;
      if (j > aEnd || j > bEnd) {
        break outer;
      }
      aNode = a[j];
      bNode = b[j];
    }


    aNode = a[aEnd];
    bNode = b[bEnd];

    // Sync nodes with the same key at the end.
    while (aNode.key === bNode.key) {
      if (bNode.dom) {
        b[bEnd] = bNode = directClone(bNode);
      }
      patch(aNode, bNode, dom, context, isSVG);
      a[aEnd] = bNode;
      aEnd--;
      bEnd--;
      if (j > aEnd || j > bEnd) {
        break outer;
      }
      aNode = a[aEnd];
      bNode = b[bEnd];
    }
  }

  if (j > aEnd) {
    if (j <= bEnd) {
      nextPos = bEnd + 1;
      const nextNode = nextPos < bLength ? b[nextPos].dom : null;
      while (j <= bEnd) {
        bNode = b[j];
        if (bNode.dom) {
          b[j] = bNode = directClone(bNode);
        }
        j++;
        insertOrAppend(dom, mount(bNode, null, context, isSVG), nextNode);
      }
    }
  } else if (j > bEnd) {
    while (j <= aEnd) {
      remove(a[j++], dom);
    }
  } else {
    let aStart = j;
    const bStart= j;
    const aLeft: number = aEnd - j + 1;
    const bLeft: number = bEnd - j + 1;
    const sources: number[] = [];
    for (i = 0; i < bLeft; i++) {
      sources.push(0);
    }
    // Keep track if its possible to remove whole DOM using textContent = '';
    let canRemoveWholeContent: boolean = aLeft === aLength;
    let moved: boolean = false;
    let pos: number = 0;
    let patched: number = 0;

    // When sizes are small, just loop them through
    if (bLength < 4 || (aLeft | bLeft) < 32) {
      for (i = aStart; i <= aEnd; i++) {
        aNode = a[i];
        if (patched < bLeft) {
          for (j = bStart; j <= bEnd; j++) {
            bNode = b[j];
            if (aNode.key === bNode.key) {
              sources[j - bStart] = i + 1;
              if (canRemoveWholeContent) {
                canRemoveWholeContent = false;
                while (i > aStart) {
                  remove(a[aStart++], dom);
                }
              }
              if (pos > j) {
                moved = true;
              } else {
                pos = j;
              }
              if (bNode.dom) {
                b[j] = bNode = directClone(bNode);
              }
              patch(aNode, bNode, dom, context, isSVG);
              patched++;
              break;
            }
          }
          if (!canRemoveWholeContent && j > bEnd) {
            remove(aNode, dom);
          }
        } else if (!canRemoveWholeContent) {
          remove(aNode, dom);
        }
      }
    } else {
      const keyIndex: Record<string, number> = {};

      // Map keys by their index
      for (i = bStart; i <= bEnd; i++) {
        keyIndex[b[i].key as string | number] = i;
      }

      // Try to patch same keys
      for (i = aStart; i <= aEnd; i++) {
        aNode = a[i];

        if (patched < bLeft) {
          j = keyIndex[aNode.key as string | number];

          if (j !== void 0) {
            if (canRemoveWholeContent) {
              canRemoveWholeContent = false;
              while (i > aStart) {
                remove(a[aStart++], dom);
              }
            }
            bNode = b[j];
            sources[j - bStart] = i + 1;
            if (pos > j) {
              moved = true;
            } else {
              pos = j;
            }
            if (bNode.dom) {
              b[j] = bNode = directClone(bNode);
            }
            patch(aNode, bNode, dom, context, isSVG);
            patched++;
          } else if (!canRemoveWholeContent) {
            remove(aNode, dom);
          }
        } else if (!canRemoveWholeContent) {
          remove(aNode, dom);
        }
      }
    }
    // fast-path: if nothing patched remove all old and add all new
    if (canRemoveWholeContent) {
      removeAllChildren(dom, a);
      mountArrayChildren(b, dom, context, isSVG);
    } else {
      if (moved) {
        const seq = lis_algorithm(sources);
        j = seq.length - 1;
        for (i = bLeft - 1; i >= 0; i--) {
          if (sources[i] === 0) {
            pos = i + bStart;
            bNode = b[pos];
            if (bNode.dom) {
              b[pos] = bNode = directClone(bNode);
            }
            nextPos = pos + 1;
            insertOrAppend(dom, mount(bNode, null, context, isSVG), nextPos < bLength ? b[nextPos].dom : null);
          } else if (j < 0 || i !== seq[j]) {
            pos = i + bStart;
            bNode = b[pos];
            nextPos = pos + 1;
            insertOrAppend(dom, bNode.dom, nextPos < bLength ? b[nextPos].dom : null);
          } else {
            j--;
          }
        }
      } else if (patched !== bLeft) {
        // when patched count doesn't match b length we need to insert those new ones
        // loop backwards so we can use insertBefore
        for (i = bLeft - 1; i >= 0; i--) {
          if (sources[i] === 0) {
            pos = i + bStart;
            bNode = b[pos];
            if (bNode.dom) {
              b[pos] = bNode = directClone(bNode);
            }
            nextPos = pos + 1;
            insertOrAppend(dom, mount(bNode, null, context, isSVG), nextPos < bLength ? b[nextPos].dom : null);
          }
        }
      }
    }
  }
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(arr: number[]): number[] {
  const p = arr.slice();
  const result: number[] = [0];
  let i;
  let j;
  let u;
  let v;
  let c;
  const len = arr.length;

  for (i = 0; i < len; i++) {
    const arrI = arr[i];

    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }

      u = 0;
      v = result.length - 1;

      while (u < v) {
        c = ((u + v) / 2) | 0;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }

      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }

  u = result.length;
  v = result[u - 1];

  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }

  return result;
}
