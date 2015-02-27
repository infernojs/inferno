var b = require('./bobril.js');

class Component {

	constructor() {
		this._ctx = null;
		this._subComponents = [];
		this._lastDependencyCheck = []
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
			return {
				compiled: this.render(),
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

	_createVnode(data) {
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


	addSubComponent(subCompnent) {
		this._subComponents.push(subCompnent);
	}


};

module.exports = Component;
