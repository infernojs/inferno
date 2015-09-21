import addAttributes        from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';
import DOMOperations        from './DOMOperations';

export default {
	addAttributes,
	extendUnitlessNumber,
	DOMOperations,
	createElement: (tag, namespace) => (namespace === undefined) ? document.createElement(tag) : document.createElementNS(namespace, tag),
	createTextNode: text => document.createTextNode(text),
	createEmptyText: () => document.createTextNode('')
};
