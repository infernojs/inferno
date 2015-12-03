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