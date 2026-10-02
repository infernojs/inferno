/**
 * @module Inferno-Compat
 */
/**
 * Inlined PropTypes, there is propType checking ATM.
 */

// A validator that does nothing, like its isRequired variant
export interface Validator {
  (): void;
  isRequired: Validator;
}

function proptype(): void {}
const validator = proptype as Validator;
validator.isRequired = validator;

// PropTypes.shape(), arrayOf() etc. take the validator configuration
function getProptype(...config: unknown[]): Validator;
function getProptype(): Validator {
  return validator;
}

const PropTypes = {
  any: getProptype,
  array: validator,
  arrayOf: getProptype,
  bool: validator,
  checkPropTypes: () => null,
  element: getProptype,
  func: validator,
  instanceOf: getProptype,
  node: getProptype,
  number: validator,
  object: validator,
  objectOf: getProptype,
  oneOf: getProptype,
  oneOfType: getProptype,
  shape: getProptype,
  string: validator,
  symbol: validator,
};

export default PropTypes;
