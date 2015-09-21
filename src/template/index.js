import addAttributes        from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';

export default {
	addAttributes,
	extendUnitlessNumber,
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
