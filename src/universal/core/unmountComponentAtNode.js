import removeFragment from "./removeFragment";
import removeContext  from "./removeContext";
import getContext  from "./getContext";
import unmountComponentAtFragment  from "./unmountComponentAtFragment";

/**
 * Unmount 
 * @param {Element} dom DOM element
 */
export default ( dom ) => {

    let context = getContext( dom );

    if ( context !== null ) {

        let component = context.fragment.component;

        if ( component ) {

            removeFragment( context, dom, component.fragment );
            unmountComponentAtFragment( component.fragment );

        } else {

            removeFragment( context, dom, context.fragment );
            removeContext( dom );
        }
    }
};
