import addAttributes        from './addAttributes';
import setProperty          from './setProperty';
import setAttributes        from './setAttributes';
import VirtualElement       from '../class/VirtualElement';
import VirtualTextNode      from '../class/VirtualTextNode';

export default {
	addAttributes,
	setProperty,
	setAttributes,
	createElement: (tag, namespace) => new VirtualElement(tag, xmlns, is),
	createTextNode: text => new VirtualTextNode(text),
	createEmptyText: () => new VirtualTextNode('')
};
