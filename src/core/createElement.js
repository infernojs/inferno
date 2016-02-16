import { isAttrAnEvent, isArray, isNullOrUndefined, isFunction } from './utils';

export function createAttrsAndEvents(props, tag) {
	let events = null;
	let attrs = null;
	let className = null;

	if (props) {
		if (!isArray(props)) {
			for (let prop in props) {
				if (prop === 'className') {
					className = props[prop];
				} else if (isAttrAnEvent(prop)) {
					if (!events) {
						events = {};
					}
					events[prop[2].toLowerCase() + prop.substring(3)] = props[prop];
					delete props[prop];
				} else if (!isFunction(tag)) {
					if (!attrs) {
						attrs = {};
					}
					attrs[prop] = props[prop];
				} else {
					attrs = props;
				}
			}
		} else {
			return props;
		}
	}
	return { attrs, events, className };
}

function createChild({ tag, attrs, children, text }) {
	const key = attrs && !isNullOrUndefined(attrs.key) ? attrs.key : null;

	if (key !== null) {
		delete attrs.key;
	}
	const attrsAndEvents = createAttrsAndEvents(attrs, tag);

	if (!isNullOrUndefined(children)) {
		children = isArray(children) && children.length === 1 ? createChildren(children[0]) : createChildren(children);
	}
	return {
		dom: null,
		tag: tag,
		key: key,
		attrs: attrsAndEvents.attrs,
		events: attrsAndEvents.events,
		className: attrsAndEvents.className,
		children: children || text,
		instance: null
	};
}

export function createChildren(children) {
	if (children && isArray(children)) {
		const newChildren = [];

		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (!isNullOrUndefined(child)) {
				newChildren.push(createChild(child));
			} else {
				newChildren.push(child);
			}
		}
		return newChildren;
	} else if (children && typeof children === 'object') {
		return createChild(children);
	} else {
		return children;
	}
}

export default function createElement(tag, props, ...children) {
	return createChild({ tag, attrs: props, children });
}