import updateFragment from './updateFragment';
import fragmentValueTypes from '../enum/fragmentValueTypes';
import updateFragmentList from './updateFragmentList';
import eventManager from '../events/eventManager';
import events from '../events/shared/events';
import isSVG from '../util/isSVG';
import attrOps from '../template/AttributeOps';

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
			case fragmentValueTypes.ATTR_NAME:
				element.name = fragment.templateValues[i];
				break;
			case fragmentValueTypes.ATTR_LABEL:
				element.label = fragment.templateValues[i];
				break;
			case fragmentValueTypes.ATTR_PLACEHOLDER:
				element.placeholder = fragment.templateValues[i];
				break;
           case fragmentValueTypes.ATTR_DESIGNMODE:
			    element.designMode = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_HTMLFOR:
			    element.htmlFor = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_PLAYBACKRATE:
			    element.playbackRate = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_PRELOAD:
			    element.preload = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_SRCDOC:
			    element.srcDoc = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_AUTOPLAY:
			    element.autoPlay = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_CHECKED:
			    element.checked = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_ISMAP:
			    element.isMap = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_LOOP:
			    element.loop = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_MUTED:
			    element.muted = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_READONLY:
			    element.readOnly = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_REVERSED:
			    element.reversed = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_REQUIRED:
			    element.required = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_SELECTED:
			    element.selected = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_SPELLCHECK:
			    element.spellCheck = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_TRUESPEED:
			    element.truespeed = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_MULTIPLE:
			    element.multiple = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_CONTROLS:
			    element.controls = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_DEFER:
			    element.defer = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_NOVALIDATE:
			    element.noValidate = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_SCOPED:
			    element.scoped = fragment.templateValues[i];
			    break;
			case fragmentValueTypes.ATTR_NO_RESIZE:
			    element.noResize = fragment.templateValues[i];
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
						eventManager.addListener(element, type, fragment.templateValues[i]);
					} else {
						attrOps.set(element, type, fragment.templateValues[i], true);
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
