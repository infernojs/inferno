"use strict";

import destroyFragment from "./destroyFragment";

export default ( context, parentDom, item ) => {
    let domItem = item.dom;

    destroyFragment( context, item );
    parentDom.removeChild( domItem );
};
