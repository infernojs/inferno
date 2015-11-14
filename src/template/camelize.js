let NONWORD_FIRST_REGEX = /\W+(\w)/g;
let NONWORD_FIRST_CAPITALIZE = ($$, $1) => $1.toUpperCase();

export default str => str.toLowerCase().replace(NONWORD_FIRST_REGEX, NONWORD_FIRST_CAPITALIZE);
