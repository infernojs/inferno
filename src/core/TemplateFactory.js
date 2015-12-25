import isArray from '../util/isArray';

function createChildren( children ) {
	const childrenArray = [];
	if ( isArray( children ) ) {
		for ( let i = 0; i < children.length; i++ ) {
			const childItem = children[i];
			childrenArray.push( childItem );
		}
	}
	return childrenArray;
}

function createElement( tag, attrs, ...children ) {
	if ( tag ) {
		const vNode = {
			tag
		};
		if ( attrs ) {
			if ( attrs.key !== undefined ) {
				vNode.key = attrs.key;
				delete attrs.key;
			}
			vNode.attrs = attrs;
		}
		if ( children ) {
			if ( children.length ) {
				vNode.children = createChildren( children );
			} else {
				vNode.children = children[0];
			}
		}
		return vNode;
	} else {
		return {
			text: tag
		};
	}
}

export default {
	createElement
};