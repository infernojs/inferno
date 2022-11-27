import { To, Location, parsePath } from 'history';
import { isString } from 'inferno-shared';

export const normalizeToLocation = (to) => {
  return isString(to) ? parsePath(to) : to;
};

export const splitLocation = (location: Location): { to: To; state: any } => {
  const { key = '', state, ...to } = location;
  return { to, state };
};
