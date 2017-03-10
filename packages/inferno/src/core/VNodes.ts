import {
	isArray,
	isInvalid,
	isNullOrUndef,
	isStatefulComponent,
	isUndefined,
	isStringOrNumber,
	combineFrom
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import {
	normalize
} from './normalization';
import options from './options';
import {EMPTY_OBJ} from '../DOM/utils';

export type InfernoInput = VNode | null | string | number;
export type Ref = Function | null;
export type InfernoChildren = string | number | VNode | Array<string | number | VNode> | null;
export type Type = string | Function | null;

export interface Props {
	children?: InfernoChildren;
	ref?: Ref;
	key?: any;
	events?: Object | null;
	[k: string]: any;
}

export interface Refs {
	onComponentDidMount?: (domNode: Element) => void;
	onComponentWillMount?(): void;
	onComponentShouldUpdate?(lastProps, nextProps): boolean;
	onComponentWillUpdate?(lastProps, nextProps): void;
	onComponentDidUpdate?(lastProps, nextProps): void;
	onComponentWillUnmount?(domNode: Element): void;
}

export interface VNode {
	children: InfernoChildren;
	dom: Element | null;
	events: Object | null;
	flags: VNodeFlags;
	key: any;
	props: Props | null;
	ref: Ref;
	type: Type;
	parentVNode?: VNode;
}

export function createVNode (
	flags: VNodeFlags,
	type?: Type,
	props?: Props,
	children?: InfernoChildren,
	events?,
	key?: any,
	ref?: Ref,
	noNormalise?: boolean
) {
	if (flags & VNodeFlags.ComponentUnknown) {
		flags = isStatefulComponent(type) ? VNodeFlags.ComponentClass : VNodeFlags.ComponentFunction;
	}

	const vNode: VNode = {
		children: isUndefined(children) ? null : children,
		dom: null,
		events: events || null,
		flags,
		key: isUndefined(key) ? null : key,
		props: props || null,
		ref: ref || null,
		type
	};
	if (!noNormalise) {
		normalize(vNode);
	}
	if (options.createVNode) {
		options.createVNode(vNode);
	}
	return vNode;
}

export function directClone(vNodeToClone: VNode): VNode {
	let newVNode;
	const flags = vNodeToClone.flags;

	if (flags & VNodeFlags.Component) {
		let props;
		const propsToClone = vNodeToClone.props;

		if (!propsToClone) {
			props = EMPTY_OBJ;
		} else {
			props = {};
			for (let key in propsToClone) {
				props[key] = propsToClone[key];
			}
		}
		newVNode = createVNode(flags, vNodeToClone.type,
			props,
			null,
			vNodeToClone.events,
			vNodeToClone.key,
			vNodeToClone.ref,
			true
		);
		const newProps = newVNode.props;

		if (newProps) {
			const newChildren = newProps.children;
			// we need to also clone component children that are in props
			// as the children may also have been hoisted
			if (newChildren) {
				if (isArray(newChildren)) {
					const len = newChildren.length;
					if (len > 0) {
						const tmpArray = [];

						for (let i = 0; i < len; i++) {
							const child = newChildren[i];

							if (isStringOrNumber(child)) {
								tmpArray.push(child);
							} else if (!isInvalid(child) && isVNode(child)) {
								tmpArray.push(directClone(child));
							}
						}
						newProps.children = tmpArray;
					}
				} else if (isVNode(newChildren)) {
					newProps.children = directClone(newChildren);
				}
			}
		}
		newVNode.children = null;
	} else if (flags & VNodeFlags.Element) {
		const children = vNodeToClone.children;
		let props;
		const propsToClone = vNodeToClone.props;

		if (!propsToClone) {
			props = EMPTY_OBJ;
		} else {
			props = {};
			for (let key in propsToClone) {
				props[key] = propsToClone[key];
			}
		}
		newVNode = createVNode(flags, vNodeToClone.type,
			props,
			children,
			vNodeToClone.events,
			vNodeToClone.key,
			vNodeToClone.ref,
			!children
		);
	} else if (flags & VNodeFlags.Text) {
		newVNode = createTextVNode(vNodeToClone.children as string, vNodeToClone.key);
	}

	return newVNode;
}

/*
 directClone is preferred over cloneVNode and used internally also.
 This function makes Inferno backwards compatible.
 And can be tree-shaked by modern bundlers

 Would be nice to combine this with directClone but could not do it without breaking change
 */
export function cloneVNode(vNodeToClone: VNode, props?: Props, ..._children: InfernoChildren[]): VNode {
	let children: any = _children;
	const childrenLen = _children.length;

	if (childrenLen > 0 && !isUndefined(_children[0])) {
		if (!props) {
			props = {};
		}
		if (childrenLen === 1) {
			children = _children[0];
		}

		if (!isUndefined(children)) {
			props.children = children as VNode;
		}
	}

	let newVNode;

	if (isArray(vNodeToClone)) {
		const tmpArray = [];
		for (let i = 0, len = (vNodeToClone as any).length; i < len; i++) {
			tmpArray.push(directClone(vNodeToClone[i]));
		}

		newVNode = tmpArray;
	} else {
		const flags = vNodeToClone.flags;
		const events = vNodeToClone.events || (props && props.events) || null;
		const key = !isNullOrUndef(vNodeToClone.key) ? vNodeToClone.key : (props ? props.key : null);
		const ref = vNodeToClone.ref || (props ? props.ref : null);

		if (flags & VNodeFlags.Component) {
			newVNode = createVNode(flags, vNodeToClone.type,
				(!vNodeToClone.props && !props) ? EMPTY_OBJ : combineFrom(vNodeToClone.props, props),
				null,
				events,
				key,
				ref,
				true
			);
			const newProps = newVNode.props;

			if (newProps) {
				const newChildren = newProps.children;
				// we need to also clone component children that are in props
				// as the children may also have been hoisted
				if (newChildren) {
					if (isArray(newChildren)) {
						const len = newChildren.length;
						if (len > 0) {
							const tmpArray = [];

							for (let i = 0; i < len; i++) {
								const child = newChildren[i];

								if (isStringOrNumber(child)) {
									tmpArray.push(child);
								} else if (!isInvalid(child) && isVNode(child)) {
									tmpArray.push(directClone(child));
								}
							}
							newProps.children = tmpArray;
						}
					} else if (isVNode(newChildren)) {
						newProps.children = directClone(newChildren);
					}
				}
			}
			newVNode.children = null;
		} else if (flags & VNodeFlags.Element) {
			children = (props && !isUndefined(props.children)) ? props.children : vNodeToClone.children;
			newVNode = createVNode(flags, vNodeToClone.type,
				(!vNodeToClone.props && !props) ? EMPTY_OBJ : combineFrom(vNodeToClone.props, props),
				children,
				events,
				key,
				ref,
				!children
			);
		} else if (flags & VNodeFlags.Text) {
			newVNode = createTextVNode(vNodeToClone.children as string, key);
		}
	}

	return newVNode;
}

export function createVoidVNode(): VNode {
	return createVNode(VNodeFlags.Void);
}

export function createTextVNode(text: string | number, key): VNode {
	return createVNode(VNodeFlags.Text, null, null, text, null, key);
}

export function isVNode(o: VNode): boolean {
	return !!o.flags;
}
