import addAttributes        from '../addAttributes';
import VirtualElement       from '../../class/VirtualElement';
import VirtualTextNode      from '../../class/VirtualTextNode';

export default {
	addAttributes,
	createElement: (tag, xmlns, is) => VirtualElement(tag, xmlns, is),
	createTextNode: text => VirtualTextNode(text),
	createEmptyText: () => VirtualTextNode(''),
	createEmptyDiv: () => VirtualElement('div')
};
