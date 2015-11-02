import escapeTextContentForBrowser from './escapeTextContentForBrowser';
import isArray                     from '../util/isArray';

// For quickly matching children type, to test if can be treated as content.
let CONTENT_TYPES = {
    'string': true,
    'number': true
};

let newlineEatingTags = {
    'listing': true,
    'pre': true,
    'textarea': true
};

/**
 * Creates markup for the content between the tags.
 *
 * @private
 * @param {string} tag
 * @param {object} props
 * @param {string|Array} children
 * @return {string} Content markup.
 */
export default (tag, props, children) => {
    let html = '';

    // Intentional use of != to avoid catching zero/false.
    let innerHTML = props && props.innerHTML;
    if (innerHTML != null) {
        html = escapeTextContentForBrowser(innerHTML);
    } else if (props && props.value && tag === 'textarea') {
        html = escapeTextContentForBrowser(props.value);
    } else {

        let contentToUse = CONTENT_TYPES[typeof children] ? children : null;
        let childrenToUse = contentToUse != null ? null : children;

        if (contentToUse != null) {
            // TODO: Validate that text is allowed as a child of this node
            html = contentToUse;
        } else if (childrenToUse != null) {

                if (isArray(childrenToUse)) {

                    if (childrenToUse.length === 1) {

                        html += escapeTextContentForBrowser(childrenToUse[0]);

                    } else {

                        for (let idx = 0; idx < childrenToUse.length; idx++) {

                            html += ' ' + childrenToUse[idx];
                        }
                    }
                }
        }
    }

    if (newlineEatingTags[tag] && html[0] === '\n') {
        // text/html ignores the first character in these tags if it's a newline
        // Prefer to break application/xml over text/html (for now) by adding
        // a newline specifically to get eaten by the parser. (Alternately for
        // textareas, replacing "^\n" with "\r\n" doesn't get eaten, and the first
        // \r is normalized out by HTMLTextAreaElement#value.)
        // See: <http://www.w3.org/TR/html-polyglot/#newlines-in-textarea-and-pre>
        // See: <http://www.w3.org/TR/html5/syntax.html#element-restrictions>
        // See: <http://www.w3.org/TR/html5/syntax.html#newlines>
        // See: Parsing of "textarea" "listing" and "pre" elements
        //  from <http://www.w3.org/TR/html5/syntax.html#parsing-main-inbody>
        return '\n' + html;
    } else {
        return html;
    }
};