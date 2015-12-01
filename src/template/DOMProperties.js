import checkBitmask from './checkBitmask';

const MUST_USE_PROPERTY = 0x1;
const HAS_BOOLEAN_VALUE = 0x4;
const HAS_NUMERIC_VALUE = 0x8;
const HAS_POSITIVE_NUMERIC_VALUE = 0x10 | 0x8;

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

// This 'whitelist' contains edge cases such as
// Mainly it contains the attributes that should be seen as a property or boolean property.
// ONLY EDIT THIS IF YOU KNOW WHAT YOU ARE DOING!!

const Whitelist = {
    allowFullScreen: HAS_BOOLEAN_VALUE,
    async: HAS_BOOLEAN_VALUE,
    autoFocus: HAS_BOOLEAN_VALUE,
    autoPlay: HAS_BOOLEAN_VALUE,
    capture: HAS_BOOLEAN_VALUE,
    checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    cols: HAS_POSITIVE_NUMERIC_VALUE,
    controls: HAS_BOOLEAN_VALUE,
    currentTime: MUST_USE_PROPERTY | HAS_POSITIVE_NUMERIC_VALUE,
    default: HAS_BOOLEAN_VALUE,
    defer: HAS_BOOLEAN_VALUE,
    disabled: HAS_BOOLEAN_VALUE,
    download: HAS_BOOLEAN_VALUE,
    enabled: HAS_BOOLEAN_VALUE,
    formNoValidate: HAS_BOOLEAN_VALUE,
    hidden: HAS_BOOLEAN_VALUE,
    loop: HAS_BOOLEAN_VALUE,
    // Caution; `option.selected` is not updated if `select.multiple` is
    // disabled with `removeAttribute`.
    multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    noValidate: HAS_BOOLEAN_VALUE,
    open: HAS_BOOLEAN_VALUE,
    paused: MUST_USE_PROPERTY,
    playbackRate: MUST_USE_PROPERTY | HAS_NUMERIC_VALUE,
    readOnly: HAS_BOOLEAN_VALUE,
    required: HAS_BOOLEAN_VALUE,
    reversed: HAS_BOOLEAN_VALUE,
    rowSpan: HAS_NUMERIC_VALUE,
    scoped: HAS_BOOLEAN_VALUE,
    seamless: HAS_BOOLEAN_VALUE,
    selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    size: HAS_POSITIVE_NUMERIC_VALUE,
    span: HAS_POSITIVE_NUMERIC_VALUE,
    srcLang: MUST_USE_PROPERTY,
    srcObject: MUST_USE_PROPERTY,
    start: HAS_NUMERIC_VALUE,
    value: MUST_USE_PROPERTY,
    volume: MUST_USE_PROPERTY | HAS_POSITIVE_NUMERIC_VALUE,
    itemScope: HAS_BOOLEAN_VALUE,

    /**
     * Namespace attributes
     */

    xmlns: null,
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

function checkMask(value, bitmask) {
    return bitmask != null && ((value & bitmask) === bitmask);
}

export default (function() {

    let propInfoByAttributeName = {};

    for (let propName in Whitelist) {

        let propConfig = Whitelist[propName];

        let attributeName = attributeMapping[propName] || propName.toLowerCase();

        let propertyInfo = {
            attributeName: attributeName,
            attributeNamespace: namespaceAttrs[propName],
            propertyName: propName,
            mutationMethod: null,

            mustUseProperty: checkBitmask(propConfig, MUST_USE_PROPERTY),
            hasBooleanValue: checkBitmask(propConfig, HAS_BOOLEAN_VALUE),
            hasNumericValue: checkBitmask(propConfig, HAS_NUMERIC_VALUE),
            hasPositiveNumericValue: checkBitmask(propConfig, HAS_POSITIVE_NUMERIC_VALUE),
        };

        propInfoByAttributeName[attributeName] = propertyInfo;
    }
    return function getPropertyInfo(attributeName) {

        let lowerCased = attributeName.toLowerCase();
        let propInfo;

        if (propInfoByAttributeName[lowerCased]) {
            propInfo = propInfoByAttributeName[lowerCased];
        } else {
            propInfo = {
                attributeName: attributeMapping[attributeName] || lowerCased,
                mustUseAttribute: true,
                isCustomAttribute: true
            };
        }
        return propInfo;
    }
})();