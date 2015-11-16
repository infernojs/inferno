import render   from './render';
import template from '../template/virtual';

export default function renderToString(fragment, component) {
	const dom = template.createElement('div');
	render(fragment, dom, component, true);
	return dom.innerHTML;
}
