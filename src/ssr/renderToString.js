import voidTags                    from './voidTags';
import createMarkupForProperty     from './createMarkupForProperty';
import createMarkupForStyles       from './createMarkupForStyles';
import createMarkupForSelect       from './createMarkupForSelect';
import escapeTextContentForBrowser from './escapeTextContentForBrowser';
import isArray                     from '../util/isArray';

let optGroups = [],
    opts = [];

export default (tag, props, children) => {

    tag = tag.toLowerCase();

    let html = '<' + tag;

    switch (tag) {

        // Special case - optgroup should not be rendered before the 'select' element
        case 'optgroup':
            optGroups.push({
                tag,
                props
            });
            return;

            // Special case - option should not be rendered before the 'select' element
        case 'option':
            opts.push({
                tag,
                props,
                children
            });
            return;

            // Special case - select values (should not be stringified)
        case 'select':

            html = createMarkupForSelect(tag, props, optGroups, opts);

            // Always remove the contents of 'optGroups' and 'opts' array
            optGroups = [];
            opts = [];

            // Return the markup
            return html;
    }

    html = '<' + tag;

    if (props != null) {

        for (let name in props) {

            let value = props[name];

            if (value != null) {

                switch (name) {
                    case 'style':
                        html += `${' ' + name}="${createMarkupForStyles(value)}"`;
                        break;

                        // Special case - 'innerHTML'
                    case 'innerHTML':
                        children = escapeTextContentForBrowser(value);
                        continue;
                    case 'value':
                        // Special case - textarea values (should not be stringified)
                        if (tag === 'textarea') {
                            children = escapeTextContentForBrowser(value);
                            continue;
                        }

                    default:
                        html += ' ' + createMarkupForProperty(name, value);
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

                            html += ' ' + children[idx];
                        }
                    }
                }
                // silently ignore real objects...
            } else {

                //TODO! Find a way to escape the 'children' without destroying HTML markup
                html += children;
            }
        }
        html += '</' + tag + '>';
    }


    return html;
};