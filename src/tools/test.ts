import { render } from 'inferno';
import { InfernoInput, VNode, VNodeFlags } from '../core/shapes';
import isValidElement from '../factories/isValidElement';

export const renderNode = (element: InfernoInput) => {
	const div = document.createElement('div');

	return render(element, div);
};

export const isElement = (element: any): element is VNode => {
	return isValidElement(element);
};

export const isElementOfType = (inst: VNode, componentClass: Function) => {
	return (
		isValidElement(inst) &&
		inst.type === componentClass
	);
};

export const isDOMComponent = (inst: VNode) => {
	return (
		isElement(inst) &&
    (inst.flags & VNodeFlags.HtmlElement) &&
    (typeof inst.type === 'string')
	);
};

export const isCompositeComponent = (inst: VNode) => {
	if (isDOMComponent(inst)) {
		return false;
	}

	return (
		isElement(inst) &&
		typeof inst.type === 'function'
	);
}