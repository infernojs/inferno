import removeFragment       from "./removeFragment";
import attachFragment       from "./attachFragment";
import updateFragmentValue  from "./updateFragmentValue";
import updateFragmentValues from "./updateFragmentValues";
import unmountComponentAtFragment from "./unmountComponentAtFragment";

export default function updateFragment( context, oldFragment, fragment, parentDom, component ) {
    if ( fragment === null ) {
        removeFragment( context, parentDom, oldFragment );
        return;
    }
    if ( oldFragment === null ) {
        attachFragment( context, fragment, parentDom, component );
        return;
    }
    if ( oldFragment.template !== fragment.template ) {
        if ( oldFragment.component ) {
            let oldComponentFragment = oldFragment.component.context.fragment;
            unmountComponentAtFragment( oldFragment );
            attachFragment( context, fragment, parentDom, component, oldComponentFragment, true );
        } else {
            attachFragment( context, fragment, parentDom, component, oldFragment, true );
        }
    } else {
        let fragmentComponent = oldFragment.component;
        //if this fragment is a component
        if ( fragmentComponent ) {
            fragmentComponent.props = fragment.props;
            fragmentComponent.forceUpdate();
            fragment.component = fragmentComponent;
            return;
        }
        //ensure we reference the new fragment with the old fragment's DOM node
        fragment.dom = oldFragment.dom;
        if ( fragment.templateValue !== undefined ) {
            //update a single value in the fragement (templateValue rather than templateValues)
            updateFragmentValue( context, oldFragment, fragment, parentDom, component );
        } else if ( fragment.templateValues ) {
            //updates all values within the fragment (templateValues is an array)
            updateFragmentValues( context, oldFragment, fragment, parentDom, component );
        }
    }
};
