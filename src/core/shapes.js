import { isUndefined } from './utils';
import { ChildrenTypes } from './ChildrenTypes';

export const NULL_INDEX = -1;
export const ROOT_INDEX = -2;

export const NodeTypes = {
	ELEMENT: 0,
	COMPONENT: 1,
	TEMPLATE: 2,
	TEXT: 3,
	PLACEHOLDER: 4,
	FRAGMENT: 5,
	VARIABLE: 6,
	PURE_VALUE : 7
};

export function cloneVNode(vNodeToClone, props, ...children) {
	if (!props) {
		props = {};
	}
	if (children.length > 0) {
		if (children.length === 1) {
			children = children[0];
		}
		if (!props.children) {
			props.children = children;
		} else {
			if (isArray(children)) {
				if (isArray(props.children)) {
					props.children = props.children.concat(children);
				} else {
					props.children = [props.children].concat(children);
				}
			} else {
				if (isArray(props.children)) {
					props.children.push(children);
				} else {
					props.children = [props.children];
					props.children.push(children);
				}
			}
		}
	}
	if (isVComponent(vNodeToClone)) {
		return createVComponent(vNodeToClone.component,
			Object.assign({}, vNodeToClone.props, props),
			vNodeToClone.key,
			vNodeToClone.hooks,
			vNodeToClone.ref
		);
	} else if (isVElement(vNodeToClone)) {
		return createVElement(vNodeToClone.tag,
			Object.assign({}, vNodeToClone.props, props),
			props.children || children || vNodeToClone.children,
			vNodeToClone.key,
			vNodeToClone.ref,
			ChildrenTypes.UNKNOWN
		);
	} else if (isVTemplate(vNodeToClone)) {
		return cloneVNode(convertVTemplate(vNodeToClone, props, children));
	}
}

function getTemplateValues(vTemplate) {
	const values = [];
	const v0 = vTemplate.v0;
	const v1 = vTemplate.v1;

	if (v0) {
		values.push(v0);
	}
	if (v1) {
		values.push(...v1);
	}
	return values;
}

export function convertVTemplate(vTemplate) {
	return vTemplate.tr.schema.apply(null, getTemplateValues(vTemplate));
}

export function createVTemplateReducers(schema, renderer) {
	const argCount = schema.length;
	const parameters = [];

	for (let i = 0; i < argCount; i++) {
		parameters.push(createVariable(i));
	}
	const vNode = schema(...parameters);
	const templateReducers = renderer.createTemplateReducers(
		vNode,
		true,
		{ length: argCount },
		null,
		false,
		false,
		0,
		''
	);
	templateReducers.schema = schema;
	return templateReducers;
}

export function createVTemplate(tr, key, v0, v1) {
	return {
		type: NodeTypes.TEMPLATE,
		dom: null,
		tr,
		key,
		v0,
		v1
	};
}

function createVariable(pointer) {
	return {
		type: NodeTypes.VARIABLE,
		pointer
	};
}

export function createTemplaceReducers(
	keyIndex,
	mount,
	patch,
	unmount,
	hydrate
) {
	return {
		keyIndex,
		schema: null,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		},
		mount,
		patch,
		unmount,
		hydrate,
		shouldUpdate: null
	};
}

export function createVComponent(
	component,
	props,
	key,
	hooks,
	ref
) {
	return {
		type: NodeTypes.COMPONENT,
		dom: null,
		component,
		props,
		hooks,
		key,
		ref,
		isStateful: !isUndefined(component.prototype) && !isUndefined(component.prototype.render)
	};
}

export function createVElement(
	tag,
	props = null,
	children = null,
	key = null,
	ref = null,
	childrenType = null
) {
	return {
		type: NodeTypes.ELEMENT,
		dom: null,
		tag,
		children,
		key,
		props,
		ref,
		childrenType: childrenType || ChildrenTypes.UNKNOWN
	};
}

export function createVText(text) {
	return {
		type: NodeTypes.TEXT,
		text,
		dom: null
	};
}

export function createVPlaceholder() {
	return {
		type: NodeTypes.PLACEHOLDER,
		dom: null
	};
}

export function createVFragment(
	children,
	childrenType = ChildrenTypes.UNKNOWN
) {
	return {
		type: NodeTypes.FRAGMENT,
		dom: null,
		pointer: null,
		children,
		childrenType
	};
}

export function isVText(o) {
	return o.type === NodeTypes.TEXT;
}

export function isVariable(o) {
	return o.type === NodeTypes.VARIABLE;
}

export function isVPlaceholder(o) {
	return o.type === NodeTypes.PLACEHOLDER;
}

export function isVFragment(o) {
	return o.type === NodeTypes.FRAGMENT;
}

export function isVElement(o) {
	return o.type === NodeTypes.ELEMENT;
}

export function isVTemplate(o) {
	return o.type === NodeTypes.TEMPLATE;
}

export function isVComponent(o) {
	return o.type === NodeTypes.COMPONENT;
}

export function isVNode(o) {
	return o.type !== undefined;
}
