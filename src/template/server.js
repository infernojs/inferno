import addAttributes        from './addAttributes';
import DOMOperations        from './DOMOperations';
import extendUnitlessNumber from './extendUnitlessNumber';
import VirtualElement       from '../class/VirtualElement';
import VirtualTextNode      from '../class/VirtualTextNode';

export default {
	addAttributes,
	extendUnitlessNumber,
	DOMOperations: DOMOperations,
	createElement(tag, namespace) {
		if (namespace === undefined) {
			return new VirtualElement(tag);
		}
		return new VirtualElement(tag, namespace);
	},
	createTextNode(text) {
		return new VirtualTextNode(text);
	},
	createEmptyText() {
		return new VirtualTextNode('');
	}
};
