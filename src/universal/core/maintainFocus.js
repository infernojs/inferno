"use strict";

export default ( previousActiveElement ) => {
    if ( previousActiveElement && previousActiveElement != document.body && ( previousActiveElement != document.activeElement) ) {
        previousActiveElement.focus();
    }
};
