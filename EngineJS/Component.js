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

			var render = [],
					renderNode = null;

			renderNode = function(node, root) {
				var i = 0;
				if(Array.isArray(node)) {
					for(i = 0; i < node.length; i++) {
						renderNode(node[i], root);
					}
				} else {
					if(node.elems != null) {
						if(node.elems.$type != null) {
							node.children = this._templateHelper.render(node.elems);
						} else if(Array.isArray(node.elems)) {
							for(i = 0; i < node.elems.length; i++) {
								renderNode(node.elems[i], node);
							}
						} else {
							renderNode(node.elems, node);
						}
						delete node.elems;
					}
					debugger;
					if(Array.isArray(root)) {
						root.push(node);
					} else {
						root.children = root.children || [];
						root.children.push(node);
					}
				}
				// for (var i in node) {
				//
				// 		if(root.children != null) {
				// 			this._pushToNode(root.children, node);
				// 		} else {
				// 			this._pushToNode(root, node);
				// 		}
				// 	}
				// 	if(node[i].children != null) {
				// 		renderNode(node[i].children, Array.isArray(node) ? root : node);
				// 	}
				//
				// }
			}.bind(this)

			renderNode(this._compiled, render)

			debugger;


			return render;
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
					ids = [],
					attrs = [];

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
					elem.elems = elem.elems || [];
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
						helperElem.elems = [];
						helperElem.$type = "if";
						switch(elements[i].condition) {
							case "isTrue":
								helperElem.$condition = true;
								break;
							case "isFalse":
								helperElem.$condition = false;
								break;
							case "isNull":
								helperElem.$condition = null;
								break;
							case "isZero":
								helperElem.$condition = 0;
								break;
						}
						helperElem.$expression = elements[i].expression.bind(this.props);
						for(j = 0; j < elements[i].elems.length; j++) {
							nextLevel(elements[i].elems[j], helperElem);
						}
						//then store the helper in the elem
						elem.elems = elem.elems || [];
						elem.elems.push(helperElem);
					}
					//handle for statements
					else if(elements[i].type === "for") {
						helperElem = {};
						helperElem.elems = [];
						if(elements[i].condition === "each") {
							helperElem.$type = "forEach";
							helperElem.$items = elements[i].items;
							for(j = 0; j < elements[i].template.length; j++) {
								nextLevel(elements[i].template[j], helperElem);
							}
							//then store the helper in the elem
							elem.elems = elem.elems || [];
							elem.elems.push(helperElem);
						}
					}
					//handle it if it's a text value
					else if(elements[i].type === "bind") {
						helperElem = {};
						helperElem.$type = "bind";
						helperElem.$condition = elements[i].condition;
						helperElem.elems = elements[i].elems;
						//then store the helper in the elem
						elem.elems = helperElem;
					}
					//check if the value is simply a string
					else if(typeof elements[i] === "string") {
						elem.elems = elements[i];
					}
					//otherwise, it could be a properties object with class etc
					else {
						elem['attrs'] = {};
						//go through each property and add it to the elem
						for(j in elements[i]) {
							//check the key and see if its on the elem or in attrs
							switch(j) {
								case "className":
								case "style":
								case "id":
									elem[j] = elements[i][j];
									break;
								case "type":
								case "value":
								case "placeholder":
								case "method":
								case "action":
								default:
									elem['attrs'][j] = elements[i][j];
									break;
							}
						}
					}

				}
			}
			//push the elem to the compiled template
			if(Array.isArray(root)) {
				root.push(elem);
			} else {
				root.elems.push(elem);
			}
		}.bind(this);

		for(i = 0; i < this.props.template.length; i++) {
			nextLevel(this.props.template[i], this._compiled);
		};
	}

	_propChange(changes) {
		//for now we can simply invalidate
		b.invalidate();
	}

};

module.exports = Component;
