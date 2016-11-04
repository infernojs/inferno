import {
	isArray,
	isStringOrNumber,
	isNullOrUndef,
	isInvalid,
	isNumber,
	isTrue,
	throwError
} from './../shared';
import { isUnitlessNumber } from '../DOM/constants';
import {
	toHyphenCase,
	escapeText,
	escapeAttr,
	isVoidElement
} from './utils';
import {
	VNodeFlags,
	isVNode
} from '../core/shapes';

function renderComponentToString(vComponent, isRoot, context, isClass) {
	const type = vComponent.type;
	const props = vComponent.props;

	if (isClass) {
		const instance = new type(props);
		const childContext = instance.getChildContext();

		if (!isNullOrUndef(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance.context = context;
		// Block setting state - we should render only once, using latest state
		instance._pendingSetState = true;
		instance.componentWillMount();
		const node = instance.render(props, vComponent.context);

		instance._pendingSetState = false;
		return renderVNodeToString(node, context, isRoot);
	} else {
		return renderVNodeToString(type(props, context), context, isRoot);
	}
}

function renderChildrenToString(children, context): string {
	if (children && isArray(children)) {
		const childrenResult: Array<string> = [];
		let insertComment = false;

		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			const isText = isStringOrNumber(child);

			if (isInvalid(child)) {
				childrenResult.push('<!--!-->');
			} else if (isText) {
				if (insertComment) {
					childrenResult.push('<!---->');
				}
				if (isText) {
					childrenResult.push(escapeText(child));
				}
				insertComment = true;
			} else if (isArray(child)) {
				childrenResult.push('<!---->');
				childrenResult.push(renderChildrenToString(child, context));
				childrenResult.push('<!--!-->');
				insertComment = true;
			} else if (isVNode(child)) {
				if (child.flags & VNodeFlags.Text) {
					if (insertComment) {
						childrenResult.push('<!---->');
					}
					insertComment = true;
				} else {
					insertComment = false;
				}
				childrenResult.push(renderVNodeToString(child, context, false));
			}
		}
		return childrenResult.join('');
	} else if (!isInvalid(children)) {
		if (isStringOrNumber(children)) {
			return escapeText(children);
		} else {
			return renderVNodeToString(children, context, false) || '';
		}
	}
	return '';
}

function renderStyleToString(style) {
	if (isStringOrNumber(style)) {
		return style;
	} else {
		const styles: Array<string> = [];
		const keys = Object.keys(style);

		for (let i = 0; i < keys.length; i++) {
			const styleName = keys[i];
			const value = style[styleName];
			const px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';

			if (!isNullOrUndef(value)) {
				styles.push(`${ toHyphenCase(styleName) }:${ escapeAttr(value) }${ px };`);
			}
		}
		return styles.join('');
	}
}

function renderElementToString(vNode, isRoot, context) {
	const tag = vNode.type;
	const outputProps: Array<string> = [];
	const props = vNode.props;
	let html = '';

	for (let prop in props) {
		const value = props[prop];

		if (prop === 'dangerouslySetInnerHTML') {
			html = value.__html;
		} else if (prop === 'style') {
			outputProps.push('style="' + renderStyleToString(props.style) + '"');
		} else if (prop === 'className') {
			outputProps.push('class="' + value + '"');
		} else {
			if (isStringOrNumber(value)) {
				outputProps.push(escapeAttr(prop) + '="' + escapeAttr(value) + '"');
			} else if (isTrue(value)) {
				outputProps.push(escapeAttr(prop));
			}
		}
	}
	if (isRoot) {
		outputProps.push('data-infernoroot');
	}
	if (isVoidElement(tag)) {
		return `<${ tag }${ outputProps.length > 0 ? ' ' + outputProps.join(' ') : '' }>`;
	} else {
		const content = html || renderChildrenToString(vNode.children, context);
		return `<${ tag }${ outputProps.length > 0 ? ' ' + outputProps.join(' ') : '' }>${ content }</${ tag }>`;
	}
}

function renderTextToString(vNode, context, isRoot) {
	return escapeText(vNode.children);
}

function renderVNodeToString(vNode, context, isRoot) {
	const flags = vNode.flags;

	if (flags & VNodeFlags.Component) {
		return renderComponentToString(vNode, isRoot, context, flags & VNodeFlags.ComponentClass);
	} else if (flags & VNodeFlags.Element) {
		return renderElementToString(vNode, isRoot, context);
	} else if (flags & VNodeFlags.Text) {
		return renderTextToString(vNode, isRoot, context);
	} else {
		throwError(`renderVNodeToString() expects a valid VNode, instead it received an object with the type "${ typeof vNode }".`);
	}
}

export default function renderToString(input) {
	return renderVNodeToString(input, null, true);
}

export function renderToStaticMarkup(input) {
	return renderVNodeToString(input, null, false);
}
