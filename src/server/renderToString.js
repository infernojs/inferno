import { isArray, isStringOrNumber, isNullOrUndefined } from '../core/utils';

function renderChildren(children) {
	if (children && isArray(children)) {
		const childrenResult = [];

		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (isStringOrNumber(child)) {
				childrenResult.push(child);
			} else {
				childrenResult.push(renderNode(child));
			}
		}
		return childrenResult.join('')
	} else if (!isNullOrUndefined(children)) {
		if (isStringOrNumber(children)) {
			return children;
		} else {
			return renderNode(children);
		}
	}
}

function renderNode(node) {
	if (!isNullOrUndefined(node)) {
		const tag = node.tag;

		return `<${ tag }>${ renderChildren(node.children) || '' }</${ tag }>`;
	}
}

export default function renderToString(node) {
	return renderNode(node);
}