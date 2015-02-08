var Compiler = function(elements, root, index) {
	var i = 0,
			j = 0,
			elem = "",
			nextElem = [],
			tag = '',
			classes = [],
			ids = [],
			attrs = [];


	//build up a vDom element
	elem = {};

	//if we have an element with an array of elements, go through them
	if(Array.isArray(elements)) {
		for(i = 0; i < elements.length; i++) {
			//see if there is nothing
			if(elements[i] == null) {
				continue;
			}
			elem.children = elem.children || [];
			Compiler(elements[i], elem, i);
		}
	} else {
		if(Array.isArray(elements)) {
			elem.children = elem.children || [];
			Compiler(elements, elem, i);
		} else {
			//check if the element is a templatehelper function
			if(elements.$type === "if") {
				//lets store this in the object so it knows
				root.$toRender = [];
				root.$type = "if";
				switch(elements.condition) {
					case "isTrue":
						root.$condition = true;
						break;
					case "isFalse":
						root.$condition = false;
						break;
					case "isNull":
						root.$condition = null;
						break;
					case "isZero":
						root.$condition = 0;
						break;
				}
				root.$expression = elements.expression;
				Compiler(elements.children, root, 0);
			}
			//handle for statements
			else if(elements.$type === "for") {
				root.$toRender = [];
				if(elements.condition === "each") {
					root.$type = "forEach";
					root.$items = elements.items;
				} else if(elements.condition === "increment") {
					root.$type = "for";
					root.$bounds = elements.bounds;
				}
				root.$toRender = elements.children;
			}
			//handle it if it's a text value
			else if(elements.$type === "text") {
				root.$type = "text";
				root.$condition = elements.condition;
				root.$toRender = elements.children;
			}
			//check if the value is simply a string
			else if(typeof elements === "string") {
				if(root.tag == null && index === 0) {
					tag = elements;
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

					//apply ids and classNames
					if(classes.length > 0) {
						root.className = classes.join(' ');
					}
					if(ids.length > 0) {
						root.attrs = elem.attrs || {};
						root.attrs.id = ids.join('');
					}

					root.tag = tag;
				} else {
					root.children = elements;
				}
			}
			//otherwise, it could be a properties object with class etc
			else {
				root['attrs'] = {};
				//go through each property and add it to the elem
				for(j in elements) {
					//check the key and see if its on the elem or in attrs
					switch(j) {
						case "className":
						case "style":
						case "onCreated":
							root[j] = elements[j];
							break;
						case "id":
						case "type":
						case "value":
						case "placeholder":
						case "method":
						case "action":
						default:
							root['attrs'][j] = elements[j];
							break;
					}
				}
			}
		}
	}

	//check if the object is empty
	if(Object.keys(elem).length === 0) {
		return;
	}

  if(Array.isArray(root)) {
    root.push(elem);
	} else if(root.$toRender != null) {
		root.$toRender.push(elem);
  } else {
    root.children.push(elem);
  }
}

module.exports = Compiler;
