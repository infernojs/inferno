import {
	isArray,
	isInvalid,
	isNull,
	isNullOrUndef,
	isNumber,
	isString,
	isStringOrNumber,
	isUndefined,
	warning
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import { createTextVNode, directClone, InfernoChildren, isVNode, Props, VNode } from './VNodes';

function applyKey(key: string, vNode: VNode) {
	vNode.key = key;

	return vNode;
}

function applyKeyIfMissing(key: string | number, vNode: VNode): VNode {
	if (isNumber(key)) {
		key = `.${ key }`;
	}
	if (isNull(vNode.key) || vNode.key[ 0 ] === '.') {
		return applyKey(key as string, vNode);
	}
	return vNode;
}

function applyKeyPrefix(key: string, vNode: VNode): VNode {
	vNode.key = key + vNode.key;

	return vNode;
}

function _normalizeVNodes(nodes: any[], result: VNode[], index: number, currentKey) {
	for (const len = nodes.length; index < len; index++) {
		let n = nodes[ index ];
		const key = `${ currentKey }.${ index }`;

		if (!isInvalid(n)) {
			if (isArray(n)) {
				_normalizeVNodes(n, result, 0, key);
			} else {
				if (isStringOrNumber(n)) {
					n = createTextVNode(n, null);
				} else if (isVNode(n) && n.dom || (n.key && n.key[ 0 ] === '.')) {
					n = directClone(n);
				}
				if (isNull(n.key) || n.key[ 0 ] === '.') {
					n = applyKey(key, n as VNode);
				} else {
					n = applyKeyPrefix(currentKey, n as VNode);
				}

				result.push(n);
			}
		}
	}
}

export function normalizeVNodes(nodes: any[]): VNode[] {
	let newNodes;

	// we assign $ which basically means we've flagged this array for future note
	// if it comes back again, we need to clone it, as people are using it
	// in an immutable way
	// tslint:disable
	if (nodes[ '$' ] === true) {
		nodes = nodes.slice();
	} else {
		nodes[ '$' ] = true;
	}
	// tslint:enable
	for (let i = 0, len = nodes.length; i < len; i++) {
		const n = nodes[ i ];

		if (isInvalid(n) || isArray(n)) {
			const result = (newNodes || nodes).slice(0, i) as VNode[];

			_normalizeVNodes(nodes, result, i, ``);
			return result;
		} else if (isStringOrNumber(n)) {
			if (!newNodes) {
				newNodes = nodes.slice(0, i) as VNode[];
			}
			newNodes.push(applyKeyIfMissing(i, createTextVNode(n, null)));
		} else if ((isVNode(n) && n.dom !== null) || (isNull(n.key) && (n.flags & VNodeFlags.HasNonKeyedChildren) === 0)) {
			if (!newNodes) {
				newNodes = nodes.slice(0, i) as VNode[];
			}
			newNodes.push(applyKeyIfMissing(i, directClone(n)));
		} else if (newNodes) {
			newNodes.push(applyKeyIfMissing(i, directClone(n)));
		}
	}

	return newNodes || nodes as VNode[];
}

function normalizeChildren(children: InfernoChildren | null) {
	if (isArray(children)) {
		return normalizeVNodes(children as any[]);
	} else if (isVNode(children as VNode) && (children as VNode).dom !== null) {
		return directClone(children as VNode);
	}

	return children;
}

function normalizeProps(vNode: VNode, props: Props, children: InfernoChildren) {
	if (vNode.flags & VNodeFlags.Element) {
		if (isNullOrUndef(children) && !isNullOrUndef(props.children)) {
			vNode.children = props.children;
		}
		if (!isNullOrUndef(props.className)) {
			vNode.className = props.className;
			delete props.className;
		}
	}
	if (props.ref) {
		vNode.ref = props.ref;
		delete props.ref;
	}
	if (!isNullOrUndef(props.key)) {
		vNode.key = props.key;
		delete props.key;
	}
}

export function getFlagsForElementVnode(type: string): number {
	if (type === 'svg') {
		return VNodeFlags.SvgElement;
	} else if (type === 'input') {
		return VNodeFlags.InputElement;
	} else if (type === 'select') {
		return VNodeFlags.SelectElement;
	} else if (type === 'textarea') {
		return VNodeFlags.TextareaElement;
	} else if (type === 'media') {
		return VNodeFlags.MediaElement;
	}
	return VNodeFlags.HtmlElement;
}

export function normalize(vNode: VNode): void {
	let props = vNode.props;
	let children = vNode.children;

	// convert a wrongly created type back to element
	// Primitive node doesn't have defaultProps, only Component
	if (vNode.flags & VNodeFlags.Component) {
		// set default props
		const type = vNode.type;
		const defaultProps = (type as any).defaultProps;

		if (!isNullOrUndef(defaultProps)) {
			if (!props) {
				props = vNode.props = defaultProps; // Create new object if only defaultProps given
			} else {
				for (const prop in defaultProps) {
					if (isUndefined(props[ prop ])) {
						props[ prop ] = defaultProps[ prop ];
					}
				}
			}
		}

		if (isString(type)) {
			vNode.flags = getFlagsForElementVnode(type as string);
			if (props && props.children) {
				vNode.children = props.children;
				children = props.children;
			}
		}
	}

	if (props) {
		normalizeProps(vNode, props, children);
		if (!isInvalid(props.children)) {
			props.children = normalizeChildren(props.children);
		}
	}
	if (!isInvalid(children)) {
		vNode.children = normalizeChildren(children);
	}

	if (process.env.NODE_ENV !== 'production') {

		// This code will be stripped out from production CODE
		// It helps users to track errors in their applications.

		const verifyKeys = function(vNodes) {
			const keyValues = vNodes.map(function(vnode) {
				return vnode.key;
			});
			keyValues.some(function(item, idx) {
				const hasDuplicate = keyValues.indexOf(item) !== idx;

				if (hasDuplicate) {
					warning('Inferno normalisation(...): Encountered two children with same key, all keys must be unique within its siblings. Duplicated key is:' + item);
				}

				return hasDuplicate;
			});
		};

		if (vNode.children && Array.isArray(vNode.children)) {
			verifyKeys(vNode.children);
		}
	}
}
