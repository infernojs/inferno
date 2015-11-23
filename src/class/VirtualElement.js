import VirtualTextNode from './VirtualTextNode';

// The HTML elements in this list are speced by
// http://www.w3.org/TR/html-markup/syntax.html#syntax-elements,
// and will be forced to close regardless of if they have a
// self-closing /> at the end.
const voidTagNames = {
    area: true,
    base: true,
    basefont: true,
    br: true,
    col: true,
    command: true,
    embed: true,
    frame: true,
    hr: true,
    img: true,
    input: true,
    isindex: true,
    keygen: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true,

    //common self closing svg elements
    path: true,
    circle: true,
    ellipse: true,
    line: true,
    rect: true,
    use: true,
    stop: true,
    polyline: true,
    polygon: true
};

let doNotShowInHtml = {
    //  textContent: true,
    //    appendChild: true,
    //    setAttribute: true,
    //    outerHTML: true,
    innerHTML: true,
    //    children: true,
    tagName: true,
    //    options: true,
    selected: true,
    value: true
};

function VirtualElement(tagName, xmlns, is) {

    // Built-in properties that belong on the element

    const virtual = {
        props: {},
        tagName: tagName,
        options: [],
        children: [],
        appendChild: function(child) {
            if (virtual.tagName === 'select') {
                virtual.options.push(child);
            }
            virtual.children.push(child);
        },
        setAttribute: function(attribute, value) {
            virtual.props[attribute] = value;
        }
    };

    Object.defineProperty(virtual, 'textContent', {
        set: textValue => {
            /* TODO shouldn't this entire function just be
            	this.children = [new VirtualTextNode(textValue)];
            */
            if (virtual.children.length > 0) {
                //if we have children, kill them
                virtual.children = [];
            } else {

                virtual.appendChild(VirtualTextNode(textValue));
            }
        },
        get: () => virtual.children[0].nodeValue
    });

    Object.defineProperty(virtual, 'innerHTML', {
        set: () => {
            throw Error('You cannot set the innerHTML of virtual elements, use declarative API instead');
        },
        get: () => virtual.children.map(child => child.outerHTML || child.nodeValue).join('')
    });

    Object.defineProperty(virtual, 'outerHTML', {
        set: () => {
            throw Error('You cannot set the outerHTML of virtual elements, use declarative API instead');
        },
        get: () => {

            const isVoidElement = voidTagNames[tagName.toLowerCase()];
            const attributes = [];

            let childrenInnerHtml;
            // Props taken out and moved into it's own object. Need to finish this later on.            
            for (let property in virtual.props) {
                if (!doNotShowInHtml[property] && virtual.props[property] != null) {
                    let propVal = virtual.props[property];
                    if (propVal === true) {
                        propVal = '';
                    }
                    attributes.push(property + `="${ propVal }"`);
                }
            }

            if (!isVoidElement) {
                childrenInnerHtml = virtual.children.map(child => child.outerHTML || child.nodeValue).join('');
            }

            if (attributes.length > 0) {

                return isVoidElement ? `<${ tagName } ${ attributes }/>` :
                    `<${ tagName } ${ attributes }>${ childrenInnerHtml }</${ tagName }>`;
            }
            return isVoidElement ? `<${ tagName }/>` :
                `<${ tagName }>${ childrenInnerHtml }</${ tagName }>`;
        }
    });

    return virtual;
}

export default VirtualElement;