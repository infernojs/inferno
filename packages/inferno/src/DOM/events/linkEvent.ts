import { isFunction } from 'inferno-shared';

export interface LinkedEvent<T, E extends Event> {
  data: T;
  event: (data: T, event: E) => void;
}

/**
 * Links given data to event as first parameter
 * @param {*} data data to be linked, it will be available in function as first parameter
 * @param {Function} event Function to be called when event occurs
 * @returns {{data: *, event: Function}}
 */
export function linkEvent<T, E extends Event>(data: T, event: (data: T, event: E) => void): LinkedEvent<T, E> | undefined {
  if (isFunction(event)) {
    return { data, event };
  }
  return undefined; // Return undefined when event is invalid, to avoid creating unnecessary event handlers
}
