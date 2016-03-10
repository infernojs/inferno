/**
 *  DOM registry
 * */

const PROPERTY = 0x1;
const BOOLEAN = 0x2;
const NUMERIC_VALUE = 0x4;
const POSITIVE_NUMERIC_VALUE = 0x6 | 0x4;

const xlink = 'http://www.w3.org/1999/xlink';
const xml = 'http://www.w3.org/XML/1998/namespace';

const DOMAttributeNamespaces = {
	// None-JSX compat
	'xlink:actuate': xlink,
	'xlink:arcrole': xlink,
	'xlink:href': xlink,
	'xlink:role': xlink,
	'xlink:show': xlink,
	'xlink:title': xlink,
	'xlink:type': xlink,
	'xml:base': xml,
	'xml:lang': xml,
	'xml:space': xml,
	// JSX compat
	xlinkActuate: xlink,
	xlinkArcrole: xlink,
	xlinkHref: xlink,
	xlinkRole: xlink,
	xlinkShow: xlink,
	xlinkTitle: xlink,
	xlinkType: xlink
};

export const DOMAttributeNames = {
	acceptCharset: 'accept-charset',
	className: 'class',
	htmlFor: 'for',
	httpEquiv: 'http-equiv',

	// SVG
	clipPath: 'clip-path',
	fillOpacity: 'fill-opacity',
	fontFamily: 'font-family',
	fontSize: 'font-size',
	markerEnd: 'marker-end',
	markerMid: 'marker-mid',
	markerStart: 'marker-start',
	stopColor: 'stop-color',
	stopOpacity: 'stop-opacity',
	strokeDasharray: 'stroke-dasharray',
	strokeLinecap: 'stroke-linecap',
	strokeOpacity: 'stroke-opacity',
	strokeWidth: 'stroke-width',
	textAnchor: 'text-anchor',
	viewBox: 'viewBox', // Edge case. The letter 'b' need to be uppercase

	// JSX compat
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

const DOMPropertyNames = {
	autoComplete: 'autocomplete',
	autoFocus: 'autofocus',
	autoSave: 'autosave'
};

// This 'whitelist' contains edge cases such as attributes
// that should be seen as a property or boolean property.
// ONLY EDIT THIS IF YOU KNOW WHAT YOU ARE DOING!!
// Based on https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attribute
const Whitelist = {
	allowFullScreen: BOOLEAN,
	async: BOOLEAN,
	autoFocus: PROPERTY | BOOLEAN,
	autoPlay: BOOLEAN,
	capture: PROPERTY | BOOLEAN,
	checked: PROPERTY | BOOLEAN,
	controls: PROPERTY | BOOLEAN,
	currentTime: PROPERTY | POSITIVE_NUMERIC_VALUE,
	default: BOOLEAN,
	defaultChecked: BOOLEAN,
	defaultMuted: BOOLEAN,
	defaultSelected: BOOLEAN,
	defer: PROPERTY | BOOLEAN,
	disabled: PROPERTY | BOOLEAN,
	download: PROPERTY | BOOLEAN,
	enabled: BOOLEAN,
	formNoValidate: PROPERTY | BOOLEAN,
	hidden: PROPERTY | BOOLEAN, // 3.2.5 - Global attributes
	loop: PROPERTY | BOOLEAN,
	// Caution; `option.selected` is not updated if `select.multiple` is
	// disabled with `removeAttribute`.
	multiple: PROPERTY | BOOLEAN,
	muted: PROPERTY | BOOLEAN,
	mediaGroup: PROPERTY,
	noValidate: PROPERTY | BOOLEAN,
	noShade: PROPERTY | BOOLEAN,
	noResize: BOOLEAN,
	noWrap: PROPERTY | BOOLEAN,
	typeMustMatch: BOOLEAN,
	open: PROPERTY | BOOLEAN,
	paused: PROPERTY,
	playbackRate: PROPERTY | NUMERIC_VALUE,
	readOnly: PROPERTY | BOOLEAN,
	required: PROPERTY | BOOLEAN,
	reversed: PROPERTY | BOOLEAN,
	radioGroup: PROPERTY,
	icon: PROPERTY,
	draggable: BOOLEAN, // 3.2.5 - Global attributes
	dropzone: null, // 3.2.5 - Global attributes
	scoped: PROPERTY | BOOLEAN,
	visible: BOOLEAN,
	trueSpeed: PROPERTY | BOOLEAN,
	sandbox: null,
	sortable: PROPERTY | BOOLEAN,
	inert: BOOLEAN,
	indeterminate: BOOLEAN,
	nohref: PROPERTY | BOOLEAN,
	compact: PROPERTY | BOOLEAN,
	declare: BOOLEAN,
	ismap: PROPERTY | BOOLEAN,
	pauseOnExit: PROPERTY | BOOLEAN,
	seamless: PROPERTY | BOOLEAN, // Removed from spec
	translate: BOOLEAN, // 3.2.5 - Global attributes
	selected: PROPERTY | BOOLEAN,
	srcLang: PROPERTY,
	srcObject: PROPERTY,
	value: PROPERTY,
	volume: PROPERTY | POSITIVE_NUMERIC_VALUE,
	itemScope: BOOLEAN, // 3.2.5 - Global attributes
	className: null,
	tabindex: PROPERTY | NUMERIC_VALUE,

	/**
	 * React compat for non-working JSX namespace support
	 */

	xlinkActuate: null,
	xlinkArcrole: null,
	xlinkHref: null,
	xlinkRole: null,
	xlinkShow: null,
	xlinkTitle: null,
	xlinkType: null,
	xmlBase: null,
	xmlLang: null,
	xmlSpace: null,

	/**
	 * SVG
	 */

	clipPath: null,
	fillOpacity: null,
	fontFamily: null,
	fontSize: null,
	markerEnd: null,
	markerMid: null,
	markerStart: null,
	stopColor: null,
	stopOpacity: null,
	strokeDasharray: null,
	strokeLinecap: null,
	strokeOpacity: null,
	strokeWidth: null,
	textAnchor: null,

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
	id: null,
	dir: null,
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
	autocorrect: null,
	// autoCapitalize and autoCorrect are supported in Mobile Safari for
	// keyboard hints.
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
	 * Others
	 */
	srcSet: null,
	inlist: null,
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
	spellcheck: null, // 3.2.5 - Global attributes
	srcDoc: PROPERTY
};

const HTMLPropsContainer = {};

function checkBitmask(value, bitmask) {
	return bitmask !== null && ((value & bitmask) === bitmask);
}

for (const propName in Whitelist) {

	const propConfig = Whitelist[propName];

	HTMLPropsContainer[propName] = {
		attributeName: DOMAttributeNames[propName] || propName.toLowerCase(),
		attributeNamespace: DOMAttributeNamespaces[propName] ? DOMAttributeNamespaces[propName] : null,
		propertyName: DOMPropertyNames[propName] || propName,

		mustUseProperty: checkBitmask(propConfig, PROPERTY),
		hasBooleanValue: checkBitmask(propConfig, BOOLEAN),
		hasNumericValue: checkBitmask(propConfig, NUMERIC_VALUE),
		hasPositiveNumericValue: checkBitmask(propConfig, POSITIVE_NUMERIC_VALUE)
	};
}

export default HTMLPropsContainer;
