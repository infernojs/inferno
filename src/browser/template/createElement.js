import template from './template';
import fragmentValueTypes from '../../universal/enum/fragmentValueTypes';
import isArray from "../../util/isArray";

export default function createElement(tag, props, ...children) {
    let dom = template.createElement(tag);
    let totalVal = (this.templateValues && this.templateValues.length) || 0;

    if(totalVal > 1) {
        this.templateElements = new Array(totalVal);
        this.templateTypes = new Array(totalVal);
    }
    if(children.length === 1) {
        children = children[0];
    }
    if(isArray(children)) {
        for(let i = 0; i < children.length; i++) {
            let child = children[i];

            if(child.pointer !== undefined) {
                let value = this.templateValues[child.pointer];
                if(typeof value !== "object") {
                    let node = template.createTextNode(value);
                    this.templateElements[child.pointer] = node;
                    this.templateTypes[child.pointer] = fragmentValueTypes.TEXT;
                    dom.appendChild(node);
                }
            } else if(typeof child !== "object") {
                let node = template.createTextNode(child);
                dom.appendChild(node);
            } else {
                dom.appendChild(child);
            }
        }
    } else if(children.pointer !== undefined) {
        let value = this.templateValues[children.pointer];

        if(typeof value !== "object") {
            dom.textContent = value;
            this.templateElements[children.pointer] = dom;
            this.templateTypes[children.pointer] = fragmentValueTypes.TEXT;
        }
    } else {
        if(typeof children !== "object") {
            dom.textContent = children;
        }
    }
    if(props) {
        template.addAttributes(dom, props);
    }

    return dom;
};
