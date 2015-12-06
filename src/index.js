import createTemplate from './core/createTemplate';
import { createFragment, render, renderToString } from './core/fragments';
import Component from './class/Component';
import { TemplateFactory } from './core/TemplateFactory';

module.exports = {
	Component,
	createTemplate,
	TemplateFactory,
	createFragment,
	render,
	renderToString
};
