import addAttributes        from './addAttributes';
import VirtualElement       from '../class/VirtualElement';
import VirtualTextNode      from '../class/VirtualTextNode';

export default {
	addAttributes,
	createElement: (tag, namespace) => new VirtualElement(tag, xmlns, is),
	createTextNode: text => new VirtualTextNode(text),
	createEmptyText: () => new VirtualTextNode('')
};
