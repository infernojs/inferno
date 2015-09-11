export default ( parentDom, item, nextItem ) => {

    let domItem = item.dom,
    domRefItem = nextItem && nextItem.dom;

    if ( domItem !== domRefItem ) {

        if ( domRefItem ) {

            parentDom.insertBefore( domItem, domRefItem );

        } else {

            parentDom.appendChild( domItem );

        }
    }
};
