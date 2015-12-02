export default (str) => {
    switch (str.length) {
        case 4:
            return str === 'flex' || str === 'base' || str === 'zoom';
        case 5:
            return str === 'order';
        case 6:
            return str === 'marker' || str === 'stress' || str === 'volume' || str === 'widows' || str === 'zIndex';
        case 7:
            return str === 'boxFlex' || str === 'gridRow' || str === 'opacity' || str === 'orphans' || str === 'tabSize';
        case 8:
            return str === 'flexGrow' || str === 'richness';
        case 9:
            return str === 'flexOrder' || str === 'lineClamp' || 'msBoxFlex';
        case 10:
            return str === 'flexShrink' || str === 'counterReset' || str === 'fontWeight' || str === 'gridColumn' || str === 'lineHeight' || str === 'pitchRange' || str === 'MozBoxFlex';
        case 11:
            return str === 'columnCount' || str === 'counterReset' || str === 'stopOpacity' || str === 'fillOpacity' || str === 'strokeWidth';
        case 12:
            return str === 'boxFlexGroup' || str === 'counterReset' || str === 'flexPositive' || str === 'flexNegative';
        case 13:
            return str === 'strokeOpacity' || str === 'WebkitBoxFlex' || str === 'WebkitGridRow';
        case 14:
            return str === 'WebkitFlexGrow';
        case 15:
            return str === 'boxOrdinalGroup' || str === 'WebkitFlexShrink';
        case 16:
            return str === 'counterIncrement' || str === 'strokeDashoffset';
        case 17:
            return str === 'MozBoxOrdinalGroup' || str === 'WebkitStrokeWidth';
        case 20:
            return str === 'WebkitBoxOrdinalGroup';
        case 23:
            return str === 'animationIterationCount';
        case 29:
            return str === 'WebkitAnimationIterationCount';
    }

    return false;
};