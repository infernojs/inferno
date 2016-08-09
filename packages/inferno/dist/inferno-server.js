/*!
 * inferno-server v0.7.25
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('stream')) :
	typeof define === 'function' && define.amd ? define(['stream'], factory) :
	(global.InfernoServer = factory(global.stream));
}(this, function (stream) { 'use strict';

	function addChildrenToProps(children, props) {
		if (!isNullOrUndefined(children)) {
			var isChildrenArray = isArray(children);
			if (isChildrenArray && children.length > 0 || !isChildrenArray) {
				if (props) {
					props = Object.assign({}, props, { children: children });
				} else {
					props = {
						children: children
					};
				}
			}
		}
		return props;
	}

	// Runs only once in applications lifetime
	var isBrowser = typeof window !== 'undefined' && window.document;

	function isArray(obj) {
		return obj instanceof Array;
	}

	function isStatefulComponent(obj) {
		return obj.prototype && obj.prototype.render !== undefined;
	}

	function isStringOrNumber(obj) {
		return isString(obj) || isNumber(obj);
	}

	function isNullOrUndefined(obj) {
		return isUndefined(obj) || isNull(obj);
	}

	function isInvalidNode(obj) {
		return isNull(obj) || obj === false || obj === true || isUndefined(obj);
	}

	function isFunction(obj) {
		return typeof obj === 'function';
	}

	function isString(obj) {
		return typeof obj === 'string';
	}

	function isNumber(obj) {
		return typeof obj === 'number';
	}

	function isNull(obj) {
		return obj === null;
	}

	function isTrue$1(obj) {
		return obj === true;
	}

	function isUndefined(obj) {
		return obj === undefined;
	}

	var screenWidth = isBrowser && window.screen.width;
	var screenHeight = isBrowser && window.screen.height;
	var scrollX = 0;
	var scrollY = 0;
	var lastScrollTime = 0;

	if (isBrowser) {
		window.onscroll = function () {
			scrollX = window.scrollX;
			scrollY = window.scrollY;
			lastScrollTime = performance.now();
		};

		window.resize = function () {
			scrollX = window.scrollX;
			scrollY = window.scrollY;
			screenWidth = window.screen.width;
			screenHeight = window.screen.height;
			lastScrollTime = performance.now();
		};
	}

	var documetBody = isBrowser ? document.body : null;

	function constructDefaults(string, object, value) {
		/* eslint no-return-assign: 0 */
		string.split(',').forEach(function (i) { return object[i] = value; });
	}

	var xlinkNS = 'http://www.w3.org/1999/xlink';
	var xmlNS = 'http://www.w3.org/XML/1998/namespace';
	var strictProps = {};
	var booleanProps = {};
	var namespaces = {};
	var isUnitlessNumber = {};

	constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
	constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
	constructDefaults('volume,value', strictProps, true);
	constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
	constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);

	function escapeText(str) {
		return (str + '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;')
			.replace(/\//g, '&#x2F;');
	}

	function escapeAttr(str) {
		return (str + '')
			.replace(/&/g, '&amp;')
	        .replace(/"/g, '&quot;');
	}

	function toHyphenCase(str) {
		return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
	}

	var voidElements = {
		area: true,
		base: true,
		br: true,
		col: true,
		command: true,
		embed: true,
		hr: true,
		img: true,
		input: true,
		keygen: true,
		link: true,
		meta: true,
		param: true,
		source: true,
		track: true,
		wbr: true
	};

	function isVoidElement(str) {
		return !!voidElements[str];
	}

	function renderComponent(Component, props, children, context, isRoot) {
		props = addChildrenToProps(children, props);

		if (isStatefulComponent(Component)) {
			var instance = new Component(props, context);
			var childContext = instance.getChildContext();

			if (!isNullOrUndefined(childContext)) {
				context = Object.assign({}, context, childContext);
			}
			instance.context = context;
			// Block setting state - we should render only once, using latest state
			instance._pendingSetState = true;
			instance.componentWillMount();
			var node = instance.render();

			instance._pendingSetState = false;
			return renderNode(node, context, isRoot);
		} else {
			return renderNode(Component(props, context), context, isRoot);
		}
	}

	function renderChildren(children, context) {
		if (children && isArray(children)) {
			var childrenResult = [];
			var insertComment = false;

			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				var isText = isStringOrNumber(child);
				var isInvalid = isInvalidNode(child);

				if (isText || isInvalid) {
					if (insertComment === true) {
						if (isInvalidNode(child)) {
							childrenResult.push('<!--!-->');
						} else {
							childrenResult.push('<!---->');
						}
					}
					if (isText) {
						childrenResult.push(escapeText(child));
					}
					insertComment = true;
				} else if (isArray(child)) {
					childrenResult.push('<!---->');
					childrenResult.push(renderChildren(child));
					childrenResult.push('<!--!-->');
					insertComment = true;
				} else {
					insertComment = false;
					childrenResult.push(renderNode(child, context, false));
				}
			}
			return childrenResult.join('');
		} else if (!isInvalidNode(children)) {
			if (isStringOrNumber(children)) {
				return escapeText(children);
			} else {
				return renderNode(children, context, false) || '';
			}
		}
		return '';
	}

	function renderStyleToString(style) {
		if (isStringOrNumber(style)) {
			return style;
		} else {
			var styles = [];
			var keys = Object.keys(style);

			for (var i = 0; i < keys.length; i++) {
				var styleName = keys[i];
				var value = style[styleName];
				var px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';

				if (!isNullOrUndefined(value)) {
					styles.push(((toHyphenCase(styleName)) + ":" + (escapeAttr(value)) + px + ";"));
				}
			}
			return styles.join();
		}
	}

	function renderNode(node, context, isRoot) {
		if (!isInvalidNode(node)) {
			var bp = node.bp;
			var tag = node.tag || (bp && bp.tag);
			var outputAttrs = [];
			var className = node.className;
			var style = node.style;

			if (isFunction(tag)) {
				return renderComponent(tag, node.attrs, node.children, context, isRoot);
			}
			if (!isNullOrUndefined(className)) {
				outputAttrs.push('class="' + escapeAttr(className) + '"');
			}
			if (!isNullOrUndefined(style)) {
				outputAttrs.push('style="' + renderStyleToString(style) + '"');
			}
			var attrs = node.attrs;
			var attrKeys = (attrs && Object.keys(attrs)) || [];
			var html = '';

			if (bp && bp.hasAttrs === true) {
				attrKeys = bp.attrKeys ? bp.attrKeys.concat(attrKeys) : attrKeys;
			}
			attrKeys.forEach(function (attrsKey, i) {
				var attr = attrKeys[i];
				var value = attrs[attr];

				if (attr === 'dangerouslySetInnerHTML') {
					html = value.__html;
				} else {
					if (isStringOrNumber(value)) {
						outputAttrs.push(escapeAttr(attr) + '="' + escapeAttr(value) + '"');
					} else if (isTrue$1(value)) {
						outputAttrs.push(escapeAttr(attr));
					}
				}
			});

			if (isRoot) {
				outputAttrs.push('data-infernoroot');
			}
			if (isVoidElement(tag)) {
				return ("<" + tag + (outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '') + ">");
			} else {
				return ("<" + tag + (outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '') + ">" + (html || renderChildren(node.children, context)) + "</" + tag + ">");
			}
		}
	}

	function renderToString(node) {
		return renderNode(node, null, false);
	}

	function renderToStaticMarkup(node) {
		return renderNode(node, null, true);
	}

	function renderStyleToString$1(style) {
		if (isStringOrNumber(style)) {
			return style;
		} else {
			var styles = [];
			var keys = Object.keys(style);

			for (var i = 0; i < keys.length; i++) {
				var styleName = keys[i];
				var value = style[styleName];
				var px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';

				if (!isNullOrUndefined(value)) {
					styles.push(((toHyphenCase(styleName)) + ":" + (escapeAttr(value)) + px + ";"));
				}
			}
			return styles.join();
		}
	}

	function renderAttributes(bp, attrs){
		var outputAttrs = [];
		var attrKeys = (attrs && Object.keys(attrs)) || [];
		var html = '';

		if (bp && bp.hasAttrs === true) {
			attrKeys = bp.attrKeys ? bp.attrKeys.concat(attrKeys) : attrKeys;
		}
		attrKeys.forEach(function (attrsKey, i) {
			var attr = attrKeys[i];
			var value = attrs[attr];

			if (attr === 'dangerouslySetInnerHTML') {
				return;
			} else {
				if (isStringOrNumber(value)) {
					outputAttrs.push(escapeAttr(attr) + '="' + escapeAttr(value) + '"');
				} else if (isTrue(value)) {
					outputAttrs.push(escapeAttr(attr));
				}
			}
		});

		return outputAttrs;
	}

	var RenderStream = (function (Readable) {
		function RenderStream(initNode, staticMarkup) {
			Readable.call(this);
			this.initNode = initNode;
			this.staticMarkup = staticMarkup;
			this.started = false;
		}

		if ( Readable ) RenderStream.__proto__ = Readable;
		RenderStream.prototype = Object.create( Readable && Readable.prototype );
		RenderStream.prototype.constructor = RenderStream;

		RenderStream.prototype._read = function _read (){
			var this$1 = this;

			if (this.started) {
				return;
			}
			this.started = true;

			Promise.resolve().then(function () {
				return this$1.renderNode(this$1.initNode, null, this$1.staticMarkup);
			}).then(function (){
				this$1.push(null);
			}).catch(function (err) {
				this$1.emit('error', err);
			});
		};

		RenderStream.prototype.renderNode = function renderNode (node, context, isRoot){
			if (isInvalidNode(node)) {
				return;
			}

			var bp = node.bp;
			var tag = node.tag || (bp && bp.tag);

			if (isFunction(tag)) {
				return this.renderComponent(tag, node.attrs, node.children, context, isRoot);
			} else {
				return this.renderNative(tag, node, context, isRoot);
			}
		};
		RenderStream.prototype.renderComponent = function renderComponent (Component, props, children, context, isRoot) {
			var this$1 = this;

			props = addChildrenToProps(children, props);

			if (!isStatefulComponent(Component)) {
				return this.renderNode(Component(props, context), context, isRoot);
			}

			var instance = new Component(props, context);
			var childContext = instance.getChildContext();

			if (!isNullOrUndefined(childContext)) {
				context = Object.assign({}, context, childContext);
			}
			instance.context = context;

			// Block setting state - we should render only once, using latest state
			instance._pendingSetState = true;
			return Promise.resolve(instance.componentWillMount()).then(function () {
				var node = instance.render();
				instance._pendingSetState = false;
				return this$1.renderNode(node, context, isRoot);
			});
		};

		RenderStream.prototype.renderChildren = function renderChildren (children, context){
			var this$1 = this;

			if (isStringOrNumber(children)) {
				return this.push(escapeText(children));
			}
			if (!children) {
				return;
			}

			var childrenIsArray = isArray(children);
			if (!childrenIsArray && !isInvalidNode(children)) {
				return this.renderNode(children, context, false);
			}
			if (!childrenIsArray) {
				throw new Error('invalid component');
			}
			return children.reduce(function (p, child){
				return p.then(function (insertComment){
					var isText = isStringOrNumber(child);
					var isInvalid = isInvalidNode(child);

					if (isText || isInvalid) {
						if (insertComment === true) {
							if (isInvalid) {
								this$1.push('<!--!-->');
							} else {
								this$1.push('<!---->');
							}
						}
						if (isText) {
							this$1.push(escapeText(child));
						}
						return true;
					} else if (isArray(child)) {
						this$1.push('<!---->');
						return Promise.resolve(this$1.renderChildren(child)).then(function (){
							this$1.push('<!--!-->');
							return true;
						});
					} else {
						return this$1.renderNode(child, context, false)
						.then(function () {
							return false;
						});
					}
				});
			}, Promise.resolve(false));
		};

		RenderStream.prototype.renderNative = function renderNative (tag, node, context, isRoot) {
			var this$1 = this;

			var bp = node.bp;
			var attrs = node.attrs;
			var className = node.className;
			var style = node.style;

			var outputAttrs = renderAttributes(bp, attrs);
			if (!isNullOrUndefined(className)) {
				outputAttrs.push('class="' + escapeAttr(className) + '"');
			}
			if (!isNullOrUndefined(style)) {
				outputAttrs.push('style="' + renderStyleToString$1(style) + '"');
			}

			var html = '';

			if (attrs && 'dangerouslySetInnerHTML' in attrs) {
				html = attrs[ 'dangerouslySetInnerHTML' ].__html;
			}


			if (isRoot) {
				outputAttrs.push('data-infernoroot');
			}
			this.push(("<" + tag + (outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '') + ">"));
			if (isVoidElement(tag)) {
				return;
			}
			if (html) {
				this.push(html);
				this.push(("</" + tag + ">"));
				return;
			}
			return Promise.resolve(this.renderChildren(node.children, context)).then(function (){
				this$1.push(("</" + tag + ">"));
			});
		};

		return RenderStream;
	}(stream.Readable));

	function streamAsString(node) {
		return new RenderStream(node, false);
	}

	function streamAsStaticMarkup(node) {
		return new RenderStream(node, true);
	}

	var index = {
		renderToString: renderToString,
		renderToStaticMarkup: renderToStaticMarkup,
		streamAsString: streamAsString,
		streamAsStaticMarkup: streamAsStaticMarkup,
		RenderStream: RenderStream
	};

	return index;

}));