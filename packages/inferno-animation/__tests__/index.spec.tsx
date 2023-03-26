import { AnimatedComponent, utils } from 'inferno-animation';

describe('inferno-animation public API', () => {
  it('should expose AnimatedComponent', () => {
    expect(AnimatedComponent).not.toBeUndefined();
  });
  it('should expose utils', () => {
    const { addClassName, removeClassName, registerTransitionListener, forceReflow, clearDimensions, getDimensions, setDimensions, setDisplay } = utils;
    expect(addClassName).not.toBeUndefined();
    expect(removeClassName).not.toBeUndefined();
    expect(registerTransitionListener).not.toBeUndefined();
    expect(forceReflow).not.toBeUndefined();
    expect(clearDimensions).not.toBeUndefined();
    expect(getDimensions).not.toBeUndefined();
    expect(setDimensions).not.toBeUndefined();
    expect(setDisplay).not.toBeUndefined();
  });
});
