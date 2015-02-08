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
			var renderHelpers = function(node) {
				var i = 0;
				if(Array.isArray(node)) {
					for(i = 0; i < node.length; i++) {
						renderHelpers(node[i]);
					}
				} else {
					if(node.children == null) {
						//no children (luck bastard)
						if(node.$type != null) {
							node.children = this._templateHelper.render(node);
						}
					}
					if(node.children != null) {
						if(node.$type != null) {
							node.children = this._templateHelper.render(node);
						}
						if(Array.isArray(node.children)) {
							for(i = 0; i < node.children.length; i++) {
								renderHelpers(node.children[i], node);
							}
						}
					}
				}
			}.bind(this)
			//re-render the helpers within our template
			renderHelpers(this._compiled)
			//return the rendered
			return {
				compiled: this._compiled,
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
