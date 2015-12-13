import createTemplate from './core/createTemplate';
import { render, renderToString, unmountComponentsAtNode } from './core/rendering';
import Component from './class/Component';
import TemplateFactory from './core/TemplateFactory';

module.exports = {
	Component,
	createTemplate,
	TemplateFactory,
	render,
	renderToString,
	unmountComponentsAtNode
};
