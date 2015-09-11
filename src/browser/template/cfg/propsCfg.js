import setObjStyle      from "../setters/setObjStyle";
import removeProp       from "../setters/removeProp";
import setPropWithCheck from "../setters/setPropWithCheck";
import boolPropCfg      from "./boolPropCfg";
import defaultAttrCfg   from "./defaultAttrCfg";
import boolAttrCfg      from "./boolAttrCfg";

/************************** WARNING!! **********************************
 *  Don't do any changes here except if you know what you are          *
 *  doing. This list controlls wich properties has to be set as an     *
 *  HTML attributes, HTML boolean attribute or a HTML boolean property *
 ***********************************************************************/

let propCfg = {
    style: {
        set: setObjStyle,
        remove: removeProp
    },
    value: {
        set: setPropWithCheck,
        remove: removeProp
    }
};

/**
 * Boolean attributes
 */
"paused spellcheck".split( " " ).forEach( ( prop ) => {

    propCfg[prop] = boolAttrCfg;

} );

/**
 * Boolean properties
 */
( "multiple allowFullScreen async inert autofocus autoplay checked controls defer disabled enabled formNoValidate " +
    "loop muted noValidate open readOnly required scoped seamless selected itemScope translate " +
    "truespeed typemustmatch defaultSelected sortable reversed nohref noresize noshade indeterminate draggable " +
    "hidden defaultSelected defaultChecked compact autoplay itemscope formNoValidate" ).split( " " ).forEach( ( prop ) => {

        propCfg[prop] = boolPropCfg;

    } );

/**
 * Properties that should be set as attributes
 */
( "allowTransparency challenge charSet class classID cols contextMenu dateTime dominantBaseline form formAction formEncType " +
    "formMethod formTarget height keyParams keyType list manifest media role rows size sizes srcset " +
	"action enctype method novalidate scrolling width wmode " +
    // IE-only attribute that specifies security restrictions on an iframe
    // as an alternative to the sandbox attribute on IE<10
    "security " +
    // itemProp, itemScope, itemType are for
    // Microdata support. See http://schema.org/docs/gs.html
	"itemProp itemType inputMode inlist datatype prefix " + 
	// property is supported for OpenGraph in meta tags.
	"property " + 
	"resource rev typeof vocab about for " +
    // itemID and itemRef are for Microdata support as well but
    // only specified in the the WHATWG spec document. See
    // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
    "itemID itemRef " +
	// All SVG attributes are supported if set as an attribute. This few attributes are added just to
	// prevent stupidity if anyone are trying to set them as properties
	"cursor cx cy d dx dy r rx ry viewBox transform r rx ry version y y1 y2 x1 x2 offset opacity points" +
    // IE-only attribute that controls focus behavior
	"unselectable" + 
	"role rows size sizes srcSet" ).split( " " ).forEach( ( prop ) => {

    propCfg[prop] = defaultAttrCfg;

} );

export default propCfg;
