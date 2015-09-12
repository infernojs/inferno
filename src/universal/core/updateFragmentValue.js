import updateFragment      from "./updateFragment";
import fragmentTypes       from "./fragmentTypes";
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
            case fragmentTypes.LIST:
            case fragmentTypes.LIST_REPLACE:
                updateFragmentList( context, oldFragment.templateValue, fragment.templateValue, element, component );
                return;
            case fragmentTypes.TEXT:
                element.firstChild.nodeValue = fragment.templateValue;
                return;
            case fragmentTypes.TEXT_DIRECT:
                element.nodeValue = fragment.templateValue;
                return;
            case fragmentTypes.FRAGMENT:
            case fragmentTypes.FRAGMENT_REPLACE:
                updateFragment( context, oldFragment.templateValue, fragment.templateValue, element, component );
                return;
            case fragmentTypes.ATTR_CLASS:
                element.className = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_CHECKED:
                element.checked = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_SELECTED:
                element.selected = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_DISABLED:
                element.disabled = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_HREF:
                element.href = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_ID:
                element.id = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_VALUE:
                element.value = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_NAME:
                element.name = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_TYPE:
                element.type = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_LABEL:
                element.label = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_PLACEHOLDER:
                element.placeholder = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_STYLE:
                //TODO
                return;
            case fragmentTypes.ATTR_WIDTH:
                element.width = fragment.templateValue;
                return;
            case fragmentTypes.ATTR_HEIGHT:
                element.height = fragment.templateValue;
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
