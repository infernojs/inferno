/** @jsx t */

import unitlessCfg from '../../src/template/cfg/unitlessCfg';
import extendUnitlessNumber from '../../src/template/extendUnitlessNumber';

export default function cssOperationTests(describe, expect, Inferno) {
    describe('CSS operations', () => {
		let container;

		beforeEach(() => {
			container = document.createElement('div');
		});

		afterEach(() => {
			Inferno.clearDomElement(container);
			container = null;
		});

		describe('unitlessCfg', () => {
			it('should generate browser prefixes for unitless numbers`', () => {
				expect(unitlessCfg.lineClamp).to.be.true;
				expect(unitlessCfg.WebkitLineClamp).to.be.true;
				expect(unitlessCfg.msFlexGrow).to.be.true;
				expect(unitlessCfg.MozFlexGrow).to.be.true;
				expect(unitlessCfg.msGridRow).to.be.true;
				expect(unitlessCfg.msGridColumn).to.be.true;
			});
		});

		describe('.extendUnitlessNumber()', () => {
			it('should extend unitless numbers', () => {
				extendUnitlessNumber({ 'foo': true, 'bar': true});
				expect(unitlessCfg.foo).to.be.true;
				expect(unitlessCfg.bar).to.be.true;
			});
		});
	});
}
