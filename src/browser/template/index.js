import addAttributes        from './addAttributes';
import addProperties        from './addProperties';
import renderToString       from './renderToString';
import extendUnitlessNumber from './extendUnitlessNumber';
import isBrowser            from '../../util/isBrowser';
import VirtualElement       from '../../universal/class/VirtualElement';
import VirtualTextNode      from '../../universal/class/VirtualTextNode';

export default {
	addAttributes,
	addProperties,
	renderToString,
	extendUnitlessNumber,
	createElement(tag, namespace) {
		if (isBrowser()) {
			if (namespace === undefined) {
				return document.createElement(tag);
			}
			return document.createElementNS(namespace, tag);
		}
		else {
			return new VirtualElement(tag, namespace);
		}
	},
	createTextNode(text) {
		if (isBrowser()) {
			return document.createTextNode(text);
		}
		else {
			return new VirtualTextNode(text);
		}
	},
	createEmptyText() {
		if (isBrowser()) {
			return document.createTextNode('');
		}
		else {
			return new VirtualTextNode('');
		}
	}
};
