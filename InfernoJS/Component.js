var b = require('./bobril.js');
var Compiler = require('./Compiler.js');

class Component {

	constructor() {
		this._lastTick = 0;
		this._ctx = null;
		this._subComponents = [];
		this._lastDependencyCheck = []
		this.render();
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
			t = Date.now();
			if(t > this._lastTick + 17) {
				if(this._ctx != null) {
					b.invalidate(this._ctx);
				} else {
					b.invalidate();
				}
				this._lastTick = t;
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
			return {
				compiled: this._createVirtualDom(),
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
			var vNode = null;

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
					//if its not an array, then its a tag field, and the start/end of a dom node
					else {
						if(render[i][0].charAt(0) === "/") {
							root = root.parent;
						} else {
							vNode = this._createVnode(render[i][0]);
							vNode.parent = root;
							if(Array.isArray(root)) {
								root.push(vNode);
							} else {
								root.children.push(vNode);
							}
							root = vNode;
						}
					}
				}
				//if its not an array, then its a textNode/nodeValue
				else {
					//make sure it's converted text with (+ '')
					root.children = render[i] + '';
				}

			}
		}.bind(this)

		var vDom = [];

		createVirtualDom(this.render(), vDom);

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
			vNode.class = tagData.classes.join(' ');
		}
		if(tagData.ids != null) {
			vNode.id = tagData.ids.join('');
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
