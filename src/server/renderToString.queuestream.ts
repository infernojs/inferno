import { EMPTY_OBJ } from 'inferno';
import { Readable } from 'stream';
import {
	copyPropsTo,
} from '../core/normalization';
import { isUnitlessNumber } from '../DOM/constants';
import {
	isArray,
	isFunction,
	isInvalid,
	isNull,
	isNullOrUndef,
	isNumber,
	isStringOrNumber,
	isTrue,
	throwError,
} from '../shared';
import {
	escapeText,
	isVoidElement as _isVoidElement,
	toHyphenCase,
} from './utils';

function renderStylesToString(styles) {
	if (isStringOrNumber(styles)) {
		return styles;
	} else {
		let renderedString = '';

		for (const styleName in styles) {
			const value = styles[styleName];
			const px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';

			if (!isNullOrUndef(value)) {
				renderedString += `${ toHyphenCase(styleName) }:${ escapeText(value) }${ px };`;
			}
		}
		return renderedString;
	}
}

export class RenderQueueStream extends Readable {

	initNode: any;
	staticMarkup: any;
	started: boolean = false;
	collector: any[] = [ Infinity ]; // Infinity marks the end of the stream
	promises: any[] = [];

	constructor(initNode, staticMarkup) {
		super();
		this.initNode = initNode;
		this.staticMarkup = staticMarkup;
	}

	_read() {
		if (this.started) { return; }
		this.started = true;
		this.renderVNodeToQueue(this.initNode, null, this.staticMarkup, null);
	}

	addToQueue(node, position) {
		// Positioning defined, stack it
		if (!isNullOrUndef(position)) {
			this.promises[position].push(node);
		// Collector is empty push to stream
		} else if (
			typeof node === 'string' &&
			(this.collector.length) - 1 === 0
		) {
			this.push(node);
		// Last element in collector and incoming are same then concat
		} else if (
			typeof node === 'string' &&
			typeof this.collector[this.collector.length - 2] === 'string'
		) {
			this.collector[this.collector.length - 2] += node;
		// Push the element to collector (before Infinity)
		} else {
			this.collector.splice(-1, 0, node);
		}
		setTimeout(this.pushQueue.bind(this), 0);
	}

	pushQueue() {
		const chunk = this.collector[0];
		// Output strings directly
		if (typeof chunk === 'string') {
			this.push(chunk);
			this.collector.shift();
			if (this.collector.length !== 0) {
				setTimeout(this.pushQueue.bind(this), 0);
			}
		// For fulfilled promises, merge into collector
		} else if (
			!! chunk &&
			(typeof chunk === 'object' || isFunction(chunk)) &&
			isFunction(chunk.then)
		) {
			const self = this;
			chunk.then(
				(index) => {
					self.collector.splice(0, 1, ...self.promises[index]);
					self.promises[index] = null;
					setTimeout(self.pushQueue.bind(self), 0);
				},
			);
			this.collector[0] = null;
		// End of content
		} else if (chunk === Infinity) {
			this.emit('end');
		}
	}

	renderVNodeToQueue(vNode, context, firstChild, position) {

		const flags = vNode.flags;
		const type = vNode.type;
		const props = vNode.props || EMPTY_OBJ;
		const children = vNode.children;

		// Handles a component render
		if (flags & VNodeFlags.Component) {
			const isClass = flags & VNodeFlags.ComponentClass;
			// Primitive node doesn't have defaultProps, only Component
			if (!isNullOrUndef(type.defaultProps)) {
				copyPropsTo(type.defaultProps, props);
				vNode.props = props;
			}
			// If a stateful component
			if (isClass) {
				const instance = new type(props, context);
				const childContext = instance.getChildContext();
				if (!isNullOrUndef(childContext)) {
					context = Object.assign({}, context, childContext);
				}
				if (instance.props === EMPTY_OBJ) {
					instance.props = props;
				}
				instance.context = context;
				instance._pendingSetState = true;
				instance._unmounted = false;
				// Capture a promise, else continue
				if (isFunction(instance.componentWillMount)) {
					const self = this;
					let mountValue = instance.componentWillMount();
					// Check if the return value is a promise
					if (!isNullOrUndef(mountValue)) {
						const promisePosition = this.promises.push([]) - 1;
						this.addToQueue(
							mountValue.then((dataForContext) => {
								instance._pendingSetState = false;
								if (!isNullOrUndef(dataForContext)) {
									instance.context = Object.assign({},
										instance.context,
										dataForContext,
									);
								}
								self.renderVNodeToQueue(
									instance.render(props, instance.context),
									instance.context,
									true,
									promisePosition,
								);
								setTimeout(self.pushQueue.bind(self), 0);
								return promisePosition;
							}),
							position,
						);
						return;
					}
				}
				const nextVNode = instance.render(props, vNode.context);
				instance._pendingSetState = false;
				// In case render returns invalid stuff
				if (isInvalid(nextVNode)) {
					this.addToQueue('<!--!-->', position);
				}
				this.renderVNodeToQueue(nextVNode, context, true, position);
			} else {
				const nextVNode = type(props, context);
				if (isInvalid(nextVNode)) {
					this.addToQueue('<!--!-->', position);
				}
				this.renderVNodeToQueue(nextVNode, context, true, position);
			}
		// If an element
		} else if (flags & VNodeFlags.Element) {

			let renderedString = `<${ type }`;
			let html;
			const isVoidElement = _isVoidElement(type);

			if (!isNull(props)) {
				for (const prop in props) {
					const value = props[prop];
					if (prop === 'dangerouslySetInnerHTML') {
						html = value.__html;
					} else if (prop === 'style') {
						renderedString += ` style="${ renderStylesToString(props.style) }"`;
					} else if (prop === 'className' && !isNullOrUndef(value)) {
						renderedString += ` class="${ escapeText(value) }"`;
					} else {
						if (isStringOrNumber(value)) {
							renderedString += ` ${ prop }="${ escapeText(value) }"`;
						} else if (isTrue(value)) {
							renderedString += ` ${ prop }`;
						}
					}
				}
			}
			// If voided element, push to queue
			if (isVoidElement) {
				this.addToQueue(renderedString + `>`, position);
			} else {
				renderedString += `>`;
				if (!isInvalid(children)) {
					if (isArray(children)) {
						this.addToQueue(renderedString, position);
						renderedString = '';
						for (let i = 0; i < children.length; i++) {
							const child = children[i];
							if (isStringOrNumber(child)) {
								this.addToQueue(escapeText(children), position);
							} else if (!isInvalid(child)) {
								this.renderVNodeToQueue(child, context, i === 0, position);
							}
						}
					} else if (isStringOrNumber(children)) {
						this.addToQueue(renderedString + escapeText(children) + '</' + type + '>', position);
						return;
					} else {
						this.addToQueue(renderedString, position);
						this.renderVNodeToQueue(children, context, true, position);
						this.addToQueue('</' + type + '>', position);
						return;
					}
				} else if (html) {
					this.addToQueue(renderedString + html + '</' + type + '>', position);
					return;
				}
				if (!isVoidElement) {
					this.addToQueue(renderedString + '</' + type + '>', position);
				}
			}
		// Push text directly to queue
		} else if (flags & VNodeFlags.Text) {
			this.addToQueue((firstChild ? '' : '<!---->') + escapeText(children), position);
		// Handle errors
		} else {
			if (process.env.NODE_ENV !== 'production') {
				if (typeof vNode === 'object') {
					throwError(`renderToString() received an object that's not a valid VNode, you should stringify it first. Object: "${ JSON.stringify(vNode) }".`);
				} else {
					throwError(`renderToString() expects a valid VNode, instead it received an object with the type "${ typeof vNode }".`);
				}
			}
			throwError();
		}
	}

};

export default function streamAsString(node) {
	return new RenderQueueStream(node, false);
}

export function streamAsStaticMarkup(node) {
	return new RenderQueueStream(node, true);
}
