import deleteValueForProperty from './deleteValueForProperty';
import setValueForProperty from './setValueForProperty';
import setValueForStyles from './setValueForStyles';
import eventManager from '../events/eventManager';
import events from '../events/shared/events';

/**
 * Detecting differences in property values and updating the DOM as necessary.
 * This function is probably the single most critical path for performance optimization.
 *
 * @param {DOMElement} node
 * @param {string} propKey
 * @param {object} lastProps
 * @param {object} nextProps
 */
function updateDOMProperties(element, propKey, lastProps, nextProps) {
    if (propKey === 'style') {

        let styleUpdates;
        let styleName;

        if (lastProps != null) {

            if (nextProps == null) {
                deleteValueForProperty(element, propKey);
            } else {

                // Unset styles on `lastProp` but not on `nextProp`.
                for (styleName in lastProps) {
                    if (lastProps[styleName] && (!nextProps || !nextProps[styleName])) {
                        styleUpdates = styleUpdates || {};
                        styleUpdates[styleName] = '';
                    }
                }
                // Update styles that changed since `lastProps`.
                for (styleName in nextProps) {
                    if (nextProps[styleName] && lastProps[styleName] !== nextProps[styleName]) {
                        styleUpdates = styleUpdates || {};
                        styleUpdates[styleName] = nextProps[styleName];
                    }
                }
            }
        } else if (nextProps != null) {
            styleUpdates = nextProps;
        }

        if (styleUpdates) {
            setValueForStyles(element, styleUpdates);
        }

    } else {

        // Check if there was a listener 
        if (events[propKey] != null) {

            // TODO!! Is this working as it should? Add tests!!
            if (lastProps != null) {

                if (nextProps == null) {
                    eventManager.removeListener(element, propKey);
                } else {
                    if (nextProps && lastProps !== nextProps) {
                        eventManager.addListener(element, propKey, nextProps);
                    }
                }
            } else if (nextProps != null) {
                eventManager.addListener(element, propKey, nextProps);
            }
        } else {

            if (lastProps != null) {

                if (nextProps == null) {
                    deleteValueForProperty(element, propKey);
                } else {

                    if (nextProps && lastProps !== nextProps) {
                        setValueForProperty(element, propKey, nextProps);
                    }
                }
            } else if (nextProps != null) {
                setValueForProperty(element, propKey, nextProps);
            }
        }
    }
}

export default updateDOMProperties;