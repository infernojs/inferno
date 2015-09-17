let defaultPropVals = {};
function getDefaultPropVal(tag, attrName) {
	let tagAttrs = defaultPropVals[tag] || (defaultPropVals[tag] = {});
	return attrName in tagAttrs ?
		tagAttrs[attrName] :
		tagAttrs[attrName] = document.createElement(tag)[attrName];
}

export default getDefaultPropVal;
