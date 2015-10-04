"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _setObjStyle = require(".././setObjStyle");

var _setObjStyle2 = _interopRequireDefault(_setObjStyle);

var _removeProp = require(".././removeProp");

var _removeProp2 = _interopRequireDefault(_removeProp);

var _setPropWithCheck = require(".././setPropWithCheck");

var _setPropWithCheck2 = _interopRequireDefault(_setPropWithCheck);

var _boolPropCfg = require("./boolPropCfg");

var _boolPropCfg2 = _interopRequireDefault(_boolPropCfg);

var _defaultAttrCfg = require("./defaultAttrCfg");

var _defaultAttrCfg2 = _interopRequireDefault(_defaultAttrCfg);

var _boolAttrCfg = require("./boolAttrCfg");

var _boolAttrCfg2 = _interopRequireDefault(_boolAttrCfg);

/************************** WARNING!! **********************************
 *  Don't do any changes here except if you know what you are          *
 *  doing. This list controlls wich properties has to be set as an     *
 *  HTML attributes, HTML boolean attribute or a HTML boolean property *
 ***********************************************************************/

var propCfg = {
    style: {
        set: _setObjStyle2["default"],
        remove: _removeProp2["default"]
    },
    value: {
        set: _setPropWithCheck2["default"],
        remove: _removeProp2["default"]
    }
};

/**
 * Boolean attributes
 */
"paused spellcheck".split(" ").forEach(function (prop) {

    propCfg[prop] = _boolAttrCfg2["default"];
});

/**
 * Boolean properties
 */
("multiple allowFullScreen async inert autofocus autoplay checked controls defer disabled enabled formNoValidate " + "loop muted noValidate open readOnly required scoped seamless selected itemScope translate " + "truespeed typemustmatch defaultSelected sortable reversed nohref noresize noshade indeterminate draggable " + "hidden defaultSelected defaultChecked compact autoplay itemscope formNoValidate").split(" ").forEach(function (prop) {

    propCfg[prop] = _boolPropCfg2["default"];
});

/**
 * Properties that should be set as attributes
 */
("allowTransparency challenge charSet class classID cols contextMenu dateTime dominantBaseline form formAction formEncType " + "formMethod formTarget height keyParams keyType list manifest media role rows size sizes srcset " + "action enctype method novalidate scrolling width wmode " +
// IE-only attribute that specifies security restrictions on an iframe
// as an alternative to the sandbox attribute on IE<10
"security " +
// itemProp, itemScope, itemType are for
// Microdata support. See http://schema.org/docs/gs.html
"itemProp itemType inputMode inlist datatype prefix " +
// property is supported for OpenGraph in meta tags.
"property " + "resource rev typeof vocab about for " +
// itemID and itemRef are for Microdata support as well but
// only specified in the the WHATWG spec document. See
// https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
"itemID itemRef " +
// All SVG attributes are supported if set as an attribute. This few attributes are added just to
// prevent stupidity if anyone are trying to set them as properties
"cursor cx cy d dx dy r rx ry viewBox transform r rx ry version y y1 y2 x1 x2 offset opacity points" +
// IE-only attribute that controls focus behavior
"unselectable" + "role rows size sizes srcSet").split(" ").forEach(function (prop) {

    propCfg[prop] = _defaultAttrCfg2["default"];
});

exports["default"] = propCfg;
module.exports = exports["default"];