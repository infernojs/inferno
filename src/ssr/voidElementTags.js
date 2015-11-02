// Nodes which should be considered implicitly self-closing	
// Taken from http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html#void-elements
export default (str) => {

    //OPTIMIZATION: Integer comparisons are low-cost, so we can use very fast tag name length filters here.
    //It's faster than using dictionary.

    switch (str.length) {
        case 2:
            return str === 'br' || str === 'hr';

        case 3:
            return str === 'col' || str === 'img' || str === 'wbr' || str === 'use';
        case 4:
            return str === 'area' || str === 'base' || str === 'link' || str === 'meta' || str === 'path' || str === 'line' || str === 'rect' || str === 'stop';
        case 5:
            return str === 'embed' || str === 'frame' || str === 'param' || str === 'track' || str === 'input';
        case 6:
            return str === 'keygen' || str === 'source' || str === 'circle';
        case 7:
            return str === 'command' || str === 'isindex' || str === 'ellipse' || str === 'polygon';
        case 8:
            return str === 'basefont' || str === 'polyline' || str === 'menuitem';
    }

    return false;
};