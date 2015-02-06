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
					helperElem = {};

			//build up a vDom element
			vElem = { tag: elements[0] };

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
						helperElem.condition = elements[i].name;
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
					}
					//check if the value is simply a string
					else if(typeof elements[i] === "string") {
						vElem.children = elements[i];
					}
					//otherwise, it could be a properties object with class etc
					else {
						debugger;
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
