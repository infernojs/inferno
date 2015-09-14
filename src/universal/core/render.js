"use strict";

import addRootDomEventListerners from "../../browser/events/addRootListener";
import contexts                  from "../../vars/contexts";
import getContext                from "./getContext";
import attachFragment            from "./attachFragment";
import updateFragment            from "./updateFragment";

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
            updateFragment(context, context.fragment, fragment, dom, component, false);
            context.fragment = fragment;
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