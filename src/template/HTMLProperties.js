const PROPERTY = 0x1;
const BOOLEAN = 0x2;
const NUMERIC_VALUE = 0x4;
const POSITIVE_NUMERIC_VALUE = 0x6 | 0x4;
const STYLE_OBJECT = 0x1 | 0x20;
const FORM_ELEMENT = 0x30;

const xlink = 'http://www.w3.org/1999/xlink';
const xml = 'http://www.w3.org/XML/1998/namespace';

const namespaceAttrs = {
    'xlink:actuate': xlink,
    'xlink:arcrole': xlink,
    'xlink:href': xlink,
    'xlink:role': xlink,
    'xlink:show': xlink,
    'xlink:title': xlink,
    'xlink:type': xlink,
    'xml:base': xml,
    'xml:lang': xml,
    'xml:space': xml
};

const attributeMapping = {
    acceptCharset: 'accept-charset',
    className: 'class',
    htmlFor: 'for',
    httpEquiv: 'http-equiv',
    xlinkActuate: 'xlink:actuate',
    xlinkArcrole: 'xlink:arcrole',
    xlinkHref: 'xlink:href',
    xlinkRole: 'xlink:role',
    xlinkShow: 'xlink:show',
    xlinkTitle: 'xlink:title',
    xlinkType: 'xlink:type',
    xmlBase: 'xml:base',
    xmlLang: 'xml:lang',
    xmlSpace: 'xml:space'
};

// This 'whitelist' contains edge cases such as attributes
// that should be seen as a property or boolean property.
// ONLY EDIT THIS IF YOU KNOW WHAT YOU ARE DOING!!
const Whitelist = {
    allowFullScreen: BOOLEAN,
    async: BOOLEAN,
    autoFocus: BOOLEAN,
    autoPlay: BOOLEAN,
    capture: BOOLEAN,
    checked: PROPERTY | BOOLEAN,
    cols: POSITIVE_NUMERIC_VALUE,
    controls: BOOLEAN,
    currentTime: PROPERTY | POSITIVE_NUMERIC_VALUE,
    default: BOOLEAN,
    defer: BOOLEAN,
    disabled: BOOLEAN,
    download: BOOLEAN,
    enabled: BOOLEAN,
    formNoValidate: BOOLEAN,
    hidden: BOOLEAN,
    loop: BOOLEAN,
    // Caution; `option.selected` is not updated if `select.multiple` is
    // disabled with `removeAttribute`.
    multiple: PROPERTY | BOOLEAN,
    muted: PROPERTY | BOOLEAN,
    noValidate: BOOLEAN,
    open: BOOLEAN,
    paused: PROPERTY,
    playbackRate: PROPERTY | NUMERIC_VALUE,
    readOnly: BOOLEAN,
    required: BOOLEAN,
    reversed: BOOLEAN,
    rowSpan: NUMERIC_VALUE,
    scoped: BOOLEAN,
    seamless: BOOLEAN,
    selected: PROPERTY | BOOLEAN,
//    style: STYLE_OBJECT, // TODO! Fix inline styles
	size: POSITIVE_NUMERIC_VALUE,
    span: POSITIVE_NUMERIC_VALUE,
    srcLang: PROPERTY,
    srcObject: PROPERTY,
    start: NUMERIC_VALUE,
    value: PROPERTY,
    volume: PROPERTY | POSITIVE_NUMERIC_VALUE,
    itemScope: BOOLEAN,

    /**
     * Namespace attributes
     */

    'xlink:actuate': null,
    'xlink:arcrole': null,
    'xlink:href': null,
    'xlink:role': null,
    'xlink:show': null,
    'xlink:title': null,
    'xlink:type': null,
    'xml:base': null,
    'xml:lang': null,
    'xml:space': null
}

function checkBitmask(value, bitmask) {
    return bitmask != null && ((value & bitmask) === bitmask);
}

export default (function() {

    let attributeContainer = {};

    for (let propName in Whitelist) {

        const propConfig = Whitelist[propName];

        const attributeName = attributeMapping[propName] || propName.toLowerCase();

        const propertyInfo = {
            attributeName: attributeName,
            attributeNamespace: namespaceAttrs[propName],
            propertyName: propName,
            mutationMethod: null,

            mustUseProperty: checkBitmask(propConfig, PROPERTY),
            hasBooleanValue: checkBitmask(propConfig, BOOLEAN),
            hasNumericValue: checkBitmask(propConfig, NUMERIC_VALUE),
            hasPositiveNumericValue: checkBitmask(propConfig, POSITIVE_NUMERIC_VALUE),
        };

        attributeContainer[attributeName] = propertyInfo;
    }
    return function getPropertyInfo(attributeName) {

        const lowerCased = attributeName.toLowerCase();
        let propInfo;

        if (attributeContainer[lowerCased]) {
            propInfo = attributeContainer[lowerCased];
        } else {
            propInfo = {
                attributeName: attributeMapping[attributeName] || lowerCased,
                mustUseAttribute: true,
                isCustomAttribute: true // TODO! Check for HTML 'data-*' attribute and validate
            };
        }
        return propInfo;
    }
})();