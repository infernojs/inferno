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

var _defaultPropCfg = require("./defaultPropCfg");

var _defaultPropCfg2 = _interopRequireDefault(_defaultPropCfg);

var _boolAttrCfg = require("./boolAttrCfg");

var _boolAttrCfg2 = _interopRequireDefault(_boolAttrCfg);

var _xmlAttrCfg = require("./xmlAttrCfg");

var _xmlAttrCfg2 = _interopRequireDefault(_xmlAttrCfg);

var _xlinkAttrCfg = require("./xlinkAttrCfg");

var _xlinkAttrCfg2 = _interopRequireDefault(_xlinkAttrCfg);

/************************** WARNING!! **********************************
 *  Don't do any changes here except if you know what you are          *
 *  doing. This list controlls wich attributes has to be set as an     *
 *  HTML property, HTML boolean attribute or a HTML boolean property   *
 ***********************************************************************/

var attrsCfg = {
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
 * Attributes that should be set as a property on common types to improve creation performance
 */
("srcset enctype autocomplete htmlFor className paused placeholder playbackRate radiogroup currentTime srcObject tabIndex volume srcDoc " + "mediagroup kind label default id href value name").split(" ").forEach(function (prop) {

    attrsCfg[prop] = _defaultPropCfg2["default"];
});

/**
 * Boolean properties
 */
("multiple allowFullScreen async inert autofocus autoplay checked controls defer disabled enabled formNoValidate " + "loop muted noValidate open readOnly required scoped seamless selected itemScope translate " + "truespeed typemustmatch defaultSelected sortable reversed nohref noresize noshade indeterminate draggable " + "hidden defaultSelected defaultChecked compact autoplay itemscope formNoValidate").split(" ").forEach(function (prop) {

    attrsCfg[prop] = _boolPropCfg2["default"];
});

/**
 * Boolean attributes
 */

("multiple allowFullScreen loop muted controls seamless itemScope async nowrap inert required noresize " + "translate truespeed typemustmatch sortable reversed autoplay nohref defaultselected defaultchecked " + "checked disabled enabled selected hidden noResize " + "allowfullscreen declare spellcheck open autofocus " + "noshade indeterminate draggable defaultSelected defaultChecked compact itemscope").split(" ").forEach(function (prop) {

    attrsCfg[prop.toLowerCase()] = _boolAttrCfg2["default"];
});

/**
 * xlink namespace attributes
 */
"xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function (prop) {

    attrsCfg[prop] = _xlinkAttrCfg2["default"];
});

/**
 * xml namespace attributes
 */
"xml:base xml:id xml:lang xml:space".split(" ").forEach(function (prop) {

    attrsCfg[prop] = _xmlAttrCfg2["default"];
});

exports["default"] = attrsCfg;
module.exports = exports["default"];