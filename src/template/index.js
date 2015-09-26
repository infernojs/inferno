import addAttributes        from './addAttributes';
import extendUnitlessNumber from './extendUnitlessNumber';
import AttributeOps        from './AttributeOps';

export default {
	addAttributes,
	extendUnitlessNumber,
	AttributeOps,
	createElement: (tag, parent) => {

	    let namespace;

	    switch (tag) {
	        'svg': namespace = "http://www.w3.org/2000/svg";
	        break;
	        'math': namespace = "http://www.w3.org/1998/Math/MathML";
	        break;
	        default: if (parent) {
	            namespace = parent.namespace;
	        }
	    }

	    if (namespace === undefined) ? document.createElement(tag) : document.createElementNS(namespace, tag);
	},	
	createTextNode: text => document.createTextNode(text),
	createEmptyText: () => document.createTextNode('')
};
