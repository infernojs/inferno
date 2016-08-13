/*!
 * inferno-server v0.8.0-alpha1
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('stream')) :
	typeof define === 'function' && define.amd ? define(['stream'], factory) :
	(global.InfernoServer = factory(global.stream));
}(this, function (stream) { 'use strict';

	function isArray(obj) {
		return obj instanceof Array;
	}

	function isStatefulComponent(o) {
		return isTrue$1(o._isStateful);
	}

	function isStringOrNumber(obj) {
		return isString(obj) || isNumber(obj);
	}

	function isNullOrUndef(obj) {
		return isUndefined(obj) || isNull(obj);
	}

	function isInvalid(obj) {
		return isNull(obj) || obj === false || isTrue$1(obj) || isUndefined(obj);
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

	var NodeTypes = {
		ELEMENT: 0,
		COMPONENT: 1,
		TEMPLATE: 2,
		TEXT: 3,
		PLACEHOLDER: 4,
		FRAGMENT: 5,
		VARIABLE: 6
	};

	function isVElement(o) {
		return o._type === NodeTypes.ELEMENT;
	}

	function isVTemplate(o) {
		return o._type === NodeTypes.TEMPLATE;
	}

	function isVComponent(o) {
		return o._type === NodeTypes.COMPONENT;
	}

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

	function renderComponentToString(vComponent, isRoot, context) {
		var Component = vComponent._component;
		var props = vComponent._props;

		if (isStatefulComponent(vComponent)) {
			var instance = new Component(props);
			var childContext = instance.getChildContext();

			if (!isNullOrUndef(childContext)) {
				context = Object.assign({}, context, childContext);
			}
			instance.context = context;
			// Block setting state - we should render only once, using latest state
			instance._pendingSetState = true;
			instance.componentWillMount();
			var node = instance.render();

			instance._pendingSetState = false;
			return renderInputToString(node, context, isRoot);
		} else {
			return renderInputToString(Component(props), context, isRoot);
		}
	}

	function renderChildren(children, context) {
		if (children && isArray(children)) {
			var childrenResult = [];
			var insertComment = false;

			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				var isText = isStringOrNumber(child);
				var invalid = isInvalid(child);

				if (isText || invalid) {
					if (insertComment === true) {
						if (isInvalid(child)) {
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
					childrenResult.push(renderInputToString(child, context, false));
				}
			}
			return childrenResult.join('');
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
			var styles = [];
			var keys = Object.keys(style);

			for (var i = 0; i < keys.length; i++) {
				var styleName = keys[i];
				var value = style[styleName];
				var px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';

				if (!isNullOrUndef(value)) {
					styles.push(((toHyphenCase(styleName)) + ":" + (escapeAttr(value)) + px + ";"));
				}
			}
			return styles.join();
		}
	}

	function renderVElementToString(vElement, isRoot, context) {
		var tag = vElement._tag;
		var outputProps = [];
		var props = vElement._props;
		var propsKeys = (props && Object.keys(props)) || [];
		var html = '';

		for (var i = 0; i < propsKeys.length; i++) {
			var prop = propsKeys[i];
			var value = props[prop];

			if (prop === 'dangerouslySetInnerHTML') {
				html = value.__html;
			} else if (prop === 'style') {
				outputProps.push('style="' + renderStyleToString(props.style) + '"');
			} else if (prop === 'className') {
				outputProps.push('class="' + value + '"');
			} else {
				if (isStringOrNumber(value)) {
					outputProps.push(escapeAttr(prop) + '="' + escapeAttr(value) + '"');
				} else if (isTrue$1(value)) {
					outputProps.push(escapeAttr(prop));
				}
			}
		}
		if (isRoot) {
			outputProps.push('data-infernoroot');
		}
		if (isVoidElement(tag)) {
			return ("<" + tag + (outputProps.length > 0 ? ' ' + outputProps.join(' ') : '') + ">");
		} else {
			return ("<" + tag + (outputProps.length > 0 ? ' ' + outputProps.join(' ') : '') + ">" + (html || renderChildren(vElement._children, context)) + "</" + tag + ">");
		}
	}

	function getTemplateValues(vTemplate) {
		var values = [];
		var v0 = vTemplate._v0;
		var v1 = vTemplate._v1;

		if (v0) {
			values.push(v0);
		}
		if (v1) {
			values.push.apply(values, v1);
		}
		return values;
	}

	function renderVTemplateToString(vTemplate, isRoot, context) {
		return renderInputToString(vTemplate._tr._schema.apply(null, getTemplateValues(vTemplate)), context, isRoot);
	}

	function renderInputToString(input, context, isRoot) {
		if (!isInvalid(input)) {
			if (isVTemplate(input)) {
				return renderVTemplateToString(input, isRoot, context);
			} else if (isVElement(input)) {
				return renderVElementToString(input, isRoot, context);
			} else if (isVComponent(input)) {
				return renderComponentToString(input, isRoot, context);
			}
		}
		throw Error('Inferno Error: Bad input argument called on renderInputToString(). Input argument may need normalising.');
	}

	function renderToString(input) {
		return renderInputToString(input, null, false);
	}

	function renderToStaticMarkup(input) {
		return renderInputToString(input, null, true);
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

				if (!isNullOrUndef(value)) {
					styles.push(((toHyphenCase(styleName)) + ":" + (escapeAttr(value)) + px + ";"));
				}
			}
			return styles.join();
		}
	}

	function renderAttributes(props){
		var outputAttrs = [];
		var propsKeys = (props && Object.keys(props)) || [];

		propsKeys.forEach(function (propKey, i) {
			var value = props[propKey];
			switch (propKey) {
				case 'dangerouslySetInnerHTML' :
				case 'className' :
				case 'style' :
					return;
				default :
					if (isStringOrNumber(value)) {
						outputAttrs.push(escapeAttr(propKey) + '="' + escapeAttr(value) + '"');
					} else if (isTrue(value)) {
						outputAttrs.push(escapeAttr(propKey));
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
			if (isInvalid(node)) {
				return;
			} else if (isVComponent(node)) {
				return this.renderComponent(node, isRoot, context);
			} else if (isVElement(node)) {
				return this.renderNative(node, isRoot, context);
			}
		};
		RenderStream.prototype.renderComponent = function renderComponent (vComponent, isRoot, context) {
			var this$1 = this;

			var Component = vComponent._component;
			var props = vComponent._props;

			if (!isStatefulComponent(vComponent)) {
				return this.renderNode(Component(props), context, isRoot);
			}

			var instance = new Component(props);
			var childContext = instance.getChildContext();

			if (!isNullOrUndef(childContext)) {
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
			if (!childrenIsArray && !isInvalid(children)) {
				return this.renderNode(children, context, false);
			}
			if (!childrenIsArray) {
				throw new Error('invalid component');
			}
			return children.reduce(function (p, child){
				return p.then(function (insertComment){
					var isText = isStringOrNumber(child);
					var childIsInvalid = isInvalid(child);

					if (isText || childIsInvalid) {
						if (insertComment === true) {
							if (childIsInvalid) {
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

		RenderStream.prototype.renderNative = function renderNative (vElement, isRoot, context) {
			var this$1 = this;

			var tag = vElement._tag;
			var outputProps = [];
			var props = vElement._props;

			var outputAttrs = renderAttributes(props);

			var html = '';
			if (props) {
				var className = props.className;
				if (className) {
					outputAttrs.push('class="' + escapeAttr(className) + '"');
				}

				var style = props.style;
				if (style) {
					outputAttrs.push('style="' + renderStyleToString$1(style) + '"');
				}

				if (props.dangerouslySetInnerHTML) {
					html = props.dangerouslySetInnerHTML.__html;
				}
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
			return Promise.resolve(this.renderChildren(vElement._children, context)).then(function (){
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