"use strict";

import updateFragment      from "./updateFragment";
import fragmentValueTypes  from "../enum/fragmentValueTypes";
import updateFragmentList  from "./updateFragmentList";
import clearEventListeners from "../../browser/events/clearEventListeners";
import addEventListener    from "../../browser/events/addEventListener";
import isSVG               from "../../util/isSVG";
import { setHtml }         from "../../browser/template/DOMOperations";

export default function(context, oldFragment, fragment, parentDom, component) {
    let element = oldFragment.templateElement,
        type = oldFragment.templateType;

    fragment.templateElement = element;
    fragment.templateType = type;

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
                    element.setAttribute("class", fragment.templateValue);
                } else {
                    element.className = fragment.templateValue;
                }
                return;
            case fragmentValueTypes.ATTR_ID:
                element.id = fragment.templateValue;
                return;
            case fragmentValueTypes.ATTR_VALUE:
                element.value = fragment.templateValue;
                return;
            case fragmentValueTypes.ATTR_NAME:
                element.name = fragment.templateValue;
                return;
            case fragmentValueTypes.ATTR_TYPE:
                element.type = fragment.templateValue;
                return;
            case fragmentValueTypes.ATTR_LABEL:
                element.label = fragment.templateValue;
                return;
            case fragmentValueTypes.ATTR_PLACEHOLDER:
                element.placeholder = fragment.templateValue;
                return;
            case fragmentValueTypes.ATTR_WIDTH:
                if (isSVG) {
                    element.setAttribute("width", fragment.templateValue);
                } else {
                    element.width = fragment.templateValue;
                }
                return;
            case fragmentValueTypes.ATTR_HEIGHT:
                if (isSVG) {
                    element.setAttribute("height", fragment.templateValue);
                } else {
                    element.height = fragment.templateValue;
                }
                return;
            default:
                if (!element.props) {
                    if (events[type] != null) {
                        clearEventListeners(element, type);
                        addEventListener(element, type, fragment.templateValue);

                    } else {
                        setHtml(element, type, fragment.templateValue);
                    }
                }
                //component prop, update it
                else {
                    //TODO make component props work for single value fragments
                }
                return;
        }
    }
}