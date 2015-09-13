"use strict";

import updateFragment      from "./updateFragment";
import fragmentValueTypes  from "../enum/fragmentValueTypes";
import updateFragmentList  from "./updateFragmentList";
import clearEventListeners from "../../browser/events/clearEventListeners";
import addEventListener    from "../../browser/events/addEventListener";
import events              from "../../browser/events/shared/events";
import isSVG               from "../../util/isSVG";
import { setHtml }         from "../../browser/template/DOMOperations";

//TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
//refactored to by more DRY. although, this causes a significant performance cost
//on the v8 compiler. need to explore how to refactor without introducing this performance cost
export default function(context, oldFragment, fragment, parentDom, component) {

    let componentsToUpdate = [];

    for (let i = 0, length = fragment.templateValues.length; i < length; i++) {
        let element = oldFragment.templateElements[i];
        let type = oldFragment.templateTypes[i];

        fragment.templateElements[i] = element;
        fragment.templateTypes[i] = type;

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
                case fragmentValueTypes.ATTR_CLASS:
                    // To set className on SVG elements, it's necessary to use .setAttribute;
                    // this works on HTML elements too in all browsers.				
					// If this kills the performance, we have to consider not to support SVG
                    if (isSVG) {
                        element.setAttribute("class", fragment.templateValues[i]);
                    } else {
                        element.className = fragment.templateValues[i];
                    }
                    return;
                    element.className = fragment.templateValues[i];
                    return;
                case fragmentValueTypes.ATTR_HREF:
                    element.href = fragment.templateValues[i];
                    return;
                case fragmentValueTypes.ATTR_ID:
                    element.id = fragment.templateValues[i];
                    return;
                case fragmentValueTypes.ATTR_VALUE:
                    element.value = fragment.templateValues[i];
                    return;
                case fragmentValueTypes.ATTR_NAME:
                    element.name = fragment.templateValues[i];
                    return;
                case fragmentValueTypes.ATTR_TYPE:
                    element.type = fragment.templateValues[i];
                    return;
                case fragmentValueTypes.ATTR_LABEL:
                    element.label = fragment.templateValues[i];
                    return;
                case fragmentValueTypes.ATTR_PLACEHOLDER:
                    element.placeholder = fragment.templateValues[i];
                    return;
                case fragmentValueTypes.ATTR_WIDTH:
                    element.width = fragment.templateValues[i];
                    return;
                case fragmentValueTypes.ATTR_HEIGHT:
                    element.height = fragment.templateValues[i];
                    return;

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
                            setHtml(element, type, fragment.templateValues[i]);
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