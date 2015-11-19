import fragmentValueTypes from '../enum/fragmentValueTypes';

export default function createComponentFactory(template) {
	return function createComponent(component) {
		var element = template.createEmptyText();

		if(arguments.length > 1) {
			throw Error('Inferno Error: createComponent() can only take one argument. The argument must be an object literal containing "component" and "props".');
		}

		if (this.templateValue) {
			this.templateElement = element;
			this.templateType = fragmentValueTypes.COMPONENT_REPLACE;
		} else {
			this.templateElements[component.pointer] = element;
			this.templateTypes[component.pointer] = fragmentValueTypes.COMPONENT_REPLACE;
		}
		return element;
	}
}