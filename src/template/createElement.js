import fragmentValueTypes from '../enum/fragmentValueTypes';
import isArray from '../util/isArray';

export default function createElementFactory(template) {
	return function createElement(tag, props, ...children) {
		let element;
		let is = props && (props.is || null); // type extension
	    let xmlns = props && (props.xmlns || null); // xmlns

		if (typeof tag === 'string') {
			element = template.createElement(tag, xmlns, is);
		} else {
			element = template.createEmptyText();

			if(this.templateValue) {
				this.templateElement = element;
				this.templateType = fragmentValueTypes.COMPONENT;
			} else {
				this.templateElements[child.pointer] = element;
				this.templateTypes[child.pointer] = fragmentValueTypes.COMPONENT;
			}

			return element;
		}

		const len = children.length;

		if(len > 0) {
			if (len > 1) {
				for (let i = 0; i < len; i++) {
					let child = children[i];

					if (child.pointer !== undefined) {
						let value = this.templateValue || this.templateValues[child.pointer];

						if (typeof value !== 'object') {
							let node = template.createTextNode(value);

							if(this.templateValue) {
								this.templateElement = node;
								this.templateType = fragmentValueTypes.TEXT_DIRECT;
							} else {
								this.templateElements[child.pointer] = node;
								this.templateTypes[child.pointer] = fragmentValueTypes.TEXT_DIRECT;
							}
							element.appendChild(node);
						}
					} else if (typeof child !== 'object') {
						let node = template.createTextNode(child);

						element.appendChild(node);
					} else if (child.component) {
						if(this.templateValues) {
							let templateIndex = child.templateIndex;

							this.templateElements[templateIndex] = element;
							this.templateTypes[templateIndex] = fragmentValueTypes.FRAGMENT;
							this.templateValues[templateIndex] = child;
						} else {
							this.templateElement = element;
							this.templateType = fragmentValueTypes.FRAGMENT;
							this.templateValue = child;
						}
					} else {
						element.appendChild(child);
					}
				}
			}
			else if ((children = children[0]) && children.pointer !== undefined) {
				let value = this.templateValue || this.templateValues[children.pointer];

				if (typeof value !== 'object') {
					element.textContent = value;
					if(this.templateValue) {
						this.templateElement = element;
						this.templateType = fragmentValueTypes.TEXT;
					} else {
						this.templateElements[children.pointer] = element;
						this.templateTypes[children.pointer] = fragmentValueTypes.TEXT;
					}
				} else if (isArray(value)) {
					if(this.templateValue) {
						this.templateElement = element;
						this.templateType = fragmentValueTypes.LIST;
					} else {
						this.templateElements[children.pointer] = element;
						this.templateTypes[children.pointer] = fragmentValueTypes.LIST;
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
			template.addAttributes(element, props, this);
		}
		return element;
	}
}
