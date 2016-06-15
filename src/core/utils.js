
export function addChildrenToProps(children, props) {
	if (!isNullOrUndefined(children)) {
		const isChildrenArray = isArray(children);
		if (isChildrenArray && children.length > 0 || !isChildrenArray) {
			if (props) {
				props = Object.assign({}, props, { children });
			} else {
				props = {
					children: children
				};
			}
		}
	}
	return props;
}

export function isArray(obj) {
	return obj instanceof Array;
}

export function isStatefulComponent(obj) {
	return obj.prototype.render !== undefined;
}

export function isStringOrNumber(obj) {
	return typeof obj === 'string' || typeof obj === 'number';
}

export function isNullOrUndefined(obj) {
	return obj === undefined || obj === null;
}

export function isInvalidNode(obj) {
	return obj === null || obj === false || obj === undefined;
}

export function isFunction(obj) {
	return typeof obj === 'function';
}

export function isAttrAnEvent(attr) {
	return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
}

export function isString(obj) {
	return typeof obj === 'string';
}

export function isAttrAHook(hook) {
	return hook === 'onCreated'
		|| hook === 'onAttached'
		|| hook === 'onWillDetach'
		|| hook === 'onWillUpdate'
		|| hook === 'onDidUpdate';
}

export function isAttrAComponentHook(hook) {
	return hook === 'onComponentWillMount'
		|| hook === 'onComponentDidMount'
		|| hook === 'onComponentWillUnmount'
		|| hook === 'onComponentShouldUpdate'
		|| hook === 'onComponentWillUpdate'
		|| hook === 'onComponentDidUpdate';
}

export function isPromise(obj) {
	return obj instanceof Promise;
}

export function replaceInArray(array, obj, newObj) {
	array.splice(array.indexOf(obj), 1, newObj);
}
