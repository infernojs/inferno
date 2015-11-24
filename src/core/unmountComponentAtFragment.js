import removeComponent from './removeComponent';
import isArray from '../util/isArray';

export default function unmountComponentAtFragment(fragment) {
	const component = fragment.templateComponent || fragment.templateComponents;
	if (component != null) {
		if (isArray(component)) {
			for (let i = 0; i < component.length; i++) {
				removeComponent(component[i]);
			}
		} else {
			removeComponent(component);
		}
	}
};
