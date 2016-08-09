/*!
 * inferno-server v0.7.18
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoServer = factory());
}(this, function () { 'use strict';

	function isArray(obj) {
		return obj instanceof Array;
	}

	function isStatefulComponent(o) {
		return isTrue(o._isStateful);
	}

	function isStringOrNumber(obj) {
		return isString(obj) || isNumber(obj);
	}

	function isNullOrUndef(obj) {
		return isUndefined(obj) || isNull(obj);
	}

	function isInvalid(obj) {
		return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
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

	function isTrue(obj) {
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

	function renderComponent(vComponent, isRoot, context) {
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
			return renderNode(node, context, isRoot);
		} else {
			return renderNode(Component(props), context, isRoot);
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
					childrenResult.push(renderNode(child, context, false));
				}
			}
			return childrenResult.join('');
		} else if (!isInvalid(children)) {
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

				if (!isNullOrUndef(value)) {
					styles.push(((toHyphenCase(styleName)) + ":" + (escapeAttr(value)) + px + ";"));
				}
			}
			return styles.join();
		}
	}

	function renderVElement(vElement, isRoot, context) {
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
				} else if (isTrue(value)) {
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

	function renderNode(node, context, isRoot) {
		if (!isInvalid(node)) {
			if (isVElement(node)) {
				return renderVElement(node, isRoot, context);
			} else if (isVComponent(node)) {
				return renderComponent(node, isRoot, context);
			}
		}
	}

	function renderToString(node) {
		return renderNode(node, null, false);
	}

	function renderToStaticMarkup(node) {
		return renderNode(node, null, true);
	}

	var index = {
		renderToString: renderToString,
		renderToStaticMarkup: renderToStaticMarkup
	};

	return index;

}));