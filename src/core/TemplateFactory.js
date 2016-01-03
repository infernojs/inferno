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
		
		if ( children.length ) {
			vNode.children = children;
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
