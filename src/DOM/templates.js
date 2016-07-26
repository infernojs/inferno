import {
	isArray,
	isStringOrNumber,
	isFunction,
	isNullOrUndef,
	addChildrenToProps,
	isStatefulComponent,
	isString,
	isInvalid,
	getRefInstance,
	isNull,
	isUndefined,
	isTrue,
	isObject
} from './../core/utils';
import {
	appendText,
	documentCreateElement,
	selectValue,
	handleAttachedHooks,
	insertOrAppend,
	normaliseChild,
	isPropertyOfElement,
	namespaces
} from './utils';
import {
	isVElement,
	isVComponent,
	isVariable,
	createTemplaceReducers,
	NULL_INDEX,
	ROOT_INDEX
} from './../core/shapes';
import {
	mountVariable,
	mountDOMNodeFromTemplate
} from './mounting';
import {
	patchVariable
} from './patching';
import {
	unmountVariable
} from './unmounting';

export function createTemplateReducers(vNode, isRoot, offset, parentDom, isSVG) {
	if (!isInvalid(vNode)) {
		let keyIndex = NULL_INDEX;
		let nodeIndex = isRoot ? ROOT_INDEX : NULL_INDEX;
		let mount;
		let patch;
		let unmount;
		let shouldClone = false;

		if (isVariable(vNode)) {
			mount = mountVariable(vNode, isSVG);
			patch = patchVariable(vNode, isSVG);
			unmount = unmountVariable(vNode);
		} else if (isVElement(vNode)) {
			const mounters = [];
			const patchers = [];
			const unmounters = [];
			const tag = vNode._tag;

			if (tag === 'svg') {
				isSVG = true;
			}
			const domNode = documentCreateElement(tag, isSVG);
			const key = vNode._key;

			if (!isNull(key) && isVariable(key)) {
				keyIndex = key._arg;
			}
			const props = vNode._props;
			const hooks = vNode._hooks;

			if (patchers.length > 0 && nodeIndex === NULL_INDEX) {
				nodeIndex = offset.length++;
			}
			const children = vNode._children;

			if (!isInvalid(children)) {
				if (isStringOrNumber(children)) {
					debugger;
				} else if (isArray(children)) {
					debugger;
				} else {
					const templateReducers = createTemplateReducers(children, false, offset, domNode, isSVG);

					if (!isInvalid(templateReducers)) {
						mounters.push(templateReducers.mount);
						const patch = templateReducers.patch;
						const unmount = templateReducers.unmount;

						if (!isNull(patch)) {
							patchers.push(patch);
						}
						if (!isNull(unmount)) {
							unmounters.push(unmount);
						}
					}
				}
			}
			mount = combineMount(nodeIndex, mountDOMNodeFromTemplate(domNode, isRoot, shouldClone), mounters);
			patch = combinePatch(nodeIndex, patchers);
			unmount = combineUnmount(nodeIndex, unmounters);
		} else if (isVComponent(vNode)) {
			throw new Error('Inferno Error: templates cannot contain VComponent nodes. Pass a VComponent node into a template as a variable instead.');
		}
		return createTemplaceReducers(keyIndex, mount, patch, unmount);
	}
}

function combineMount(nodeIndex, mountDOMNodeFromTemplate, mounters) {
	if (nodeIndex === NULL_INDEX && mounters.length === 0) {
		return mountDOMNodeFromTemplate;
	} else if (mounters.length <= 5) {
		return combineMountTo5(nodeIndex, mountDOMNodeFromTemplate, mounters[0], mounters[1], mounters[2], mounters[3]);
	} else {
		return combineMountToX(nodeIndex, mountDOMNodeFromTemplate, mounters);
	}
}

function combineMountTo5(nodeIndex, mountDOMNodeFromTemplate, mounter1, mounter2, mounter3, mounter4) {
	const write = (nodeIndex !== NULL_INDEX);

	return function combineMountTo5(vTemplate, parentDom, lifecycle, context) {
		const domNode = mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context);

		if (write) {
			vTemplate.write(nodeIndex, domNode);
		}
		if (mounter1) {
			mounter1(vTemplate, domNode, lifecycle, context);
			if (mounter2) {
				mounter2(vTemplate, domNode, lifecycle, context);
				if (mounter3) {
					mounter3(vTemplate, domNode, lifecycle, context);
					if (mounter4) {
						mounter4(vTemplate, domNode, lifecycle, context);
					}
				}
			}
		}
		return domNode;
	};
}

function combineMountToX(nodeIndex, mountDOMNodeFromTemplate, mounters) {
	const write = (nodeIndex !== NULL_INDEX);

	return function combineMountToX(vTemplate, parentDom, lifecycle, instance) {
		const domNode = mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context);

		if (write) {
			vTemplate.write(nodeIndex, domNode);
		}
		for (let i = 0; i < mounters.length; i++) {
			mounters[i](vTemplate, domNode, lifecycle, context);
		}
		return domNode;
	};
}

function combinePatch(nodeIndex, patchers) {
	if (patchers.length === 0) {
		if (nodeIndex !== NULL_INDEX) {
			return copyTemplate(nodeIndex);
		} else {
			return null;
		}
	} else if (patchers.length <= 5) {
		return combinePatchTo5(nodeIndex, patchers[0], patchers[1], patchers[2], patchers[3], patchers[4]);
	} else {
		return combinePatchX(nodeIndex, patchers);
	}
}

function combinePatchTo5(nodeIndex, patch1, patch2, patch3, patch4, patch5) {
	const copy = (nodeIndex !== NULL_INDEX);

	return function combinePatchTo5(lastVTemplate, nextVTemplate, lifecycle, context) {
		let domNode;

		if (copy) {
			domNode = copyValue(lastVTemplate, nextVTemplate, nodeIndex);
		}
		if (patch1) {
			patch1(lastVTemplate, nextVTemplate, domNode, lifecycle, context);
			if (patch2) {
				patch2(lastVTemplate, nextVTemplate, domNode, lifecycle, context);
				if (patch3) {
					patch3(lastVTemplate, nextVTemplate, domNode, lifecycle, context);
					if (patch4) {
						patch4(lastVTemplate, nextVTemplate, domNode, lifecycle, context);
						if (patch5) {
							patch5(lastVTemplate, nextVTemplate, domNode, lifecycle, context);
						}
					}
				}
			}
		}
	};
}

function combinePatchX(nodeIndex, patchers) {
	const copy = (nodeIndex !== NULL_INDEX);

	return function combinePatchX(lastVTemplate, nextVTemplate, lifecycle, context) {
		let domNode;

		if (copy) {
			domNode = copyValue(lastVTemplate, nextVTemplate, nodeIndex);
		}
		for (let i = 0; i < patchers.length; i++) {
			patchers[i](lastVTemplate, nextVTemplate, domNode, lifecycle, context);
		}
	};
}

function combineUnmount(nodeIndex, unmounters) {
	if (unmounters.length > 0) {
		if (unmounters.length <= 5) {
			return combineUnmountTo5(nodeIndex, unmounters[0], unmounters[1], unmounters[2], unmounters[3], unmounters[4]);
		}
	}
	return null;
}

function combineUnmountTo5(nodeIndex, unomunt1, unomunt2, unomunt3, unomunt4, unomunt5) {
	const copy = (nodeIndex !== NULL_INDEX);

	return function combineUnmountTo5(vTemplate, domNode, lifecycle, isRoot, isReplace) {
		if (copy) {
			domNode = vTemplate.read(nodeIndex);
		}
		if (unomunt1) {
			unomunt1(vTemplate, domNode, lifecycle, isRoot, isReplace);
			if (unomunt2) {
				unomunt2(vTemplate, domNode, lifecycle, isRoot, isReplace);
				if (unomunt3) {
					unomunt3(vTemplate, domNode, lifecycle, isRoot, isReplace);
					if (unomunt4) {
						unomunt4(vTemplate, domNode, lifecycle, isRoot, isReplace);
						if (unomunt5) {
							unomunt5(vTemplate, domNode, lifecycle, isRoot, isReplace);
						}
					}
				}
			}
		}
	};
}

function combineUnmountX() {

}