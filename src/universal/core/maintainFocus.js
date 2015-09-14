"use strict";

import updateFragment from "./updateFragment";

/**
 * Same as document.activeElement but wraps in a try-catch block. In IE it is
 * not safe to call document.activeElement if there is nothing focused.
 *
 * The activeElement will be null only if the document body is not yet defined.
 */
function getActiveElement() {
    try {
        return document.activeElement || document.body;
    } catch (e) {
        return document.body;
    }
}

export default function maintainFocus(context, contextFragment, fragment, dom, component, negative) {

    let activeElement = getActiveElement();

    updateFragment(context, contextFragment, fragment, dom, component, negative);
    context.fragment = fragment;

    if (document.activeElement !== active) {
        active.focus();
    }
};