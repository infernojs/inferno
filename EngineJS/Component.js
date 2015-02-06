var TemplateHelper = require('./TemplateHelper.js');

class Component {

	constructor(props) {
		this._vDom = [];
		this.props = this.props || {};
		this.props.template = {};
		this._templateHelper = new TemplateHelper(this.props);

		//call init
		this.init.call(this.props, this._templateHelper);

		//then apply the observer for this class
		Object.observe(this.props, this._propChange.bind(this));
	}

	mount(elem) {
		//then compile the template
		this._compileTemplate();
	}

	getTemplateHelper() {
		return this._templateHelper;
	}

	_compileTemplate() {
		var i = 0;

		this._vDom = [];

		var nextLevel = function(elements, root) {
			var i = 0,
					j = 0,
					vElem = "",
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
			vElem = { tag: tag };
			//apply ids and classNames
			if(classes.length > 0) {
				vElem.className = classes.join(' ');
			}
			if(ids.length > 0) {
				vElem.id = ids.join('');
			}

			//now go through its properties
			for(i = 1; i < elements.length; i++) {
				if(Array.isArray(elements[i])) {
					vElem.children = vElem.children || [];
					nextLevel(elements[i], vElem);
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
						helperElem.condition = elements[i].condition;
						helperElem.expression = elements[i].expression.bind(this.props);
						for(j = 0; j < elements[i].success.length; j++) {
							nextLevel(elements[i].success[j], helperElem);
						}
						//then store the helper in the vElem
						vElem.children = vElem.children || [];
						vElem.children.push(helperElem);
					}
					//handle it if it's a text value
					else if(elements[i].type === "bind") {
						helperElem = {};
						helperElem.tag = "bind";
						helperElem.condition = elements[i].condition;
						helperElem.expression = elements[i].expression.bind(this.props);
						//then store the helper in the vElem
						vElem.children = helperElem;
					}
					//check if the value is simply a string
					else if(typeof elements[i] === "string") {
						vElem.children = elements[i];
					}
					//otherwise, it could be a properties object with class etc
					else {
						//go through each property and add it to the vElem
						for(j in elements[i]) {
							vElem[j] = elements[i][j];
						}
					}

				}
			}
			//push the vElem to the vDom
			if(Array.isArray(root)) {
				root.push(vElem);
			} else {
				root.children.push(vElem);
			}
		}.bind(this);

		for(i = 0; i < this.props.template.length; i++) {
			nextLevel(this.props.template[i], this._vDom);
		};

		debugger;
	}

	_propChange(changes) {
		debugger;
	}

};

module.exports = Component;
