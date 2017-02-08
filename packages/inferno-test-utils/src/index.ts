import {
	render,
	VNode,
	InfernoInput,
	InfernoChildren
} from 'inferno';
import VNodeFlags from 'inferno-vnode-flags';
import createClass from 'inferno-create-class';
import createElement from 'inferno-create-element';
import {
	isArray,
	isFunction,
	isNumber,
	isObject,
	isString,
	throwError
} from 'inferno-shared';

// Type Checkers

export function isVNode(inst: any): boolean {
	return Boolean(inst) && isObject(inst) && isNumber(inst.flags) &&
		(inst.flags & (VNodeFlags.Component | VNodeFlags.Element)) > 0;
}

export function isVNodeOfType(inst: VNode, type: string | Function): boolean {
	return isVNode(inst) && inst.type === type;
}

export function isDOMVNode(inst: VNode): boolean {
	return isVNode(inst) && isString(inst.type);
}

export function isDOMVNodeOfType(inst: VNode, type: string): boolean {
	return isDOMVNode(inst) && inst.type === type;
}

export function isFunctionalVNode(inst: VNode): boolean {
	return isVNode(inst) && Boolean(inst.flags & VNodeFlags.ComponentFunction);
}

export function isFunctionalVNodeOfType(inst: VNode, type: Function): boolean {
	return isFunctionalVNode(inst) && inst.type === type;
}

export function isClassVNode(inst: VNode): boolean {
	return isVNode(inst) && Boolean(inst.flags & VNodeFlags.ComponentClass);
}

export function isClassVNodeOfType(inst: VNode, type: Function): boolean {
	return isClassVNode(inst) && inst.type === type;
}

export function isDOMElement(inst: any): boolean  {
	return Boolean(inst) && isObject(inst) &&
		inst.nodeType === 1 && isString(inst.tagName);
}

export function isDOMElementOfType(inst: any, type: string): boolean  {
	return isDOMElement(inst) && isString(type) &&
		inst.tagName.toLowerCase() === type.toLowerCase();
}

export function isRenderedClassComponent(inst: any): boolean {
	return Boolean(inst) && isObject(inst) && isVNode(inst._vNode) &&
		isFunction(inst.render) && isFunction(inst.setState);
}

export function isRenderedClassComponentOfType(inst: any, type: Function): boolean {
	return isRenderedClassComponent(inst) &&
		isFunction(type) && inst._vNode.type === type;
}

// Render Utilities

const Wrapper = createClass({
	render() {
		return this.props.children;
	}
});

export function renderIntoDocument(input: InfernoInput): InfernoChildren {
	const wrappedInput = createElement(Wrapper, null, input);
	const parent = document.createElement('div');
	return render(wrappedInput, parent);
}

// Recursive Finder Functions

export function findAllInRenderedTree(tree: any, predicate: Function): VNode[] {
	if (isRenderedClassComponent(tree)) {
		return findAllInVNodeTree(tree._lastInput, predicate);
	} else {
		throwError('findAllInRenderedTree(...) instance must be a rendered class component');
	}
}

export function findAllInVNodeTree(tree: VNode, predicate: Function): VNode[] {
	if (isVNode(tree)) {
		let result: VNode[] = predicate(tree) ? [ tree ] : [];
		const children: any = tree.children;

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
		throwError('findAllInVNodeTree(...) instance must be a VNode');
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

export function scryRenderedDOMElementsWithClass(tree: any, classNames: string | string[]): Element[] {
	return findAllInRenderedTree(tree, (inst) => {
		if (isDOMVNode(inst)) {
			let domClassName = inst.dom.className;
			if (!isString(domClassName)) { // SVG, probably
				domClassName = inst.dom.getAttribute('class') || '';
			}
			const domClassList = parseSelector(domClassName);
			return parseSelector(classNames).every((className) => {
				return domClassList.indexOf(className) !== -1;
			});
		}
		return false;
	}).map((inst) => inst.dom);
}

export function scryRenderedDOMElementsWithTag(tree: any, tagName: string): Element[] {
	return findAllInRenderedTree(tree, (inst) => {
		return isDOMVNodeOfType(inst, tagName);
	}).map((inst) => inst.dom);
}

export function scryRenderedVNodesWithType(tree: any, type: string | Function): VNode[] {
	return findAllInRenderedTree(tree, (inst) => isVNodeOfType(inst, type));
}

export function scryVNodesWithType(tree: VNode, type: string | Function): VNode[] {
	return findAllInVNodeTree(tree, (inst) => isVNodeOfType(inst, type));
}

// Find Utilities

export function findRenderedDOMElementWithClass(tree: any, classNames: string | string[]): Element {
	return findOneOf(tree, classNames, 'class', scryRenderedDOMElementsWithClass);
}

export function findRenderedDOMElementWithTag(tree: any, tagName: string): Element {
	return findOneOf(tree, tagName, 'tag', scryRenderedDOMElementsWithTag);
}

export function findRenderedVNodeWithType(tree: any, type: string | Function): VNode {
	return findOneOf(tree, type, 'component', scryRenderedVNodesWithType);
}

export function findVNodeWithType(tree: VNode, type: string | Function): VNode {
	return findOneOf(tree, type, 'VNode', scryVNodesWithType);
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
