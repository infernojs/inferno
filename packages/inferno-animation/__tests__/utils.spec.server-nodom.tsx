import {
  transitionEndName
} from '../src/utils';

describe('inferno-animation utils SSR', () => {
  it('transitionEnd is empty string', () => {
    expect(transitionEndName).toEqual('');
  });
});
