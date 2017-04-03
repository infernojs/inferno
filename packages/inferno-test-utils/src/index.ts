import { InfernoChildren, InfernoInput, render, VNode } from 'inferno';
import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import { isArray, isFunction, isNumber, isObject, isString, throwError } from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';

// Type Checkers

export function isVNode(instance: any): boolean {
	return Boolean(instance) && isObject(instance) &&
		isNumber(instance.flags) && instance.flags > 0;
}

export function isVNodeOfType(instance: VNode, type: string | Function): boolean {
	return isVNode(instance) && instance.type === type;
}

export function isDOMVNode(instance: VNode): boolean {
	return isVNode(instance) && isString(instance.type);
}

export function isDOMVNodeOfType(instance: VNode, type: string): boolean {
	return isDOMVNode(instance) && instance.type === type;
}

export function isFunctionalVNode(instance: VNode): boolean {
	return isVNode(instance) && Boolean(instance.flags & VNodeFlags.ComponentFunction);
}

export function isFunctionalVNodeOfType(instance: VNode, type: Function): boolean {
	return isFunctionalVNode(instance) && instance.type === type;
}

export function isClassVNode(instance: VNode): boolean {
	return isVNode(instance) && Boolean(instance.flags & VNodeFlags.ComponentClass);
}

export function isClassVNodeOfType(instance: VNode, type: Function): boolean {
	return isClassVNode(instance) && instance.type === type;
}

export function isDOMElement(instance: any): boolean {
	return Boolean(instance) && isObject(instance) &&
		instance.nodeType === 1 && isString(instance.tagName);
}

export function isDOMElementOfType(instance: any, type: string): boolean {
	return isDOMElement(instance) && isString(type) &&
		instance.tagName.toLowerCase() === type.toLowerCase();
}

export function isRenderedClassComponent(instance: any): boolean {
	return Boolean(instance) && isObject(instance) && isVNode(instance._vNode) &&
		isFunction(instance.render) && isFunction(instance.setState);
}

export function isRenderedClassComponentOfType(instance: any, type: Function): boolean {
	return isRenderedClassComponent(instance) &&
		isFunction(type) && instance._vNode.type === type;
}

// Render Utilities

class Wrapper extends Component<any, any> {
	render() {
		return this.props.children;
	}
}

export function renderIntoDocument(input: InfernoInput): InfernoChildren {
	const wrappedInput = createElement(Wrapper, null, input);
	const parent = document.createElement('div');
	document.body.appendChild(parent);
	return render(wrappedInput, parent);
}

// Recursive Finder Functions

export function findAllInRenderedTree(renderedTree: any, predicate: (vNode: VNode) => boolean): VNode[] {
	if (isRenderedClassComponent(renderedTree)) {
		return findAllInVNodeTree(renderedTree._lastInput, predicate);
	} else {
		throwError('findAllInRenderedTree(renderedTree, predicate) renderedTree must be a rendered class component');
	}
}

export function findAllInVNodeTree(vNodeTree: VNode, predicate: (vNode: VNode) => boolean): VNode[] {
	if (isVNode(vNodeTree)) {
		let result: VNode[] = predicate(vNodeTree) ? [ vNodeTree ] : [];
		const children: any = vNodeTree.children;

		if (isRenderedClassComponent(children)) {
			result = result.concat(findAllInVNodeTree(children._lastInput, predicate));

		} else if (isVNode(children)) {
			result = result.concat(findAllInVNodeTree(children, predicate));

		} else if (isArray(children)) {
			children.forEach((child) => {
				result = result.concat(findAllInVNodeTree(child, predicate));
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
		return all[ 0 ];
	}
}

// Scry Utilities

export function scryRenderedDOMElementsWithClass(renderedTree: any, classNames: string | string[]): Element[] {
	return findAllInRenderedTree(renderedTree, (instance) => {
		if (isDOMVNode(instance)) {
			let domClassName = instance.dom.className;
			if (!isString(domClassName)) { // SVG, probably
				domClassName = instance.dom.getAttribute('class') || '';
			}
			const domClassList = parseSelector(domClassName);
			return parseSelector(classNames).every((className) => {
				return domClassList.indexOf(className) !== -1;
			});
		}
		return false;
	}).map((instance) => instance.dom);
}

export function scryRenderedDOMElementsWithTag(renderedTree: any, tagName: string): Element[] {
	return findAllInRenderedTree(renderedTree, (instance) => {
		return isDOMVNodeOfType(instance, tagName);
	}).map((instance) => instance.dom);
}

export function scryRenderedVNodesWithType(renderedTree: any, type: string | Function): VNode[] {
	return findAllInRenderedTree(renderedTree, (instance) => isVNodeOfType(instance, type));
}

export function scryVNodesWithType(vNodeTree: VNode, type: string | Function): VNode[] {
	return findAllInVNodeTree(vNodeTree, (instance) => isVNodeOfType(instance, type));
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

export default {

	isVNode,
	isVNodeOfType,

	isDOMVNode,
	isDOMVNodeOfType,

	isFunctionalVNode,
	isFunctionalVNodeOfType,

	isClassVNode,
	isClassVNodeOfType,

	isDOMElement,
	isDOMElementOfType,

	isRenderedClassComponent,
	isRenderedClassComponentOfType,

	renderIntoDocument,

	findAllInRenderedTree,
	findAllInVNodeTree,

	scryRenderedDOMElementsWithClass,
	findRenderedDOMElementWithClass,

	scryRenderedDOMElementsWithTag,
	findRenderedDOMElementWithTag,

	scryRenderedVNodesWithType,
	findRenderedVNodeWithType,

	scryVNodesWithType,
	findVNodeWithType
};
