"use strict";

import destroyFragment from "./destroyFragment";

export default function insertFragment( context, parentDom, domNode, nextFragment, replace ) {
    let noDestroy = false;

    if ( nextFragment ) {
        let domNextFragment = nextFragment.dom;

        if ( !domNextFragment ) {
            domNextFragment = nextFragment;
            parentDom = domNextFragment.parentNode;
            noDestroy = true;
        }
        if ( replace ) {
            if ( noDestroy === false ) {
                destroyFragment( context, nextFragment );
            }
            parentDom.replaceChild( domNode, domNextFragment );

        } else {
            parentDom.insertBefore( domNode, domNextFragment );
        }
    } else {
        parentDom.appendChild( domNode );
    }
};
