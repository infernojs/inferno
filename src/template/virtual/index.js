import VirtualElement       from '../../class/VirtualElement';
import VirtualTextNode      from '../../class/VirtualTextNode';

export default {
	createElement: (tag, xmlns, is) => VirtualElement(tag, xmlns, is),
	createTextNode: text => VirtualTextNode(text),
	createEmptyText: () => VirtualTextNode(''),
	createEmptyDiv: () => VirtualElement('div')
};
