import fragmentValueTypes from '../enum/fragmentValueTypes';

export default function createComponentFactory(template) {
	return function createComponent(component, ...children) {
		var element = template.createEmptyDiv();

		if (this.templateValue) {
			this.templateElement = element;
			this.templateType = fragmentValueTypes.COMPONENT_REPLACE;
		} else {
			this.templateElements[component.pointer] = element;
			this.templateTypes[component.pointer] = fragmentValueTypes.COMPONENT_REPLACE;
		}

		for (let i = 0; i < children.length; i++) {
			element.appendChild(children[i]);
		}
		return element;
	}
}