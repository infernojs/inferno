import addAttributes        from './addAttributes';
import addProperties        from './addProperties';
import extendUnitlessNumber from './extendUnitlessNumber';
import VirtualElement       from '../class/VirtualElement';
import VirtualTextNode      from '../class/VirtualTextNode';

export default {
	addAttributes,
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
