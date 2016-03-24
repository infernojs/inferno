import { isArray, isStringOrNumber, isNullOrUndefined, isInvalidNode } from '../core/utils';

function renderChildren(children) {
	if (children && isArray(children)) {
		const childrenResult = [];
		let insertComment = false;

		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (isStringOrNumber(child)) {
				if (insertComment === true) {
					childrenResult.push('<!-- -->');
				}
				childrenResult.push(child);
				insertComment = true;
			} else {
				insertComment = false;
				childrenResult.push(renderNode(child));
			}
		}
		return childrenResult.join('');
	} else if (!isInvalidNode(children)) {
		if (isStringOrNumber(children)) {
			return children;
		} else {
			return renderNode(children);
		}
	}
}

function renderNode(node) {
	if (!isInvalidNode(node)) {
		const tag = node.tag;
		const outputAttrs = [];

		if (!isNullOrUndefined(node.className)) {
			outputAttrs.push('class="' + node.className + '"');
		}
		const attrs = node.attrs;

		if (!isNullOrUndefined(attrs)) {
			const attrsKeys = Object.keys(attrs);

			attrsKeys.forEach((attrsKey, i) => {
				const attr = attrsKeys[i];

				outputAttrs.push(attr + '="' + attrs[attr] + '"');
			});
		}

		return `<${ tag }${ outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '' }>${ renderChildren(node.children) || '' }</${ tag }>`;
	}
}

export default function renderToString(node) {
	return renderNode(node);
}
