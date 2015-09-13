import addAttributes from "./addAttributes";
import addProperties from "./addProperties";
import isBrowser     from "../../util/isBrowser";

export default {
    addAttributes: addAttributes,
    addProperties: addProperties,
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