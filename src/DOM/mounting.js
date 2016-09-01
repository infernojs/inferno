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
	isVTemplate,
	isVText
} from '../core/shapes';
import TemplateValueTypes from '../core/TemplateValueTypes';
import {
	recycleVTemplate,
	recyclingEnabled
} from './recycling';

export function mount(input, parentDom, lifecycle, context, isSVG) {
	if (isVTemplate(input)) {
		return mountVTemplate(input, parentDom, lifecycle, context, isSVG);
	} else if (isVText(input)) {
		return mountVText(input, parentDom);
	}
}

function createStaticClone(bp, isSVG) {
	const stat = bp.static;
	const tag = stat.tag;
	const dom = document.createElement(tag);
	const props = stat.props;

	for (let prop in props) {
		patchProp(prop, null, props[prop], dom);
	}
	bp.clone = dom;
	return dom.cloneNode(true);
}

export function mountVText(vText, parentDom) {
	const dom = document.createTextNode(vText.text);

	vText.dom = dom;
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountVTemplate(vTemplate, parentDom, lifecycle, context, isSVG) {
	const bp = vTemplate.bp;
	let dom = null;

	if (recyclingEnabled) {
		dom = recycleVTemplate(vTemplate, lifecycle, context, isSVG);
	}
	if (isNull(dom)) {
		dom = (bp.clone && bp.clone.cloneNode(true)) || createStaticClone(bp, isSVG);
		const v0 = vTemplate.v0;
		const v1 = vTemplate.v1;
		const v2 = vTemplate.v2;
		const v3 = vTemplate.v3;

		vTemplate.dom = dom;
		if (!isUndefined(v0)) {
			mountTemplateValue(bp.v0, v0, dom, lifecycle, context, isSVG);
			if (!isUndefined(v1)) {
				mountTemplateValue(bp.v1, v1, dom, lifecycle, context, isSVG);
			}
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
		case TemplateValueTypes.CHILDREN_NON_KEYED:
			mountArrayChildrenWithType(value, dom, lifecycle, context, isSVG);
			break;
		case TemplateValueTypes.CHILDREN_TEXT:
			setTextContent(dom, value);
			break;
		case TemplateValueTypes.CHILDREN_NODE:
			mount(value, dom, lifecycle, context, isSVG);
			break;
		case TemplateValueTypes.PROPS_CLASS_NAME:
			if (!isNullOrUndef(value)) {
				dom.className = value;
			}
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