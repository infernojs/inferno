import isVoid from '../util/isVoid';
import isArray from '../util/isArray';
import replaceChild from '../core/replaceChild';

export default function addShapeChildren(domNode, subTreeForChildren, item, treeLifecycle, context) {

	if (!isVoid(subTreeForChildren)) {
		if (isArray(subTreeForChildren)) {
			for (let i = 0; i < subTreeForChildren.length; i++) {
				const subTree = subTreeForChildren[i];
				const childNode = subTree.create(item, treeLifecycle, context);
				if (!isVoid(childNode)) {
					domNode.appendChild(childNode);
				}
			}
		} else if (typeof subTreeForChildren === 'object') {
			const childNode = subTreeForChildren.create(item, treeLifecycle, context);

			replaceChild(domNode, childNode);
		}
	}
}