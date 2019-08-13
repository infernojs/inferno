import {isFunction, isNull} from 'inferno-shared';
import {LinkedEvent} from '../../core/types';

/**
 * Links given data to event as first parameter
 * @param {*} data data to be linked, it will be available in function as first parameter
 * @param {Function} event Function to be called when event occurs
 * @returns {{data: *, event: Function}}
 */
export function linkEvent<T, E extends Event>(data: T, event: (data: T, event: E) => void): LinkedEvent<T, E> | null {
  if (isFunction(event)) {
    return { data, event };
  }
  return null; // Return null when event is invalid, to avoid creating unnecessary event handlers
}

// object.event should always be function, otherwise its badly created object.
export function isLinkEventObject(o): o is LinkedEvent<any, any> {
  return !isNull(o) && typeof o === 'object';
}
