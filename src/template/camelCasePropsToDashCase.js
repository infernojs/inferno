let DASH_REGEX = /([a-z])?([A-Z])/g;
let DASHED_REPLACE = ($$, $1, $2) => `${ $1 || '' }-${ $2.toLowerCase() }`;

// Since prefix is expected to work on inline style objects, we must
// translate the keys to dash case for rendering to CSS.	
export default str => str.replace(DASH_REGEX, DASHED_REPLACE);