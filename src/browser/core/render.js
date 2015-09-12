"use strict";

import addRootDomEventListerners from "../events/addRootListener";
import contexts                  from "../../vars/contexts";
import getContext                from "../../universal/core/getContext";
import attachFragment            from "../../universal/core/attachFragment";
import updateFragment            from "../../universal/core/updateFragment";
import maintainFocus             from "../../universal/core/maintainFocus";

let initialisedListeners = false;

export default function render(fragment, dom, component) {
    let context, generatedFragment;

    if (component) {
        if (component.context) {
            generatedFragment = fragment();
            context = component.context;
            updateFragment(context, context.fragment, generatedFragment, dom, component, false);
            context.fragment = generatedFragment;
        } else {
            generatedFragment = fragment();
            context = component.context = {
                fragment: generatedFragment,
                dom: dom,
                shouldRecycle: true
            };
            component.componentWillMount();
            attachFragment(context, generatedFragment, dom, component);
            component.componentDidMount();
        }
    } else {
        if (initialisedListeners === false) {
            addRootDomEventListerners();
            initialisedListeners = true;
        }
        context = getContext(dom);
        if (context) {
            let activeElement = document.activeElement;
            updateFragment(context, context.fragment, fragment, dom, component, false);
            context.fragment = fragment;
            // TODO! Move to moveFragment()
            maintainFocus(activeElement);
        } else {
            context = {
                fragment: fragment,
                dom: dom,
                shouldRecycle: true
            };
            attachFragment(context, fragment, dom, component);
            contexts.push(context);
        }
    }
};
