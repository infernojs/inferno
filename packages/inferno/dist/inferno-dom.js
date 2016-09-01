/*!
 * inferno-dom v0.8.0-alpha6
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoDOM = factory());
}(this, (function () { 'use strict';

var Lifecycle = function Lifecycle() {
	this._listeners = [];
};
Lifecycle.prototype.addListener = function addListener (callback) {
	this._listeners.push(callback);
};
Lifecycle.prototype.trigger = function trigger () {
		var this$1 = this;

	for (var i = 0; i < this._listeners.length; i++) {
		this$1._listeners[i]();
	}
};

var NO_OP = '$NO_OP';

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';

// Runs only once in applications lifetime
var isBrowser = typeof window !== 'undefined' && window.document;

function isArray(obj) {
	return obj instanceof Array;
}

function isStringOrNumber(obj) {
	return isString(obj) || isNumber(obj);
}

function isNullOrUndef(obj) {
	return isUndefined(obj) || isNull(obj);
}

function isInvalid(obj) {
	return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}

function isAttrAnEvent(attr) {
	return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
}

function isString(obj) {
	return typeof obj === 'string';
}

function isNumber(obj) {
	return typeof obj === 'number';
}

function isNull(obj) {
	return obj === null;
}

function isTrue(obj) {
	return obj === true;
}

function isUndefined(obj) {
	return obj === undefined;
}

function throwError(message) {
	if (!message) {
		message = ERROR_MSG;
	}
	throw new Error(("Inferno Error: " + message));
}

var NodeTypes = {
	TEMPLATE: 1,
	TEXT: 2,
	FRAGMENT: 3
};

var TemplateValueTypes = {
	CHILDREN_KEYED: 1,
	CHILDREN_NON_KEYED: 2,
	CHILDREN_TEXT: 3,
	CHILDREN_NODE: 4,
	PROPS_CLASS_NAME: 5
};

var ChildrenTypes = {
	NON_KEYED: 1,
	KEYED: 2,
	NODE: 3,
	TEXT: 4,
	UNKNOWN: 5
};

function isVTemplate(o) {
	return o.type === NodeTypes.TEMPLATE;
}

function isVText(o) {
	return o.type === NodeTypes.TEXT;
}

function isVFragment$1(o) {
	return o.type === NodeTypes.FRAGMENT;
}

function isUnknownChildrenType(o) {
	return o === ChildrenTypes.UNKNOWN;
}

function isKeyedListChildrenType(o) {
	return o === ChildrenTypes.KEYED;
}

function isNonKeyedListChildrenType(o) {
	return o === ChildrenTypes.NON_KEYED;
}

// import {
// 	isArray,
// 	isStringOrNumber,
// 	isNullOrUndef,
// 	isInvalid,
// 	getRefInstance,
// 	isNull,
// 	isUndefined,
// 	throwError
// } from './../core/utils';
// import {
// 	appendText,
// 	documentCreateElement,
// 	handleAttachedHooks,
// 	normalise,
// 	setTextContent
// } from './utils';
// import {
// 	isVElement,
// 	isVComponent,
// 	isVariable,
// 	isVFragment,
// 	isVText,
// 	createTemplaceReducers,
// 	NULL_INDEX,
// 	ROOT_INDEX
// } from './../core/shapes';
// import {
// 	mountVariableAsExpression,
// 	mountVariableAsChildren,
// 	mountVariableAsText,
// 	mountDOMNodeFromTemplate,
// 	mountEmptyTextNode,
// 	mountTemplateClassName,
// 	mountTemplateStyle,
// 	mountTemplateProps,
// 	mountRefFromTemplate,
// 	mountSpreadPropsFromTemplate
// } from './mounting';
// import {
// 	patchVariableAsExpression,
// 	patchVariableAsChildren,
// 	patchVariableAsText,
// 	patchProp,
// 	patchTemplateClassName,
// 	patchTemplateStyle,
// 	patchTemplateProps,
// 	patchSpreadPropsFromTemplate
// } from './patching';
// import {
// 	hydrateVariableAsChildren,
// 	hydrateVariableAsExpression,
// 	hydrateVariableAsText,
// 	normaliseChildNodes
// } from './hydration';
// import {
// 	unmountVariableAsExpression,
// 	unmountVariableAsChildren,
// 	unmountVariableAsText
// } from './unmounting';
// import { ChildrenTypes } from '../core/ChildrenTypes';

// function copyValue(oldItem, item, index) {
// 	const value = readFromVTemplate(oldItem, index);

// 	writeToVTemplate(item, index, value);
// 	return value;
// }

// function copyTemplate(nodeIndex) {
// 	return function copyTemplate(oldItem, item) {
// 		return copyValue(oldItem, item, nodeIndex);
// 	};
// }

// export function readFromVTemplate(vTemplate, index) {
// 	let value;
// 	if (index === ROOT_INDEX) {
// 		value = vTemplate.dom;
// 	} else if (index === 0) {
// 		value = vTemplate.v0;
// 	} else {
// 		value = vTemplate.v1[index - 1];
// 	}
// 	return value;
// }

// export function writeToVTemplate(vTemplate, index, value) {
// 	if (index === ROOT_INDEX) {
// 		vTemplate.dom = value;
// 	} else if (index === 0) {
// 		vTemplate.v0 = value;
// 	} else {
// 		const array = vTemplate.v1;
// 		if (!array) {
// 			vTemplate.v1 = [value];
// 		} else {
// 			array[index - 1] = value;
// 		}
// 	}
// }

// export function createTemplateReducers(vNode, isRoot, offset, parentDom, isSVG, isChildren, childrenType, path) {
// 	if (!isInvalid(vNode)) {
// 		let keyIndex = NULL_INDEX;
// 		let nodeIndex = isRoot ? ROOT_INDEX : NULL_INDEX;
// 		let mount;
// 		let patch;
// 		let unmount;
// 		let hydrate;
// 		let deepClone = false;

// 		if (isVariable(vNode)) {
// 			if (isChildren) {
// 				mount = mountVariableAsChildren(vNode.pointer, isSVG, childrenType);
// 				if (childrenType === ChildrenTypes.STATIC_TEXT) {
// 					patch = null;
// 				} else {
// 					patch = patchVariableAsChildren(vNode.pointer, isSVG, childrenType);
// 				}
// 				unmount = unmountVariableAsChildren(vNode.pointer, childrenType);
// 				hydrate = hydrateVariableAsChildren(vNode.pointer, childrenType);
// 			} else {
// 				mount = mountVariableAsExpression(vNode.pointer, isSVG);
// 				patch = patchVariableAsExpression(vNode.pointer, isSVG);
// 				unmount = unmountVariableAsExpression(vNode.pointer);
// 				hydrate = hydrateVariableAsExpression(vNode.pointer);
// 			}
// 		} else if (isVFragment(vNode)) {
// 			const children = vNode.children;

// 			if (isVariable(children)) {
// 				mount = mountVariableAsChildren(children.pointer, isSVG, childrenType);
// 				patch = patchVariableAsChildren(children.pointer, isSVG, childrenType);
// 				unmount = unmountVariableAsChildren(children.pointer, childrenType);
// 			} else {
// 				// debugger;
// 			}
// 		} else if (isVText(vNode)) {
// 			const text = vNode.text;

// 			if (isVariable(text)) {
// 				nodeIndex = offset.length++;
// 				mount = combineMountTo2(nodeIndex, mountEmptyTextNode, mountVariableAsText(text.pointer));
// 				patch = combinePatchTo2(nodeIndex, patchVariableAsText(text.pointer));
// 				unmount = unmountVariableAsText(text.pointer);
// 				hydrate = hydrateVariableAsText(text.pointer);
// 			} else {
// 				if (nodeIndex !== NULL_INDEX) {
// 					nodeIndex = offset.length++;
// 				}
// 				mount = mountDOMNodeFromTemplate(document.createTextNode(text), true);
// 				patch = null;
// 				unmount = null;
// 			}
// 		} else if (isVElement(vNode)) {
// 			const mounters = [];
// 			const patchers = [];
// 			const unmounters = [];
// 			const hydraters = [];
// 			const tag = vNode.tag;

// 			if (tag === 'svg') {
// 				isSVG = true;
// 			}
// 			const dom = documentCreateElement(tag, isSVG);
// 			const key = vNode.key;

// 			if (!isNull(key) && isVariable(key)) {
// 				keyIndex = key.pointer;
// 			}
// 			const children = vNode.children;

// 			if (!isInvalid(children)) {
// 				if (isStringOrNumber(children)) {
// 					setTextContent(dom, children);
// 					deepClone = true;
// 				} else if (isArray(children)) {
// 					for (let i = 0; i < children.length; i++) {
// 						const child = children[i];

// 						if (nodeIndex === NULL_INDEX && isVariable(child)) {
// 							nodeIndex = offset.length++;
// 						}
// 						const templateReducers = createTemplateReducers(normalise(child), false, offset, dom, isSVG, false, vNode.childrenType, path + ',' + i);

// 						if (!isInvalid(templateReducers)) {
// 							mounters.push(templateReducers.mount);
// 							const patch = templateReducers.patch;
// 							const unmount = templateReducers.unmount;
// 							const hydrate = templateReducers.hydrate;

// 							if (!isNull(patch)) {
// 								patchers.push(patch);
// 							}
// 							if (!isNull(unmount)) {
// 								unmounters.push(unmount);
// 							}
// 							if (!isNull(hydrate)) {
// 								hydraters.push(hydrate);
// 							}
// 						}
// 					}
// 				} else {
// 					if (nodeIndex === NULL_INDEX && isVariable(children)) {
// 						nodeIndex = offset.length++;
// 					}
// 					const templateReducers = createTemplateReducers(normalise(children), false, offset, dom, isSVG, true, vNode.childrenType, path + ',0');

// 					if (!isInvalid(templateReducers)) {
// 						mounters.push(templateReducers.mount);
// 						const patch = templateReducers.patch;
// 						const unmount = templateReducers.unmount;
// 						const hydrate = templateReducers.hydrate;

// 						if (!isNull(patch)) {
// 							patchers.push(patch);
// 						}
// 						if (!isNull(unmount)) {
// 							unmounters.push(unmount);
// 						}
// 						if (!isNull(hydrate)) {
// 							hydraters.push(hydrate);
// 						}
// 					}
// 				}
// 			}
// 			const props = vNode.props;
// 			let staticPropCount = 0;

// 			if (!isNull(props)) {
// 				if (isVariable(props)) {
// 					mounters.push(mountSpreadPropsFromTemplate(props.pointer, isSVG));
// 					patchers.push(patchSpreadPropsFromTemplate(props.pointer, isSVG));
// 				} else {
// 					const propsToMount = [];
// 					const propsToPatch = [];

// 					for (let prop in props) {
// 						const value = props[prop];

// 						if (isVariable(value)) {
// 							if (prop === 'className') {
// 								mounters.push(mountTemplateClassName(value.pointer));
// 								patchers.push(patchTemplateClassName(value.pointer));
// 							} else if (prop === 'style') {
// 								mounters.push(mountTemplateStyle(value.pointer));
// 								patchers.push(patchTemplateStyle(value.pointer));
// 							} else {
// 								propsToMount.push(prop, value);
// 								propsToPatch.push(prop, value);
// 							}
// 						} else {
// 							const shouldMountProp = patchProp(prop, null, value, dom);

// 							if (shouldMountProp) {
// 								propsToMount.push(prop, value);
// 								propsToPatch.push(prop, value);
// 								staticPropCount++;
// 							}
// 						}
// 					}
// 					if (propsToMount.length > 0) {
// 						mounters.push(mountTemplateProps(propsToMount, tag));
// 					}
// 					if (propsToPatch.length > 0) {
// 						patchers.push(patchTemplateProps(propsToPatch, tag));
// 					}
// 				}
// 			}
// 			const ref = vNode.ref;

// 			if (!isNullOrUndef(ref)) {
// 				mounters.push(mountRefFromTemplate(ref));
// 			}
// 			if (patchers.length > 0 && nodeIndex === NULL_INDEX) {
// 				if (staticPropCount === patchers.length) {
// 					nodeIndex = offset.length + 1;
// 				} else {
// 					nodeIndex = offset.length++;
// 				}
// 			}
// 			mount = combineMount(nodeIndex, mountDOMNodeFromTemplate(dom, deepClone), mounters);
// 			patch = combinePatch(nodeIndex, patchers);
// 			unmount = combineUnmount(nodeIndex, unmounters);
// 			hydrate = combineHydrate(nodeIndex, path, hydraters);
// 		} else if (isVComponent(vNode)) {
// 			if ("development" !== 'production') {
// 				throwError('templates cannot contain VComponent nodes. Pass a VComponent node into a template as a variable instead.');
// 			}
// 			throwError();
// 		}
// 		return createTemplaceReducers(keyIndex, mount, patch, unmount, hydrate);
// 	}
// }

// function combineMount(nodeIndex, mountDOMNodeFromTemplate, mounters) {
// 	if (nodeIndex === NULL_INDEX && mounters.length === 0) {
// 		return mountDOMNodeFromTemplate;
// 	} else if (mounters.length <= 1) {
// 		return combineMountTo2(nodeIndex, mountDOMNodeFromTemplate, mounters[0]);
// 	} else if (mounters.length <= 4) {
// 		return combineMountTo5(nodeIndex, mountDOMNodeFromTemplate, mounters[0], mounters[1], mounters[2], mounters[3]);
// 	} else {
// 		return combineMountToX(nodeIndex, mountDOMNodeFromTemplate, mounters);
// 	}
// }

// function combineMountTo2(nodeIndex, mountDOMNodeFromTemplate, mounter1) {
// 	const write = (nodeIndex !== NULL_INDEX);

// 	return function combineMountTo2(vTemplate, parentDom, lifecycle, context, isSVG) {
// 		const dom = mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context, isSVG);

// 		if (write) {
// 			writeToVTemplate(vTemplate, nodeIndex, dom);
// 		}
// 		if (mounter1) {
// 			mounter1(vTemplate, dom, lifecycle, context, isSVG);
// 		}
// 		return dom;
// 	};
// }

// function combineMountTo5(nodeIndex, mountDOMNodeFromTemplate, mounter1, mounter2, mounter3, mounter4) {
// 	const write = (nodeIndex !== NULL_INDEX);

// 	return function combineMountTo5(vTemplate, parentDom, lifecycle, context, isSVG) {
// 		const dom = mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context, isSVG);

// 		if (write) {
// 			writeToVTemplate(vTemplate, nodeIndex, dom);
// 		}
// 		if (mounter1) {
// 			mounter1(vTemplate, dom, lifecycle, context, isSVG);
// 			if (mounter2) {
// 				mounter2(vTemplate, dom, lifecycle, context, isSVG);
// 				if (mounter3) {
// 					mounter3(vTemplate, dom, lifecycle, context, isSVG);
// 					if (mounter4) {
// 						mounter4(vTemplate, dom, lifecycle, context, isSVG);
// 					}
// 				}
// 			}
// 		}
// 		return dom;
// 	};
// }

// function combineMountToX(nodeIndex, mountDOMNodeFromTemplate, mounters) {
// 	const write = (nodeIndex !== NULL_INDEX);

// 	return function combineMountToX(vTemplate, parentDom, lifecycle, context, isSVG) {
// 		const dom = mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context);

// 		if (write) {
// 			writeToVTemplate(vTemplate, nodeIndex, dom);
// 		}
// 		for (let i = 0; i < mounters.length; i++) {
// 			mounters[i](vTemplate, dom, lifecycle, context, isSVG);
// 		}
// 		return dom;
// 	};
// }

// function combinePatch(nodeIndex, patchers) {
// 	if (patchers.length === 0) {
// 		if (nodeIndex !== NULL_INDEX) {
// 			return copyTemplate(nodeIndex);
// 		} else {
// 			return null;
// 		}
// 	} else if (patchers.length <= 1) {
// 		return combinePatchTo2(nodeIndex, patchers[0]);
// 	} else if (patchers.length <= 4) {
// 		return combinePatchTo5(nodeIndex, patchers[0], patchers[1], patchers[2], patchers[3], patchers[4]);
// 	} else {
// 		return combinePatchX(nodeIndex, patchers);
// 	}
// }

// function combinePatchTo2(nodeIndex, patch1) {
// 	const copy = (nodeIndex !== NULL_INDEX);

// 	return function combinePatchTo2(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
// 		let dom;

// 		if (copy) {
// 			dom = copyValue(lastVTemplate, nextVTemplate, nodeIndex);
// 		}
// 		if (patch1) {
// 			patch1(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
// 		}
// 	};
// }

// function combinePatchTo5(nodeIndex, patch1, patch2, patch3, patch4, patch5) {
// 	const copy = (nodeIndex !== NULL_INDEX);

// 	return function combinePatchTo5(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
// 		let dom;

// 		if (copy) {
// 			dom = copyValue(lastVTemplate, nextVTemplate, nodeIndex);
// 		}
// 		if (patch1) {
// 			patch1(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
// 			if (patch2) {
// 				patch2(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
// 				if (patch3) {
// 					patch3(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
// 					if (patch4) {
// 						patch4(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
// 						if (patch5) {
// 							patch5(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
// 						}
// 					}
// 				}
// 			}
// 		}
// 	};
// }

// function combinePatchX(nodeIndex, patchers) {
// 	const copy = (nodeIndex !== NULL_INDEX);

// 	return function combinePatchX(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
// 		let dom;

// 		if (copy) {
// 			dom = copyValue(lastVTemplate, nextVTemplate, nodeIndex);
// 		}
// 		for (let i = 0; i < patchers.length; i++) {
// 			patchers[i](lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
// 		}
// 	};
// }

// function combineUnmount(nodeIndex, unmounters) {
// 	if (unmounters.length > 0) {
// 		if (unmounters.length <= 4) {
// 			return combineUnmountTo5(nodeIndex, unmounters[0], unmounters[1], unmounters[2], unmounters[3], unmounters[4]);
// 		}
// 	}
// 	return null;
// }

// function combineUnmountTo5(nodeIndex, unomunt1, unomunt2, unomunt3, unomunt4, unomunt5) {
// 	return function combineUnmountTo5(vTemplate, lifecycle) {
// 		if (unomunt1) {
// 			unomunt1(vTemplate, lifecycle);
// 			if (unomunt2) {
// 				unomunt2(vTemplate, lifecycle);
// 				if (unomunt3) {
// 					unomunt3(vTemplate, lifecycle);
// 					if (unomunt4) {
// 						unomunt4(vTemplate, lifecycle);
// 						if (unomunt5) {
// 							unomunt5(vTemplate, lifecycle);
// 						}
// 					}
// 				}
// 			}
// 		}
// 	};
// }

// function combineUnmountX(nodeIndex, unmounters) {
// 	return function combineUnmountX(vTemplate, lifecycle) {
// 		for (let i = 0; i < unmounters.length; i++) {
// 			unmounters[i](vTemplate, lifecycle);
// 		}
// 	};
// }

// function combineHydrate(nodeIndex, path, hydraters) {
// 	if (hydraters.length <= 4) {
// 		return combineHydrateTo5(nodeIndex, path, hydraters[0], hydraters[1], hydraters[2], hydraters[3], hydraters[4]);
// 	} else {
// 		return combineHydrateX(nodeIndex, path, hydraters);
// 	}
// }

// function combineHydrateTo5(nodeIndex, path, hydrate1, hydrate2, hydrate3, hydrate4, hydrate5) {
// 	const write = (nodeIndex !== NULL_INDEX);

// 	return function combineHydrateTo5(vTemplate, rootDom, lifecycle, context) {
// 		let dom;

// 		if (write) {
// 			dom = getDomFromTemplatePath(rootDom, path);
// 			writeToVTemplate(vTemplate, nodeIndex, dom);
// 		}
// 		if (hydrate1) {
// 			hydrate1(vTemplate, dom, lifecycle, context);
// 			if (hydrate2) {
// 				hydrate2(vTemplate, dom, lifecycle, context);
// 				if (hydrate3) {
// 					hydrate3(vTemplate, dom, lifecycle, context);
// 					if (hydrate4) {
// 						hydrate4(vTemplate, dom, lifecycle, context);
// 						if (hydrate5) {
// 							hydrate5(vTemplate, dom, lifecycle, context);
// 						}
// 					}
// 				}
// 			}
// 		}
// 	};
// }

// function combineHydrateX(nodeIndex, unmounters) {
// 	return function combineHydrateX() {
// 		const write = (nodeIndex !== NULL_INDEX);

// 		return function combineHydrateX(vTemplate, rootDom, lifecycle, context) {
// 			let dom;

// 			if (write) {
// 				dom = getDomFromTemplatePath(rootDom, path);
// 				writeToVTemplate(vTemplate, nodeIndex, dom);
// 			}
// 			for (let i = 0; i < unmounters.length; i++) {
// 				unmounters[i](vTemplate, dom, lifecycle, context);
// 			}
// 		};
// 	};
// }

// function getDomFromTemplatePath(rootDom, path) {
// 	if (path === '') {
// 		normaliseChildNodes(rootDom);
// 		return rootDom;
// 	} else {
// 		const routes = path.split(',');
// 		let dom = rootDom;

// 		for (let i = 0; i < routes.length; i++) {
// 			const route = routes[i];

// 			if (route !== '') {
// 				const childNodes = normaliseChildNodes(dom);

// 				dom = childNodes[route];
// 			}
// 		}
// 		return dom;
// 	}
// }

function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
	replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput.dom);
	unmount(lastInput, null, lifecycle);
}

function patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
	if (lastInput !== nextInput) {
		if (isVTemplate(nextInput)) {
			if (isVTemplate(lastInput)) {
				patchVTemplate(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVTemplate(nextInput, null, lifecycle, context, isSVG), lastInput.dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVTemplate(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
		} else if (isVText(nextInput)) {
			if (isVText(lastInput)) {
				patchVText(lastInput, nextInput);
			}
		} else if (isVFragment$1(nextInput)) {
			if (isVFragment$1(lastInput)) {
				patchVFragment(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVFragment(nextInput, null, lifecycle, context, isSVG), lastInput.dom);
				unmount(lastInput, null, lifecycle);
			}
		} else {
			if ("development" !== 'production') {
				throwError('bad input argument called on patch(). Input argument may need normalising.');
			}
			throwError();
		}
	}
}

function patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG) {
	if (isInvalid(nextChildren)) {
		if (!isInvalid(lastChildren)) {
			removeAllChildren(parentDom, lastChildren, lifecycle);
		}
	} else if (isInvalid(lastChildren)) {
		if (isStringOrNumber(nextChildren)) {
			setTextContent(parentDom, nextChildren);
		} else if (!isInvalid(nextChildren)) {
			if (isArray(nextChildren)) {
				mountArrayChildrenWithoutType(nextChildren, parentDom, lifecycle, context, isSVG);
			} else {
				mount(nextChildren, parentDom, lifecycle, context, isSVG);
			}
		}
	} else if (isStringOrNumber(nextChildren)) {
		if (isStringOrNumber(lastChildren)) {
			updateTextContent(parentDom, nextChildren);
		} else {
			setTextContent(parentDom, nextChildren);
		}
	} else if (isStringOrNumber(lastChildren)) {
		var child = normalise(lastChildren);

		child.dom = parentDom.firstChild;
		patchChildrenWithUnknownType(child, nextChildren, parentDom, lifecycle, context, isSVG);
	} else if (isArray(nextChildren)) {
		if (isArray(lastChildren)) {
			nextChildren.complex = lastChildren.complex;

			if (isKeyed(lastChildren, nextChildren)) {
				patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null);
			} else {
				patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, true);
			}
		} else {
			patchNonKeyedChildren([lastChildren], nextChildren, parentDom, lifecycle, context, isSVG, null, true);
		}
	} else if (isArray(lastChildren)) {
		patchNonKeyedChildren(lastChildren, [nextChildren], parentDom, lifecycle, context, isSVG, null, true);
	} else {
		patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG);
	}
}

function patchVText(lastVText, nextVText) {
	var nextText = nextVText.text;
	var dom = lastVText.dom;

	nextVText.dom = dom;
	if (lastVText.text !== nextText) {
		dom.nodeValue = nextText;
	}
}

function patchVTemplate(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
	var dom = lastVTemplate.dom;
	var lastBp = lastVTemplate.bp;
	var nextBp = nextVTemplate.bp;

	nextVTemplate.dom = dom;
	if (lastBp !== nextBp) {
		var newDom = mountVTemplate(nextVTemplate, null, lifecycle, context, isSVG);

		replaceChild(parentDom, newDom, dom);
		unmount(lastVTemplate, null, lifecycle, true);
	} else {
		var bp0 = nextBp.v0;

		if (!isNull(bp0)) {
			var lastV0 = lastVTemplate.v0;
			var nextV0 = nextVTemplate.v0;
			var bp1 = nextBp.v1;

			if (lastV0 !== nextV0) {
				patchTemplateValue(bp0, lastV0, nextV0, dom, lifecycle, context, isSVG);
			}
			if (!isNull(bp1)) {
				var lastV1 = lastVTemplate.v1;
				var nextV1 = nextVTemplate.v1;

				if (lastV1 !== nextV1) {
					patchTemplateValue(bp1, lastV1, nextV1, dom, lifecycle, context, isSVG);
				}
			}
		}
	}
}

function patchTemplateValue(templateValueType, lastValue, nextValue, dom, lifecycle, context, isSVG) {
	switch (templateValueType) {
		case TemplateValueTypes.CHILDREN_KEYED:
			patchKeyedChildren(lastValue, nextValue, dom, lifecycle, context, isSVG, null);
			break;
		case TemplateValueTypes.CHILDREN_NON_KEYED:
			patchNonKeyedChildren(lastValue, nextValue, dom, lifecycle, context, isSVG, null, false);
			break;
		case TemplateValueTypes.CHILDREN_TEXT:
			updateTextContent(dom, nextValue);
			break;
		case TemplateValueTypes.CHILDREN_NODE:
			patch(lastValue, nextValue, dom, lifecycle, context, isSVG);
			break;
		case TemplateValueTypes.PROPS_CLASS_NAME:
			if (isNullOrUndef(nextValue)) {
				dom.removeAttribute('class');
			} else {
				dom.className = nextValue;
			}
			break;
	}
}

function patchVFragment(lastVFragment, nextVFragment, parentDom, lifecycle, context, isSVG) {
	var lastChildren = lastVFragment.children;
	var nextChildren = nextVFragment.children;
	var pointer = lastVFragment.pointer;

	nextVFragment.dom = lastVFragment.dom;
	nextVFragment.pointer = pointer;
	if (!lastChildren !== nextChildren) {
		var lastChildrenType = lastVFragment.childrenType;
		var nextChildrenType = nextVFragment.childrenType;

		if (lastChildrenType === nextChildrenType) {
			if (isKeyedListChildrenType(nextChildrenType)) {
				return patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment);
			} else if (isNonKeyedListChildrenType(nextChildrenType)) {
				return patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, false);
			}
		}
		if (isKeyed(lastChildren, nextChildren)) {
			patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment);
		} else {
			patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, true);
		}
	}
}

function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, parentVList, shouldNormalise) {
	var lastChildrenLength = lastChildren.length;
	var nextChildrenLength = nextChildren.length;
	var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
	var i = 0;

	for (; i < commonLength; i++) {
		var lastChild = lastChildren[i];
		var nextChild = shouldNormalise ? normaliseChild(nextChildren, i) : nextChildren[i];

		patch(lastChild, nextChild, dom, lifecycle, context, isSVG);
	}
	if (lastChildrenLength < nextChildrenLength) {
		for (i = commonLength; i < nextChildrenLength; i++) {
			var child = normaliseChild(nextChildren, i);

			insertOrAppend(dom, mount(child, null, lifecycle, context, isSVG), parentVList && parentVList.pointer);
		}
	} else if (lastChildrenLength > nextChildrenLength) {
		for (i = commonLength; i < lastChildrenLength; i++) {
			unmount(lastChildren[i], dom, lifecycle);
		}
	}
}

function patchKeyedChildren(a, b, dom, lifecycle, context, isSVG, parentVList) {
	var aLength = a.length;
	var bLength = b.length;
	var aEnd = aLength - 1;
	var bEnd = bLength - 1;
	var aStart = 0;
	var bStart = 0;
	var i;
	var j;
	var aStartNode = a[aStart];
	var bStartNode = b[bStart];
	var aEndNode = a[aEnd];
	var bEndNode = b[bEnd];
	var aNode = null;
	var bNode = null;
	var nextNode;
	var nextPos;
	var node;

	if (aLength === 0) {
		if (bLength !== 0) {
			mountArrayChildrenWithType(b, dom, lifecycle, context, isSVG);
		}
		return;
	} else if (bLength === 0) {
		if (aLength !== 0) {
			removeAllChildren(dom, a, lifecycle);
		}
		return;
	}
	// Step 1
	/* eslint no-constant-condition: 0 */
	outer: while (true) {
		// Sync nodes with the same key at the beginning.
		while (aStartNode.key === bStartNode.key) {
			patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG);
			aStart++;
			bStart++;
			if (aStart > aEnd || bStart > bEnd) {
				break outer;
			}
			aStartNode = a[aStart];
			bStartNode = b[bStart];
		}

		// Sync nodes with the same key at the end.
		while (aEndNode.key === bEndNode.key) {
			patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG);
			aEnd--;
			bEnd--;
			if (aStart > aEnd || bStart > bEnd) {
				break outer;
			}
			aEndNode = a[aEnd];
			bEndNode = b[bEnd];
		}

		// Move and sync nodes from right to left.
		if (aEndNode.key === bStartNode.key) {
			patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG);
			insertOrAppend(dom, bStartNode.dom, aStartNode.dom);
			aEnd--;
			bStart++;
			if (aStart > aEnd || bStart > bEnd) {
				break;
			}
			aEndNode = a[aEnd];
			bStartNode = b[bStart];
			// In a real-world scenarios there is a higher chance that next node after the move will be the same, so we
			// immediately jump to the start of this prefix/suffix algo.
			continue;
		}

		// Move and sync nodes from left to right.
		if (aStartNode.key === bEndNode.key) {
			patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG);
			nextPos = bEnd + 1;
			nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
			insertOrAppend(dom, bEndNode.dom, nextNode);
			aStart++;
			bEnd--;
			if (aStart > aEnd || bStart > bEnd) {
				break;
			}
			aStartNode = a[aStart];
			bEndNode = b[bEnd];
			continue;
		}
		break;
	}

	if (aStart > aEnd) {
		if (bStart <= bEnd) {
			nextPos = bEnd + 1;
			nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
			while (bStart <= bEnd) {
				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG), nextNode);
			}
		}
	} else if (bStart > bEnd) {
		while (aStart <= aEnd) {
			unmount(a[aStart++], dom, lifecycle);
		}
	} else {
		aLength = aEnd - aStart + 1;
		bLength = bEnd - bStart + 1;
		var aNullable = a;
		var sources = new Array(bLength);

		// Mark all nodes as inserted.
		for (i = 0; i < bLength; i++) {
			sources[i] = -1;
		}
		var moved = false;
		var pos = 0;
		var patched = 0;

		if ((bLength <= 4) || (aLength * bLength <= 16)) {
			for (i = aStart; i <= aEnd; i++) {
				aNode = a[i];
				if (patched < bLength) {
					for (j = bStart; j <= bEnd; j++) {
						bNode = b[j];
						if (aNode.key === bNode.key) {
							sources[j - bStart] = i;

							if (pos > j) {
								moved = true;
							} else {
								pos = j;
							}
							patch(aNode, bNode, dom, lifecycle, context, isSVG, false);
							patched++;
							aNullable[i] = null;
							break;
						}
					}
				}
			}
		} else {
			var keyIndex = new Map();

			for (i = bStart; i <= bEnd; i++) {
				node = b[i];
				keyIndex.set(node.key, i);
			}
			for (i = aStart; i <= aEnd; i++) {
				aNode = a[i];

				if (patched < bLength) {
					j = keyIndex.get(aNode.key);

					if (!isUndefined(j)) {
						bNode = b[j];
						sources[j - bStart] = i;
						if (pos > j) {
							moved = true;
						} else {
							pos = j;
						}
						patch(aNode, bNode, dom, lifecycle, context, isSVG, false);
						patched++;
						aNullable[i] = null;
					}
				}
			}
		}
		if (aLength === a.length && patched === 0) {
			removeAllChildren(dom, a, lifecycle);
			while (bStart < bLength) {
				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG), null);
			}
		} else {
			i = aLength - patched;
			while (i > 0) {
				aNode = aNullable[aStart++];
				if (!isNull(aNode)) {
					unmount(aNode, dom, lifecycle);
					i--;
				}
			}
			if (moved) {
				var seq = lis_algorithm(sources);
				j = seq.length - 1;
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + bStart;
						node = b[pos];
						nextPos = pos + 1;
						nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
						insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG), nextNode);
					} else {
						if (j < 0 || i !== seq[j]) {
							pos = i + bStart;
							node = b[pos];
							nextPos = pos + 1;
							nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
							insertOrAppend(dom, node.dom, nextNode);
						} else {
							j--;
						}
					}
				}
			} else if (patched !== bLength) {
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + bStart;
						node = b[pos];
						nextPos = pos + 1;
						nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
						insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), nextNode);
					}
				}
			}
		}
	}
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(a) {
	var p = a.slice(0);
	var result = [];
	result.push(0);
	var i;
	var j;
	var u;
	var v;
	var c;

	for (i = 0; i < a.length; i++) {
		if (a[i] === -1) {
			continue;
		}

		j = result[result.length - 1];
		if (a[j] < a[i]) {
			p[i] = j;
			result.push(i);
			continue;
		}

		u = 0;
		v = result.length - 1;

		while (u < v) {
			c = ((u + v) / 2) | 0;
			if (a[result[c]] < a[i]) {
				u = c + 1;
			} else {
				v = c;
			}
		}

		if (a[i] < a[result[u]]) {
			if (u > 0) {
				p[i] = result[u - 1];
			}
			result[u] = i;
		}
	}

	u = result.length;
	v = result[u - 1];

	while (u-- > 0) {
		result[u] = v;
		v = p[v];
	}

	return result;
}

// returns true if a property has been applied that can't be cloned via elem.cloneNode()
function patchProp(prop, lastValue, nextValue, dom) {
	if (strictProps[prop]) {
		dom[prop] = isNullOrUndef(nextValue) ? '' : nextValue;
	} else if (booleanProps[prop]) {
		dom[prop] = nextValue ? true : false;
	} else {
		if (lastValue !== nextValue) {
			if (isNullOrUndef(nextValue)) {
				dom.removeAttribute(prop);
				return false;
			}
			if (prop === 'className') {
				dom.className = nextValue;
				return false;
			} else if (prop === 'style') {
				patchStyle(lastValue, nextValue, dom);
			} else if (prop === 'defaultChecked') {
				if (isNull(lastValue)) {
					dom.addAttribute('checked');
				}
				return false;
			} else if (prop === 'defaultValue') {
				if (isNull(lastValue)) {
					dom.setAttribute('value', nextValue);
				}
				return false;
			} else if (isAttrAnEvent(prop)) {
				dom[prop.toLowerCase()] = nextValue;
			} else if (prop === 'dangerouslySetInnerHTML') {
				var lastHtml = lastValue && lastValue.__html;
				var nextHtml = nextValue && nextValue.__html;

				if (isNullOrUndef(nextHtml)) {
					if ("development" !== 'production') {
						throwError('dangerouslySetInnerHTML requires an object with a __html propety containing the innerHTML content.');
					}
					throwError();
				}
				if (lastHtml !== nextHtml) {
					dom.innerHTML = nextHtml;
				}
			} else if (prop !== 'childrenType' && prop !== 'ref' && prop !== 'key') {
				var ns = namespaces[prop];

				if (ns) {
					dom.setAttributeNS(ns, prop, nextValue);
				} else {
					dom.setAttribute(prop, nextValue);
				}
				return false;
			}
		}
	}
	return true;
}

var recyclingEnabled = true;

// const vComponentPools = new Map();

function recycleVTemplate(vTemplate, lifecycle, context, isSVG) {
	var bp = vTemplate.bp;
	var key = vTemplate.key;
	var pool = key === null ? bp.pools.nonKeyed : bp.pools.keyed.get(key);

	if (!isUndefined(pool)) {
		var recycledVTemplate = pool.pop();

		if (!isUndefined(recycledVTemplate)) {
			patchVTemplate(recycledVTemplate, vTemplate, null, lifecycle, context, isSVG);
			return vTemplate.dom;
		}
	}
	return null;
}

function poolVTemplate(vTemplate) {
	var bp = vTemplate.bp;
	var key = vTemplate.key;
	var pools = bp.pools;

	if (isNull(key)) {
		pools.nonKeyed.push(vTemplate);
	} else {
		var pool = pools.keyed.get(key);

		if (isUndefined(pool)) {
			pool = [];
			pools.keyed.set(key, pool);
		}
		pool.push(vTemplate);
	}
}

// export function recycleVComponent(vComponent, lifecycle, context, isSVG) {
// 	const component = vComponent.component;
// 	const key = vComponent.key;
// 	let pools = vComponentPools.get(component);

// 	if (!isUndefined(pools)) {
// 		const pool = key === null ? pools.nonKeyed : pools.keyed.get(key);

// 		if (!isUndefined(pool)) {
// 			const recycledVComponent = pool.pop();

// 			if (!isUndefined(recycledVComponent)) {
// 				patchVComponent(recycledVComponent, vComponent, null, lifecycle, context, isSVG);
// 				return vComponent.dom;
// 			}
// 		}
// 	}
// 	return null;
// }

// export function poolVComponent(vComponent) {
// 	const component = vComponent.component;
// 	const key = vComponent.key;
// 	let pools = vComponentPools.get(component);

// 	if (isUndefined(pools)) {
// 		pools = {
// 			nonKeyed: [],
// 			keyed: new Map()
// 		};
// 		vComponentPools.set(component, pools);
// 	}
// 	if (isNull(key)) {
// 		pools.nonKeyed.push(vComponent);
// 	} else {
// 		let pool = pools.keyed.get(key);

// 		if (isUndefined(pool)) {
// 			pool = [];
// 			pools.keyed.set(key, pool);
// 		}
// 		pool.push(vComponent);
// 	}
// }

function unmount(input, parentDom, lifecycle, canRecycle) {
	if (!isInvalid(input)) {
		if (isVTemplate(input)) {
			unmountVTemplate(input, parentDom, lifecycle, canRecycle);
		}
	}
}

function unmountVTemplate(vTemplate, parentDom, lifecycle, canRecycle) {
	if (!isNull(parentDom)) {
		parentDom.removeChild(vTemplate.dom);
	}
	if (recyclingEnabled && (parentDom || canRecycle)) {
		poolVTemplate(vTemplate);
	}
}

function constructDefaults(string, object, value) {
	/* eslint no-return-assign: 0 */
	string.split(',').forEach(function (i) { return object[i] = value; });
}

var xlinkNS = 'http://www.w3.org/1999/xlink';
var xmlNS = 'http://www.w3.org/XML/1998/namespace';
var strictProps = {};
var booleanProps = {};
var namespaces = {};
var isUnitlessNumber = {};

constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,value', strictProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);

function setTextContent(dom, text) {
	if (text !== '') {
		dom.textContent = text;
	} else {
		dom.appendChild(document.createTextNode(''));
	}
}

function updateTextContent(dom, text) {
	dom.firstChild.nodeValue = text;
}

function appendChild(parentDom, dom) {
	parentDom.appendChild(dom);
}

function insertOrAppend(parentDom, newNode, nextNode) {
	if (isNullOrUndef(nextNode)) {
		appendChild(parentDom, newNode);
	} else {
		parentDom.insertBefore(newNode, nextNode);
	}
}

function replaceChild(parentDom, nextDom, lastDom) {
	parentDom.replaceChild(nextDom, lastDom);
}

function normalise(object) {
	if (isStringOrNumber(object)) {
		// return createVText(object);
	} else if (isInvalid(object)) {
		// return createVPlaceholder();
	} else if (isArray(object)) {
		// return createVFragment(object);
	}
	return object;
}

function normaliseChild(children, i) {
	var child = children[i];

	return children[i] = normalise(child);
}

// TODO: for node we need to check if document is valid
function getActiveNode() {
	return document.activeElement;
}

function removeAllChildren(dom, children, lifecycle) {
	dom.textContent = '';
	for (var i = 0; i < children.length; i++) {
		var child = children[i];

		if (!isInvalid(child)) {
			unmount(child, null, lifecycle, true);
		}
	}
}

function resetActiveNode(activeNode) {
	if (activeNode !== null && activeNode !== document.body && document.activeElement !== activeNode) {
		activeNode.focus(); // TODO: verify are we doing new focus event, if user has focus listener this might trigger it
	}
}

function isKeyed(lastChildren, nextChildren) {
	if (lastChildren.complex) {
		return false;
	}
	return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key)
		&& lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
}

function mount(input, parentDom, lifecycle, context, isSVG) {
	if (isVTemplate(input)) {
		return mountVTemplate(input, parentDom, lifecycle, context, isSVG);
	} else if (isVText(input)) {
		return mountVText(input, parentDom);
	} else if (isVFragment$1(input)) {
		return mountVFragment$1(input, parentDom, lifecycle, context, isSVG);
	} else {
		if ("development" !== 'production') {
			throwError('bad input argument called on mount(). Input argument may need normalising.');
		}
		throwError();
	}
}

function mountVFragment$1(vFragment, parentDom, lifecycle, context, isSVG) {
	var children = vFragment.children;
	var pointer = document.createTextNode('');
	var dom = document.createDocumentFragment();
	var childrenType = vFragment.childrenType;

	if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG);
	} else if (isUnknownChildrenType(childrenType)) {
		mountArrayChildrenWithoutType$1(children, dom, lifecycle, context, isSVG);
	}
	vFragment.pointer = pointer;
	vFragment.dom = dom;
	appendChild(dom, pointer);
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function createStaticClone(bp, isSVG) {
	var stat = bp.static;
	var tag = stat.tag;
	var dom = document.createElement(tag);
	var props = stat.props;

	for (var prop in props) {
		patchProp(prop, null, props[prop], dom);
	}
	bp.clone = dom;
	return dom.cloneNode(true);
}

function mountVText(vText, parentDom) {
	var dom = document.createTextNode(vText.text);

	vText.dom = dom;
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function mountVTemplate(vTemplate, parentDom, lifecycle, context, isSVG) {
	var bp = vTemplate.bp;
	var dom = null;

	if (recyclingEnabled) {
		dom = recycleVTemplate(vTemplate, lifecycle, context, isSVG);
	}
	if (isNull(dom)) {
		dom = (bp.clone && bp.clone.cloneNode(true)) || createStaticClone(bp, isSVG);
		vTemplate.dom = dom;
		var bp0 = bp.v0;

		if (!isNull(bp0)) {
			mountTemplateValue(bp0, vTemplate.v0, dom, lifecycle, context, isSVG);
			var bp1 = bp.v1;

			if (!isNull(bp1)) {
				mountTemplateValue(bp1, vTemplate.v1, dom, lifecycle, context, isSVG);
			}
		}
	}
	if (!isNull(parentDom)) {
		parentDom.appendChild(dom);
	}
	return dom;
}

function mountTemplateValue(templateValueType, value, dom, lifecycle, context, isSVG) {
	switch (templateValueType) {
		case TemplateValueTypes.CHILDREN_KEYED:
		case TemplateValueTypes.CHILDREN_NON_KEYED:
			mountArrayChildrenWithType(value, dom, lifecycle, context, isSVG);
			break;
		case TemplateValueTypes.CHILDREN_TEXT:
			setTextContent(dom, value);
			break;
		case TemplateValueTypes.CHILDREN_NODE:
			mount(value, dom, lifecycle, context, isSVG);
			break;
		case TemplateValueTypes.PROPS_CLASS_NAME:
			if (!isNullOrUndef(value)) {
				dom.className = value;
			}
			break;
	}
}

function mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG) {
	for (var i = 0; i < children.length; i++) {
		mount(children[i], dom, lifecycle, context, isSVG);
	}
}

function mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG) {
	if (isArray(children)) {
		// mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG);
	} else if (isStringOrNumber(children)) {
		setTextContent(dom, children);
	} else if (!isInvalid(children)) {
		mount(children, dom, lifecycle, context, isSVG);
	}
}

function mountArrayChildrenWithoutType$1(children, dom, lifecycle, context, isSVG) {
	children.complex = false;
	for (var i = 0; i < children.length; i++) {
		var child = normaliseChild(children, i);

		if (isVText(child)) {
			mountVText(child, dom);
			children.complex = true;
		} else if (isVPlaceholder(child)) {
			mountVPlaceholder(child, dom);
			children.complex = true;
		} else if (isVFragment$1(child)) {
			mountVFragment$1(child, dom, lifecycle, context, isSVG);
			children.complex = true;
		} else {
			mount(child, dom, lifecycle, context, isSVG);
		}
	}
}

// import hydrateRoot from './hydration';
var roots = new Map();
var componentToDOMNodeMap = new Map();

function findDOMNode(domNode) {
	return componentToDOMNodeMap.get(domNode) || null;
}

var documetBody = isBrowser ? document.body : null;

function render(input, parentDom) {
	var root = roots.get(parentDom);
	var lifecycle = new Lifecycle();

	if (documetBody === parentDom) {
		if ("development" !== 'production') {
			throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
		}
		throwError();
	}
	if (input === NO_OP) {
		return;
	}
	if (isUndefined(root)) {
		if (!isInvalid(input)) {
			// if (!hydrateRoot(input, parentDom, lifecycle)) {
			mountChildrenWithUnknownType(input, parentDom, lifecycle, {}, false);
			// }
			lifecycle.trigger();
			roots.set(parentDom, { input: input });
		}
	} else {
		var activeNode = getActiveNode();

		if (isNull(input)) {
			unmount(root.input, parentDom, lifecycle, true);
			roots.delete(parentDom);
		} else {
			patchChildrenWithUnknownType(root.input, input, parentDom, lifecycle, {}, false);
		}
		lifecycle.trigger();
		root.input = input;
		resetActiveNode(activeNode);
	}
}

var index = {
	render: render,
	findDOMNode: findDOMNode,
	mount: mount,
	patch: patch,
	unmount: unmount
};

return index;

})));