import { render } from '../../../src/DOM/rendering';
import createElement from '../../../src/core/createElement';
import Component from '../../../src/component/es2015';
import createClass from '../../../src/component/createClass';
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