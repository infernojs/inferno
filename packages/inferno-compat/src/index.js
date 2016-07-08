import { render, findDOMNode } from '../../../src/DOM/rendering';
import createElement from '../../../src/core/createElement';
import { createBlueprint, createVNode } from '../../../src/core/shapes';
import Component from '../../../src/component/es2015';
import createClass from '../../../src/component/createClass';
import renderToString from '../../../src/server/renderToString';
import { renderToStaticMarkup } from '../../../src/server/renderToString';
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
	createClass,
	findDOMNode,
	renderToString,
	renderToStaticMarkup,
	createBlueprint,
	createVNode
};

export default {
	render,
	createElement,
	Component,
	unmountComponentAtNode,
	cloneElement,
	PropTypes,
	createClass,
	findDOMNode,
	renderToString,
	renderToStaticMarkup,
	createBlueprint,
	createVNode
};