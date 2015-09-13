import voidCfg        from "./cfg/voidCfg";
import forIn          from "../../util/forIn";
import { SSRStyles }  from "./CSSOperations";
import { attrToHtml } from "./DOMOperations";

// WORK IN PROGRESS!!!!!!!
function renderToString(props, tagName, children) {

    let attrType,
        html = "<" + tagName,
        attr;

    if (props != null) {

        forIn(props, (name, value) => {

            if (name === "style") {
                html += " " + name + "=\"" + "" + SSRStyles(value) + "\"";

            // we need to check for number values, else expected - '<a download="0"></a>' - would
            // become - '<a></a>'. And the '0' - zero - will be skipped.
            } else if (name !== "innerHTML" && (value || (typeof value === "number"))) {
                if (value !== "false") {
                    html += " " + attrToHtml(name, value);
                }
            }
        });
    }

    if (voidCfg[tagName]) {

        html = html + "/>";

    } else {

        html = html + ">";

        // ... child nodes

        html += "</" + tagName + ">";
    }

    return html;
}

export default renderToString;