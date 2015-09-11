"use strict";

import updateFragment from "./updateFragment";
import fragmentTypes from "./fragmentTypes";
import updateFragmentList from "./updateFragmentList";
import clearEventListeners from "../../browser/events/clearEventListeners";
import addEventListener from "../../browser/events/addEventListener";
import events              from "../../browser/events/shared/events";

//TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
//refactored to by more DRY. although, this causes a significant performance cost
//on the v8 compiler. need to explore how to refactor without introducing this performance cost
export default (context, oldFragment, fragment, parentDom, component) => {
    let componentsToUpdate = [],
        i;

    for (i = 0, length = fragment.templateValues.length; i < length; i++) {
        let element = oldFragment.templateElements[i];
        let type = oldFragment.templateTypes[i];

        fragment.templateElements[i] = element;
        fragment.templateTypes[i] = type;

        if (fragment.templateValues[i] !== oldFragment.templateValues[i]) {
            switch (type) {
                case fragmentTypes.LIST:
                case fragmentTypes.LIST_REPLACE:
                    updateFragmentList(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
                    break;
                case fragmentTypes.TEXT:
                    element.firstChild.nodeValue = fragment.templateValues[i];
                    break;
                case fragmentTypes.TEXT_DIRECT:
                    element.nodeValue = fragment.templateValues[i];
                    break;
                case fragmentTypes.FRAGMENT:
                case fragmentTypes.FRAGMENT_REPLACE:
                    updateFragment(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
                    break;
                case fragmentTypes.ATTR_CLASS:
                    element.className = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_CHECKED:
                    element.checked = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_SELECTED:
                    element.selected = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_DISABLED:
                    element.disabled = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_HREF:
                    element.href = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_ID:
                    element.id = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_VALUE:
                    element.value = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_NAME:
                    element.name = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_TYPE:
                    element.type = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_LABEL:
                    element.label = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_PLACEHOLDER:
                    element.placeholder = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_STYLE:
                    //TODO
                    break;
                case fragmentTypes.ATTR_WIDTH:
                    element.width = fragment.templateValues[i];
                    break;
                case fragmentTypes.ATTR_HEIGHT:
                    element.height = fragment.templateValues[i];
                    break;
                default:
                    //custom attribute, so simply setAttribute it
                    if (!element.props) {
                        if (events[type] != null) {
                            clearEventListeners(element, type);
                            addEventListener(element, type, fragment.templateValues[i]);
                        } else {
                            element.setAttribute(type, fragment.templateValues[i]);
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
        for (i = 0; i < componentsToUpdate.length; i++) {
            componentsToUpdate[i].forceUpdate();
        }
    }
}
