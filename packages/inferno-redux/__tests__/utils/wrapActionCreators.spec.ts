import { wrapActionCreators } from 'inferno-redux';

describe('inferno-redux wrapActionCreators', () => {
  describe('wrapActionCreators', () => {
    it('should return a function that wraps argument in a call to bindActionCreators', () => {
      const dispatch = (action: unknown) => ({ dispatched: action });
      const actionResult = { an: 'action' };
      const actionCreators = {
        action: () => actionResult,
      };

      const wrapped = wrapActionCreators(actionCreators);
      expect(typeof wrapped).toBe('function');
      // @ts-expect-error the fake dispatch returns a wrapper instead of the action
      expect(() => wrapped(dispatch)).not.toThrow();
      // @ts-expect-error calling without dispatch is invalid and must throw
      expect(() => wrapped().action()).toThrow();

      // @ts-expect-error the fake dispatch returns a wrapper instead of the action
      const bound = wrapped(dispatch);
      expect(bound.action).not.toThrow();
      expect(bound.action().dispatched).toBe(actionResult);
    });
  });
});
