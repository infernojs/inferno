import { render, findDOMNode } from '../../../src/DOM/rendering';
import createElement from '../../../src/core/createElement';
import { createVElement, createStaticVElement, createOptBlueprint, createVComponent, ValueTypes, ChildrenTypes, NodeTypes } from '../../../src/core/shapes.ts';
import Component from '../../../src/component/es2015';
import createClass from '../../../src/component/createClass';
import renderToString, { renderToStaticMarkup } from '../../../src/server/renderToString';
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

const ARR = [];

const Children = {
	map(children, fn, ctx) {
		children = Children.toArray(children);
		if (ctx && ctx!==children) fn = fn.bind(ctx);
		return children.map(fn);
	},
	forEach(children, fn, ctx) {
		children = Children.toArray(children);
		if (ctx && ctx!==children) fn = fn.bind(ctx);
		children.forEach(fn);
	},
	count(children) {
		children = Children.toArray(children);
		return children.length;
	},
	only(children) {
		children = Children.toArray(children);
		if (children.length!==1) throw new Error('Children.only() expects only one child.');
		return children[0];
	},
	toArray(children) {
		return Array.isArray && Array.isArray(children) ? children : ARR.concat(children);
	}
};

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
	createVElement,
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	ValueTypes,
	ChildrenTypes,
	NodeTypes,
	Children
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
	createVElement,
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	ValueTypes,
	ChildrenTypes,
	NodeTypes,
	Children
};
