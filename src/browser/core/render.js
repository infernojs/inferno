"use strict";

import addRootDomEventListerners from "../browser/events/addRootListener";
import initialisedListeners      from "../browser/events/shared/initialisedListeners";
import contexts                  from "../vars/contexts";
import getContext                from "./getContext";
import attachFragment            from "./attachFragment";
import updateFragment            from "./updateFragment";
import maintainFocus             from "./maintainFocus";

export default ( fragment, dom, component ) => {

    var context, generatedFragment;
    if ( component === undefined ) {

        if ( initialisedListeners === false ) {

            addRootDomEventListerners();

        }
        context = getContext( dom );
        if ( context === null ) {

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
            maintainFocus( activeElement );

        }

    } else {

        if ( component.context === null ) {

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
