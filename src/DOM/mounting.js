import {
	isArray,
	isUndefined,
	isStringOrNumber,
	isFunction,
	isNullOrUndef,
	isStatefulComponent,
	isString,
	isInvalid,
	isNull,
	isTrue,
	throwError
} from './../core/utils';
import {
	setTextContent,
	documentCreateElement,
	normaliseChild,
	appendChild,
	normalise,
	formSelectValue
} from './utils';
import { patchStyle, patch, patchProp } from './patching';
import { componentToDOMNodeMap } from './rendering';
import {
	isVTemplate
} from '../core/shapes';
import TemplateValueTypes from '../core/TemplateValueTypes';
import {
	recycleVTemplate,
	recyclingEnabled
} from './recycling';

export function mount(input, parentDom, lifecycle, context, isSVG) {
	if (isVTemplate(input)) {
		return mountVTemplate(input, parentDom, lifecycle, context, isSVG);
	}
}

export function mountVTemplate(vTemplate, parentDom, lifecycle, context, isSVG) {
	const bp = vTemplate.bp;
	let dom = null;

	if (recyclingEnabled) {
		dom = recycleVTemplate(vTemplate, lifecycle, context, isSVG);
	}
	if (isNull(dom)) {
		dom = document.createElement(bp.tag);
		const v0 = vTemplate.v0;
		const v1 = vTemplate.v1;
		const v2 = vTemplate.v2;
		const v3 = vTemplate.v3;

		vTemplate.dom = dom;
		if (!isUndefined(v0)) {
			mountTemplateValue(bp.v0, v0, dom, lifecycle, context, isSVG);
		}
	}
	if (!isNull(parentDom)) {
		parentDom.appendChild(dom);
	}
	return dom;
}

function mountTemplateValue(templateValueType, value, dom, lifecycle, context, isSVG) {
	switch (templateValueType) {
		case TemplateValueTypes.CHILDREN_KEYED:
			mountArrayChildrenWithType(value, dom, lifecycle, context, isSVG);
			break;
		case TemplateValueTypes.CHILDREN_TEXT:
			setTextContent(dom, value);
			break;
	}
}

export function mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG) {
	for (let i = 0; i < children.length; i++) {
		mount(children[i], dom, lifecycle, context, isSVG);
	}
}

export function mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG) {
	if (isArray(children)) {
		// mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG);
	} else if (isStringOrNumber(children)) {
		setTextContent(dom, children);
	} else if (!isInvalid(children)) {
		mount(children, dom, lifecycle, context, isSVG);
	}
}