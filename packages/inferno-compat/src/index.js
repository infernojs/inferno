import { render, findDOMNode } from '../../../src/DOM/rendering';
import { NO_OP } from '../../../src/shared';
import createElement from '../../../src/factories/createElement';
import { 
	createVElement,
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	createOptVElement,
	createVFragment,
	createVPlaceholder,
	createVText
} from '../../../src/core/shapes';
import Component from '../../../src/component/es2015';
import createClass from '../../../src/component/createClass';
import renderToString, { renderToStaticMarkup } from '../../../src/server/renderToString';
import PropTypes from 'proptypes';
import cloneVNode from '../../../src/factories/cloneVNode';
import {
	ValueTypes,
	ChildrenTypes,
	NodeTypes
} from '../../../src/core/constants';

function unmountComponentAtNode(container) {
	render(null, container);
	return true;
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

const cloneElement = cloneVNode;
const version = '15.3.1';

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
	Children,
	createOptVElement,
	createVFragment,
	createVPlaceholder,
	createVText,
	cloneVNode,
	NO_OP,
	version
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
	Children,
	createOptVElement,
	createVFragment,
	createVPlaceholder,
	createVText,
	cloneVNode,
	NO_OP,
	version
};
