import VirtualTextNode from './VirtualTextNode';

let doNotShowInHtml = {
    textContent: true,
    appendChild: true,
    setAttribute: true,
    outerHTML: true,
    innerHTML: true,
    children: true,
    tagName: true,
    options: true,
    selected: true,
    value: true
};

function VirtualElement(tagName, xmlns, is) {

    // Built-in properties that belong on the element

    const virtual = {

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
            virtual[attribute] = value;
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
            const childrenInnerHtml = virtual.children.map(child => child.outerHTML || child.nodeValue).join('');
            const attributes = [];
            for (let property in virtual) {
                if (!doNotShowInHtml[property] && virtual[property] != null) {
                    let propVal = virtual[property];
                    if (propVal === true) {
                        propVal = '';
                    }
                    attributes.push(property + `="${ propVal }"`);
                }
            }
            if (attributes.length > 0) {
                return `<${ tagName } ${ attributes }>${ childrenInnerHtml }</${ tagName }>`;
            }
            return `<${ tagName }>${ childrenInnerHtml }</${ tagName }>`;
        }
    });

    return virtual;
}


export default VirtualElement;