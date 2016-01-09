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
	autoSave: 'autosave',
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
	mediaGroup: PROPERTY,
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
	radioGroup: PROPERTY,
	icon: PROPERTY,
	draggable: BOOLEAN, // 3.2.5 - Global attributes
	dropzone: null, // 3.2.5 - Global attributes
	scoped: PROPERTY | BOOLEAN,
	visible: BOOLEAN,
	trueSpeed: BOOLEAN,
	sandbox: null,
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
	autocorrect: null,
	// autoCapitalize and autoCorrect are supported in Mobile Safari for
	// keyboard hints.
	autoCapitalize: null,

	// Some version of IE ( like IE9 ) actually throw an exception
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
	about: null,
	inlist: null,
	prefix: null,
	resource: null,
	typeof: null,
	vocab: null,
	poster:null,
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
	content:null,
	contextMenu: null,
	classID: null,
	security:null,
	cellPadding: null,
	cellSpacing: null,
	challenge: null,
	charSet: null,
	allowTransparency: null,
	wrap: null,
	wmode: null,
	spellcheck: null, // 3.2.5 - Global attributes
	srcDoc: PROPERTY
};

const HTMLPropsContainer = {};

function checkBitmask( value, bitmask ) {
	return bitmask !== null && ( ( value & bitmask ) === bitmask );
}

for ( const propName in Whitelist ) {

	const propConfig = Whitelist[propName];

	HTMLPropsContainer[propName] = {
		attributeName: DOMAttributeNames[propName] || propName.toLowerCase(),
		attributeNamespace: DOMAttributeNamespaces[propName] ? DOMAttributeNamespaces[propName] : null,
		propertyName: DOMPropertyNames[propName] || propName,

		mustUseProperty: checkBitmask( propConfig, PROPERTY ),
		hasBooleanValue: checkBitmask( propConfig, BOOLEAN ),
		hasNumericValue: checkBitmask( propConfig, NUMERIC_VALUE ),
		hasPositiveNumericValue: checkBitmask( propConfig, POSITIVE_NUMERIC_VALUE )
	};
}

export default HTMLPropsContainer;
