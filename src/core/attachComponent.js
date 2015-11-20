import bind from '../util/bind';
import render from './render';

export default function attachComponent(tempElem, Component, parentElem, replace) {
	const frag = document.createDocumentFragment();
	let props = Component.props;
	const component = new Component.component(props);

	component.context = null;
	component.forceUpdate = render.bind(null, bind(component, component.render), frag, component);
	component.componentWillMount();
	component.forceUpdate();

	const newElement = frag.firstChild;

	if(replace) {
		parentElem.replaceChild(frag, tempElem);
	} else {
		parentElem.appendChild(frag);
	}

	const mountCallback = component.componentDidMount;
	return {component, newElement, mountCallback};
}
