import { render } from '../DOM/rendering';
import createElement from '../factories/createElement';
import isValidElement from '../factories/isValidElement';
import { isArray, throwError, toArray } from '../shared';

export function renderIntoDocument(element: VNode): VNode {
	const div = document.createElement('div');
	return render(element, div) as VNode;
}

export function isElement(element: VNode): boolean {
	return isValidElement(element);
}

export function isElementOfType(inst: VNode, componentClass: Function): boolean {
	return (
		isValidElement(inst) &&
		inst.type === componentClass
	);
}

export function isDOMComponent(inst: any): boolean  {
	return !!(inst && inst.nodeType === 1 && inst.tagName);
}

export function isDOMComponentElement(inst: VNode): boolean {
	return !!(inst &&
		isValidElement(inst) &&
		typeof inst.type === 'string'
	);
}

export function isCompositeComponent(inst): boolean {
	if (isDOMComponent(inst)) {
		return false;
	}
	return (
		inst != null &&
		typeof inst.type.render === 'function' &&
		typeof inst.type.setState === 'function'
	);
}

export function isCompositeComponentWithType(inst, type: Function): boolean {
	if (!isCompositeComponent(inst)) {
		return false;
	}
	return (inst.type === type);
}

function findAllInTree(inst: any, test: Function): VNode[] {
	if (!inst) {
		return [];
	}
	const publicInst = inst.dom;
	const currentElement = inst._vNode;
	let ret = test(publicInst) ? [inst] : [];
	if (isDOMComponent(publicInst)) {
		const renderedChildren = inst.children;
		for (let key in renderedChildren) {
			if (!renderedChildren.hasOwnProperty(key)) {
				continue;
			}
			ret = ret.concat(
				findAllInTree(
					renderedChildren[key],
					test,
				),
			);
		}
	}

	if (
		isValidElement(currentElement) &&
		typeof currentElement.type === 'function'
	) {
		ret = ret.concat(
			findAllInTree(inst._lastInput, test),
		);
	}

	return ret;
}

export function findAllInRenderedTree(inst: any, test: Function): VNode[] {
	const result: VNode[] = [];
	if (!inst) {
		return result;
	}
	if (isDOMComponent(inst)) {
		throwError('findAllInRenderedTree(...): instance must be a composite component');
	}
	return findAllInTree(inst, test);
}

type stringArr = string | string[];
export function scryRenderedDOMComponentsWithClass(root: VNode, classNames: stringArr): VNode[] {
	return findAllInRenderedTree(root, function(inst) {
		if (isDOMComponent(inst)) {
			let className = inst.className;
			if (typeof className !== 'string') {
				// SVG, probably.
				className = inst.getAttribute('class') || '';
			}
			const classList = className.split(/\s+/);

			let classNamesList = classNames;
			if (!isArray(classNames)) {
				classNamesList = classNames.split(/\s+/);
			}

			classNamesList = toArray(classNamesList);
			return classNamesList.every(function(name) {
				return classList.indexOf(name) !== -1;
			});
		}
		return false;
	});
}

export function scryRenderedDOMComponentsWithTag(root: VNode, tagName: string): VNode[] {
	return findAllInRenderedTree(root, function(inst) {
		return isDOMComponent(inst) && inst.tagName.toUpperCase() === tagName.toUpperCase();
	});
}

export function scryRenderedComponentsWithType(root: VNode, componentType: Function): VNode[] {
	return findAllInRenderedTree(root, function(inst) {
		return isCompositeComponentWithType(
			inst,
			componentType,
		);
	});
}

function findOneOf(root: VNode, option: any, optionName: string, finderFn: Function): VNode {
	const all = finderFn(root, option);
	if (all.length > 1) {
		throwError(`Did not find exactly one match (found ${all.length}) for ${optionName}: ${option}`);
	}
	return all[0];
}

export function findRenderedDOMComponentsWithClass(root: VNode, classNames: Function): VNode {
	return findOneOf(root, classNames, 'class', scryRenderedDOMComponentsWithClass);
}

export function findRenderedDOMComponentsWithTag(root: VNode, tagName: Function): VNode {
	return findOneOf(root, tagName, 'tag', scryRenderedDOMComponentsWithTag);
}

export function findRenderedComponentWithType(root: VNode, componentClass: Function): VNode {
	return findOneOf(root, componentClass, 'component', scryRenderedComponentsWithType);
}

export function mockComponent(module, mockTagName: string) {
	mockTagName = mockTagName || typeof module.type === 'string' ? module.type : 'div';

	module.prototype.render.mockImplementation(function() {
		return createElement(
			mockTagName,
			null,
			this.props.children,
		);
	});

	return this;
}
