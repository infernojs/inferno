import addAttributes        from './addAttributes';
import addProperties        from './addProperties';
import renderToString       from './renderToString';
import extendUnitlessNumber from './extendUnitlessNumber';
import VirtualElement       from '../class/VirtualElement';
import VirtualTextNode      from '../class/VirtualTextNode';

export default {
	addAttributes,
	addProperties,
	renderToString,
	extendUnitlessNumber,
	createElement(tag, namespace) {
		return new VirtualElement(tag, namespace);
	},
	createTextNode(text) {
		return new VirtualTextNode(text);
	},
	createEmptyText() {
		return new VirtualTextNode('');
	}
};
