import { VNode } from 'inferno';
import { isArray, isFunction, isInvalid, isNullOrUndef, isObject, isString, throwError } from 'inferno-shared';
import {
  getTagNameOfVNode as _getTagNameOfVNode,
  isClassVNode as _isClassVNode,
  isComponentVNode as _isComponentVNode,
  isDOMVNode as _isDOMVNode,
  isFunctionalVNode as _isFunctionalVNode,
  isTextVNode as _isTextVNode,
  isVNode as _isVNode,
  Wrapper as _Wrapper
} from './utils';
import { renderToSnapshot as _renderToSnapshot, vNodeToSnapshot as _vNodeToSnapshot } from './jest';

// Type Checkers

export function isVNodeOfType(instance: VNode, type: string | Function): boolean {
  return _isVNode(instance) && instance.type === type;
}

export function isDOMVNodeOfType(instance: VNode, type: string): boolean {
  return _isDOMVNode(instance) && instance.type === type;
}

export function isFunctionalVNodeOfType(instance: VNode, type: Function): boolean {
  return _isFunctionalVNode(instance) && instance.type === type;
}

export function isClassVNodeOfType(instance: VNode, type: Function): boolean {
  return _isClassVNode(instance) && instance.type === type;
}

export function isComponentVNodeOfType(inst: VNode, type: Function): boolean {
  return (_isFunctionalVNode(inst) || _isClassVNode(inst)) && inst.type === type;
}

export function isDOMElement(instance: any): boolean {
  return Boolean(instance) && isObject(instance) && (instance as any).nodeType === 1 && isString((instance as any).tagName);
}

export function isDOMElementOfType(instance: any, type: string): boolean {
  return isDOMElement(instance) && isString(type) && instance.tagName.toLowerCase() === type.toLowerCase();
}

export function isRenderedClassComponent(instance: any): boolean {
  return (
    Boolean(instance) && isObject(instance) && _isVNode((instance as any).$V) && isFunction((instance as any).render) && isFunction((instance as any).setState)
  );
}

export function isRenderedClassComponentOfType(instance: any, type: Function): boolean {
  return isRenderedClassComponent(instance) && isFunction(type) && instance.$V.type === type;
}

// Recursive Finder Functions

export function findAllInRenderedTree(renderedTree: any, predicate: (vNode: VNode) => boolean): VNode[] | any {
  if (isRenderedClassComponent(renderedTree)) {
    return findAllInVNodeTree(renderedTree.$LI, predicate);
  } else {
    return findAllInVNodeTree(renderedTree, predicate);
  }
}

export function findAllInVNodeTree(vNodeTree: VNode, predicate: (vNode: VNode) => boolean): any {
  if (_isVNode(vNodeTree)) {
    let result: VNode[] = predicate(vNodeTree) ? [vNodeTree] : [];
    const children: any = vNodeTree.children;

    if (isRenderedClassComponent(children)) {
      result = result.concat(findAllInVNodeTree(children.$LI, predicate) as VNode[]);
    } else if (_isVNode(children)) {
      result = result.concat(findAllInVNodeTree(children, predicate) as VNode[]);
    } else if (isArray(children)) {
      children.forEach(child => {
        if (!isInvalid(child)) {
          result = result.concat(findAllInVNodeTree(child, predicate) as VNode[]);
        }
      });
    }
    return result;
  } else {
    throwError('findAllInVNodeTree(vNodeTree, predicate) vNodeTree must be a VNode instance');
  }
}

// Finder Helpers

function parseSelector(filter) {
  if (isArray(filter)) {
    return filter;
  } else if (isString(filter)) {
    return filter.trim().split(/\s+/);
  } else {
    return [];
  }
}

function findOneOf(tree: any, filter: any, name: string, finder: Function): any {
  const all = finder(tree, filter);
  if (all.length > 1) {
    throwError(`Did not find exactly one match (found ${all.length}) for ${name}: ${filter}`);
  } else {
    return all[0];
  }
}

// Scry Utilities

export function scryRenderedDOMElementsWithClass(renderedTree: any, classNames: string | string[]): Element[] {
  return findAllInRenderedTree(renderedTree, instance => {
    if (_isDOMVNode(instance)) {
      let domClassName = !isNullOrUndef(instance.dom) ? (instance.dom as Element).className : '';

      if (!isString(domClassName) && !isNullOrUndef(instance.dom) && isFunction(instance.dom.getAttribute)) {
        // SVG || null, probably
        domClassName = (instance.dom as Element).getAttribute('class') || '';
      }

      const domClassList = parseSelector(domClassName);
      return parseSelector(classNames).every(className => {
        return domClassList.indexOf(className) !== -1;
      });
    }
    return false;
  }).map(instance => instance.dom);
}

export function scryRenderedDOMElementsWithTag(renderedTree: any, tagName: string): Element[] {
  return findAllInRenderedTree(renderedTree, instance => {
    return isDOMVNodeOfType(instance, tagName);
  }).map(instance => instance.dom);
}

export function scryRenderedVNodesWithType(renderedTree: any, type: string | Function): VNode[] {
  return findAllInRenderedTree(renderedTree, instance => isVNodeOfType(instance, type));
}

export function scryVNodesWithType(vNodeTree: VNode, type: string | Function): VNode[] {
  return findAllInVNodeTree(vNodeTree, instance => isVNodeOfType(instance, type));
}

// Find Utilities

export function findRenderedDOMElementWithClass(renderedTree: any, classNames: string | string[]): Element {
  return findOneOf(renderedTree, classNames, 'class', scryRenderedDOMElementsWithClass);
}

export function findRenderedDOMElementWithTag(renderedTree: any, tagName: string): Element {
  return findOneOf(renderedTree, tagName, 'tag', scryRenderedDOMElementsWithTag);
}

export function findRenderedVNodeWithType(renderedTree: any, type: string | Function): VNode {
  return findOneOf(renderedTree, type, 'component', scryRenderedVNodesWithType);
}

export function findVNodeWithType(vNodeTree: VNode, type: string | Function): VNode {
  return findOneOf(vNodeTree, type, 'VNode', scryVNodesWithType);
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
