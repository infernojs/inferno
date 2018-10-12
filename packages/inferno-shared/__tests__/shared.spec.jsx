import { flatten } from 'inferno-shared';

describe('Shared functions', () => {
  describe('flatten', () => {
    let xs;
    beforeEach(() => {
      xs = ['h', 'o', ['w', [' '], ['n', 'o', ['w'], ' '], 'b'], 'r', ['o', [['w', ['n'], ' '], 'c', [[[[[['o', [['w']]]]]]]]]]];
    });

    it('should flatten an array to a single level', () => {
      expect(flatten(xs)).toEqual(['h', 'o', 'w', ' ', 'n', 'o', 'w', ' ', 'b', 'r', 'o', 'w', 'n', ' ', 'c', 'o', 'w']);
    });
  });
});