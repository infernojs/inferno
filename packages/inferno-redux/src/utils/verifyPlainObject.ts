import { warning } from './warning';

function isPlainObject(value): boolean {
  if (typeof value !== 'object' || value + '' !== '[object Object]') {
    return false;
  }
  if (Object.getPrototypeOf(value) === null) {
    return true;
  }
  let proto = value;

  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(value) === proto;
}

export const verifyPlainObject = (
  value: any,
  displayName: string,
  methodName: string,
): void => {
  if (!isPlainObject(value)) {
    warning(
      `${methodName}() in ${displayName} must return a plain object. Instead received ${value}.`,
    );
  }
};
