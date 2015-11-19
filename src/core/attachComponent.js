import bind from '../util/bind';
import render from './render';

export default function attachComponent(tempElem, Component, staticOpts, parentElem, replace) {
	const newElement = document.createDocumentFragment();
	let props = Component.props;

	if(staticOpts) {
		let staticChildren = staticOpts.staticChildren;
		staticChildren = staticChildren.length === 1 ? staticChildren[0] : staticChildren;
		props = {
			...props,
			children: staticChildren,
			...staticOpts.staticProps
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

	if(replace) {
		parentElem.replaceChild(newElement, tempElem);
	} else {
		parentElem.appendChild(newElement);
	}


	const mountCallback = component.componentDidMount;
	return {component, newElement, mountCallback};
}