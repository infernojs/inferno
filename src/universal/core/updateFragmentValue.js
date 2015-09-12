import updateFragment      from "./updateFragment";
import fragmentValueTypes       from "../enum/fragmentValueTypes";
import updateFragmentList  from "./updateFragmentList";
import clearEventListeners from "../../browser/events/clearEventListeners";
import addEventListener    from "../../browser/events/addEventListener";

export default function udateFragmentValue( context, oldFragment, fragment, parentDom, component ) {
    let element = oldFragment.templateElement,
        type = oldFragment.templateType;

    fragment.templateElement = element;
    fragment.templateType = type;

    if ( fragment.templateValue !== oldFragment.templateValue ) {

        switch ( type ) {
            case fragmentValueTypes.LIST:
            case fragmentValueTypes.LIST_REPLACE:
                updateFragmentList( context, oldFragment.templateValue, fragment.templateValue, element, component );
                return;
            case fragmentValueTypes.TEXT:
                element.firstChild.nodeValue = fragment.templateValue;
                return;
            case fragmentValueTypes.TEXT_DIRECT:
                element.nodeValue = fragment.templateValue;
                return;
            case fragmentValueTypes.FRAGMENT:
            case fragmentValueTypes.FRAGMENT_REPLACE:
                updateFragment( context, oldFragment.templateValue, fragment.templateValue, element, component );
                return;
            default:
                if ( !element.props ) {
                    if ( events[type] != null ) {
                        clearEventListeners( element, type );
                        addEventListener( element, type, fragment.templateValue );

                    } else {
                        element.setAttribute( type, fragment.templateValue );
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
