import isArray from '../util/isArray';
import isBrowser from '../util/isBrowser';
import attributes from './attributes';
import fragmentValueTypes from '../enum/fragmentValueTypes';
import template from './template';

function createElement(tag, props, ...children) {

    let element;

    if (typeof tag === 'string') {
        element = template.createElement(tag);
    } else {
        let propsParsed = props;

        for (let prop in props) {
            if (props[prop].pointer) {
                propsParsed[prop] = this.templateValues[propsParsed[prop].pointer];
            }
        }

        return {
            dom: null,
            component: this.templateValue || this.templateValues[tag.pointer],
            props: propsParsed,
            key: null,
            template: null,
            templateIndex: tag.pointer
        };
    }

    if (children && (children.length)) {

        let len = children.length;

        if (len > 1) {
            for (let i = 0; i < len; i++) {
                let child = children[i];

                if (child.pointer != null) {
                    let value = this.templateValue || this.templateValues[child.pointer];

                    if (typeof value !== 'object') {
                        let node = document.createTextNode(value);

                        if (this.templateValue) {
                            this.templateElement = node;
                            this.templateType = fragmentValueTypes.TEXT_DIRECT;
                        } else {
                            this.templateElements[child.pointer] = node;
                            this.templateTypes[child.pointer] = fragmentValueTypes.TEXT_DIRECT;
                        }
                        element.appendChild(node);
                    }
                    return;
                }

                if (typeof child !== 'object') {
                    // TODO! What if the document don't exist? E.g. server side
                    let node = document.createTextNode(child);

                    element.appendChild(node);
                    return;
                }

                if (child.component) {
                    if (this.templateValues) {
                        let templateIndex = child.templateIndex;

                        this.templateElements[templateIndex] = element;
                        this.templateTypes[templateIndex] = fragmentValueTypes.FRAGMENT;
                        this.templateValues[templateIndex] = child;
                    } else {
                        this.templateElement = element;
                        this.templateType = fragmentValueTypes.FRAGMENT;
                        this.templateValue = child;
                    }
                    return;
                }
                element.appendChild(child);

            }
        } else if ((children = children[0]).pointer !== undefined) {

            let pointer = children.pointer,
                value = this.templateValue || this.templateValues[pointer];

            if (typeof value === 'object') {

                if (isArray(value)) {
                    if (this.templateValue) {
                        this.templateElement = element;
                        this.templateType = fragmentValueTypes.LIST;
                    } else {
                        this.templateElements[pointer] = element;
                        this.templateTypes[pointer] = fragmentValueTypes.LIST;
                    }
                }

                // silently ignore real objects

            } else {

                element.textContent = value;

                if (this.templateValue) {
                    this.templateElement = element;
                    this.templateType = fragmentValueTypes.TEXT;
                } else {
                    this.templateElements[pointer] = element;
                    this.templateTypes[pointer] = fragmentValueTypes.TEXT;
                }
            }
        } else {

            switch (typeof children) {

                case 'string':
                    element.textContent = children;
                    break;
                case 'number':
                    element.textContent = children.toString();
                    break;
                default:
                    
					// NOTE! if we avoid checking for 'instanceof Date' it will throw when trying to append the child
                    if (children instanceof Date) {
                        element.textContent = '' + children; // cast to string
                    } else {
                        element.appendChild(children);
                    }
            }
        }
    }

    if (props != null) {
        attributes(element, props, this);
    }

    return element;
}

export default createElement;