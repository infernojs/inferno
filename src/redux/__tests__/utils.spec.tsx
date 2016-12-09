import { warning, shallowEqual } from '../utils';
import { expect } from 'chai';
import sinon from 'sinon';

describe('Redux Utils', () => {
  describe('warning', () => {
    it('should log message using console.error', () => {
      const spy = sinon.spy(console, 'error');
      warning('warning!');
      expect(spy.calledOnce).to.equal(true);
      expect(spy.calledWith('warning!')).to.equal(true);
    })
  })
  describe('shallowEqual', () => {
    it('should return true if two objects are strictly equal', () => {
      const obj = { key: 'value' };
      expect(shallowEqual(obj, obj)).to.equal(true);
    })
    it('should return false if two objects have different key lengths', () => {
      const obj1 = { key: 'value' };
      const obj2 = { key: 'value', key2: 'value2' };
      expect(shallowEqual(obj1, obj2)).to.equal(false);
    })
    it('should return false if two objects have different key values', () => {
      const obj1 = { key: 'value', key2: 'value3' };
      const obj2 = { key: 'value', key2: 'value2' };
      expect(shallowEqual(obj1, obj2)).to.equal(false);
    })
    it('should return true if two objects have same keys and values', () => {
      const obj1 = { key: 'value', key2: 'value2' }
      const obj2 = { key: 'value', key2: 'value2' }
      expect(shallowEqual(obj1, obj2)).to.equal(true);
    })
  })
})