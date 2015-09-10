"use strict";

import isBrowser from '../../util/isBrowser';

export default function render (fragment, dom, component) {
  let context, generatedFragment;

  if (component === undefined) {
    if (initialisedListeners === false) {
      addRootDomEventListerners();
    }
    context = getContext(dom);
    if (context === null) {
      context = {
        fragment: fragment,
        dom: dom,
        shouldRecycle: true
      };
      attachFragment(context, fragment, dom, component);
      contexts.push(context);
    } else {
      if(isBrowser) {
        let activeElement = document.activeElement;
      }
      updateFragment(context, context.fragment, fragment, dom, component, false);
      context.fragment = fragment;
      if(isBrowser) {
        maintainFocus(activeElement);
      }
    }
  } else {
    if (component.context === null) {
      generatedFragment = fragment();
      context = component.context = {
        fragment: generatedFragment,
        dom: dom,
        shouldRecycle: true
      };
      component.componentWillMount();
      attachFragment(context, generatedFragment, dom, component);
      component.componentDidMount();
    } else {
      generatedFragment = fragment();
      context = component.context;
      updateFragment(context, context.fragment, generatedFragment, dom, component, false);
      context.fragment = generatedFragment;
    }
  }
};
