export default (node, propName) => {
    // Set corresponding property to false
    node[propName] = false;
    
	// Remove the attribute
	
	// Todo! Should we remove boolean attrs here as well?
	
//    node.removeAttribute(propName);
};