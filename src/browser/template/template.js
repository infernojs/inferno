import addAttributes  from "./addAttributes";
import renderToString from "./renderToString";
import isBrowser      from "../../util/isBrowser";

export default {
    addAttributes: addAttributes,
    renderToString: renderToString,
    createElement(tag, namespace) {

        if (isBrowser) {

            if (namespace == null) {
                return document.createElement(tag);
            }

            return document.createElementNS(namespace, tag);
        }
    },
    createTextNode(text) {
        if (isBrowser) {
            return document.createTextNode(text);
        }
    },
    createEmptyText() {
        if (isBrowser) {
            return document.createTextNode("");
        }
    }
};