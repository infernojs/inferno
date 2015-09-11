import forIn     from "../../../util/forIn";
import prefixes  from "../styles/prefixes";
import prefixKey from "../styles/prefixKey";

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
let unitless = {
    animationIterationCount: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    counterRreset: true,
    counterIncrement: true,
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    float: true,
    fontWeight: true,

    // CSS3 Grid layout support
	gridRow:true,
	gridColumn: true,
	
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    pitchRange: true,
    richness: true,
    stress: true,
    tabSize: true,
    volume: true,
    widows: true,
    zIndex: true,
    zoom: true,

    // SVG related properties
    stopOpacity: true,
    fillOpacity: true,
    strokeDashoffset: true,
    strokeOpacity: true,
    strokeWidth: true
};

// convert to vendor prefixed unitless CSS properties
forIn( unitless, ( prop, value ) => {

    prefixes.forEach( ( prefix ) => {

        unitless[prefixKey( prefix, prop )] = value;

    } );

} );

/**
 * Common snake-cased CSS properties
 */
forIn( {
    "animation-iteration-count": true,
    "box-flex": true,
    "box-flex-group": true,
    "box-ordinal-group": true,
    "counter-reset": true,
    "counter-increment": true,
    "column-count": true,
    "flex-grow": true,
    "flex-positive": true,
    "flex-shrink": true,
    "flex-negative": true,
    "flex-order": true,
    "font-weight": true,
    "line-clamp": true,
    "line-height": true,

    // SVG-related properties
    "stop-opacity": true,
    "fill-opacity": true,
    "stroke-dashoffset": true,
    "stroke-opacity": true,
    "stroke-width": true
}, ( prop ) => {

    prefixes.forEach( ( prefix, value ) => {

        unitless[ prop ] = value;

    } );

} );

export default unitless;
