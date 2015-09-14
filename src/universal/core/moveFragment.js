import isBrowser from "../../util/isBrowser";

export default (parentDom, item, nextItem) => {

    let domItem = item.dom,
        domRefItem = nextItem && nextItem.dom;

    if (domItem !== domRefItem) {

        if (isBrowser()) {
            let activeFragment = document.activeElement;
        }

        if (domRefItem) {

            parentDom.insertBefore(domItem, domRefItem);

        } else {

            parentDom.appendChild(domItem);
        }

        /**
         * Same as document.activeElement but wraps in a try-catch block. In IE it is
         * not safe to call document.activeElement if there is nothing focused.
         *
         * The activeElement will be null only if the document body is not yet defined.
         */
        if (isBrowser()) {
            if (activeFragment != document.body && (document.activeElement !== activeFragment)) {
                activeDomNode.focus();
            }
        }
    }
};