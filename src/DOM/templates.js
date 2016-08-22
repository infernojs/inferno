import {
	isArray,
	isStringOrNumber,
	isNullOrUndef,
	isInvalid,
	getRefInstance,
	isNull,
	isUndefined,
	throwError
} from './../core/utils';
import {
	appendText,
	documentCreateElement,
	handleAttachedHooks,
	normalise,
	setTextContent
} from './utils';
import {
	isVElement,
	isVComponent,
	isVariable,
	isVFragment,
	isVText,
	createTemplaceReducers,
	NULL_INDEX,
	ROOT_INDEX
} from './../core/shapes';
import {
	mountVariableAsExpression,
	mountVariableAsChildren,
	mountVariableAsText,
	mountDOMNodeFromTemplate,
	mountEmptyTextNode,
	mountTemplateClassName,
	mountTemplateStyle,
	mountTemplateProps,
	mountRefFromTemplate,
	mountSpreadPropsFromTemplate
} from './mounting';
import {
	patchVariableAsExpression,
	patchVariableAsChildren,
	patchVariableAsText,
	patchVTemplate,
	patchProp,
	patchTemplateClassName,
	patchTemplateStyle,
	patchTemplateProps
} from './patching';
import {
	hydrateVariableAsChildren,
	hydrateVariableAsExpression,
	hydrateVariableAsText,
	normaliseChildNodes
} from './hydration';
import {
	unmountVariableAsExpression,
	unmountVariableAsChildren,
	unmountVariableAsText
} from './unmounting';
import { ChildrenTypes } from '../core/ChildrenTypes';

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

export function createTemplateReducers(vNode, isRoot, offset, parentDom, isSVG, isChildren, childrenType, path) {
	if (!isInvalid(vNode)) {
		let keyIndex = NULL_INDEX;
		let nodeIndex = isRoot ? ROOT_INDEX : NULL_INDEX;
		let mount;
		let patch;
		let unmount;
		let hydrate;
		let deepClone = false;

		if (isVariable(vNode)) {
			if (isChildren) {
				mount = mountVariableAsChildren(vNode._pointer, isSVG, childrenType);
				if (childrenType === ChildrenTypes.STATIC_TEXT) {
					patch = null;
				} else {
					patch = patchVariableAsChildren(vNode._pointer, isSVG, childrenType);
				}
				unmount = unmountVariableAsChildren(vNode._pointer, childrenType);
				hydrate = hydrateVariableAsChildren(vNode._pointer, childrenType);
			} else {
				mount = mountVariableAsExpression(vNode._pointer, isSVG);
				patch = patchVariableAsExpression(vNode._pointer, isSVG);
				unmount = unmountVariableAsExpression(vNode._pointer);
				hydrate = hydrateVariableAsExpression(vNode._pointer);
			}
		} else if (isVFragment(vNode)) {
			const children = vNode._children;

			if (isVariable(children)) {
				mount = mountVariableAsChildren(children._pointer, isSVG, childrenType);
				patch = patchVariableAsChildren(children._pointer, isSVG, childrenType);
				unmount = unmountVariableAsChildren(children._pointer, childrenType);
			} else {
				// debugger;
			}
		} else if (isVText(vNode)) {
			const text = vNode._text;
			nodeIndex = offset.length++;

			if (isVariable(text)) {
				mount = combineMountTo2(nodeIndex, mountEmptyTextNode, mountVariableAsText(text._pointer));
				patch = combinePatchTo2(nodeIndex, patchVariableAsText(text._pointer));
				unmount = unmountVariableAsText(text._pointer);
				hydrate = hydrateVariableAsText(text._pointer);
			} else {
				mount = mountDOMNodeFromTemplate(document.createTextNode(text), true);
				patch = null;
				unmount = null;
			}
		} else if (isVElement(vNode)) {
			const mounters = [];
			const patchers = [];
			const unmounters = [];
			const hydraters = [];
			const tag = vNode._tag;

			if (tag === 'svg') {
				isSVG = true;
			}
			const dom = documentCreateElement(tag, isSVG);
			const key = vNode._key;

			if (!isNull(key) && isVariable(key)) {
				keyIndex = key._pointer;
			}
			const children = vNode._children;

			if (!isInvalid(children)) {
				if (isStringOrNumber(children)) {
					setTextContent(dom, children);
					deepClone = true;
				} else if (isArray(children)) {
					for (let i = 0; i < children.length; i++) {
						const child = children[i];

						if (nodeIndex === NULL_INDEX && isVariable(child)) {
							nodeIndex = offset.length++;
						}
						const templateReducers = createTemplateReducers(normalise(child), false, offset, dom, isSVG, false, vNode._childrenType, path + ',' + i);

						if (!isInvalid(templateReducers)) {
							mounters.push(templateReducers.mount);
							const patch = templateReducers.patch;
							const unmount = templateReducers.unmount;
							const hydrate = templateReducers.hydrate;

							if (!isNull(patch)) {
								patchers.push(patch);
							}
							if (!isNull(unmount)) {
								unmounters.push(unmount);
							}
							if (!isNull(hydrate)) {
								hydraters.push(hydrate);
							}
						}
					}
				} else {
					if (nodeIndex === NULL_INDEX && isVariable(children)) {
						nodeIndex = offset.length++;
					}
					const templateReducers = createTemplateReducers(normalise(children), false, offset, dom, isSVG, true, vNode._childrenType, path + ',0');

					if (!isInvalid(templateReducers)) {
						mounters.push(templateReducers.mount);
						const patch = templateReducers.patch;
						const unmount = templateReducers.unmount;
						const hydrate = templateReducers.hydrate;

						if (!isNull(patch)) {
							patchers.push(patch);
						}
						if (!isNull(unmount)) {
							unmounters.push(unmount);
						}
						if (!isNull(hydrate)) {
							hydraters.push(hydrate);
						}
					}
				}
			}
			const props = vNode._props;

			if (!isNull(props)) {
				if (isVariable(props)) {
					mounters.push(mountSpreadPropsFromTemplate(props._pointer, isSVG));
				} else {
					const propsToMount = [];
					const propsToPatch = [];

					for (let prop in props) {
						const value = props[prop];

						if (isVariable(value)) {
							if (prop === 'className') {
								mounters.push(mountTemplateClassName(value._pointer));
								patchers.push(patchTemplateClassName(value._pointer));
							} else if (prop === 'style') {
								mounters.push(mountTemplateStyle(value._pointer));
								patchers.push(patchTemplateStyle(value._pointer));
							} else {
								propsToMount.push(prop, value);
								propsToPatch.push(prop, value._pointer);
							}
						} else {
							const shouldMountProp = patchProp(prop, null, value, dom);

							if (shouldMountProp) {
								propsToMount.push(prop, value);
							}
						}
					}
					if (propsToMount.length > 0) {
						mounters.push(mountTemplateProps(propsToMount, tag));
					}
					if (propsToPatch.length > 0) {
						patchers.push(patchTemplateProps(propsToPatch, tag));
					}
				}
			}
			const ref = vNode._ref;

			if (!isNullOrUndef(ref)) {
				mounters.push(mountRefFromTemplate(ref));
			}
			if (patchers.length > 0 && nodeIndex === NULL_INDEX) {
				nodeIndex = offset.length++;
			}
			mount = combineMount(nodeIndex, mountDOMNodeFromTemplate(dom, deepClone), mounters);
			patch = combinePatch(nodeIndex, patchers);
			unmount = combineUnmount(nodeIndex, unmounters);
			hydrate = combineHydrate(nodeIndex, path, hydraters);
		} else if (isVComponent(vNode)) {
			if (process.env.NODE_ENV !== 'production') {
				throwError('templates cannot contain VComponent nodes. Pass a VComponent node into a template as a variable instead.');
			}
			throwError();
		}
		return createTemplaceReducers(keyIndex, mount, patch, unmount, hydrate);
	}
}

function combineMount(nodeIndex, mountDOMNodeFromTemplate, mounters) {
	if (nodeIndex === NULL_INDEX && mounters.length === 0) {
		return mountDOMNodeFromTemplate;
	} else if (mounters.length <= 1) {
		return combineMountTo2(nodeIndex, mountDOMNodeFromTemplate, mounters[0]);
	} else if (mounters.length <= 4) {
		return combineMountTo5(nodeIndex, mountDOMNodeFromTemplate, mounters[0], mounters[1], mounters[2], mounters[3]);
	} else {
		return combineMountToX(nodeIndex, mountDOMNodeFromTemplate, mounters);
	}
}

function combineMountTo2(nodeIndex, mountDOMNodeFromTemplate, mounter1) {
	const write = (nodeIndex !== NULL_INDEX);

	return function combineMountTo2(vTemplate, parentDom, lifecycle, context, isSVG) {
		const dom = mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context, isSVG);

		if (write) {
			vTemplate.write(nodeIndex, dom);
		}
		if (mounter1) {
			mounter1(vTemplate, dom, lifecycle, context, isSVG);
		}
		return dom;
	};
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

	return function combineMountToX(vTemplate, parentDom, lifecycle, context, isSVG) {
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
	} else if (patchers.length <= 1) {
		return combinePatchTo2(nodeIndex, patchers[0]);
	} else if (patchers.length <= 4) {
		return combinePatchTo5(nodeIndex, patchers[0], patchers[1], patchers[2], patchers[3], patchers[4]);
	} else {
		return combinePatchX(nodeIndex, patchers);
	}
}

function combinePatchTo2(nodeIndex, patch1) {
	const copy = (nodeIndex !== NULL_INDEX);

	return function combinePatchTo2(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
		let dom;

		if (copy) {
			dom = copyValue(lastVTemplate, nextVTemplate, nodeIndex);
		}
		if (patch1) {
			patch1(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
		}
	};
}

function combinePatchTo5(nodeIndex, patch1, patch2, patch3, patch4, patch5) {
	const copy = (nodeIndex !== NULL_INDEX);

	return function combinePatchTo5(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
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

	return function combinePatchX(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
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
		if (unmounters.length <= 4) {
			return combineUnmountTo5(nodeIndex, unmounters[0], unmounters[1], unmounters[2], unmounters[3], unmounters[4]);
		}
	}
	return null;
}

function combineUnmountTo5(nodeIndex, unomunt1, unomunt2, unomunt3, unomunt4, unomunt5) {
	return function combineUnmountTo5(vTemplate, lifecycle) {
		if (unomunt1) {
			unomunt1(vTemplate, lifecycle);
			if (unomunt2) {
				unomunt2(vTemplate, lifecycle);
				if (unomunt3) {
					unomunt3(vTemplate, lifecycle);
					if (unomunt4) {
						unomunt4(vTemplate, lifecycle);
						if (unomunt5) {
							unomunt5(vTemplate, lifecycle);
						}
					}
				}
			}
		}
	};
}

function combineUnmountX(nodeIndex, unmounters) {
	return function combineUnmountX(vTemplate, lifecycle) {
		for (let i = 0; i < unmounters.length; i++) {
			unmounters[i](vTemplate, lifecycle);
		}
	};
}

function combineHydrate(nodeIndex, path, hydraters) {
	if (hydraters.length <= 4) {
		return combineHydrateTo5(nodeIndex, path, hydraters[0], hydraters[1], hydraters[2], hydraters[3], hydraters[4]);
	} else {
		return combineHydrateX(nodeIndex, path, hydraters);
	}
}

function combineHydrateTo5(nodeIndex, path, hydrate1, hydrate2, hydrate3, hydrate4, hydrate5) {
	const write = (nodeIndex !== NULL_INDEX);

	return function combineHydrateTo5(vTemplate, rootDom, lifecycle, context) {
		let dom;

		if (write) {
			dom = getDomFromTemplatePath(rootDom, path);
			vTemplate.write(nodeIndex, dom);
		}
		if (hydrate1) {
			hydrate1(vTemplate, dom, lifecycle, context);
			if (hydrate2) {
				hydrate2(vTemplate, dom, lifecycle, context);
				if (hydrate3) {
					hydrate3(vTemplate, dom, lifecycle, context);
					if (hydrate4) {
						hydrate4(vTemplate, dom, lifecycle, context);
						if (hydrate5) {
							hydrate5(vTemplate, dom, lifecycle, context);
						}
					}
				}
			}
		}
	};
}

function combineHydrateX(nodeIndex, unmounters) {
	return function combineHydrateX() {
		const write = (nodeIndex !== NULL_INDEX);

		return function combineHydrateX(vTemplate, rootDom, lifecycle, context) {
			let dom;

			if (write) {
				dom = getDomFromTemplatePath(rootDom, path);
				vTemplate.write(nodeIndex, dom);
			}
			for (let i = 0; i < unmounters.length; i++) {
				unmounters[i](vTemplate, dom, lifecycle, context);
			}
		};
	};
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

function getDomFromTemplatePath(rootDom, path) {
	if (path === '') {
		normaliseChildNodes(rootDom);
		return rootDom;
	} else {
		const routes = path.split(',');
		let dom = rootDom;

		for (let i = 0; i < routes.length; i++) {
			const route = routes[i];

			if (route !== '') {
				const childNodes = normaliseChildNodes(dom);

				dom = childNodes[route];
			}
		}
		return dom;
	}
}
