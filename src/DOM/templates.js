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
	patchVariable,
	patchVTemplate,
	patchProp,
	patchTemplateClassName
} from './patching';
import {
	unmountVariable
} from './unmounting';

export const recyclingEnabled = true;

function copyValue(oldItem, item, index) {
	const value = oldItem.read(index);

	item.write(index, value);
	return value;
}

function copyTemplate(nodeIndex) {
	return function copyTemplate(oldItem, item) {
		return copyValue(oldItem, item, nodeIndex);
	};
}

export function createTemplateReducers(vNode, isRoot, offset, parentDom, isSVG, isChildren, childrenType) {
	if (!isInvalid(vNode)) {
		let keyIndex = NULL_INDEX;
		let nodeIndex = isRoot ? ROOT_INDEX : NULL_INDEX;
		let mount;
		let patch;
		let unmount;
		let deepClone = false;

		if (isVariable(vNode)) {
			mount = mountVariable(vNode, isSVG, isChildren, childrenType);
			patch = patchVariable(vNode, isSVG, isChildren, childrenType);
			unmount = unmountVariable(vNode, isChildren, childrenType);
		} else if (isVElement(vNode)) {
			const mounters = [];
			const patchers = [];
			const unmounters = [];
			const tag = vNode._tag;

			if (tag === 'svg') {
				isSVG = true;
			}
			const dom = documentCreateElement(tag, isSVG);
			const key = vNode._key;

			if (!isNull(key) && isVariable(key)) {
				keyIndex = key._arg;
			}
			const props = vNode._props;

			if (!isNull(props)) {
				for (let prop in props) {
					const value = props[prop];

					if (isVariable(value)) {
						if (prop === 'className') {
							patchers.push(patchTemplateClassName(value));
						}
					} else {
						const shouldMountProp = patchProp(prop, null, value, dom);
						// debugger;
						// todo
					}
				}
			}
			const hooks = vNode._hooks;

			if (patchers.length > 0 && nodeIndex === NULL_INDEX) {
				nodeIndex = offset.length++;
			}
			const children = vNode._children;

			if (!isInvalid(children)) {
				if (isStringOrNumber(children)) {
					// debugger;
				} else if (isArray(children)) {
					for (let i = 0; i < children.length; i++) {
						const templateReducers = createTemplateReducers(children[i], false, offset, dom, isSVG, false, vNode._childrenType);

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
				} else {
					if (nodeIndex === NULL_INDEX && isVariable(children)) {
						nodeIndex = offset.length++;
					}
					const templateReducers = createTemplateReducers(children, false, offset, dom, isSVG, true, vNode._childrenType);

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
			mount = combineMount(nodeIndex, mountDOMNodeFromTemplate(dom, isRoot, deepClone), mounters);
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

	return function combineMountTo5(vTemplate, parentDom, lifecycle, context, isSVG) {
		const dom = mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context, isSVG);

		if (write) {
			vTemplate.write(nodeIndex, dom);
		}
		if (mounter1) {
			mounter1(vTemplate, dom, lifecycle, context, isSVG);
			if (mounter2) {
				mounter2(vTemplate, dom, lifecycle, context, isSVG);
				if (mounter3) {
					mounter3(vTemplate, dom, lifecycle, context, isSVG);
					if (mounter4) {
						mounter4(vTemplate, dom, lifecycle, context, isSVG);
					}
				}
			}
		}
		return dom;
	};
}

function combineMountToX(nodeIndex, mountDOMNodeFromTemplate, mounters) {
	const write = (nodeIndex !== NULL_INDEX);

	return function combineMountToX(vTemplate, parentDom, lifecycle, instance, isSVG) {
		const dom = mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context);

		if (write) {
			vTemplate.write(nodeIndex, dom);
		}
		for (let i = 0; i < mounters.length; i++) {
			mounters[i](vTemplate, dom, lifecycle, context, isSVG);
		}
		return dom;
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

	return function combinePatchTo5(lastVTemplate, nextVTemplate, lifecycle, context, isSVG) {
		let dom;

		if (copy) {
			dom = copyValue(lastVTemplate, nextVTemplate, nodeIndex);
		}
		if (patch1) {
			patch1(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
			if (patch2) {
				patch2(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
				if (patch3) {
					patch3(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
					if (patch4) {
						patch4(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
						if (patch5) {
							patch5(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
						}
					}
				}
			}
		}
	};
}

function combinePatchX(nodeIndex, patchers) {
	const copy = (nodeIndex !== NULL_INDEX);

	return function combinePatchX(lastVTemplate, nextVTemplate, lifecycle, context, isSVG) {
		let dom;

		if (copy) {
			dom = copyValue(lastVTemplate, nextVTemplate, nodeIndex);
		}
		for (let i = 0; i < patchers.length; i++) {
			patchers[i](lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
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

	return function combineUnmountTo5(vTemplate) {
		if (unomunt1) {
			unomunt1(vTemplate);
			if (unomunt2) {
				unomunt2(vTemplate);
				if (unomunt3) {
					unomunt3(vTemplate);
					if (unomunt4) {
						unomunt4(vTemplate);
						if (unomunt5) {
							unomunt5(vTemplate);
						}
					}
				}
			}
		}
	};
}

function combineUnmountX() {

}

export function recycleVTemplate(vTemplate, lifecycle, context, isSVG) {
	const templateReducers = vTemplate._tr;
	const key = vTemplate._key;
	const pool = key === null ? templateReducers._pools.nonKeyed : templateReducers._pools.keyed.get(key);

	if (!isUndefined(pool)) {
		const recycledVTemplate = pool.pop();

		if (!isNullOrUndef(recycledVTemplate)) {
			patchVTemplate(recycledVTemplate, vTemplate, null, lifecycle, context, isSVG);
			return vTemplate._dom;
		}
	}
	return null;
}

export function poolVTemplate(vTemplate) {
	const templateReducers = vTemplate._tr;
	const key = vTemplate._key;
	const pools = templateReducers._pools;

	if (key === null) {
		const pool = pools.nonKeyed;

		pool && pool.push(vTemplate);
	} else {
		let pool = pools.keyed.get(key);

		if (isUndefined(pool)) {
			pool = [];
			pools.keyed.set(key, pool);
		}
		pool.push(vTemplate);
	}
	return true;
}