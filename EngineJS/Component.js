var TemplateHelper = require('./TemplateHelper.js');
var Compiler = require('./Compiler.js');
var b = require('./bobril.js');


class Component {

	constructor() {
		this._compiled = [];
		this._templateHelper = new TemplateHelper();

		//init the template
		this._template = this.initTemplate(this._templateHelper) || {};

		//then compile the template
		this._compileTemplate(this);

		//then apply the observer for this class
		//Object.observe(this.props, this._propChange.bind(this));
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
						if(node.children.$type != null) {
							node.children.children = this._templateHelper.render(node.children);
						}
						if(Array.isArray(node.children)) {
							for(i = 0; i < node.children.length; i++) {
								renderHelpers(node.children[i], node);
							}
						} else {
							renderHelpers(node.children, node);
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
