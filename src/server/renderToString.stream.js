import {
	isArray,
	isStringOrNumber,
	isNullOrUndefined,
	isInvalidNode,
	isFunction,
	addChildrenToProps,
	isStatefulComponent,
	isNumber,
	isTrue
} from './../core/utils';
import { isUnitlessNumber } from '../DOM/utils';
import { toHyphenCase, escapeText, escapeAttr, isVoidElement } from './utils';
import { Readable } from 'stream';
import { renderStyleToString, renderAttributes } from './prop-renderers';

export class RenderStream extends Readable {
	constructor(initNode, staticMarkup) {
		super();
		this.initNode = initNode;
		this.staticMarkup = staticMarkup;
		this.started = false;
	}

	_read(){
		if (this.started) {
			return;
		}
		this.started = true;

		Promise.resolve().then(() =>{
			return this.renderNode(this.initNode, null, this.staticMarkup);
		}).then(()=>{
			this.push(null);
		}).catch((err) =>{
			this.emit('error', err);
		});
	}

	renderNode(node, context, isRoot){
		if (isInvalidNode(node)) {
			return;
		}

		const bp = node.bp;
		const tag = node.tag || (bp && bp.tag);

		if (isFunction(tag)) {
			return this.renderComponent(tag, node.attrs, node.children, context, isRoot);
		} else {
			return this.renderNative(tag, node, context, isRoot);
		}
	}
	renderComponent(Component, props, children, context, isRoot) {
		props = addChildrenToProps(children, props);

		if (!isStatefulComponent(Component)) {
			return this.renderNode(Component(props, context), context, isRoot);
		}

		const instance = new Component(props, context);
		const childContext = instance.getChildContext();

		if (!isNullOrUndefined(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance.context = context;

		// Block setting state - we should render only once, using latest state
		instance._pendingSetState = true;
		return Promise.resolve(instance.componentWillMount()).then(() =>{
			const node = instance.render();
			instance._pendingSetState = false;
			return this.renderNode(node, context, isRoot);
		});
	}

	renderChildren(children, context){
		if (isStringOrNumber(children)) {
			return this.push(escapeText(children));
		}
		if (!children) {
			return;
		}

		const childrenIsArray = isArray(children);
		if (!childrenIsArray && !isInvalidNode(children)) {
			return this.renderNode(children, context, false);
		}
		if (!childrenIsArray) {
			throw new Error('invalid component');
		}
		return children.reduce((p, child)=> {
			return p.then((insertComment)=>{
				const isText = isStringOrNumber(child);
				const isInvalid = isInvalidNode(child);

				if (isText || isInvalid) {
					if (insertComment === true) {
						if (isInvalid) {
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
					return Promise.resolve(this.renderChildren(child)).then(()=>{
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

	renderNative(tag, node, context, isRoot) {
		const bp = node.bp;
		const attrs = node.attrs;
		const className = node.className;
		const style = node.style;

		const outputAttrs = renderAttributes(bp, attrs);
		if (!isNullOrUndefined(className)) {
			outputAttrs.push('class="' + escapeAttr(className) + '"');
		}
		if (!isNullOrUndefined(style)) {
			outputAttrs.push('style="' + renderStyleToString(style) + '"');
		}

		let html = '';

		if (attrs && 'dangerouslySetInnerHTML' in attrs) {
			html = attrs[ 'dangerouslySetInnerHTML' ].__html;
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
		return Promise.resolve(this.renderChildren(node.children, context)).then(()=>{
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
