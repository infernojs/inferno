import { getValueWithIndex } from '../core/variables';
import isArray from '../util/isArray';
import isStringOrNumber from '../util/isStringOrNumber';

function constructVirtualChildren(children, item, depth, maxDepth) {

	if (!children) {
		return;
	}
	if (isArray(children)) {
		let vChildren = new Array(children.length);
		for (let i = 0; i < children.length; i++) {
			const childNode = children[i];

			if (typeof childNode === 'object') {
				if (childNode.index !== undefined) {
					vChildren[i] = constructVirtualNode(getValueWithIndex(item, childNode.index), item, depth, maxDepth);
				}
			} else {
				vChildren[i] = constructVirtualNode(childNode, item, depth, maxDepth);
			}
		}
		return vChildren;
	} else if (typeof children === 'object') {
		if (children.index !== undefined) {
			return constructVirtualNode(getValueWithIndex(item, children.index), item, depth, maxDepth);
		} else {
			return constructVirtualNode(children, item, depth, maxDepth);
		}
	} else if (isStringOrNumber(children)) {
		return children;
	}
}

function constructVirtualNode(node, item, depth, maxDepth) {
	let vNode;

	if (isStringOrNumber(node)) {
		return node;
	} else if (node && typeof node.tag === 'string') {
		vNode = {
			tag: node.tag,
			attrs: {}
		};
		if (node.attrs) {
			for (let attr in node.attrs) {
				const value = node.attrs[attr];

				if (value.index !== undefined) {
					vNode.attrs[attr] = getValueWithIndex(item, value.index);
				} else {
					vNode.attrs[attr] = value;
				}
			}
		}
		if (node.children && depth < maxDepth) {
			vNode.children = constructVirtualChildren(node.children, item, depth + 1, maxDepth);
		}
	} else if (node && typeof node.tag.index !== undefined) {
		const Component = getValueWithIndex(item, node.tag.index);

		if (typeof Component === 'function') {
			const props = {};

			if (node.attrs) {
				for (let attr in node.attrs) {
					const value = node.attrs[attr];

					if (value.index !== undefined) {
						props[attr] = getValueWithIndex(item, value.index);
					} else {
						props[attr] = value;
					}
				}
			}
			// stateless
			if (!Component.prototype.render) {
				return Component(props).tree.test.create(item, depth + 1, maxDepth);
			} else {
				const instance = new Component(props);

				instance.componentWillMount();
				const render = instance.render().tree.test.create(item, depth + 1, maxDepth);

				instance.componentDidMount();
				return render;
			}
		}
	}
	return vNode;
}

export default function createTree(schema, isRoot, dynamicNodes) {
	return {
		create(item, maxDepth) {
			return constructVirtualNode(schema, item, 0, maxDepth);
		}
	};
}
