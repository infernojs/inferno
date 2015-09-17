/* global __VERSION__ */
import Component              from './class/Component';
import render                 from './core/render';
import renderToString         from './core/renderToString';
import unmountComponentAtNode from './core/unmountComponentAtNode';
import FragmentValueTypes     from './enum/fragmentValueTypes';
import TemplateTypes          from './enum/templateTypes';
import createFragment         from './core/createFragment';
import createTemplate         from './core/createTemplate';
import template               from './template';
import clearDomElement        from './core/clearDomElement';

export default {
	Component,
	render,
	renderToString,
	createFragment,
	createTemplate,
	unmountComponentAtNode,
	FragmentValueTypes,
	TemplateTypes,
	template,
	clearDomElement,
	version: __VERSION__
};
