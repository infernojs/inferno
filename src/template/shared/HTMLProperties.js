import DOMasks from '../DOMasks';

const {
    MUST_USE_PROPERTY,
    IS_EDGE_CASE,
    HAS_BOOLEAN_VALUE,
    HAS_NUMERIC_VALUE,
    HAS_POSITIVE_NUMERIC_VALUE

} = DOMasks;

export default {
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
};