import updateFragment from './updateFragment';
import fragmentValueTypes from '../enum/fragmentValueTypes';
import updateFragmentList from './updateFragmentList';
import isSVG from '../util/isSVG';
import updateDOMProperties from '../template/updateDOMProperties';
import updateComponent from './updateComponent';
import removeComponent from './removeComponent';
import sanitizeValue from '../template/sanitizeValue';

// TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
// refactored to by more DRY. although, this causes a significant performance cost
// on the v8 compiler. need to explore how to refactor without introducing this performance cost
function updateFragmentValues(context, oldFragment, fragment, component) {
    for (let i = 0, length = fragment.templateValues.length; i < length; i++) {
        let element = oldFragment.templateElements[i];
        let type = oldFragment.templateTypes[i];
        let templateComponent = oldFragment.templateComponents[i];

        fragment.templateElements[i] = element;
        fragment.templateTypes[i] = type;
        fragment.templateComponents[i] = templateComponent;

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
                case fragmentValueTypes.COMPONENT:
                case fragmentValueTypes.COMPONENT_REPLACE:
                    const comp = fragment.templateValues[i];
                    const oldComp = oldFragment.templateValues[i];

                    if (comp === null || comp.component === null) {
                        removeComponent(templateComponent, element);
                        templateComponent = fragment.templateValues[i] = null;
                    } else if (comp && comp.component === oldComp.component) {
                        updateComponent(templateComponent, comp.props);
                    }
                    break;
                case fragmentValueTypes.COMPONENT_CHILDREN:
                    break;
                case fragmentValueTypes.ATTR_CLASS:
                    if (isSVG) {
                        sanitizeValue(element, fragment.templateValues[i], null, 'class');
                    } else {
                        sanitizeValue(element, fragment.templateValues[i], 'className', 'class');
                    }
                    break;
                case fragmentValueTypes.ATTR_ID:
                    sanitizeValue(element, fragment.templateValues[i], 'id', 'id');
                    break;
                default:
                    updateDOMProperties(element, type, oldFragment.templateValues[i], fragment.templateValues[i]);
            }
        }
    }
}

export default updateFragmentValues;