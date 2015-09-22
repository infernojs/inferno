import addAttributes        from './addAttributes';
import AttributeOps        from './AttributeOps';
import extendUnitlessNumber from './extendUnitlessNumber';
import VirtualElement       from '../class/VirtualElement';
import VirtualTextNode      from '../class/VirtualTextNode';

export default {
	addAttributes,
	extendUnitlessNumber,
	AttributeOps,
	createElement: (tag, namespace) => new VirtualElement(tag, namespace),
	createTextNode: text => new VirtualTextNode(text),
	createEmptyText: () => new VirtualTextNode('')
};
