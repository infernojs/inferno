/**
 * @module Inferno-Compat
 */
/**
 * Inlined PropTypes, there is propType checking ATM.
 */

function proptype() {}
(proptype as any).isRequired = proptype;

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
