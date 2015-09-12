"use strict";

import updateFragment      from "./updateFragment";
import fragmentTypes       from "./fragmentTypes";
import updateFragmentList  from "./updateFragmentList";
import clearEventListeners from "../../browser/events/clearEventListeners";
import addEventListener    from "../../browser/events/addEventListener";
import events              from "../../browser/events/shared/events";
import DOMAttributes       from "../../browser/template/DOMAttributes";

//TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
//refactored to by more DRY. although, this causes a significant performance cost
//on the v8 compiler. need to explore how to refactor without introducing this performance cost
export default function updateFragmentValues(context, oldFragment, fragment, parentDom, component) {
    let componentsToUpdate = [];

    for (let i = 0, length = fragment.templateValues.length; i < length; i++) {
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
                default:
                    //component prop, update it
                    if (element.props) {
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
                    } else {
                        if (events[type] != null) {
                            clearEventListeners(element, type);
                            addEventListener(element, type, fragment.templateValues[i]);
                        } else {
						   DOMAttributes(element, type, fragment.templateValues[i]);
                        }
                    }
            }
        }
    }
    if (componentsToUpdate.length > 0) {
        for (let i = 0; i < componentsToUpdate.length; i++) {
            componentsToUpdate[i].forceUpdate();
        }
    }
}
