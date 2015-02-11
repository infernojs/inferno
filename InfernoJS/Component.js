var b = require('./bobril.js');
var Compiler = require('./Compiler.js');
var RenderHelpers = require('./RenderHelpers.js');

class Component {

	constructor() {
		this._ctx = null;
		this._subComponents = [];
		this._lastDependencyCheck = []
		this._renderHelpers = new RenderHelpers(this);
		this.render(this._renderHelpers);
	}

	forceUpdate() {
		var t,
				skipUpdateThis = false;

		//check if we need to update ourselves
		if(this.dependencies != null) {
			var dependencies = this.dependencies();
			if(this._compareArrays(dependencies, this._lastDependencyCheck)) {
				//then only update children
				for(var i = 0; i < this._subComponents.length; i++) {
					this._subComponents[i].forceUpdate();
				}
				skipUpdateThis = true;
			} else {
				this._lastDependencyCheck = dependencies;
				skipUpdateThis = false;
			}
		}

		if(skipUpdateThis === false) {
			if(this._ctx != null) {
				b.invalidate(this._ctx);
			} else {
				b.invalidate();
			}
		}

	}

	mount(elem) {
		//clear the contents
		elem.innerHTML = "";
		b.setRootNode(elem);
		//now we let bobril generate the dom to start with
		b.init(function () {
			//return the rendered
			var vDom = this._createVirtualDom();
			return {
				compiled: vDom,
				context: this
			};
		}.bind(this));
	}


	_compareArrays(array1, array2) {
			// if the other array is a falsy value, return
			if (!array2)
					return false;

			// compare lengths - can save a lot of time
			if (array1.length != array2.length)
					return false;

			for (var i = 0, l=array1.length; i < l; i++) {
					// Check if we have nested arrays
					if (array1[i] instanceof Array && array2[i] instanceof Array) {
							// recurse into the nested arrays
							if(array1[i].equals(array2[i]))
									return false;
					}
					else if (array1[i] != array2[i]) {
							// Warning - two different object instances will never be equal: {x:20} != {x:20}
							return false;
					}
			}
			return true;
	}

	_isFunction(obj) {
		return !!(obj && obj.constructor && obj.call && obj.apply);
	}

	_createVirtualDom() {

		var createVirtualDom = function(render, root) {
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
					if(Array.isArray(render[i][0])) {
						for(s = 0; s < render[i].length; s++) {
							createVirtualDom(render[i][s], vNode)
						}
					}
					//if we have a function, we need to execute it to get its contents
					else if(Array.isArray(render[i][0])) {
					}
					//if its not an array, then its a tag field, and the start/end of a dom node
					else {
						if(render[i][0].charAt(0) === "/") {
							r = r.parent;
						} else {
							vNode = this._createVnode(render[i][0]);
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
		}.bind(this)

		var vDom = [];
		createVirtualDom(this.render(this._renderHelpers), vDom);

		return vDom;
	}

	_createVnode(data) {
		//lets make a dom node
		var vNode = {};
		//it will have children, so lets create that array
		vNode.children = [];
		//the first part of the array is the tag
		var tagData = Compiler.compileTag(data);
		vNode.tag = tagData.tag;
		if(tagData.classes != null) {
			vNode.className = tagData.classes.join(' ');
		}
		if(tagData.ids != null) {
			vNode.attrs = vNode.attrs || {};
			vNode.attrs.id = tagData.ids.join('');
		}
		return vNode;
	}

	// render(ctx, me) {
	// 	var props = ctx.data.props,
	// 			compiledTag = {},
	// 			i = 0;
	//
	// 	this._ctx = ctx;
	//
	// 	if(ctx.data.props != null) {
	// 		props = ctx.data.props();
	// 		//best to also disable the watcher here?
	// 		//apply the props to this object
	// 		for(i in props) {
	// 			this[i] = props[i];
	// 		}
	// 		if(this.onUpdate != null) {
	// 			this.onUpdate();
	// 		}
	// 	}
	// 	//handle the tag
	// 	compiledTag = Compiler.compileTag(ctx.data.tag);
	// 	me.tag = compiledTag.tag;
	// 	if(compiledTag.classes.length > 0) {
	// 		me.className = compiledTag.classes;
	// 	}
	// 	if(compiledTag.ids.length > 0) {
	// 		me.attr.id = compiledTag.ids;
	// 	}
	// 	//generate children from this component's own vdom
	// 	me.children = this._createVirtualDom();
	// }

	addSubComponent(subCompnent) {
		this._subComponents.push(subCompnent);
	}


};

module.exports = Component;
