var TemplateHelper = require('./TemplateHelper.js');
var Compiler = require('./Compiler.js');
var b = require('./bobril.js');
var b = require('./bobril.js');
var WatchJS = require("./watch.js")
var watch = WatchJS.watch;
var unwatch = WatchJS.unwatch;
var callWatchers = WatchJS.callWatchers;


class Component {

	constructor() {
		this._compiled = [];
		this._propsToWatch = [];
		this._lastTick = 0;
		this._ctx = null;
		this._subComponents = [];
		this._lastDependencyCheck = []
		this._templateHelper = new TemplateHelper(this);
		//init the template
		this._template = this.initTemplate(this._templateHelper) || {};
		//then compile the template
		this._compileTemplate(this);
		//init the watchers on user defined properties
		this._initPropWatchers();
		this._enableWatchers();
	}

	forceUpdate() {
		var t = Date.now(),
				skipUpdateThis = false;

		//check if we need to update ourselves
		if(this.dependencies != null) {
			var dependencies = this.dependencies();
			if(this._compareArrays(dependencies, this._lastDependencyCheck)) {
				//then only update children
				for(var i = 0; i < this._subComponents.length; i++) {
					this._subComponents[i].forceUpdate();
				}
				skipUpdateThis = true;
			} else {
				this._lastDependencyCheck = dependencies;
				console.log('updating', dependencies);
				skipUpdateThis = false;
			}
		}

		if(skipUpdateThis === false) {
			if(t > this._lastTick + 17) {
				if(this._ctx != null) {
					b.invalidate(this._ctx);
				} else {
					b.invalidate();
				}
				this._lastTick = t;
			}
		}

	}

	mount(elem) {
		//clear the contents
		elem.innerHTML = "";
		b.setRootNode(elem);
		//now we let bobril generate the dom to start with
		b.init(function () {
			//return the rendered
			return {
				compiled: this._createVirtualDom(),
				context: this
			};
		}.bind(this));
	}

	getTemplateHelper() {
		return this._templateHelper;
	}

	updateElement(node) {
		b.updateNode(node);
	}

	_compareArrays(array1, array2) {
			// if the other array is a falsy value, return
			if (!array2)
					return false;

			// compare lengths - can save a lot of time
			if (array1.length != array2.length)
					return false;

			for (var i = 0, l=array1.length; i < l; i++) {
					// Check if we have nested arrays
					if (array1[i] instanceof Array && array2[i] instanceof Array) {
							// recurse into the nested arrays
							if(array1[i].equals(array2[i]))
									return false;
					}
					else if (array1[i] != array2[i]) {
							// Warning - two different object instances will never be equal: {x:20} != {x:20}
							return false;
					}
			}
			return true;
	}

	_initPropWatchers() {
		var prop = '';

		for(prop in this) {
			if(prop.charAt(0) !== '_') {
				//add to list of props to watch
				this._propsToWatch.push(prop);
			}
		}
	}

	_enableWatchers() {
		//watch(this, this._propsToWatch, this._propChange.bind(this));
	}

	_disableWatchers() {
		//unwatch(this, this._propsToWatch);
	}

	_isFunction(obj) {
		return !!(obj && obj.constructor && obj.call && obj.apply);
	}

	_createVirtualDom() {
		var createVirtualDom = function(node, parent) {
			var i = 0,
					comp = null;
			if(Array.isArray(node)) {
				for(i = 0; i < node.length; i++) {
					if(Array.isArray(parent)) {
						createVirtualDom(node[i], parent);
					} else {
						createVirtualDom(node[i], parent.children);
					}
				}
			} else {
				var vNode = {};
				vNode.children = [];
				if(node.tag != null) {
					vNode.tag = node.tag;
				}
				if(node.style != null) {
					if(this._isFunction(node.style)) {
						vNode.style = node.style.call(this);
					} else {
						vNode.style = node.style;
					}
				}
				if(node.className != null) {
					if(typeof node.className === "string") {
						vNode.className = node.className;
					} else if(node.className.$type != null) {
						vNode.className = this._templateHelper.process(node.className);
					}
				}
				if(node.attrs != null) {
					vNode.attrs = node.attrs;
				}
				if(node.children == null) {
					//no children (luck bastard)
					if(node.$type != null && node.$type !== "render") {
						node.children = this._templateHelper.process(node);
					} else if(node.$type === "render") {
						comp = this._templateHelper.process(node);
						vNode.component = comp.component;
						vNode.data = comp.data;
					}
					if(Array.isArray(node.children)) {
						createVirtualDom(node.children, vNode);
					} else {
						vNode.children = node.children;
					}
				}
				if(node.children != null) {
					if(node.$type != null && node.$type !== "render") {
						node.children = this._templateHelper.process(node);
					} else if(node.$type === "render") {
						comp = this._templateHelper.process(vNode);
						vNode.component = comp.component;
						vNode.data = comp.data;
					}

					if(Array.isArray(node.children)) {
						createVirtualDom(node.children, vNode);
					} else {
						vNode.children = node.children;
					}
				}
				if(vNode.children !== null || node.$type === "render") {
					if(Array.isArray(parent)) {
						parent.push(vNode);
					} else {
						parent.children.push(vDom);
					}
				}
			}

		}.bind(this)

		var vDom = [];
		//using the compiled template, handle the handlers so we have a new vDom
		createVirtualDom(this._compiled, vDom);

		return vDom;
	}

	render(ctx, me) {
		var props = ctx.data.props,
				compiledTag = {},
				i = 0;

		this._ctx = ctx;

		if(ctx.data.props != null) {
			props = ctx.data.props();
			//best to also disable the watcher here?
			//apply the props to this object
			this._disableWatchers();
			for(i in props) {
				this[i] = props[i];
			}
			this._enableWatchers();
			if(this.onUpdate != null) {
				this.onUpdate();
			}
		}
		//handle the tag
		compiledTag = Compiler.compileTag(ctx.data.tag);
		me.tag = compiledTag.tag;
		if(compiledTag.classes.length > 0) {
			me.className = compiledTag.classes;
		}
		if(compiledTag.ids.length > 0) {
			me.attr.id = compiledTag.ids;
		}
		//generate children from this component's own vdom
		me.children = this._createVirtualDom();
	}

	addSubComponent(subCompnent) {
		this._subComponents.push(subCompnent);
	}

	_compileTemplate() {
		var i = 0;
		this._compiled = [];

		for(i = 0; i < this._template.length; i++) {
			Compiler.compileDsl.call(this._comp, this._template[i], this._compiled);
		};
	}

	_propChange(changes) {
		//for now we can simply invalidate
		b.invalidate();
	}

};

module.exports = Component;
