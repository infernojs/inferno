import deleteValueForProperty from './deleteValueForProperty';
import setValueForProperty from './setValueForProperty';
import setValueForStyles from './setValueForStyles';
import eventManager from '../events/eventManager';
import events from '../events/shared/events';

/**
 * Detecting differences in property values and updating the DOM as necessary.
 * This function is probably the single most critical path for performance optimization.
 *
 * @param {DOMElement} element
 * @param {string} propName
 * @param {object} oldProp
 * @param {object} newProp
 */
function updateDOMProperties(element, propName, oldProp, newProp) {

    if (propName === 'style') {

        let styleUpdates;
        let styleName;

        if (oldProp != null) {

            if (newProp == null) {
                deleteValueForProperty(element, propName);
            } else {

                // Unset styles on `oldProp` but not on `newProp`.
                for (styleName in oldProp) {
                    if (oldProp[styleName] && (!newProp || !newProp[styleName])) {
                        styleUpdates = styleUpdates || {};
                        styleUpdates[styleName] = '';
                    }
                }
                // Update styles that changed since `oldProp`.
                for (styleName in newProp) {
                    if (newProp[styleName] && oldProp[styleName] !== newProp[styleName]) {
                        styleUpdates = styleUpdates || {};
                        styleUpdates[styleName] = newProp[styleName];
                    }
                }
            }
        } else if (newProp != null) {
            styleUpdates = newProp;
        }

        if (styleUpdates) {
            setValueForStyles(element, styleUpdates);
        }

        // Event listeners
    } else if (events[propName] != null) {

        if (oldProp != null) {

            if (newProp != null) {
                eventManager.addListener(element, propName, newProp);
            } else {
                eventManager.removeListener(element, propName);
            }
        } else if (newProp != null) {
            eventManager.addListener(element, propName, newProp);
        }
    } else if (oldProp != null) {

        // If 'newProp' is null or undefined, we, we should remove the property
        // from the DOM node instead of inadvertantly setting to a string.
        if (newProp != null) {
            setValueForProperty(element, propName, newProp);
        } else {
            deleteValueForProperty(element, propName);
        }
    } else if (newProp != null) {
        setValueForProperty(element, propName, newProp);
    }
}

export default updateDOMProperties;