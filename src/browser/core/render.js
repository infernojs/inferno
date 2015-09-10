"use strict";

import addRootDomEventListerners from "../events/addRootListener";
import initialisedListeners      from "../events/shared/initialisedListeners";
import contexts                  from "../../vars/contexts";
import getContext                from "../../universal/core/getContext";
import attachFragment            from "../../universal/core/attachFragment";
import updateFragment            from "../../universal/core/updateFragment";
import maintainFocus             from "../../universal/core/maintainFocus";

export default ( fragment, dom, component ) => {

    var context, generatedFragment;
    if ( component === undefined ) {
        if ( initialisedListeners() === false ) {
            addRootDomEventListerners();
            initialisedListeners(true);
        }

        context = getContext( dom );

		if ( context == null ) {

            context = {
                fragment: fragment,
                dom: dom,
                shouldRecycle: true
            };
            attachFragment( context, fragment, dom, component );
            contexts.push( context );

        } else {

            var activeElement = document.activeElement;
            updateFragment( context, context.fragment, fragment, dom, component, false );
            context.fragment = fragment;

			// TODO! Move to moveFragment()
            maintainFocus( activeElement );

        }

    } else {

        if ( component.context == null ) {

            generatedFragment = fragment();
            context = component.context = {
                fragment: generatedFragment,
                dom: dom,
                shouldRecycle: true
            };
            component.componentWillMount();
            attachFragment( context, generatedFragment, dom, component );
            component.componentDidMount();

        } else {

            generatedFragment = fragment();
            context = component.context;
            updateFragment( context, context.fragment, generatedFragment, dom, component, false );
            context.fragment = generatedFragment;

        }

    }

};
