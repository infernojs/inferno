var Compiler = function(elements, root) {
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
    elem.attrs = elem.attrs || {};
		elem.attrs.id = ids.join('');
	}

	//now go through its properties
	for(i = 1; i < elements.length; i++) {
		if(Array.isArray(elements[i])) {
			elem.children = elem.children || [];
      Compiler(elements[i], elem);
		} else {

			//see if there is nothing
			if(elements[i] == null) {
				continue;
			}
			//check if the element is a templatehelper function
			else if(elements[i].type === "if") {
				//lets store this in the object so it knows
				helperElem = {};
				helperElem.$toRender = [];
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
				helperElem.$expression = elements[i].expression;
				for(j = 0; j < elements[i].children.length; j++) {
          Compiler(elements[i].children[j], helperElem);
				}
				//then store the helper in the elem
				elem.children = elem.children || [];
				elem.children.push(helperElem);
			}
			//handle for statements
			else if(elements[i].type === "for") {
				helperElem = {};
				helperElem.$toRender = [];
				if(elements[i].condition === "each") {
					helperElem.$type = "forEach";
					helperElem.$items = elements[i].items;
				} else if(elements[i].condition === "increment") {
          helperElem.$type = "for";
          helperElem.$bounds = elements[i].bounds;
        }
        helperElem.$toRender = elements[i].children;
        //then store the helper in the elem
        elem.children = elem.children || [];
        elem.children.push(helperElem);
			}
			//handle it if it's a text value
			else if(elements[i].type === "bind") {
				helperElem = {};
				helperElem.$type = "bind";
				helperElem.$condition = elements[i].condition;
				helperElem.$toRender = elements[i].children;
				//then store the helper in the elem
				elem.children = helperElem;
			}
			//check if the value is simply a string
			else if(typeof elements[i] === "string") {
				elem.children = elements[i];
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
						case "onDomCreated":
							elem[j] = elements[i][j];
							break;
            case "id":
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
  if(Array.isArray(root)) {
    root.push(elem);
  } else if(root.$toRender != null) {
    root.$toRender.push(elem);
  } else {
    root.children.push(elem);
  }
}

module.exports = Compiler;
