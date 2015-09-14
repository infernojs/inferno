"use strict";

import attachFragment from "./attachFragment";

export default function attachFragmentList( context, list, parentDom, component )  {
    for ( let i = 0; i < list.length; i++ ) {
        attachFragment( context, list[i], parentDom, component );
    }
};
