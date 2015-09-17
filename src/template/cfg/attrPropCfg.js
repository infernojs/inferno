import masks from '../vars/masks';
import isSVG from '../../util/isSVG';

let {
    MUST_USE_ATTRIBUTE,
	MUST_USE_PROPERTY,
	HAS_SIDE_EFFECTS,
	HAS_BOOLEAN_VALUE,
	HAS_NUMERIC_VALUE,
	HAS_POSITIVE_NUMERIC_VALUE,
	HAS_OVERLOADED_BOOLEAN_VALUE
} = masks;

/*************************** INFO!! **************************************
 * Inferno supports custom attributes, meanin all SVG / HTML             *
 * attributes are supported. 'Only' attributes / properties that need a  *
 * special treatment should be listed here.                              *
 *************************************************************************/

export default {
	allowFullScreen: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
	allowTransparency: MUST_USE_ATTRIBUTE,
	async: HAS_BOOLEAN_VALUE,
	autoFocus: HAS_BOOLEAN_VALUE,
	autoPlay: HAS_BOOLEAN_VALUE,
	capture: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
	charSet: MUST_USE_ATTRIBUTE,
	challenge: MUST_USE_ATTRIBUTE,
	checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
	classID: MUST_USE_ATTRIBUTE,
	className: isSVG ? MUST_USE_ATTRIBUTE : MUST_USE_PROPERTY,
	cols: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
	contextMenu: MUST_USE_ATTRIBUTE,
	controls: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
	dateTime: MUST_USE_ATTRIBUTE,
    default: HAS_BOOLEAN_VALUE,
	defer: HAS_BOOLEAN_VALUE,
    declare: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
	defaultchecked: HAS_BOOLEAN_VALUE,
	defaultmuted: HAS_BOOLEAN_VALUE,
	defaultselected: HAS_BOOLEAN_VALUE,
	disabled: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    draggable: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
	download: HAS_OVERLOADED_BOOLEAN_VALUE,
	form: MUST_USE_ATTRIBUTE,
	formAction: MUST_USE_ATTRIBUTE,
	formEncType: MUST_USE_ATTRIBUTE,
	formMethod: MUST_USE_ATTRIBUTE,
	formNoValidate: HAS_BOOLEAN_VALUE,
	formTarget: MUST_USE_ATTRIBUTE,
	frameBorder: MUST_USE_ATTRIBUTE,
	height: MUST_USE_PROPERTY,
	hidden: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
	id: MUST_USE_PROPERTY,
	inputMode: MUST_USE_ATTRIBUTE,
	is: MUST_USE_ATTRIBUTE,
	ismap: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
	keyParams: MUST_USE_ATTRIBUTE,
	keyType: MUST_USE_ATTRIBUTE,
	label: MUST_USE_PROPERTY,
	list: MUST_USE_ATTRIBUTE,
	loop: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
	manifest: MUST_USE_ATTRIBUTE,
	maxLength: MUST_USE_ATTRIBUTE,
	media: MUST_USE_ATTRIBUTE,
	minLength: MUST_USE_ATTRIBUTE,
	multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
	muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
	name: MUST_USE_PROPERTY,
    nohref: MUST_USE_ATTRIBUTE
    noshade: MUST_USE_ATTRIBUTE,
	noValidate: HAS_BOOLEAN_VALUE,
	open: HAS_BOOLEAN_VALUE,
	placeholder: MUST_USE_PROPERTY,
	readOnly: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    reversed: HAS_BOOLEAN_VALUE,
	required: HAS_BOOLEAN_VALUE,
	role: MUST_USE_ATTRIBUTE,
	rows: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
	scoped: HAS_BOOLEAN_VALUE,
	seamless: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
	selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
	selectedIndex: MUST_USE_PROPERTY,
	size: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
	sizes: MUST_USE_ATTRIBUTE,
    sortable: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
	span: HAS_POSITIVE_NUMERIC_VALUE,
    spellCheck: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
	srcDoc: MUST_USE_PROPERTY,
	srcSet: MUST_USE_ATTRIBUTE,
	start: HAS_NUMERIC_VALUE,
	style: MUST_USE_PROPERTY,
    translate: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    truespeed: HAS_BOOLEAN_VALUE,
    typemustmatch: HAS_BOOLEAN_VALUE,
	value: MUST_USE_PROPERTY | HAS_SIDE_EFFECTS,
    visible: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
	width: MUST_USE_PROPERTY,
	wmode: MUST_USE_ATTRIBUTE,

	/**
	 * Non-standard Properties
	 */

	// itemProp, itemScope, itemType are for
	// Microdata support. See http://schema.org/docs/gs.html
	itemProp: MUST_USE_ATTRIBUTE,
	itemScope: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
	itemType: MUST_USE_ATTRIBUTE,
	// itemID and itemRef are for Microdata support as well but
	// only specified in the the WHATWG spec document. See
	// https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
	itemID: MUST_USE_ATTRIBUTE,
	itemRef: MUST_USE_ATTRIBUTE,
	// IE-only attribute that specifies security restrictions on an iframe
	// as an alternative to the sandbox attribute on IE<10
	security: MUST_USE_ATTRIBUTE,
	// IE-only attribute that controls focus behavior
	unselectable: MUST_USE_ATTRIBUTE
};
