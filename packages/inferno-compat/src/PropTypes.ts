
// Inlined PropTypes, there is propType checking ATM.
// tslint:disable-next-line:no-empty
function proptype() {}
(proptype as any).isRequired = proptype;

const getProptype = () => proptype;

const PropTypes = {
	any: getProptype,
	array: proptype,
	arrayOf: getProptype,
	bool: proptype,
	element: getProptype,
	func: proptype,
	instanceOf: getProptype,
	node: getProptype,
	number: proptype,
	object: proptype,
	objectOf: getProptype,
	oneOf: getProptype,
	oneOfType: getProptype,
	shape: getProptype,
	string: proptype,
	symbol: proptype
};

export default PropTypes;
