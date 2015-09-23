let PropertyAccessor = {};

export default (node, attrName) => {
	let tag = node.tagName, tagAttrs = PropertyAccessor[tag] || (PropertyAccessor[tag] = {});
	return attrName in tagAttrs
		? tagAttrs[attrName]
		: tagAttrs[attrName] = document.createElement(tag)[attrName];
};
