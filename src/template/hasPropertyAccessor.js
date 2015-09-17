let PropertyAccessor = {};
function hasPropertyAccessor(tag, attrName) {
	let tagAttrs = PropertyAccessor[tag] || (PropertyAccessor[tag] = {});
	return attrName in tagAttrs ?
		tagAttrs[attrName] :
		tagAttrs[attrName] = document.createElement(tag)[attrName];
}

export default hasPropertyAccessor;
