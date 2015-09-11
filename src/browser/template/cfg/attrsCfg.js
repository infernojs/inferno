import setObjStyle from "../setters/setObjStyle";
import removeProp from "../setters/removeProp";
import setPropWithCheck from "../setters/setPropWithCheck";
import boolPropCfg from "./boolPropCfg";
import defaultPropCfg from "./defaultPropCfg";
import boolAttrCfg from "./boolAttrCfg";
import xmlAttrCfg from "./xmlAttrCfg";
import xlinkAttrCfg from "./xlinkAttrCfg";

/************************** WARNING!! **********************************
 *  Don't do any changes here except if you know what you are          *
 *  doing. This list controlls wich attributes has to be set as an     *
 *  HTML property, HTML boolean attribute or a HTML boolean property   *
 ***********************************************************************/

let attrsCfg = {
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
 * Attributes that should be set as a property on common types to improve creation performance
 */
( "srcset enctype autocomplete htmlFor className paused placeholder playbackRate radiogroup currentTime srcObject tabIndex volume srcDoc " +
    "mediagroup kind label default id href value name" ).split( " " ).forEach( ( prop ) => {

        attrsCfg[prop] = defaultPropCfg;

    } );

/**
 * Boolean properties
 */
( "multiple allowFullScreen async inert autofocus autoplay checked controls defer disabled enabled formNoValidate " +
    "loop muted noValidate open readOnly required scoped seamless selected itemScope translate " +
    "truespeed typemustmatch defaultSelected sortable reversed nohref noresize noshade indeterminate draggable " +
    "hidden defaultSelected defaultChecked compact autoplay itemscope formNoValidate" ).split( " " ).forEach( ( prop ) => {

        attrsCfg[prop] = boolPropCfg;

    } );

/**
 * Boolean attributes
 */

( "multiple allowFullScreen loop muted controls seamless itemScope async nowrap inert required noresize " +
    "translate truespeed typemustmatch sortable reversed autoplay nohref defaultselected defaultchecked " +
    "checked disabled enabled selected hidden noResize " +
    "allowfullscreen declare spellcheck open autofocus " +
    "noshade indeterminate draggable defaultSelected defaultChecked compact itemscope" ).split( " " ).forEach( ( prop ) => {

        attrsCfg[prop.toLowerCase()] = boolAttrCfg;

    } );

/**
 * xlink namespace attributes
 */
"xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type".split( " " ).forEach( ( prop ) => {

    attrsCfg[prop] = xlinkAttrCfg;

} );

/**
 * xml namespace attributes
 */
"xml:base xml:id xml:lang xml:space".split( " " ).forEach( ( prop ) => {

    attrsCfg[prop] = xmlAttrCfg;

} );

export default attrsCfg;
