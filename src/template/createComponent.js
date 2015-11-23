import fragmentValueTypes from '../enum/fragmentValueTypes';

export default function createComponentFactory(fragment, template) {
	return function createComponent(component, ...children) {
		var element = template.createEmptyDiv();

		if (fragment.templateValue) {
			fragment.templateElement = element;
			fragment.templateType = fragmentValueTypes.COMPONENT_REPLACE;
		} else {
			fragment.templateElements[component.pointer] = element;
			fragment.templateTypes[component.pointer] = fragmentValueTypes.COMPONENT_REPLACE;
		}

		for (let i = 0; i < children.length; i++) {
			element.appendChild(children[i]);
		}
		return element;
	}
}