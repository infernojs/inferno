import removeFragment    from "./removeFragment";
import recycledFragments from "../../vars/recycledFragments";

/**
 * Destroy fragment
 */
export default ( context, fragment ) => {

    let templateKey;

    //long winded approach, but components have their own context which is how we find their template keys
    if ( fragment.component ) {

        templateKey = fragment.component.context.fragment.template.key;

    } else {

        templateKey = fragment.template.key;
    }

    if ( context.shouldRecycle === true ) {

        let toRecycleForKey = recycledFragments[templateKey];

        if ( !toRecycleForKey ) {

            recycledFragments[templateKey] = toRecycleForKey = [];
        }

        toRecycleForKey.push( fragment );
    }
}
