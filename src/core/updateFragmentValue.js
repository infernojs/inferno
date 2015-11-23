import updateFragment from './updateFragment';
import fragmentValueTypes from '../enum/fragmentValueTypes';
import updateFragmentList from './updateFragmentList';
import eventManager from '../events/eventManager';
import events from '../events/shared/events';
import isSVG from '../util/isSVG';
import updateDOMProperties from '../template/updateDOMProperties';
import updateComponent from './updateComponent';
import removeComponent from './removeComponent';
import sanitizeValue from '../template/sanitizeValue';

function updateFragmentValue(context, oldFragment, fragment, component) {
    let element = oldFragment.templateElement,
        type = oldFragment.templateType,
        templateComponent = oldFragment.templateComponent;

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
            case fragmentValueTypes.ATTR_CLASS:
                // To set className on SVG elements, it's necessary to use .setAttribute;
                // this works on HTML elements too in all browsers.
                // If this kills the performance, we have to consider not to support SVG
                if (isSVG) {
                    sanitizeValue(element, fragment.templateValue, null, 'class');
                } else {
                    sanitizeValue(element, fragment.templateValue, 'className', 'class');
                }
                return;
            case fragmentValueTypes.COMPONENT:
            case fragmentValueTypes.COMPONENT_REPLACE:
				const comp = fragment.templateValue;
				const oldComp = oldFragment.templateValue;

				if (comp === null) {
					removeComponent(templateComponent, element);
					templateComponent = fragment.templateValue = null;
				} else if (comp && comp.component === oldComp.component) {
					updateComponent(templateComponent, comp.props);
				}
                return;
            case fragmentValueTypes.COMPONENT_CHILDREN:
                break;
            case fragmentValueTypes.ATTR_ID:
                sanitizeValue(element, fragment.templateValue, 'id', 'id');
                return;
            default:
                updateDOMProperties(element, type, oldFragment.templateValue, fragment.templateValue);
        }
    }
}

export default updateFragmentValue;