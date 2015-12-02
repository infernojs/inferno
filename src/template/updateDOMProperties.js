import template from './';
import addListener from '../events/addListener';
import removeListener from '../events/removeListener';
import eventMapping from '../events/shared/eventMapping';

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
                template.removeProperty(element, propName);
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
          //  template.setProperty(element, propName, styleUpdates);
        }
        // Event listeners
    } else if (eventMapping[propName] != null) {
        if (oldProp != null) {
            if (newProp != null) {
                addListener(element, eventMapping[propName], newProp);
            } else {
                removeListener(element, eventMapping[propName]);
            }
        } else if (newProp != null) {
            addListener(element, eventMapping[propName], newProp);
        }
    } else if (oldProp != null) {
        // If 'newProp' is null or undefined, we, we should remove the property
        // from the DOM node instead of inadvertantly setting to a string.
        if (newProp != null) {
            template.setProperty(element, propName, newProp);
        } else {
            template.removeProperty(element, propName);
        }
    } else if (newProp != null) {
        template.setProperty(element, propName, newProp);
    }
}

export default updateDOMProperties;