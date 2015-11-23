import fragmentValueTypes from '../enum/fragmentValueTypes';

function processFragmentAttrs(node, attrName, attrVal, fragment) {

	let fragmentType;
    let skip = false;

	switch (attrName) {
	case 'designMode':
		fragmentType = fragmentValueTypes.ATTR_DESIGNMODE;
		break;
	case 'htmlFor':
		fragmentType = fragmentValueTypes.ATTR_HTMLFOR;
		break;
	case 'playbackRate':
		fragmentType = fragmentValueTypes.ATTR_PLAYBACKRATE;
		break;
	case 'srcDoc':
		fragmentType = fragmentValueTypes.ATTR_SRCDOC;
		break;
	case 'checked':
		fragmentType = fragmentValueTypes.ATTR_CHECKED;
		break;
	case 'isMap':
		fragmentType = fragmentValueTypes.ATTR_ISMAP;
		break;
	case 'loop':
		fragmentType = fragmentValueTypes.ATTR_LOOP;
		break;
	case 'muted':
		fragmentType = fragmentValueTypes.ATTR_MUTED;
		break;
	case 'required':
		fragmentType = fragmentValueTypes.ATTR_REQUIRED;
		break;
	case 'selected':
		fragmentType = fragmentValueTypes.ATTR_SELECTED;
		break;
	case 'trueSpeed':
		fragmentType = fragmentValueTypes.ATTR_TRUESPEED;
		break;
	case 'multiple':
		fragmentType = fragmentValueTypes.ATTR_MULTIPLE;
		break;
	case 'controls':
		fragmentType = fragmentValueTypes.ATTR_CONTROLS;
		break;
	case 'defer':
		fragmentType = fragmentValueTypes.ATTR_DEFER;
		break;
	case 'noValidate':
		fragmentType = fragmentValueTypes.ATTR_NOVALIDATE;
		break;
	case 'scoped':
		fragmentType = fragmentValueTypes.ATTR_SCOPED;
		break;
	case 'resize':
		fragmentType = fragmentValueTypes.ATTR_NO_RESIZE;
		break;
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