/* global __VERSION__ */
import Component              from './class/Component';
import render                 from './core/render';
import renderToString         from './ssr/renderToString';
import unmountComponentAtNode from './core/unmountComponentAtNode';
import FragmentValueTypes     from './enum/fragmentValueTypes';
import TemplateTypes          from './enum/templateTypes';
import createFragment         from './core/createFragment';
import createTemplate         from './core/createTemplate';
import template               from './template/server';
import clearDomElement        from './core/clearDomElement';
import createRef	          from './core/createRef';

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
	createRef,
	version: __VERSION__
};
