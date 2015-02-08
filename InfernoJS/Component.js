var TemplateHelper = require('./TemplateHelper.js');
var Compiler = require('./Compiler.js');
var b = require('./bobril.js');
var b = require('./bobril.js');
var WatchJS = require("./watch.js")
var watch = WatchJS.watch;
var unwatch = WatchJS.unwatch;
var callWatchers = WatchJS.callWatchers;

var defaultProps = {

};

class Component {

	constructor() {
		this._compiled = [];
		this._templateHelper = new TemplateHelper();
		//init the template
		this._template = this.initTemplate(this._templateHelper) || {};
		//then compile the template
		this._compileTemplate(this);
		//init the watchers on user defined properties
		this._initPropWatchers();
	}

	mount(elem) {
		//clear the contents
		elem.innerHTML = "";
		b.setRootNode(elem);
		this._render();
	}

	getTemplateHelper() {
		return this._templateHelper;
	}

	updateElement(node) {
		b.updateNode(node);
	}

	_initPropWatchers() {
		var toWatch = [],
				prop = '';

		for(prop in this) {
			if(prop.charAt(0) !== '_') {
				//add to list of props to watch
				toWatch.push(prop);
			}
		}

		watch(this, toWatch, this._propChange.bind(this));
	}

	_render() {
		b.init(function () {
			var createVirtualDom = function(node, parent) {
				var i = 0;
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
					if(node.className != null) {
						vNode.className = node.className;
					}
					if(node.style != null) {
						vNode.style = node.style;
					}
					if(node.attrs != null) {
						vNode.attrs = node.attrs;
					}
					if(node.children == null) {
						//no children (luck bastard)
						if(node.$type != null) {
							node.children = this._templateHelper.render(node);
						}
						if(Array.isArray(node.children)) {
							createVirtualDom(node.children, vNode);
						} else {
							vNode.children = node.children;
						}
					}
					if(node.children != null) {
						if(node.$type != null) {
							node.children = this._templateHelper.render(node);
						}
						if(Array.isArray(node.children)) {
							createVirtualDom(node.children, vNode);
						} else {
							vNode.children = node.children;
						}
					}
					if(vNode.children !== null) {
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
			createVirtualDom(this._compiled, vDom)
			//return the rendered
			return {
				compiled: vDom,
				context: this
			};
		}.bind(this));
	}

	_compileTemplate() {
		var i = 0;
		this._compiled = [];

		for(i = 0; i < this._template.length; i++) {
			Compiler.call(this, this._template[i], this._compiled);
		};
	}

	_propChange(changes) {
		//for now we can simply invalidate
		b.invalidate();
	}

};

module.exports = Component;
