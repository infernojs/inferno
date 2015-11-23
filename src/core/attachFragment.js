// import Inferno from '../..';
import getRecycledFragment from './getRecycledFragment';
import updateFragment from './updateFragment';
import attachFragmentList from './attachFragmentList';
import fragmentValueTypes from '../enum/fragmentValueTypes';
import insertFragment from './insertFragment';
import bind from '../util/bind';
import templateTypes from '../enum/templateTypes';
import templateCreateElement from '../template/createElement';
import templateCreateComponent from '../template/createComponent';
import domTemplate from '../template/dom';
import virtualTemplate from '../template/virtual';
import attachComponent from './attachComponent';

function attachFragment(context, fragment, parentDom, component, nextFragment, replace) {
	let { template } = fragment,
		templateKey = template.key,
		mountCallbacks = [];

	if (context.shouldRecycle === true) {
	    let recycledFragment = getRecycledFragment(templateKey);
	    if (recycledFragment != null) {
	        updateFragment(context, recycledFragment, fragment, parentDom, component);
	        insertFragment(context, fragment, parentDom, fragment.dom, nextFragment, replace);
	        return;
	    }
	}

	//there are different things we need to check for now
	const templateToUse = context.useVirtual ? virtualTemplate : domTemplate;
	switch (template.type) {
		case templateTypes.TEMPLATE_API:
			template(fragment, templateToUse);
			break;
		case templateTypes.FUNCTIONAL_API:
			const createElement = templateCreateElement(fragment, templateToUse);
			const createComponent = templateCreateComponent(fragment, templateToUse);
			let params = [createElement, createComponent], length = (fragment.templateValue != null && 1)
				|| (fragment.templateValues && fragment.templateValues.length) || 0;

			//create our pointers, for example 0,1,2,3,4,5 as params to pass through
			for(let i = 0; i < length; i++) {
				params.push({pointer: i});
			}
			fragment.dom = template.apply(null, params);
			if(fragment.dom == null) {
				throw Error("Inferno Error: Fragment template (FUNCTIONAL_API) returned a null or undefined object rather than a DOM element.");
			}
			break;
		default:
			template(fragment);
			break;
	}
	//if this fragment has a single value, we attach only that value
	if ( fragment.templateValue ) {
		switch ( fragment.templateType ) {
			case fragmentValueTypes.LIST:
				attachFragmentList( context, fragment.templateValue, fragment.templateElement );
				break;
			case fragmentValueTypes.FRAGMENT:
			case fragmentValueTypes.LIST_REPLACE:
				attachFragment( context, fragment.templateValue, fragment.templateElement, component );
				break;
			case fragmentValueTypes.FRAGMENT_REPLACE:
				attachFragment( context, fragment.templateValue, parentDom, fragment.templateElement, true );
				fragment.templateElement = fragment.templateValue.dom.parentNode;
				break;
			case fragmentValueTypes.ATTR_REF:
				fragment.templateValue.element = fragment.templateElement;
				break;
			case fragmentValueTypes.COMPONENT_REPLACE:
			{
				const {mountElem, component, mountCallback, newElement} = attachComponent(fragment.templateElement, fragment.templateValue, fragment.dom, true);
				fragment.templateElement = newElement;
				fragment.templateComponent = component;
				//root component node
				if (mountElem === fragment.dom) {
					fragment.dom = newElement;
				}
				mountCallbacks.push(mountCallback);
				break;
			}
			case fragmentValueTypes.COMPONENT:
			{
				const {mountCallback} = attachComponent(fragment.templateElement, fragment.templateValue, fragment.dom, false);
				mountCallbacks.push(mountCallback);
				break;
			}
		}
	} else if ( fragment.templateValues ) {
		//if the fragment has multiple values, we must loop through them all and attach them
		//pulling this block of code out into its own function caused strange things to happen
		//with performance. it was faster in Gecko but far slower in v8
		for ( let i = 0, length = fragment.templateValues.length; i < length; i++ ) {
			let element = fragment.templateElements[i],
				value = fragment.templateValues[i];

			switch ( fragment.templateTypes[i] ) {
				case fragmentValueTypes.LIST:
					attachFragmentList( context, value, element );
					break;
				case fragmentValueTypes.LIST_REPLACE:
					const nodeList = document.createDocumentFragment(),
						placeholderNode = fragment.templateElements[i],
						parentElem = placeholderNode.parentNode;

					attachFragmentList( context, value, nodeList );
					parentElem.replaceChild( nodeList, placeholderNode );
					fragment.templateElements[i] = parentElem;
					break;
				case fragmentValueTypes.FRAGMENT:
					attachFragment( context, fragment.templateValues[i], fragment.templateElements[i], component );
					break;
				case fragmentValueTypes.FRAGMENT_REPLACE:
					attachFragment( context, value, parentDom, component, element, true );
					fragment.templateElements[i] = value.dom.parentNode;
					break;
				case fragmentValueTypes.ATTR_REF:
					fragment.templateValues[i].element = fragment.templateElements[i];
					break;
				case fragmentValueTypes.COMPONENT_REPLACE:
				{
					const {mountElem, component, mountCallback, newElement} = attachComponent(element, value, fragment.dom, true);

					fragment.templateElements[i] = newElement;
					fragment.templateComponents[i] = component;
					//root component node
					if (mountElem === fragment.dom) {
						fragment.dom = newElement;
					}
					mountCallbacks.push(mountCallback);
					break;
				}
				case fragmentValueTypes.COMPONENT:
				{
					const {mountCallback} = attachComponent(fragment.templateElement, fragment.templateValue, fragment.dom, false);
					mountCallbacks.push(mountCallback);
					break;
				}
			}
		}
	}

	insertFragment(context, fragment, parentDom, fragment.dom, nextFragment, replace );
	//now fire all the component mountCallback functions so they know this fragment has been added
	for(let i = 0; i < mountCallbacks.length; i++) {
		mountCallbacks[i]();
	}
}

export default attachFragment;
