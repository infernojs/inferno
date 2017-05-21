import { render } from 'inferno';
import { expect, assert } from 'chai';

/* eslint-disable no-invalid-this */
// Quick and dirty hack to get enzyme like tests running without much modifications
function find(val) {
	const node = this.querySelector(val);

	return {
		text() {
			return node.textContent;
		}
	};
}

export function mounter(input) {
	render(input, this);

	return {
		find: find.bind(this)
	};
}

export const t = {
	equal(a, b, msg) {
		expect(a).to.equal(b, msg);
	},
	throws(a, b) {
		expect(a).to.throw(); // Dont validate msg
	},
	deepEqual(a, b) {
		expect(a).to.deep.equal(b);
	},
	fail(e) {
		assert.fail(e);
	},
	end() {} // Does nothing...
};
/* eslint-enable no-invalid-this */
