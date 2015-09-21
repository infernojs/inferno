let DASH_REGEX = /([^A-Z]+)([A-Z])/g;

export default str => str.replace(DASH_REGEX, '$1-$2').toLowerCase();
