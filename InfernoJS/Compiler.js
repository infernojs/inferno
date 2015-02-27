var Compiler = {};

Compiler.compileAttr = function(text) {
	var compiled = {};
	var attrName = '';
	var currentSring = '';
	var inValue = false;
	var char = '';

	for(var i = 0; i < text.length; i++) {
		char = text[i];
		if(char === "=") {
			attrName = currentSring;
			currentSring = '';
		} else if(char === '"' || char === "'") {
			if(inValue === false) {
				inValue = true;
			} else {
				compiled[attrName] = currentSring;
				currentSring = '';
				inValue = false;
			}
		} else {
			if((char === " " && inValue === true) || char !== " ") {
				currentSring += char;
			}
		}
	};
	return compiled;
};

Compiler.compileHtml = function(text) {
	var compiled = [];
	var insideTag = false;
	var char = '';
	var currentSring = '';
	var tagName = '';
	var tagChild = false;
	var textNode = '';
	var hasTag = false;
	var attrText = false;

	for(var i = 0; i < text.length; i++) {
		char = text[i];
		if(char === "<") {
			insideTag = true;
			if(tagChild === true) {
				textNode = currentSring.trim();
				if(textNode) {
					compiled.push(textNode);
				}
			} else {
				attrText = currentSring.trim();
			}
			currentSring = '';
		} else if(char === ">") {
			insideTag = false;
			tagName = currentSring.trim();
			if(tagName) {
				if(tagName.charAt(0) === "/") {
					tagChild = false;
					compiled.push([tagName]);
				} else {
					if(hasTag === false) {
						tagChild = true;
						compiled.push([tagName]);
						hasTag = true;
					} else {
						//this is an attribute, so lets set it to the property
						compiled[compiled.length - 1].push(
							Compiler.compileAttr(currentSring.trim())
						);
						hasTag = false;
					}
				}
				hasTag = false;
			}
			currentSring = '';
		} else if(char === " ") {
			//if we are in a tag
			if(insideTag === true && hasTag == false) {
				tagName = currentSring.trim();
				currentSring = '';
				if(tagName) {
					compiled.push([tagName]);
					hasTag = true;
				}
			} else {
				currentSring += char;
			}
		} else {
			if(char !== "\n") {
				currentSring += char;
			}
		}
	}
	return compiled;
};

Compiler.createVirtualNode = function(data) {
	//lets make a dom node
	var vNode = {};
	//it will have children, so lets create that array
	vNode.children = [];
	//the first part of the array is the tag
	var tagData = Compiler.compileTag(data);
	vNode.tag = tagData.tag;
	if(tagData.classes.length > 0) {
		vNode.className = tagData.classes.join(' ');
	}
	if(tagData.ids.length > 0) {
		vNode.attrs = vNode.attrs || {};
		vNode.attrs.id = tagData.ids.join('');
	}
	return vNode;
}

Compiler.createVirtualDom = function(render, root) {
	var i = 0;
	var s = 0;
	var attrKey = null;
	var vNode = null;
	var r = root;

	for(i = 0; i < render.length; i++) {
		//likely to be a text node or the openings
		//check if this is an array (a dom node)
		if(Array.isArray(render[i])) {
			//if we have another array, then we're dealing with children for the last vNode
			//generally this is from a closure, such as forEach(), map() or times()
			if(Array.isArray(render[i][0][0])) {
				for(s = 0; s < render[i].length; s++) {
					Compiler.createVirtualDom(render[i][s], vNode)
				}
			}
			//if we have an array here, it's most likely from an if() helper
			else if(Array.isArray(render[i][0])) {
				Compiler.createVirtualDom(render[i], vNode)
			}
			//if its not an array, then its a tag field, and the start/end of a dom node
			else {
				if(render[i][0].charAt(0) === "/") {
					r = r.parent;
				} else {
					vNode = Compiler.createVirtualNode(render[i][0]);
					vNode.parent = r;
					//now add our attributes
					if(render[i][1] != null) {
						vNode.attrs = vNode.attrs || {};
						for(attrKey in render[i][1]) {
							if(attrKey === 'style' || attrKey === 'className') {
								vNode[attrKey] = render[i][1][attrKey];
							} else {
								vNode['attrs'][attrKey] = render[i][1][attrKey];
							}
						}
					}
					if(Array.isArray(r)) {
						r.push(vNode);
					} else {
						r.children.push(vNode);
					}
					//check if this tag does not need a close tag
					if(vNode.tag !== 'input') {
						r = vNode;
					}
				}
			}
		}
		//if its not an array, then its a textNode/nodeValue
		else {
			//make sure it's converted text with (+ '')
			r.children = render[i] + '';
		}
	}
};

Compiler.compileTag = function(tag) {
	var classes = [],
			ids = [];

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
	return {
		tag: tag,
		ids: ids,
		classes: classes
	}
};

module.exports = Compiler;
