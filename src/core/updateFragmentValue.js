import updateFragment from './updateFragment';
import fragmentValueTypes from '../enum/fragmentValueTypes';
import updateFragmentList from './updateFragmentList';
import eventManager from '../events/eventManager';
import events from '../events/shared/events';
import setValueForProperty from '../template/setValueForProperty';
import updateComponent from './updateComponent';

function updateFragmentValue(context, oldFragment, fragment, component) {
	let element = oldFragment.templateElement;
	let	type = oldFragment.templateType;
	let	templateComponent = oldFragment.templateComponent;

	fragment.templateElement = element;
	fragment.templateType = type;
	fragment.templateComponent = templateComponent;

	if (fragment.templateValue !== oldFragment.templateValue) {

		switch (type) {
		case fragmentValueTypes.LIST:
		case fragmentValueTypes.LIST_REPLACE:
			updateFragmentList(context, oldFragment.templateValue, fragment.templateValue, element, component);
			return;
		case fragmentValueTypes.TEXT:
			element.firstChild.nodeValue = fragment.templateValue;
			return;
		case fragmentValueTypes.TEXT_DIRECT:
			element.nodeValue = fragment.templateValue;
			return;
		case fragmentValueTypes.FRAGMENT:
		case fragmentValueTypes.FRAGMENT_REPLACE:
			updateFragment(context, oldFragment.templateValue, fragment.templateValue, element, component);
			return;
		case fragmentValueTypes.COMPONENT:
		case fragmentValueTypes.COMPONENT_REPLACE:
			if (fragment.templateValue.component === oldFragment.templateValue.component) {
				updateComponent(templateComponent, fragment.templateValue.props);
			}
			return;
		case fragmentValueTypes.COMPONENT_CHILDREN:
			break;
		case fragmentValueTypes.ATTR_DESIGNMODE:
			element.designMode = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_HTMLFOR:
			element.htmlFor = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_PLAYBACKRATE:
			element.playbackRate = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_SRCDOC:
			element.srcDoc = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_CHECKED:
			element.checked = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_ISMAP:
			element.isMap = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_LOOP:
			element.loop = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_MUTED:
			element.muted = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_REQUIRED:
			element.required = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_SELECTED:
			element.selected = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_TRUESPEED:
			element.truespeed = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_MULTIPLE:
			element.multiple = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_CONTROLS:
			element.controls = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_DEFER:
			element.defer = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_NOVALIDATE:
			element.noValidate = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_SCOPED:
			element.scoped = fragment.templateValue;
			return;
		case fragmentValueTypes.ATTR_NO_RESIZE:
			element.noResize = fragment.templateValue;
			return;
		default:
			if (events[type] != null) {
				eventManager.addListener(element, type, fragment.templateValue);
			} else {
				setValueForProperty(element, type, fragment.templateValue);
			}
		}
	}
}

export default updateFragmentValue;
