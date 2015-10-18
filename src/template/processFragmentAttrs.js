import fragmentValueTypes from '../enum/fragmentValueTypes';

export default (node, attrName, attrVal, fragment) => {

    let fragmentType;

    switch (attrName) {
        case 'class':
        case 'className':
            fragmentType = fragmentValueTypes.ATTR_CLASS;
            break;
        case 'id':
            fragmentType = fragmentValueTypes.ATTR_ID;
            break;
        case 'label':
            fragmentType = fragmentValueTypes.ATTR_LABEL;
            break;
        case 'placeholder':
            fragmentType = fragmentValueTypes.ATTR_PLACEHOLDER;
            break;
        case 'name':
            fragmentType = fragmentValueTypes.ATTR_NAME;
            break;
        case 'width':
            fragmentType = fragmentValueTypes.ATTR_WIDTH;
            break;
        case 'height':
            fragmentType = fragmentValueTypes.ATTR_HEIGHT;
            break;
        case 'designMode':
            fragmentType = fragmentValueTypes.ATTR_DESIGNMODE;
            break;
        case 'htmlFor':
            fragmentType = fragmentValueTypes.ATTR_HTMLFOR;
            break;
        case 'playbackRate':
            fragmentType = fragmentValueTypes.ATTR_PLAYBACKRATE;
            break;
        case 'preload':
            fragmentType = fragmentValueTypes.ATTR_PRELOAD;
            break;
        case 'srcDoc':
            fragmentType = fragmentValueTypes.ATTR_SRCDOC;
            break;
        case 'autoplay':
            fragmentType = fragmentValueTypes.ATTR_AUTOPLAY;
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
        case 'readOnly':
            fragmentType = fragmentValueTypes.ATTR_READONLY;
            break;
        case 'reversed':
            fragmentType = fragmentValueTypes.ATTR_REVERSED;
            break;
        case 'required':
            fragmentType = fragmentValueTypes.ATTR_REQUIRED;
            break;
        case 'selected':
            fragmentType = fragmentValueTypes.ATTR_SELECTED;
            break;
        case 'spellCheck':
            fragmentType = fragmentValueTypes.ATTR_SPELLCHECK;
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
        return fragment.templateValue;
    } else {
        fragment.templateElements[attrVal.pointer] = node;
        if (fragmentType === fragmentValueTypes.ATTR_OTHER) {
            fragment.templateTypes[attrVal.pointer] = fragmentValueTypes.ATTR_OTHER[attrName] = attrName;
        } else {
            fragment.templateTypes[attrVal.pointer] = fragmentType;
        }
        return fragment.templateValues[attrVal.pointer];
    }
};