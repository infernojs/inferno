import updateFragment from './updateFragment';
import fragmentValueTypes from '../enum/fragmentValueTypes';
import updateFragmentList from './updateFragmentList';
import clearEventListeners from '../events/clearEventListeners';
import addEventListener from '../events/addEventListener';
import events from '../events/shared/events';
import isSVG from '../util/isSVG';
import { setAttribute } from '../template/DOMOperations';

// TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
// refactored to by more DRY. although, this causes a significant performance cost
// on the v8 compiler. need to explore how to refactor without introducing this performance cost
function updateFragmentValues(context, oldFragment, fragment, component) {

	let componentsToUpdate = [];

	for (let i = 0, length = fragment.templateValues.length; i < length; i++) {
		let element = oldFragment.templateElements[i];
		let type = oldFragment.templateTypes[i];

		fragment.templateElements[i] = element;
		fragment.templateTypes[i] = type;

		if (fragment.templateValues[i] !== oldFragment.templateValues[i]) {
			switch (type) {
			case fragmentValueTypes.LIST:
			case fragmentValueTypes.LIST_REPLACE:
				updateFragmentList(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
				break;
			case fragmentValueTypes.TEXT:
				element.firstChild.nodeValue = fragment.templateValues[i];
				break;
			case fragmentValueTypes.TEXT_DIRECT:
				element.nodeValue = fragment.templateValues[i];
				break;
			case fragmentValueTypes.FRAGMENT:
			case fragmentValueTypes.FRAGMENT_REPLACE:
				updateFragment(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
				break;
			case fragmentValueTypes.ATTR_CLASS:
				if (isSVG) {
					element.setAttribute('class', fragment.templateValues[i]);
				} else {
					element.className = fragment.templateValues[i];
				}
				break;
			case fragmentValueTypes.ATTR_ID:
				element.id = fragment.templateValues[i];
				break;
			case fragmentValueTypes.ATTR_VALUE:
				element.value = fragment.templateValues[i];
				break;
			case fragmentValueTypes.ATTR_NAME:
				element.name = fragment.templateValues[i];
				break;
			case fragmentValueTypes.ATTR_TYPE:
				element.type = fragment.templateValues[i];
				break;
			case fragmentValueTypes.ATTR_LABEL:
				element.label = fragment.templateValues[i];
				break;
			case fragmentValueTypes.ATTR_PLACEHOLDER:
				element.placeholder = fragment.templateValues[i];
				break;
			case fragmentValueTypes.ATTR_WIDTH:
				if (isSVG) {
					element.setAttribute('width', fragment.templateValues[i]);
				} else {
					element.width = fragment.templateValues[i];
				}
				break;
			case fragmentValueTypes.ATTR_HEIGHT:
				if (isSVG) {
					element.setAttribute('height', fragment.templateValues[i]);
				} else {
					element.height = fragment.templateValues[i];
				}
				break;
			default:
					//custom attribute, so simply setAttribute it
				if (!element.props) {
					if (events[type] != null) {
						clearEventListeners(element, type);
						addEventListener(element, type, fragment.templateValues[i]);
					} else {
						setAttribute(element, type, fragment.templateValues[i]);
					}
				}
				//component prop, update it
				else {
					element.props[type] = fragment.templateValues[i];
					let alreadyInQueue = false;
					for (let s = 0; s < componentsToUpdate.length; s++) {
						if (componentsToUpdate[s] === element) {
							alreadyInQueue = true;
						}
					}
					if (alreadyInQueue === false) {
						componentsToUpdate.push(element);
					}
				}
				break;
			}
		}
	}
	if (componentsToUpdate.length > 0) {
		for (let i = 0; i < componentsToUpdate.length; i++) {
			componentsToUpdate[i].forceUpdate();
		}
	}
}

export default updateFragmentValues;
