import forIn     from "../../../util/forIn";
import prefixes  from "../prefixes";
import prefixKey from "../prefixKey";

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
    lineClamp: true,
    lineHeight: true,
    marker: true,
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

    // SVG-related properties
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

export default unitless;