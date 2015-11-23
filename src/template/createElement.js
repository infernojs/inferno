import fragmentValueTypes from '../enum/fragmentValueTypes';
import isArray from '../util/isArray';
import render from '../core/render';

export default function createElementFactory(fragment, template) {
	return function createElement(tag, props, ...children) {
		let element;
		const is = props && (props.is || null); // type extension
		const len = children.length;

		if (typeof tag === 'string') {
			element = template.createElement(tag, is);
		} else {
			throw Error("Inferno Error: Invalid tag passed to createElement(). Components cannot be passed to createElement().");
		}

		if(len > 0) {
			if (len > 1) {
				for (let i = 0; i < len; i++) {
					const child = children[i];

					if (child.pointer !== undefined) {
						let value = fragment.templateValue || fragment.templateValues[child.pointer];

						if (typeof value !== 'object') {
							const node = template.createTextNode(value);

							if(fragment.templateValue) {
								fragment.templateElement = node;
								fragment.templateType = fragmentValueTypes.TEXT_DIRECT;
							} else {
								fragment.templateElements[child.pointer] = node;
								fragment.templateTypes[child.pointer] = fragmentValueTypes.TEXT_DIRECT;
							}
							element.appendChild(node);
						} else if (isArray(value)) {
							for(let s = 0; s < value.length; s++) {
								element.appendChild(value[s]);
							}
						} else if (value.template) {
							render(value, element)
							if(fragment.templateValues) {
								fragment.templateTypes[child.pointer] = fragmentValueTypes.COMPONENT_CHILDREN;
							} else {
								fragment.templateType = fragmentValueTypes.COMPONENT_CHILDREN;
							}
						}
					} else if (typeof child !== 'object') {
						const node = template.createTextNode(child);

						element.appendChild(node);
					} else if (child.component) {
						if (fragment.templateValues) {
							let templateIndex = child.templateIndex;

							fragment.templateElements[templateIndex] = element;
							fragment.templateTypes[templateIndex] = fragmentValueTypes.FRAGMENT;
							fragment.templateValues[templateIndex] = child;
						} else {
							fragment.templateElement = element;
							fragment.templateType = fragmentValueTypes.FRAGMENT;
							fragment.templateValue = child;
						}
					} else {
						element.appendChild(child);
					}
				}
			}
			else if ((children = children[0]) && children.pointer !== undefined) {
				const value = fragment.templateValue || fragment.templateValues[children.pointer];

				if (typeof value !== 'object') {
					element.textContent = value;
					if(fragment.templateValue) {
						fragment.templateElement = element;
						fragment.templateType = fragmentValueTypes.TEXT;
					} else {
						fragment.templateElements[children.pointer] = element;
						fragment.templateTypes[children.pointer] = fragmentValueTypes.TEXT;
					}
				} else if (isArray(value)) {
					if(fragment.templateValue) {
						fragment.templateElement = element;
						fragment.templateType = fragmentValueTypes.LIST;
					} else {
						fragment.templateElements[children.pointer] = element;
						fragment.templateTypes[children.pointer] = fragmentValueTypes.LIST;
					}
				}
			}
			else if (typeof children !== 'object') {
				element.textContent = children;
			} else if (children) {
				element.appendChild(children);
			}
		}

		if (props) {
			template.addAttributes(element, props, fragment);
		}
		return element;
	}
}
