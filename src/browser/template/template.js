import addAttributes from "./addAttributes";
import addProperties from "./addProperties";
import isBrowser     from "../../util/isBrowser";

export default {
    addAttributes: addAttributes,
    addProperties: addProperties,
    createElement(tag) {
        if (isBrowser) {
            return document.createElement(tag);
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
