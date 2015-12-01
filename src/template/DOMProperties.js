import DOMAttributeNamespaces from './DOMAttributeNamespaces';
import DOMAttributeNames from './DOMAttributeNames';
import DOMasks from './DOMasks';
import checkBitmask from './checkBitmask';

const {
    MUST_USE_PROPERTY,
    IS_EDGE_CASE,
    HAS_BOOLEAN_VALUE,
    HAS_NUMERIC_VALUE,
    HAS_POSITIVE_NUMERIC_VALUE

} = DOMasks;

let DOMPropertyContainer = {};

const DOMProperties = {
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
    value: MUST_USE_PROPERTY | IS_EDGE_CASE,
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

export default (function () {
	
var propInfoByAttributeName = {};

for (let propName in DOMProperties) {

    let propConfig = DOMProperties[propName];
	
    let attributeName = DOMAttributeNames[propName] || propName.toLowerCase();

    let propertyInfo = {
        attributeName: attributeName,
        attributeNamespace: DOMAttributeNamespaces[propName],
        propertyName: propName,
        mutationMethod: null,

        mustUseProperty: checkBitmask(propConfig, MUST_USE_PROPERTY),
        hasSideEffects: checkBitmask(propConfig, IS_EDGE_CASE),
        hasBooleanValue: checkBitmask(propConfig, HAS_BOOLEAN_VALUE),
        hasNumericValue: checkBitmask(propConfig, HAS_NUMERIC_VALUE),
        hasPositiveNumericValue: checkBitmask(propConfig, HAS_POSITIVE_NUMERIC_VALUE),
    };

    propInfoByAttributeName[attributeName] = propertyInfo;
}
 return function getPropertyInfo (attributeName) {

	 let lowerCased = attributeName.toLowerCase();
     let propInfo;

    if (propInfoByAttributeName[lowerCased]) {
          propInfo = propInfoByAttributeName[lowerCased];
	} else {
            propInfo = {
                attributeName: DOMAttributeNames[attributeName] || attributeName.toLowerCase(),
                mustUseAttribute: true,
                isCustomAttribute: true
            };
        }
return propInfo;

	}
})();