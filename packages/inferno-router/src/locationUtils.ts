 
import { type Location, parsePath, type To } from 'history';
import { isString } from 'inferno-shared';

export const normalizeToLocation = (to) => {
  return isString(to) ? parsePath(to) : to;
};

export const splitLocation = (location: Location): { to: To; state: any } => {
  const { state, ...to } = location;
  return { to, state };
};
