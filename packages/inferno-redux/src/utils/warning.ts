import { isFunction } from 'inferno-shared';

export const warning = (message: string): void => {
  if (typeof console !== 'undefined' && isFunction(console.error)) {
    console.error(message);
  }
};
