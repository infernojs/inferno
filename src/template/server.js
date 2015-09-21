import addAttributes        from './addAttributes';
import DOMOperations        from './DOMOperations';
import extendUnitlessNumber from './extendUnitlessNumber';
import VirtualElement       from '../class/VirtualElement';
import VirtualTextNode      from '../class/VirtualTextNode';

export default {
	addAttributes,
	extendUnitlessNumber,
	DOMOperations,
	createElement: (tag, namespace) => new VirtualElement(tag, namespace),
	createTextNode: text => new VirtualTextNode(text),
	createEmptyText: () => new VirtualTextNode('')
};
