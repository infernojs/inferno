import boily from '../../src';

describe('Boily - unit tests both for browser and nodeJS', () => {

    it('should be a object', () => {
        expect(boily).to.be.a.object;
    })
});