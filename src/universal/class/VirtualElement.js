import VirtualTextNode from './VirtualTextNode';

let doNotShowInHtml = {
    "textContent": true,
    "appendChild": true,
    "setAttribute": true,
    "outerHTML": true,
    "innerHTML": true,
    "children": true,
    "tagName": true
};

//VirtualElements are lightweight replacements for real DOM elements, they allow us to easily
//move, remove, delete elements around our "virtual DOM" without needing real DOM elements
//we can they find their text string for when we want to renderToString()
export default class VirtualElement {
    constructor(tagName, namespace) {
        this.tagName = tagName;
        this.children = [];

        Object.defineProperty(this, "textContent", {
            set: textValue => {
                if(this.children.length > 0) {
                    //if we have children, kill them
                    this.children = [];
                } else {
                    this.appendChild(new VirtualTextNode(textValue));
                }
            },
            get: () => {
                return this.children[0].nodeValue;
            }
        });

        Object.defineProperty(this, "innerHTML", {
            set: textValue => {
                throw Error("You cannot set the innerHTML of virtual elements, use declarative API instead");
            },
            get: () => {
                let childrenInnerHtml = this.children.map(child => child.outerHTML || child.nodeValue).join("");
                return childrenInnerHtml;
            }
        });

        Object.defineProperty(this, "outerHTML", {
            set: textValue => {
                throw Error("You cannot set the outerHTML of virtual elements, use declarative API instead");
            },
            get: () => {
                let childrenInnerHtml = this.children.map(child => child.outerHTML || child.nodeValue).join("");
                let attributes = [];
                for(let property in this) {
                    if(!doNotShowInHtml[property]) {
                        attributes.push(property + `="${ this[property] }"`)
                    }
                }
                if(attributes.length > 0) {
                    return `<${ tagName } ${ attributes }>${ childrenInnerHtml }</${ tagName }>`;
                } else {
                    return `<${ tagName }>${ childrenInnerHtml }</${ tagName }>`;
                }
            }
        });
    }
    appendChild(childVirtualElement) {
        this.children.push(childVirtualElement);
    }
    setAttribute(attribute, value) {
        this[attribute] = value;
    }
}
