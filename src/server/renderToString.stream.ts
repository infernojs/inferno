import {
	isArray,
	isStringOrNumber,
	isNullOrUndef,
	isInvalid,
	isStatefulComponent
} from './../shared';
import {
	escapeText,
	escapeAttr,
	isVoidElement
} from './utils';
import { Readable } from 'stream';
import {
	ELEMENT,
	COMPONENT
} from '../core/NodeTypes';
import {
	renderStyleToString,
	renderAttributes
} from './prop-renderers';

export class RenderStream extends Readable {
	initNode: any;
	staticMarkup: any;
	started: boolean = false;

	constructor(initNode, staticMarkup) {
		super();
		this.initNode = initNode;
		this.staticMarkup = staticMarkup;
	}

	_read() {
		if (this.started) {
			return;
		}
		this.started = true;

		Promise.resolve().then(() => {
			return this.renderNode(this.initNode, null, this.staticMarkup);
		}).then(() => {
			this.push(null);
		}).catch((err) => {
			this.emit('error', err);
		});
	}

	renderNode(node, context, isRoot) {
		if (isInvalid(node)) {
			return;
		} else if (node.nodeType === COMPONENT) {
			return this.renderComponent(node, isRoot, context);
		} else if (node.nodeType === ELEMENT) {
			return this.renderNative(node, isRoot, context);
		}
	}

	renderComponent(vComponent, isRoot, context) {
		const type = vComponent.type;
		const props = vComponent.props;

		if (!isStatefulComponent(vComponent)) {
			return this.renderNode(type(props), context, isRoot);
		}

		const instance = new type(props);
		const childContext = instance.getChildContext();

		if (!isNullOrUndef(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance.context = context;

		// Block setting state - we should render only once, using latest state
		instance._pendingSetState = true;
		return Promise.resolve(instance.componentWillMount()).then(() => {
			const node = instance.render();
			instance._pendingSetState = false;
			return this.renderNode(node, context, isRoot);
		});
	}

	renderChildren(children: any, context?: any) {
		if (isStringOrNumber(children)) {
			return this.push(escapeText(children));
		}
		if (!children) {
			return;
		}

		const childrenIsArray = isArray(children);
		if (!childrenIsArray && !isInvalid(children)) {
			return this.renderNode(children, context, false);
		}
		if (!childrenIsArray) {
			throw new Error('invalid component');
		}
		return children.reduce((p, child) => {
			return p.then((insertComment) => {
				const isText = isStringOrNumber(child);
				const childIsInvalid = isInvalid(child);

				if (isText || childIsInvalid) {
					if (insertComment === true) {
						if (childIsInvalid) {
							this.push('<!--!-->');
						} else {
							this.push('<!---->');
						}
					}
					if (isText) {
						this.push(escapeText(child));
					}
					return true;
				} else if (isArray(child)) {
					this.push('<!---->');
					return Promise.resolve(this.renderChildren(child)).then(() => {
						this.push('<!--!-->');
						return true;
					});
				} else {
					return this.renderNode(child, context, false)
						.then(function () {
							return false;
						});
				}
			});
		}, Promise.resolve(false));
	}

	renderNative(vElement, isRoot, context) {
		const tag = vElement.tag;
		const props = vElement.props;

		const outputAttrs = renderAttributes(props);

		let html = '';
		if (props) {
			const className = props.className;
			if (className) {
				outputAttrs.push('class="' + escapeAttr(className) + '"');
			}

			const style = props.style;
			if (style) {
				outputAttrs.push('style="' + renderStyleToString(style) + '"');
			}

			if (props.dangerouslySetInnerHTML) {
				html = props.dangerouslySetInnerHTML.__html;
			}
		}

		if (isRoot) {
			outputAttrs.push('data-infernoroot');
		}
		this.push(`<${tag}${outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : ''}>`);
		if (isVoidElement(tag)) {
			return;
		}
		if (html) {
			this.push(html);
			this.push(`</${tag}>`);
			return;
		}
		return Promise.resolve(this.renderChildren(vElement.children, context)).then(() => {
			this.push(`</${tag}>`);
		});
	}
}

export default function streamAsString(node) {
	return new RenderStream(node, false);
}

export function streamAsStaticMarkup(node) {
	return new RenderStream(node, true);
}
