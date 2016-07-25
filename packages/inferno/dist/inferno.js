/*!
 * inferno v0.7.18
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Inferno = factory());
}(this, function () { 'use strict';

	function isUndefined(obj) {
		return obj === undefined;
	}

	var NodeTypes = {
		ELEMENT: 0,
		COMPONENT: 1,
		TEMPLATE: 2,
		TEXT: 3,
		PLACEHOLDER: 4,
		FRAGMENT: 5
	};

	function VElement(tag) {
		this._type = NodeTypes.ELEMENT;
		this._dom = null;
		this._tag = tag;
		this._children = null;
		this._key = null;
		this._props = null;
		this._hooks = null;
	}

	VElement.prototype = {
		children: function children(children) {
			this._children = children;
			return this;
		},
		key: function key(key) {
			this._key = key;
			return this;
		},
		props: function props(props) {
			this._props = props;
			return this;
		},
		hooks: function hooks(hooks) {
			this._hooks = hooks;
			return this;
		},
		events: function events(events) {
			this._events = events;
			return this;
		}
	};

	function VComponent(component) {
		this._type = NodeTypes.COMPONENT;
		this._dom = null;
		this._component = component;
		this._props = null;
		this._hooks = null;
		this._key = null;
		this._isStateful = !isUndefined(component.prototype) && !isUndefined(component.prototype.render);
	}

	VComponent.prototype = {
		key: function key$1(key) {
			this._key = key;
			return this;
		},
		props: function props$1(props) {
			this._props = props;
			return this;
		},
		hooks: function hooks$1(hooks) {
			this._hooks = hooks;
			return this;
		}
	};

	function VText(text) {
		this._type = NodeTypes.TEXT;
		this._text = text;
		this._dom = null;
	}

	function createVComponent(component) {
		return new VComponent(component);
	}

	function createVElement(tag) {
		return new VElement(tag);
	}

	function createVText(text) {
		return new VText(text);
	}

	var index = {
		createVComponent: createVComponent,
		createVElement: createVElement,
		createVText: createVText
	};

	return index;

}));