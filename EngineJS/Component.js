var TemplateHelper = require('./TemplateHelper.js');
var b = require('./bobril.js');

class Component {

	constructor(props) {
		this._compiled = [];
		this.props = this.props || {};
		this.props.template = {};
		this._templateHelper = new TemplateHelper(this.props);

		//call init
		this.init.call(this.props, this._templateHelper);

		//then compile the template
		this._compileTemplate();

		//then apply the observer for this class
		Object.observe(this.props, this._propChange.bind(this));
	}

	mount(elem) {
		b.setRootNode(elem);
		this._render();
	}

	getTemplateHelper() {
		return this._templateHelper;
	}

	_render() {
		b.init(function () {
			return this._compiled;
		}.bind(this));
	}

	_compileTemplate() {
		var i = 0;

		this._compiled = [];

		var nextLevel = function(elements, root) {
			var i = 0,
					j = 0,
					elem = "",
					nextElem = [],
					helperElem = {},
					tag = '',
					classes = [],
					ids = [];

			tag = elements[0];

			//tag may have .className or #id in it, so we need to take them out
			if(tag.indexOf(".") > -1) {
				classes = tag.split(".");
				tag = classes[0];
				classes.shift();
			}

			if(tag.indexOf("#") > -1) {
				ids = tag.split("#");
				tag = ids[0];
				ids.shift();
			}

			//build up a vDom element
			elem = { tag: tag };
			//apply ids and classNames
			if(classes.length > 0) {
				elem.className = classes.join(' ');
			}
			if(ids.length > 0) {
				elem.id = ids.join('');
			}

			//now go through its properties
			for(i = 1; i < elements.length; i++) {
				if(Array.isArray(elements[i])) {
					elem.children = elem.children || [];
					nextLevel(elements[i], elem);
				} else {

					//see if there is nothing
					if(elements[i] == null) {
						continue;
					}
					//check if the element is a templatehelper function
					else if(elements[i].type === "if") {
						//lets store this in the object so it knows
						helperElem = {};
						helperElem.children = [];
						helperElem.tag = "if";
						helperElem.condition = elements[i].$condition;
						helperElem.expression = elements[i].$expression.bind(this.props);
						for(j = 0; j < elements[i].$template.length; j++) {
							nextLevel(elements[i].$template[j], helperElem);
						}
						//then store the helper in the elem
						elem.children = elem.children || [];
						elem.children.push(helperElem);
					}
					//handle for statements
					else if(elements[i].type === "for") {
						helperElem = {};
						helperElem.children = [];
						if(elements[i].$condition === "each") {
							helperElem.tag = "forEach";
							helperElem.items = elements[i].$items;
							for(j = 0; j < elements[i].$template.length; j++) {
								nextLevel(elements[i].$template[j], helperElem);
							}
							//then store the helper in the elem
							elem.children = elem.children || [];
							elem.children.push(helperElem);
						}
					}
					//handle it if it's a text value
					else if(elements[i].type === "bind") {
						helperElem = {};
						helperElem.tag = "bind";
						helperElem.condition = elements[i].$condition;
						helperElem.expression = elements[i].$expression.bind(this.props);
						//then store the helper in the elem
						elem.children = helperElem;
					}
					//check if the value is simply a string
					else if(typeof elements[i] === "string") {
						elem.children = elements[i];
					}
					//otherwise, it could be a properties object with class etc
					else {
						//go through each property and add it to the elem
						for(j in elements[i]) {
							elem[j] = elements[i][j];
						}
					}

				}
			}
			//push the elem to the compiled template
			if(Array.isArray(root)) {
				root.push(elem);
			} else {
				root.children.push(elem);
			}
		}.bind(this);

		for(i = 0; i < this.props.template.length; i++) {
			nextLevel(this.props.template[i], this._compiled);
		};
	}

	_propChange(changes) {
		debugger;
	}

};

module.exports = Component;
