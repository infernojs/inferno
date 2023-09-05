/**
 * @module Inferno-Compat
 */
/**
 * Inlined PropTypes, there is propType checking ATM.
 */

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function proptype() {}
(proptype as any).isRequired = proptype;

// eslint-disable-next-line @typescript-eslint/ban-types
function getProptype(): Function {
  return proptype;
}

const PropTypes = {
  any: getProptype,
  array: proptype,
  arrayOf: getProptype,
  bool: proptype,
  checkPropTypes: () => null,
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
  symbol: proptype,
};

export default PropTypes;
