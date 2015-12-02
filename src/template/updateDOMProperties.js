import template from './';

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

    if (oldProp === newProp) {
        return;
    }

    switch (propName) {
       
        case 'style':
        case 'dataset':

            let styleUpdates = {};
            let styleName;

            if (oldProp != null) {
                if (newProp == null) {
                    template.removeProperty(element, propName);
                } else {
                    for (styleName in oldProp) {
                        if (oldProp[styleName] && (!newProp || !newProp[styleName])) {
                            styleUpdates[styleName] = '';
                        }
                    }
                    // Update styles that changed since `oldProp`.
                    for (styleName in newProp) {
                        if (newProp[styleName] && oldProp[styleName] !== newProp[styleName]) {
                            styleUpdates[styleName] = newProp[styleName];
                        }
                    }
                }
            } else if (newProp != null) {
                styleUpdates = newProp;
            }

            template.setProperty(element, propName, styleUpdates);

            return;
        default: // string values

            if (oldProp != null) {
                // If 'newProp' is null or undefined, we, we should remove the property
                // from the DOM node instead of inadvertantly setting to a string.
                if (newProp == null) {
                    template.removeProperty(element, propName);
                } else {
                    template.setProperty(element, propName, newProp);
                }
            } else if (newProp != null) {
                template.setProperty(element, propName, newProp);
            }
    }

}

export default updateDOMProperties;