import addAttributes        from './addAttributes';
import addProps               from './addProps';
import extendUnitlessNumber from './extendUnitlessNumber';
import VirtualElement       from '../class/VirtualElement';
import VirtualTextNode      from '../class/VirtualTextNode';

export default {
	addAttributes,
    addProps,
	extendUnitlessNumber,
	createElement: (tag, namespace) => new VirtualElement(tag, xmlns, is),
	createTextNode: text => new VirtualTextNode(text),
	createEmptyText: () => new VirtualTextNode('')
};
