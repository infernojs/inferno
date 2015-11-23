import addAttributes        from '../addAttributes';
import extendUnitlessNumber from './../extendUnitlessNumber';
import VirtualElement       from '../../class/VirtualElement';
import VirtualTextNode      from '../../class/VirtualTextNode';

export default {
	addAttributes,
	extendUnitlessNumber,
	createElement: (tag, xmlns, is) => VirtualElement(tag, xmlns, is),
	createTextNode: text => new VirtualTextNode(text),
	createEmptyText: () => new VirtualTextNode(''),
	createEmptyDiv: () => VirtualElement('div')
};
