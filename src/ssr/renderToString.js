import voidTags                    from './voidTags';
import createMarkupForProperty     from './createMarkupForProperty';
import createMarkupForStyles       from './createMarkupForStyles';
import createMarkupForSelect       from './createMarkupForSelect';
import escapeTextContentForBrowser from './escapeTextContentForBrowser';
import isArray                     from '../util/isArray';

let optGroups = [],
    opts = [];

function renderToString(tag, props, children) {

    tag = tag.toLowerCase();

    let innerHTML = props && props.innerHTML,
        html = '<' + tag;

    switch (tag) {

        // Special case - optgroup should not be rendered before the 'select' element
        case 'optgroup':
            optGroups.push({
                tag,
                props
            });
            break;

        // Special case - option should not be rendered before the 'select' element
        case 'option':
            opts.push({
                tag,
                props,
                children
            });
            break;

        // Special case - select values (should not be stringified)
        case 'select':

            html = createMarkupForSelect(tag, props, optGroups, opts);

            // Always remove the contents of 'optGroups' and 'opts' array
            optGroups = [];
            opts = [];

            // Return the markup
            return html;

        default:

            html = '<' + tag;

            if (props != null) {

                for (let name in props) {

                    let value = props[name];

                    // 'innerHTML' is a special case
                    if (name === 'innerHTML') {
                        children = name;
                    } else {

                        if (value != null) {

                            // Special case - textarea values (should not be stringified)
                            if (name === 'value' && (tag === 'textarea')) {
                                children = escapeTextContentForBrowser(value);
                                continue;
                            }

                            // create CSS style markup
                            if (name === 'style') {

                                html += `${' ' + name}="${createMarkupForStyles(value)}"`;
                            }

                            // create markup for attributes / properties                    
                            if (name !== 'style') {
                                html += ' ' + createMarkupForProperty(name, value);
                            }
                        }
                    }
                }
            }
			
            if (voidTags[tag]) {

                html = html + '/>';

            } else {

                html = html + '>';

                if (children) {

                    if (typeof children === 'object') {

                        if (isArray(children)) {

                            if (children.length === 1) {

                                html += escapeTextContentForBrowser(children[0]);

                            } else {

                                for (let idx = 0; idx < children.length; idx++) {

                                    let child = children[idx];

                                    // Assume that strings that start and end with <> are HTML and avoid escaping pre-rendered HTML markup
                                    if (child[0] && child[0] === '<' && child[child.length - 1] === '>' && child.length >= 3) {
                                        html += ' ' + child;
                                    } else {
                                        html += ' ' + escapeTextContentForBrowser(child);
                                    }
                                }
                            }
                        }
                        // silently ignore real objects...
                    } else {

                        //TODO! Find a way to escape the children without destroying HTML markup
                        html += innerHTML ? escapeTextContentForBrowser(innerHTML) : children;
                    }
                }
                html += '</' + tag + '>';
            }
    }

    return html;
}

export default renderToString;