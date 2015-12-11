const PROPERTY = 0x1;
const BOOLEAN = 0x2;
const NUMERIC_VALUE = 0x4;
const POSITIVE_NUMERIC_VALUE = 0x6 | 0x4;
const OBJECT = 0x1 | 0x20;
const NEED_REVIEW = 0x30;

const xlink = 'http://www.w3.org/1999/xlink';
const xml = 'http://www.w3.org/XML/1998/namespace';

const DOMAttributeNamespaces = {
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

const DOMAttributeNames = {
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
    xmlSpace: 'xml:space',
    viewBox: 'viewBox' // SVG - Edge case. The letter 'b' need to be uppercase
};

const DOMPropertyNames = {
    autoComplete: 'autocomplete',
    autoFocus: 'autofocus',
    autoPlay: 'autoplay',
    autoSave: 'autosave',
    hrefLang: 'hreflang',
    radioGroup: 'radiogroup',
    spellCheck: 'spellcheck',
    srcDoc: 'srcdoc',
    srcSet: 'srcset'
};

// This 'whitelist' contains edge cases such as attributes
// that should be seen as a property or boolean property.
// ONLY EDIT THIS IF YOU KNOW WHAT YOU ARE DOING!!
const Whitelist = {
    allowFullScreen: BOOLEAN,
    async: BOOLEAN,
    autoFocus: BOOLEAN,
    autoPlay: null,
    capture: BOOLEAN,
    checked: PROPERTY | BOOLEAN,
    controls: BOOLEAN,
    currentTime: PROPERTY | POSITIVE_NUMERIC_VALUE,
    default: BOOLEAN,
    defaultChecked: BOOLEAN,
    defaultMuted: BOOLEAN,
    defaultSelected: BOOLEAN,
    defer: BOOLEAN,
    disabled: PROPERTY | BOOLEAN,
    download: BOOLEAN,
    enabled: BOOLEAN,
    formNoValidate: BOOLEAN,
    hidden: PROPERTY | BOOLEAN, // 3.2.5 - Global attributes
    loop: BOOLEAN,
    // Caution; `option.selected` is not updated if `select.multiple` is
    // disabled with `removeAttribute`.
    multiple: PROPERTY | BOOLEAN,
    muted: PROPERTY | BOOLEAN,
    noValidate: BOOLEAN,
    noShade: PROPERTY | BOOLEAN,
    noResize: BOOLEAN,
    noWrap: BOOLEAN,
    typeMustMatch: BOOLEAN,
    open: BOOLEAN,
    paused: PROPERTY,
    playbackRate: PROPERTY | NUMERIC_VALUE,
    readOnly: BOOLEAN,
    required: PROPERTY | BOOLEAN,
    reversed: BOOLEAN,
    draggable: BOOLEAN, // 3.2.5 - Global attributes
    dropzone: null, // 3.2.5 - Global attributes
    scoped: BOOLEAN,
    visible: BOOLEAN,
    trueSpeed: BOOLEAN,
    sortable: BOOLEAN,
    inert: BOOLEAN,
    indeterminate: BOOLEAN,
    nohref: BOOLEAN,
    compact: BOOLEAN,
    declare: BOOLEAN,
    ismap: PROPERTY | BOOLEAN,
    pauseOnExit: PROPERTY | BOOLEAN,
    seamless: BOOLEAN,
    translate: BOOLEAN, // 3.2.5 - Global attributes
    selected: PROPERTY | BOOLEAN,
    style: OBJECT, // 3.2.5 - Global attributes
    srcLang: PROPERTY,
    srcObject: PROPERTY,
    value: PROPERTY | NEED_REVIEW,
    volume: PROPERTY | POSITIVE_NUMERIC_VALUE,
    itemScope: BOOLEAN, // 3.2.5 - Global attributes
    className: null,
    tabindex: PROPERTY | NUMERIC_VALUE,

    /**
     * Numeric attributes
     */
    cols: POSITIVE_NUMERIC_VALUE,
    rows: NUMERIC_VALUE,
    rowspan: NUMERIC_VALUE,
    size: POSITIVE_NUMERIC_VALUE,
    sizes: NUMERIC_VALUE,
    start: NUMERIC_VALUE,

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
    'xml:space': null,

    /**
     * 3.2.5 - Global attributes
     */
    itemprop: true,
    itemref: true,
    itemscope: true,
    itemtype: true,
    id: null,
    class: null,
    dir: null,
    lang: null,
    title: null,

    /**
     * Properties that MUST be set as attributes, due to:
     *
     * - browser bug
     * - strange spec outlier
     *
     * Nothing bad with this. This properties get a performance boost
     * compared to custom attributes because they are skipping the
     * validation check.
     */

    // Force 'autocorrect' and 'autoCapitalize' to be set as an attribute
    // to fix issues with Mobile Safari on iOS devices
    autocorrect: BOOLEAN,

    autoCapitalize: null,

    // Some version of IE (like IE9) actually throw an exception
    // if you set input.type = 'something-unknown'
    type: null,

    /**
     * Form
     */
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formTarget: null,
    frameBorder: null,

    /**
     * Internet Explorer / Edge
     */

    // IE-only attribute that controls focus behavior
    unselectable: null,

    /**
     * Firefox
     */

    continuous: BOOLEAN,

    /**
     * Safari
     */

    // color is for Safari mask-icon link
    color: null,

    /**
     * RDFa Properties
     */
    datatype: null,
    // property is also supported for OpenGraph in meta tags.
    property: null,

    /**
     * Others
     */
    
	srcSet: null,
    scrolling: null,
    nonce: null,
    method: null,
    minLength: null,
    marginWidth: null,
    marginHeight: null,
    list: null,
    keyType: null,
    is: null,
    inputMode: null,
    height: null,
    width: null,
    dateTime: null,
    contenteditable: null, // 3.2.5 - Global attributes
    contextMenu: null,
    classID: null,
    cellPadding: null,
    cellSpacing: null,
    charSet: null,
    allowTransparency: null,
    spellcheck: null // 3.2.5 - Global attributes
};

let HTMLPropsContainer = {};

function checkBitmask(value, bitmask) {
    return bitmask !== null && ((value & bitmask) === bitmask);
}

for (let propName in Whitelist) {

    const propConfig = Whitelist[propName];

    HTMLPropsContainer[propName] = {
        attributeName: DOMAttributeNames[propName] || propName.toLowerCase(),
        attributeNamespace: DOMAttributeNamespaces[propName] ? DOMAttributeNamespaces[propName] : null,
        propertyName: DOMPropertyNames[propName] || propName,

        mustUseProperty: checkBitmask(propConfig, PROPERTY),
        hasBooleanValue: checkBitmask(propConfig, BOOLEAN),
        hasNumericValue: checkBitmask(propConfig, NUMERIC_VALUE),
        needReview: checkBitmask(propConfig, NEED_REVIEW),
        hasPositiveNumericValue: checkBitmask(propConfig, POSITIVE_NUMERIC_VALUE),
        mustUseObject: checkBitmask(propConfig, OBJECT)
    };
}

export default HTMLPropsContainer;