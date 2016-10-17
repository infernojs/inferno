import {
	isArray,
	isStringOrNumber,
	isNullOrUndef,
	isInvalid,
	isStatefulComponent,
	isNumber,
	isTrue
} from './../shared';
import { isUnitlessNumber } from '../DOM/constants';
import {
	toHyphenCase,
	escapeText,
	escapeAttr,
	isVoidElement
} from './utils';
import {
	isVElement,
	isVComponent,
	isOptVElement
} from './../core/shapes';
import { convertVOptElementToVElement } from '../factories/cloneVNode';

function renderComponentToString(vComponent, isRoot, context) {
	const Component = vComponent.component;
	const props = vComponent.props;

	if (isStatefulComponent(vComponent)) {
		const instance = new Component(props);
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
		return renderInputToString(node, context, isRoot);
	} else {
		return renderInputToString(Component(props, context), context, isRoot);
	}
}

function renderChildren(children, context): string {
	if (children && isArray(children)) {
		let childrenResult: string = '';
		let insertComment: boolean = false;

		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			const isText = isStringOrNumber(child);

			if (isInvalid(child)) {
				childrenResult += '<!--!-->';
			} else if (isText) {
				if (insertComment) {
					childrenResult += '<!---->';
				}
				if (isText) {
					childrenResult += escapeText(child);
				}
				insertComment = true;
			} else if (isArray(child)) {
				childrenResult += '<!---->';
				childrenResult += renderChildren(child, context);
				childrenResult += '<!--!-->';
				insertComment = true;
			} else {
				insertComment = false;
				childrenResult += renderInputToString(child, context, false);
			}
		}
		return childrenResult;
	} else if (!isInvalid(children)) {
		if (isStringOrNumber(children)) {
			return escapeText(children);
		} else {
			return renderInputToString(children, context, false) || '';
		}
	}
	return '';
}

function renderStyleToString(style) {
	if (isStringOrNumber(style)) {
		return style;
	} else {
		let styles: string = '';
		const keys = Object.keys(style);

		for (let i = 0; i < keys.length; i++) {
			const styleName = keys[i];
			const value = style[styleName];
			const px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';

			if (!isNullOrUndef(value)) {
				styles += `${ toHyphenCase(styleName) }:${ escapeAttr(value) }${ px };`;
			}
		}
		return styles;
	}
}

function renderVElementToString(vElement, isRoot, context) {
	const tag = vElement.tag;
	const props = vElement.props;
	let outputProps: string = '';
	let propsKeys = (props && Object.keys(props)) || [];
	let html = '';

	for (let i = 0; i < propsKeys.length; i++) {
		const prop = propsKeys[i];
		const value = props[prop];

		if (prop === 'dangerouslySetInnerHTML') {
			html = value.__html;
		} else if (prop === 'style') {
			outputProps += 'style="' + renderStyleToString(props.style) + '"';
		} else if (prop === 'className') {
			outputProps += 'class="' + value + '"';
		} else {
			if (isStringOrNumber(value)) {
				outputProps += escapeAttr(prop) + '="' + escapeAttr(value) + '"';
			} else if (isTrue(value)) {
				outputProps += escapeAttr(prop);
			}
		}
	}
	if (isRoot) {
		outputProps += 'data-infernoroot';
	}
	if (isVoidElement(tag)) {
		return `<${ tag }${ outputProps.length > 0 ? ' ' + outputProps : '' }>`;
	} else {
		return `<${ tag }${ outputProps.length > 0 ? ' ' + outputProps : '' }>${ html || renderChildren(vElement.children, context) }</${ tag }>`;
	}
}

function renderOptVElementToString(optVElement, isRoot, context) {
	return renderInputToString(convertVOptElementToVElement(optVElement), context, isRoot);
}

function renderInputToString(input, context, isRoot) {
	if (!isInvalid(input)) {
		if (isOptVElement(input)) {
			return renderOptVElementToString(input, isRoot, context);
		} else if (isVElement(input)) {
			return renderVElementToString(input, isRoot, context);
		} else if (isVComponent(input)) {
			return renderComponentToString(input, isRoot, context);
		}
	}
	throw Error('Inferno Error: Bad input argument called on renderInputToString(). Input argument may need normalising.');
}

export default function renderToString(input) {
	return renderInputToString(input, null, true);
}

export function renderToStaticMarkup(input) {
	return renderInputToString(input, null, false);
}
