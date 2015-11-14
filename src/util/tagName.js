/**
 * Returns a DOM node tagName as lowerCase
 * @param {Object} node A DOM element.
 */
function getNodeName (node) {
	
	// TODO!! Cache this for re-use?
    return node.tagName.toLowerCase();	
};

export default getNodeName;