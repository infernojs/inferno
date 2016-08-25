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
	VARIABLE: 6
};

export function cloneVNode(vNodeToClone) {
	// TODO
}

export function createVTemplateFactory(schema, renderer) {
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
	const keyIndex = templateReducers.keyIndex;

	templateReducers._schema = schema;
	switch (argCount) {
		case 0:
			return () => creaetVTemplate(templateReducers, null, null, null);
		case 1:
			if (keyIndex === 0) {
				return v0 => creaetVTemplate(templateReducers, v0, v0, null);
			} else {
				return v0 => creaetVTemplate(templateReducers, null, v0, null);
			}
		default:
			if (keyIndex === NULL_INDEX) {
				return (v0, ...v1) => creaetVTemplate(templateReducers, null, v0, v1);
			} else if (keyIndex === 0) {
				return (v0, ...v1) => creaetVTemplate(templateReducers, v0, v0, v1);
			} else {
				return (v0, ...v1) => {
					return creaetVTemplate(templateReducers, v1[keyIndex - 1], v0, v1);
				};
			}
	}
}

function creaetVTemplate(tr, key, v0, v1) {
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
		hydrate
	};
}

export function createVComponent(
	component,
	props = null,
	key = null,
	hooks = null,
	ref = null
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
