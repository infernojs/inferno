import {
  type Component,
  render,
  type VNode,
  type InfernoChild,
  type InfernoFragment,
} from 'inferno';
import {
  isArray,
  isFunction,
  isInvalid,
  isNullOrUndef,
  isString,
  throwError,
} from 'inferno-shared';
import {
  getTagNameOfVNode as _getTagNameOfVNode,
  isClassVNode as _isClassVNode,
  isComponentVNode as _isComponentVNode,
  isDOMVNode as _isDOMVNode,
  isFunctionalVNode as _isFunctionalVNode,
  isTextVNode as _isTextVNode,
  isVNode as _isVNode,
  Wrapper as _Wrapper,
} from './utils';
import { VNodeFlags } from 'inferno-vnode-flags';
import {
  renderToSnapshot as _renderToSnapshot,
  vNodeToSnapshot as _vNodeToSnapshot,
} from './jest';

// Type Checkers

export function isVNodeOfType(obj: VNode, type: unknown): boolean {
  return _isVNode(obj) && obj.type === type;
}

export function isDOMVNodeOfType(obj: VNode, type: string): boolean {
  return _isDOMVNode(obj) && obj.type === type;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunctionalVNodeOfType(obj: VNode, type: Function): boolean {
  return _isFunctionalVNode(obj) && obj.type === type;
}

export function isClassVNodeOfType(
  obj: VNode,
  type: Component<any, any>,
): boolean {
  return _isClassVNode(obj) && obj.type === type;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isComponentVNodeOfType(obj: VNode, type: Function): boolean {
  return (_isFunctionalVNode(obj) || _isClassVNode(obj)) && obj.type === type;
}

export function isDOMElement(obj: any): boolean {
  return (
    Boolean(obj) &&
    typeof obj === 'object' &&
    obj.nodeType === 1 &&
    isString(obj.tagName)
  );
}

export function isDOMElementOfType(obj: any, type: string): boolean {
  return (
    isDOMElement(obj) &&
    isString(type) &&
    obj.tagName.toLowerCase() === type.toLowerCase()
  );
}

export function isRenderedClassComponent(obj: any): boolean {
  return (
    Boolean(obj) &&
    typeof obj === 'object' &&
    _isVNode(obj.$LI) &&
    isFunction(obj.render) &&
    isFunction(obj.setState)
  );
}

export function isRenderedClassComponentOfType(
  obj: any,
  type: Component<any, any>,
): boolean {
  return (
    isRenderedClassComponent(obj) &&
    isFunction(type) &&
    obj.constructor === type
  );
}

// Recursive Finder Functions

export function findAllInRenderedTree(
  renderedTree: any,
  predicate: (vNode: VNode) => boolean,
): VNode[] | any {
  if (isRenderedClassComponent(renderedTree)) {
    return findAllInVNodeTree(renderedTree.$LI, predicate);
  } else {
    return findAllInVNodeTree(renderedTree, predicate);
  }
}

export function findAllInVNodeTree(
  vNodeTree: VNode,
  predicate: (vNode: VNode) => boolean,
): any {
  if (_isVNode(vNodeTree)) {
    let result: VNode[] = predicate(vNodeTree) ? [vNodeTree] : [];
    const children: any = vNodeTree.children;

    if (isRenderedClassComponent(children)) {
      result = result.concat(
        findAllInVNodeTree(children.$LI, predicate) as VNode[],
      );
    } else if (_isVNode(children)) {
      result = result.concat(
        findAllInVNodeTree(children, predicate) as VNode[],
      );
    } else if (isArray(children)) {
      children.forEach((child) => {
        if (!isInvalid(child)) {
          result = result.concat(
            findAllInVNodeTree(child, predicate) as VNode[],
          );
        }
      });
    }
    return result;
  } else {
    throwError(
      'findAllInVNodeTree(vNodeTree, predicate) vNodeTree must be a VNode instance',
    );
  }
}

// Finder Helpers

function parseSelector(filter: unknown): unknown[] {
  if (isArray(filter)) {
    return filter;
  } else if (isString(filter)) {
    return filter.trim().split(/\s+/);
  } else {
    return [];
  }
}

// @ts-expect-error there is no way to declare that function throws
// eslint-disable-next-line prettier/prettier
function findOneOf<TResult, TArgTree, TArgFilter>(tree: TArgTree, filter: TArgFilter, name: string, finder: (renderedTree: TArgTree, type: TArgFilter) => TResult[]): TResult {
  const all = finder(tree, filter);
  if (all.length > 1) {
    throwError(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Did not find exactly one match (found ${all.length}) for ${name}: ${filter}`,
    );
  } else {
    return all[0];
  }
}

// Scry Utilities

export function scryRenderedDOMElementsWithClass(
  renderedTree: any,
  classNames: string | string[],
): Element[] {
  return findAllInRenderedTree(renderedTree, (instance) => {
    if (_isDOMVNode(instance)) {
      let domClassName = !isNullOrUndef(instance.dom)
        ? instance.dom.className
        : '';

      if (
        !isString(domClassName) &&
        !isNullOrUndef(instance.dom) &&
        isFunction(instance.dom.getAttribute)
      ) {
        // SVG || null, probably
        domClassName = instance.dom.getAttribute('class') || '';
      }

      const domClassList = parseSelector(domClassName);
      return parseSelector(classNames).every((className) => {
        return domClassList.includes(className);
      });
    }
    return false;
  }).map((instance) => instance.dom);
}

export function scryRenderedDOMElementsWithTag(
  renderedTree: any,
  tagName: string,
): Element[] {
  return findAllInRenderedTree(renderedTree, (instance) => {
    return isDOMVNodeOfType(instance, tagName);
  }).map((instance) => instance.dom);
}

export function scryRenderedVNodesWithType(
  renderedTree: any,
  type: unknown,
): VNode[] {
  return findAllInRenderedTree(renderedTree, (instance) =>
    isVNodeOfType(instance, type),
  );
}

export function scryVNodesWithType(vNodeTree: VNode, type: unknown): VNode[] {
  return findAllInVNodeTree(vNodeTree, (instance) =>
    isVNodeOfType(instance, type),
  );
}

// Find Utilities

export function findRenderedDOMElementWithClass(
  renderedTree: any,
  classNames: string | string[],
): Element {
  return findOneOf(
    renderedTree,
    classNames,
    'class',
    scryRenderedDOMElementsWithClass,
  );
}

export function findRenderedDOMElementWithTag(
  renderedTree: any,
  tagName: string,
): Element {
  return findOneOf(
    renderedTree,
    tagName,
    'tag',
    scryRenderedDOMElementsWithTag,
  );
}

export function findRenderedVNodeWithType(
  renderedTree: any,
  type: unknown,
): VNode {
  return findOneOf(renderedTree, type, 'component', scryRenderedVNodesWithType);
}

export function findVNodeWithType(vNodeTree: VNode, type: unknown): VNode {
  return findOneOf(vNodeTree, type, 'VNode', scryVNodesWithType);
}

export function renderIntoContainer(
  input: boolean | VNode | InfernoChild | InfernoFragment | null | undefined,
): Component<any, any> | VNode {
  const container: any = document.createElement('div');

  render(input, container);

  const rootInput = container.$V;

  if (rootInput && rootInput.flags & VNodeFlags.Component) {
    return rootInput.children;
  }

  return rootInput;
}

export const vNodeToSnapshot = _vNodeToSnapshot;
export const renderToSnapshot = _renderToSnapshot;
export const getTagNameOfVNode = _getTagNameOfVNode;
export const isClassVNode = _isClassVNode;
export const isComponentVNode = _isComponentVNode;
export const isDOMVNode = _isDOMVNode;
export const isFunctionalVNode = _isFunctionalVNode;
export const isTextVNode = _isTextVNode;
export const isVNode = _isVNode;
export const Wrapper = _Wrapper;
