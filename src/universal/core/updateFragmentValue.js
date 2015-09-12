import updateFragment      from "./updateFragment";
import fragmentTypes       from "./fragmentTypes";
import updateFragmentList  from "./updateFragmentList";
import clearEventListeners from "../../browser/events/clearEventListeners";
import addEventListener    from "../../browser/events/addEventListener";
import events              from "../../browser/events/shared/events";
import DOMAttributes       from "../../browser/template/DOMAttributes";

export default (context, oldFragment, fragment, parentDom, component) => {

    let element = oldFragment.templateElement;
    let type = oldFragment.templateType;

    fragment.templateElement = element;
    fragment.templateType = type;

    if (fragment.templateValue !== oldFragment.templateValue) {
        switch (type) {
            case fragmentTypes.LIST:
            case fragmentTypes.LIST_REPLACE:
                updateFragmentList(context, oldFragment.templateValue, fragment.templateValue, element, component);
                return;
            case fragmentTypes.TEXT:
                element.firstChild.nodeValue = fragment.templateValue;
                return;
            case fragmentTypes.TEXT_DIRECT:
                element.nodeValue = fragment.templateValue;
                return;
            case fragmentTypes.FRAGMENT:
            case fragmentTypes.FRAGMENT_REPLACE:
                updateFragment(context, oldFragment.templateValue, fragment.templateValue, element, component);
                return;
            default:

                //component prop, update it
                if (element.props) {
                    //TODO make component props work for single value fragments
                } else {
                    if (events[type] != null) {
                        clearEventListeners(element, type);
                        addEventListener(element, type, fragment.templateValue);
                    } else {
                       DOMAttributes(element, type, fragment.templateValue);
                    }
                }
        }
    }
}