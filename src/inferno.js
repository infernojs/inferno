import Component              from './universal/class/Component';
import render                 from './universal/core/render';
import renderToString         from './universal/core/renderToString';
import version                from './InfernoVersion';
import unmountComponentAtNode from './universal/core/unmountComponentAtNode';
import FragmentValueTypes     from './universal/enum/fragmentValueTypes';
import TemplateTypes          from './universal/enum/templateTypes';
import createFragment         from './universal/core/createFragment';
import createTemplate         from './universal/core/createTemplate';
import template               from './browser/template/template';
import clearDomElement        from './browser/core/clearDomElement';

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
	version
};
