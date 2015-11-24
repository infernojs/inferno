import removeContext from './removeContext';
import badUpdate from './badUpdate';

export default function removeComponent(component, element) {
	if(component == null) {
		return;
	}
	component.componentWillUnmount();
	removeContext(component.context.dom);
	component.forceUpdate = badUpdate;
	component.context = null;
	if(element) {
		element.parentNode.removeChild(element);
	}
}
