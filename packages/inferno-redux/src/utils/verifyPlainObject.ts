/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

import isPlainObject from "lodash-es/isPlainObject";
import { warning } from "./warning";

export const verifyPlainObject = (
  value: any,
  displayName: string,
  methodName: string
) => {
  if (!isPlainObject(value)) {
    warning(
      `${methodName}() in ${displayName} must return a plain object. Instead received ${value}.`
    );
  }
};
