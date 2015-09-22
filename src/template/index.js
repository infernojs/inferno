import addAttributes        from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';
import AttributeOps        from './AttributeOps';

export default {
	addAttributes,
	extendUnitlessNumber,
	AttributeOps,
	createElement: (tag, namespace) => (namespace === undefined) ? document.createElement(tag) : document.createElementNS(namespace, tag),
	createTextNode: text => document.createTextNode(text),
	createEmptyText: () => document.createTextNode('')
};
