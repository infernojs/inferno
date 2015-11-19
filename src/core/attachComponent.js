import bind from '../util/bind';
import render from './render';

export default function attachComponent(tempElem, Component, parentElem, replace) {
	const newElement = document.createDocumentFragment();
	let props = Component.props;
	const component = new Component.component(props);

	component.context = null;
	component.forceUpdate = render.bind(null, bind(component, component.render), newElement, component);
	component.componentWillMount();
	component.forceUpdate();

	if(replace) {
		parentElem.replaceChild(newElement, tempElem);
	} else {
		parentElem.appendChild(newElement);
	}

	const mountCallback = component.componentDidMount;
	return {component, newElement, mountCallback};
}