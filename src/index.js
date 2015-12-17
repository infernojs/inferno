import createTemplate from './core/createTemplate';
import { render, renderToString, unmountComponentsAtNode } from './core/rendering';
import Component from './class/Component';
import TemplateFactory from './core/TemplateFactory';

export default {
	Component,
	createTemplate,
	TemplateFactory,
	render,
	renderToString,
	unmountComponentsAtNode
};
