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
    /**
     * Standard Properties
     */
    accept: null,
    acceptCharset: null,
    accessKey: null,
    action: null,
    allowFullScreen: HAS_BOOLEAN_VALUE,
    allowTransparency: null,
    alt: null,
    async: HAS_BOOLEAN_VALUE,
    autoComplete: null,
    autoFocus: HAS_BOOLEAN_VALUE,
    autoPlay: HAS_BOOLEAN_VALUE,
    capture: HAS_BOOLEAN_VALUE,
    cellPadding: null,
    cellSpacing: null,
    charSet: null,
    challenge: null,
    checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    classID: null,
    className: null,
    cols: HAS_POSITIVE_NUMERIC_VALUE,
    colSpan: null,
    content: null,
    contentEditable: null,
    contextMenu: null,
    controls: HAS_BOOLEAN_VALUE,
    coords: null,
    crossOrigin: null,
    currentTime: MUST_USE_PROPERTY | HAS_POSITIVE_NUMERIC_VALUE,
    data: null, // For `<object />` acts as `src`.
    dateTime: null,
    default: HAS_BOOLEAN_VALUE,
    defer: HAS_BOOLEAN_VALUE,
    dir: null,
    disabled: HAS_BOOLEAN_VALUE,
    download: HAS_BOOLEAN_VALUE,
    draggable: null,
    enabled: HAS_BOOLEAN_VALUE,
    encType: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: HAS_BOOLEAN_VALUE,
    formTarget: null,
    frameBorder: null,
    headers: null,
    height: null,
    hidden: HAS_BOOLEAN_VALUE,
    high: null,
    href: null,
    hrefLang: null,
    htmlFor: null,
    httpEquiv: null,
    icon: null,
    id: null,
    inputMode: null,
    integrity: null,
    is: null,
    keyParams: null,
    keyType: null,
    kind: null,
    label: null,
    lang: null,
    list: null,
    loop: HAS_BOOLEAN_VALUE,
    low: null,
    manifest: null,
    marginHeight: null,
    marginWidth: null,
    max: null,
    maxLength: null,
    media: null,
    mediaGroup: null,
    method: null,
    min: null,
    minLength: null,
    // Caution; `option.selected` is not updated if `select.multiple` is
    // disabled with `removeAttribute`.
    multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    name: null,
    noValidate: HAS_BOOLEAN_VALUE,
    open: HAS_BOOLEAN_VALUE,
    optimum: null,
    pattern: null,
    paused: MUST_USE_PROPERTY,
    placeholder: null,
    playbackRate: MUST_USE_PROPERTY | HAS_NUMERIC_VALUE,
    poster: null,
    preload: null,
    radioGroup: null,
    readOnly: HAS_BOOLEAN_VALUE,
    rel: null,
    required: HAS_BOOLEAN_VALUE,
    reversed: HAS_BOOLEAN_VALUE,
    role: null,
    rows: null,
    rowSpan: HAS_NUMERIC_VALUE,
    sandbox: null,
    scope: null,
    scoped: HAS_BOOLEAN_VALUE,
    scrolling: null,
    seamless: HAS_BOOLEAN_VALUE,
    selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    shape: null,
    size: HAS_POSITIVE_NUMERIC_VALUE,
    sizes: null,
    span: HAS_POSITIVE_NUMERIC_VALUE,
    spellCheck: null,
    src: null,
    srcDoc: null,
    srcLang: MUST_USE_PROPERTY,
    srcObject: MUST_USE_PROPERTY,
    srcSet: null,
    start: HAS_NUMERIC_VALUE,
    step: null,
    style: null,
    summary: null,
    tabIndex: null,
    target: null,
    title: null,
    // Setting .type throws on non-<input> tags
    type: null,
    useMap: null,
    value: MUST_USE_PROPERTY | IS_EDGE_CASE,
    volume: MUST_USE_PROPERTY | HAS_POSITIVE_NUMERIC_VALUE,
    width: null,
    wmode: null,
    wrap: null,

    /**
     * RDFa Properties
     */
    about: null,
    datatype: null,
    inlist: null,
    prefix: null,
    // property is also supported for OpenGraph in meta tags.
    property: null,
    resource: null,
    typeof: null,
    vocab: null,

    /**
     * Non-standard Properties
     */
    // autoCapitalize and autoCorrect are supported in Mobile Safari for
    // keyboard hints.
    autoCapitalize: null,
    autoCorrect: null,
    // autoSave allows WebKit/Blink to persist values of input fields on page reloads
    autoSave: null,
    // color is for Safari mask-icon link
    color: null,
    // itemProp, itemScope, itemType are for
    // Microdata support. See http://schema.org/docs/gs.html
    itemProp: null,
    itemScope: HAS_BOOLEAN_VALUE,
    itemType: null,
    // itemID and itemRef are for Microdata support as well but
    // only specified in the the WHATWG spec document. See
    // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
    itemID: null,
    itemRef: null,
    // results show looking glass icon and recent searches on input
    // search fields in WebKit/Blink
    results: null,
    // IE-only attribute that specifies security restrictions on an iframe
    // as an alternative to the sandbox attribute on IE<10
    security: null,
    // IE-only attribute that controls focus behavior
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