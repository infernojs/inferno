// Testing the length property are actually faster than testing the
// string against '', because the interpreter won't have to create a String
// object from the string literal.
export default x => (x === null || x === undefined) || (x.length === 0);