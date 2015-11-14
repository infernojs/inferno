let DASH_REGEX = /([^A-Z]+)([A-Z])/g;
let DASHED_REPLACE = ($$, $1, $2) => `${ $1 }-${ $2 }`;

export default str => str.replace(DASH_REGEX, DASHED_REPLACE).toLowerCase();
