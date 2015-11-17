import bind from '../util/bind';
import render from './render';

export default function attachComponent(tempElem, Component) {
	const newElement = document.createDocumentFragment();
	const parentElem = tempElem.parentNode;
	const component = new Component.component(Component.props);

	component.context = null;
	component.forceUpdate = render.bind(null, bind(component, component.render), newElement, component);
	component.forceUpdate();

	parentElem.replaceChild(newElement, tempElem);
	return {component, newElement};
}