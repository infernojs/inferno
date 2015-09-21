import addAttributes        from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';
import DOMOperations        from './DOMOperations';

export default {
	addAttributes,
	extendUnitlessNumber,
	DOMOperations:DOMOperations,
	createElement(tag, namespace) {
		if (namespace === undefined) {
			return document.createElement(tag);
		}
		return document.createElementNS(namespace, tag);
	},
	createTextNode(text) {
		return document.createTextNode(text);
	},
	createEmptyText() {
		return document.createTextNode('');
	}
};
