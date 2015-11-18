import bind from '../util/bind';
import render from './render';

export default function attachComponent(tempElem, Component, staticOpts) {
	const newElement = document.createDocumentFragment();
	const parentElem = tempElem.parentNode;
	let props = Component.props;

	if(staticOpts) {
		props = {
			...props,
			children: staticOpts.staticChildren,
			props: staticOpts.staticProps
		};
	}

	const component = new Component.component(props);

	if(staticOpts) {
		component._staticOpts = staticOpts;
	}

	component.context = null;
	component.forceUpdate = render.bind(null, bind(component, component.render), newElement, component);
	component.componentWillMount();
	component.forceUpdate();
	parentElem.replaceChild(newElement, tempElem);

	const mountCallback = component.componentDidMount;
	return {component, newElement, mountCallback};
}