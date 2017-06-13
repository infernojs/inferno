/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

const hasOwn = Object.prototype.hasOwnProperty;

export const shallowEqual = (a: any, b: any) => {
  if (a === b) {
    return true;
  }

  let countA = 0;
  let countB = 0;

  for (const key in a) {
    if (hasOwn.call(a, key) && a[key] !== b[key]) {
      return false;
    }

    countA++;
  }

  for (const key in b) {
    if (hasOwn.call(b, key)) {
      countB++;
    }
  }

  return countA === countB;
};
