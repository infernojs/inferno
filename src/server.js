/* global __VERSION__ */
import Component              from './universal/class/Component';
import render                 from './universal/core/render';
import renderToString         from './universal/core/renderToString';
import unmountComponentAtNode from './universal/core/unmountComponentAtNode';
import FragmentValueTypes     from './universal/enum/fragmentValueTypes';
import TemplateTypes          from './universal/enum/templateTypes';
import createFragment         from './universal/core/createFragment';
import createTemplate         from './universal/core/createTemplate';
import template               from './universal/template/server';
import clearDomElement        from './universal/core/clearDomElement';

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
