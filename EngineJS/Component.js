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
					vElem = "",
					nextElem = [];

			//build up a vDom element
			vElem = { tag: elements[0] };
			//now go through its properties
			for(i = 1; i < elements.length; i++) {
				if(Array.isArray(elements[i])) {
					nextLevel(elements[i], vElem);
				} else {
					debugger;
					//otherwise, it could be a properties object with class etc
				}
			}
			//push the vElem to the vDom
			if(Array.isArray(root)) {
				root.push(vElem);
			} else {
				root.children = vElem;
			}
		};

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
