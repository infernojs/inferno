import {
	VNodeFlags,
	createVNode,
	isVNode,
} from '../core/shapes';
import {
	isArray,
	isNull,
	isNullOrUndef,
	isUndefined,
	isInvalid
} from '../shared';

export default function cloneVNode(vNodeToClone, props?, ..._children) {
	let children: any = _children;

	if (_children.length > 0 && !isNull(_children[0])) {
		if (!props) {
			props = {};
		}
		if (_children.length === 1) {
			children = _children[0];
		}
		if (isUndefined(props.children)) {
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
	children = null;
	const flags = vNodeToClone.flags;
	const events = vNodeToClone.events || (props && props.events) || null;
	let newVNode;

	if (isArray(vNodeToClone)) {
		newVNode = vNodeToClone.map((vNode) => cloneVNode(vNode));
	} else if (isNullOrUndef(props) && isNullOrUndef(children)) {
		newVNode = Object.assign({}, vNodeToClone);
	} else {
		const key = !isNullOrUndef(vNodeToClone.key) ? vNodeToClone.key : props.key;
		const ref = vNodeToClone.ref || props.ref;

		if (flags & VNodeFlags.Component) {
			newVNode = createVNode(flags, vNodeToClone.type,
				Object.assign({}, vNodeToClone.props, props),
				null,
				events,
				key,
				ref,
				true
			);
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
		}
	}
	if (flags & VNodeFlags.Component) {
		const newProps = newVNode.props;

		if (newProps) {
			const newChildren = newProps.children;
			// we need to also clone component children that are in props
			// as the children may also have been hoisted
			if (newChildren) {
				if (isArray(newChildren)) {
					for (let i = 0; i < newChildren.length; i++) {
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
	}
	newVNode.dom = null;
	return newVNode;
}
