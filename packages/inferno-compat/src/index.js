import { render } from '../../../src/DOM/rendering';
import createElement from '../../../src/createElement';
import Component from '../../../src/component';
import PropTypes from 'proptypes';

function unmountComponentAtNode(container) {
	render(null, container);
	return true;
}

function cloneElement(element, props, ...children) {
	return createElement(
		element.tag,
		Object.assign({}, 
			element.attrs || {}, 
			props || {}, 
			element.className ? { className: element.className } : {},
			element.style ? { style: element.style } : {},
			element.key ? { key: element.key } : {},
			element.hooks || {},
			element.events || {}
		),
		...children
	);
}

function createClass() {
	throw new Error('Inferno Error: "inferno-compat" does not currently have support for createClass');
}

Component.prototype.isReactComponent = {};

export {
	render,
	createElement,
	Component,
	unmountComponentAtNode,
	cloneElement,
	PropTypes,
	createClass
};

export default {
	render,
	createElement,
	Component,
	unmountComponentAtNode,
	cloneElement,
	PropTypes,
	createClass
};