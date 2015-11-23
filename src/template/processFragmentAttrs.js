import fragmentValueTypes from '../enum/fragmentValueTypes';

function processFragmentAttrs(node, attrName, attrVal, fragment) {

	let fragmentType;
    let skip = false;

	switch (attrName) {
	case 'ref':
		fragmentType = fragmentValueTypes.ATTR_REF;
		skip = true;
		break;
	default:
		fragmentType = fragmentValueTypes.ATTR_OTHER;
	}

	if (fragment.templateValue !== undefined) {
		fragment.templateElement = node;
		if (fragmentType === fragmentValueTypes.ATTR_OTHER) {
			fragment.templateType = fragmentValueTypes.ATTR_OTHER[attrName] = attrName;
		} else {
			fragment.templateType = fragmentType;
		}
		return {attrVal: fragment.templateValue, skip};

	} else {
		fragment.templateElements[attrVal.pointer] = node;
		if (fragmentType === fragmentValueTypes.ATTR_OTHER) {
			fragment.templateTypes[attrVal.pointer] = fragmentValueTypes.ATTR_OTHER[attrName] = attrName;
		} else {
			fragment.templateTypes[attrVal.pointer] = fragmentType;
		}
		return {attrVal: fragment.templateValues[attrVal.pointer], skip};
	}

	return {attrVal: null, skip};
}

export default processFragmentAttrs;