import {
	isArray,
	isInvalid,
	isNull,
	isNullOrUndef,
	isStatefulComponent,
	isUndefined
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import {
	normalize
} from './normalization';
import options from './options';

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

export function cloneVNode(vNodeToClone: VNode, props?: Props, ..._children: InfernoChildren[]): VNode {
	let children: any = _children;
	if (_children.length > 0 && !isNull(_children[0])) {
		if (!props) {
			props = {};
		}
		if (_children.length === 1) {
			children = _children[0];
		}
		if (isUndefined(props.children)) {
			props.children = children as VNode;
		} else {
			if (isArray(children)) {
				if (isArray(props.children)) {
					props.children = (props.children as Array<string | number | VNode>).concat(children) as any;
				} else {
					props.children = [props.children].concat(children) as any;
				}
			} else {
				if (isArray(props.children)) {
					(props.children as Array<string | number | VNode>).push(children);
				} else {
					props.children = [props.children] as any;
					(props.children as any[]).push(children);
				}
			}
		}
	}
	children = null;
	let newVNode;

	if (isArray(vNodeToClone)) {
		const tmpArray = [];
		for (let i = 0, len = (vNodeToClone as any).length; i < len; i++) {
			tmpArray.push(cloneVNode(vNodeToClone[i]));
		}

		newVNode = tmpArray;
	} else {
		const flags = vNodeToClone.flags;
		const events = vNodeToClone.events || (props && props.events) || null;
		const key = !isNullOrUndef(vNodeToClone.key) ? vNodeToClone.key : (props ? props.key : null);
		const ref = vNodeToClone.ref || (props ? props.ref : null);

		if (flags & VNodeFlags.Component) {
			newVNode = createVNode(flags, vNodeToClone.type,
				Object.assign({}, vNodeToClone.props, props),
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
						for (let i = 0, len = newChildren.length; i < len; i++) {
							const child = newChildren[i];

							if (!isInvalid(child) && isVNode(child)) {
								newProps.children[i] = cloneVNode(child);
							}
						}
					} else if (isVNode(newChildren)) {
						newProps.children = cloneVNode(newChildren);
					}
				}
			}
			newVNode.children = null;
		} else if (flags & VNodeFlags.Element) {
			children = (props && props.children) || vNodeToClone.children;
			newVNode = createVNode(flags, vNodeToClone.type,
				Object.assign({}, vNodeToClone.props, props),
				children,
				events,
				key,
				ref,
				!children
			);
		} else if (flags & VNodeFlags.Text) {
			newVNode = createTextVNode(vNodeToClone.children as string);
		}
	}

	return newVNode;
}

export function createVoidVNode(): VNode {
	return createVNode(VNodeFlags.Void);
}

export function createTextVNode(text: string | number): VNode {
	return createVNode(VNodeFlags.Text, null, null, text, null, null, null, true);
}

export function isVNode(o: VNode): boolean {
	return !!o.flags;
}
