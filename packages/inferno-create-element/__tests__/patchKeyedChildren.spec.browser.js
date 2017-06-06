import { render } from 'inferno';
import createElement from 'inferno-create-element';
import { createTextVNode } from 'inferno/core/VNodes';

function generateKeyNodes(array) {
	let i, id, key;
	let children = [];
	let newKey;

	for (i = 0; i < array.length; i++) {
		id = key = array[i];
		if (key !== null && (typeof key !== 'string' || key[0] !== '#')) {
			newKey = key;
		} else {
			newKey = null;
		}

		children.push(
			createElement(
				'div',
				{
					key: newKey,
					id: String(id),
				},
				id,
			),
		);
	}
	return children;
}

describe('keyed-nodes', () => {
	let container;

	let template = function(child) {
		return createElement('div', null, child);
	};

	beforeEach(function() {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function() {
		render(null, container);
		container.innerHTML = '';
		document.body.removeChild(container);
	});

	it('should add all nodes', () => {
		render(template(generateKeyNodes([])), container);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		expect(container.textContent).toBe('#0#1#2#3');
		expect(container.firstChild.childNodes.length).toBe(4);
	});
	it('should remove two keys at the beginning', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		render(template(generateKeyNodes(['c'])), container);
		expect(container.textContent).toBe('c');
		expect(container.firstChild.childNodes.length).toBe(1);
	});
	it('should size up', () => {
		render(template(generateKeyNodes(['#0', '#1'])), container);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		expect(container.textContent).toBe('#0#1#2#3');
		expect(container.firstChild.childNodes.length).toBe(4);
	});
	it('should size down', () => {
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes(['#0', '#1'])), container);
		expect(container.textContent).toBe('#0#1');
		expect(container.firstChild.childNodes.length).toBe(2);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes(['#0', '#1'])), container);
		expect(container.textContent).toBe('#0#1');
		expect(container.firstChild.childNodes.length).toBe(2);
	});

	it('should clear all nodes', () => {
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes([])), container);
		expect(container.textContent).toBe('');
		expect(container.firstChild.childNodes.length).toBe(0);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes([])), container);
	});

	it('should work with mixed nodes', () => {
		render(template(generateKeyNodes(['1', '#0', '#1', '#2'])), container);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		expect(container.textContent).toBe('#0#1#2#3');
		expect(container.firstChild.childNodes.length).toBe(4);
	});
	it('should move a key for start to end', () => {
		render(template(generateKeyNodes(['a', '#0', '#1', '#2'])), container);
		render(template(generateKeyNodes(['#0', '#1', '#2', 'a'])), container);
		expect(container.textContent).toBe('#0#1#2a');
		expect(container.firstChild.childNodes.length).toBe(4);
	});
	it('should move a key', () => {
		render(template(generateKeyNodes(['#0', 'a', '#2', '#3'])), container);
		render(template(generateKeyNodes(['#0', '#1', 'a', '#3'])), container);
		expect(container.textContent).toBe('#0#1a#3');
		expect(container.firstChild.childNodes.length).toBe(4);
	});
	it('should move a key with a size up', () => {
		render(template(generateKeyNodes(['a', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3', 'a', '#5'])), container);
		expect(container.textContent).toBe('#0#1#2#3a#5');
		expect(container.firstChild.childNodes.length).toBe(6);
	});
	it('should move a key with a size down', () => {
		render(template(generateKeyNodes(['a', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
		expect(container.textContent).toBe('#0a#2');
		expect(container.firstChild.childNodes.length).toBe(3);
	});
	it('should avoid unnecessary reordering', () => {
		render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
		render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
		expect(container.textContent).toBe('#0a#2');
		expect(container.firstChild.childNodes.length).toBe(3);
	});
	it('should work with keyed nodes', () => {
		render(template(generateKeyNodes([0, 1, 2, 3, 4])), container);
		render(template(generateKeyNodes([1, 2, 3, 4, 0])), container);
		expect(container.textContent).toBe('12340');
		expect(container.firstChild.childNodes.length).toBe(5);
		render(template(generateKeyNodes([0, 1, 2, 3, 4])), container);
		render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
		expect(container.textContent).toBe('74326abcdef1');
		expect(container.firstChild.childNodes.length).toBe(8);
		render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
		expect(container.textContent).toBe('#0a#2');
		expect(container.firstChild.childNodes.length).toBe(3);
	});

	it('should reorder keys', () => {
		render(template(generateKeyNodes(['1', '2', '3', '4', 'abc', '6', 'def', '7'])), container);
		render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
		expect(container.textContent).toBe('74326abcdef1');
		expect(container.firstChild.childNodes.length).toBe(8);
	});
	it('should remove one key at the start', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		render(template(generateKeyNodes(['b', 'c'])), container);
		expect(container.textContent).toBe('bc');
		expect(container.firstChild.childNodes.length).toBe(2);
	});
	it('should do a complex reverse', () => {
		render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
		render(template(generateKeyNodes(['d', 'c', 'b', 'a'])), container);
		expect(container.textContent).toBe('dcba');
		expect(container.firstChild.childNodes.length).toBe(4);
	});
	it('should remove two keys at the start', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		render(template(generateKeyNodes(['c'])), container);
		expect(container.textContent).toBe('c');
		expect(container.firstChild.childNodes.length).toBe(1);
	});
	it('should add one key to start', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).toBe('abc');
		expect(container.firstChild.childNodes.length).toBe(3);
		render(template(generateKeyNodes(['a', 'b'])), container);
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).toBe('abc');
		expect(container.firstChild.childNodes.length).toBe(3);
	});

	it('should add two key to start', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).toBe('abc');
		expect(container.firstChild.childNodes.length).toBe(3);
		render(template(generateKeyNodes(['c'])), container);
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).toBe('abc');
		expect(container.firstChild.childNodes.length).toBe(3);
	});
	it('should remove one key at the end', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		render(template(generateKeyNodes(['a', 'b'])), container);
		expect(container.textContent).toBe('ab');
		expect(container.firstChild.childNodes.length).toBe(2);
	});
	it('should remove two keys at the end', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		render(template(generateKeyNodes(['a'])), container);
		expect(container.textContent).toBe('a');
		expect(container.firstChild.childNodes.length).toBe(1);
	});
	it('should add one key at the end', () => {
		render(template(generateKeyNodes(['a', 'b'])), container);
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).toBe('abc');
		expect(container.firstChild.childNodes.length).toBe(3);
	});
	it('should add two key at the end', () => {
		render(template(generateKeyNodes(['a'])), container);
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).toBe('abc');
		expect(container.firstChild.childNodes.length).toBe(3);
	});
	it('should add to end, delete from center & reverse', () => {
		render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
		render(template(generateKeyNodes(['e', 'd', 'c', 'a'])), container);
		expect(container.textContent).toBe('edca');
		expect(container.firstChild.childNodes.length).toBe(4);
	});
	it('should add to the beginning and remove', () => {
		render(template(generateKeyNodes(['c', 'd'])), container);
		render(template(generateKeyNodes(['a', 'b', 'c', 'e'])), container);
		expect(container.textContent).toBe('abce');
		expect(container.firstChild.childNodes.length).toBe(4);
	});
	it('should keep a central pivot', () => {
		render(template(generateKeyNodes(['1', '2', '3'])), container);
		render(template(generateKeyNodes(['4', '2', '5'])), container);
		expect(container.textContent).toBe('425');
		expect(container.firstChild.childNodes.length).toBe(3);
	});
	it('should insert to the middle', () => {
		render(template(generateKeyNodes(['c', 'd', 'e'])), container);
		render(template(generateKeyNodes(['a', 'b', 'e'])), container);
		expect(container.textContent).toBe('abe');
		expect(container.firstChild.childNodes.length).toBe(3);
		render(template(generateKeyNodes(['c', 'd', 'e'])), container);
		render(template(generateKeyNodes(['c', 'd', 'e'])), container);
		render(template(generateKeyNodes(['a', 'p', 'e'])), container);
		expect(container.textContent).toBe('ape');
		expect(container.firstChild.childNodes.length).toBe(3);
	});

	it('should shuffle, insert and remove', () => {
		render(template(generateKeyNodes(['a', 'b', 'c', 'd', 'e', 'f', 'g'])), container);
		render(template(generateKeyNodes(['b', 'c', 'a'])), container);
		expect(container.textContent).toBe('bca');
		expect(container.firstChild.childNodes.length).toBe(3);
	});
	it('should remove a element from the middle', () => {
		render(template(generateKeyNodes([1, 2, 3, 4, 5])), container);
		expect(container.firstChild.childNodes.length).toBe(5);
		render(template(generateKeyNodes([1, 2, 4, 5])), container);
		expect(container.textContent).toBe('1245');
		expect(container.firstChild.childNodes.length).toBe(4);
	});
	it('should move a element forward', () => {
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		render(template(generateKeyNodes([2, 3, 1, 4])), container);
		expect(container.textContent).toBe('2314');
		expect(container.firstChild.childNodes.length).toBe(4);
		render(template(generateKeyNodes([3, 2, 1, 4])), container);
		expect(container.textContent).toBe('3214');
		expect(container.firstChild.childNodes.length).toBe(4);
		render(template(generateKeyNodes([3, 2, 4, 1])), container);
		expect(container.textContent).toBe('3241');
		expect(container.firstChild.childNodes.length).toBe(4);
	});

	it('should move a element to the end', () => {
		render(template(generateKeyNodes([1, 2, 3])), container);
		expect(container.firstChild.childNodes.length).toBe(3);
		render(template(generateKeyNodes([2, 3, 1])), container);
		expect(container.textContent).toBe('231');
		expect(container.firstChild.childNodes.length).toBe(3);
	});
	it('should move a element backwards', () => {
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		render(template(generateKeyNodes([1, 4, 2, 3])), container);
		expect(container.textContent).toBe('1423');
		expect(container.firstChild.childNodes.length).toBe(4);
	});
	it('should swap first and last', () => {
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		render(template(generateKeyNodes([4, 2, 3, 1])), container);
		expect(container.textContent).toBe('4231');
		expect(container.firstChild.childNodes.length).toBe(4);
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
	});

	it('should move to left and replace', () => {
		render(template(generateKeyNodes([1, 2, 3, 4, 5])), container);
		expect(container.firstChild.childNodes.length).toBe(5);
		render(template(generateKeyNodes([4, 1, 2, 3, 6])), container);
		expect(container.textContent).toBe('41236');
		expect(container.firstChild.childNodes.length).toBe(5);
		render(template(generateKeyNodes([4, 5, 2, 3, 0])), container);
		expect(container.textContent).toBe('45230');
		render(template(generateKeyNodes([1, 2, 3, 4, 5])), container);
		expect(container.firstChild.childNodes.length).toBe(5);
	});

	it('should move to left and leave a hole', () => {
		render(template(generateKeyNodes([1, 4, 5])), container);
		expect(container.firstChild.childNodes.length).toBe(3);
		render(template(generateKeyNodes([4, 6])), container);
		expect(container.textContent).toBe('46');
		expect(container.firstChild.childNodes.length).toBe(2);
	});
	it('should do something', () => {
		render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);
		expect(container.firstChild.childNodes.length).toBe(6);
		render(template(generateKeyNodes([4, 3, 2, 1, 5, 0])), container);
		expect(container.textContent).toBe('432150');
		expect(container.firstChild.childNodes.length).toBe(6);
	});

	it('should cycle order correctly', () => {
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		expect(container.textContent).toBe('1234');
		render(template(generateKeyNodes([2, 3, 4, 1])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		expect(container.textContent).toBe('2341');
		render(template(generateKeyNodes([3, 4, 1, 2])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		expect(container.textContent).toBe('3412');
		render(template(generateKeyNodes([4, 1, 2, 3])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		expect(container.textContent).toBe('4123');
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		expect(container.textContent).toBe('1234');
	});

	it('should cycle order correctly in the other direction', () => {
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		expect(container.textContent).toBe('1234');
		render(template(generateKeyNodes([4, 1, 2, 3])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		expect(container.textContent).toBe('4123');
		render(template(generateKeyNodes([3, 4, 1, 2])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		expect(container.textContent).toBe('3412');
		render(template(generateKeyNodes([2, 3, 4, 1])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		expect(container.textContent).toBe('2341');
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).toBe(4);
		expect(container.textContent).toBe('1234');
	});

	it('should allow any character as a key', () => {
		render(template(generateKeyNodes(['<WEIRD/&\\key>'])), container);
		render(template(generateKeyNodes(['INSANE/(/&\\key', '<CRAZY/&\\key>', '<WEIRD/&\\key>'])), container);
		expect(container.textContent).toBe('INSANE/(/&\\key<CRAZY/&\\key><WEIRD/&\\key>');
		expect(container.firstChild.childNodes.length).toBe(3);
	});

	it('should reorder nodes', () => {
		render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
		expect(container.textContent).toBe('74326abcdef1');
		expect(container.firstChild.childNodes.length).toBe(8);
		render(template(generateKeyNodes(['1', '2', '3', '4', 'abc', '6', 'def', '7'])), container);
		render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
		expect(container.textContent).toBe('74326abcdef1');
		expect(container.firstChild.childNodes.length).toBe(8);
		render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
		expect(container.textContent).toBe('74326abcdef1');
		expect(container.firstChild.childNodes.length).toBe(8);
	});

	it('should do a advanced shuffle - numbers and letters', () => {
		render(template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])), container);
		expect(container.textContent).toBe('abcd123');
		expect(container.firstChild.childNodes.length).toBe(7);
		render(template(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3])), container);
		expect(container.textContent).toBe('1e2bfgca3');
		expect(container.firstChild.childNodes.length).toBe(9);
		render(template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])), container);
		expect(container.textContent).toBe('abcd123');
		expect(container.firstChild.childNodes.length).toBe(7);
		render(template(generateKeyNodes([0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4])), container);
		expect(container.textContent).toBe('0e2bfgca4');
		expect(container.firstChild.childNodes.length).toBe(9);
		render(template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])), container);
		expect(container.textContent).toBe('abcd123');
		expect(container.firstChild.childNodes.length).toBe(7);
		render(template(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3])), container);
		expect(container.textContent).toBe('1e2bfgca3');
		expect(container.firstChild.childNodes.length).toBe(9);
	});

	it('should do a complex removal at the beginning', () => {
		render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
		expect(container.textContent).toBe('abcd');
		expect(container.firstChild.childNodes.length).toBe(4);
		render(template(generateKeyNodes(['c', 'd'])), container);
		expect(container.textContent).toBe('cd');
		expect(container.firstChild.childNodes.length).toBe(2);
		render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
		expect(container.textContent).toBe('abcd');
		expect(container.firstChild.childNodes.length).toBe(4);
		render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
		expect(container.textContent).toBe('abcd');
		expect(container.firstChild.childNodes.length).toBe(4);
	});

	it('should do move and sync nodes from right to left', () => {
		render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
		expect(container.textContent).toBe('abcd');
		expect(container.firstChild.childNodes.length).toBe(4);
		render(template(generateKeyNodes(['c', 'l', 1, 2, 3, 4, 5, 6, 7, 8, 9, 'd', 'g', 'b'])), container);
		expect(container.textContent).toBe('cl123456789dgb');
		expect(container.firstChild.childNodes.length).toBe(14);
	});

	describe('Should handle massive large arrays', () => {
		let items;

		beforeEach(function() {
			items = new Array(1000);
			for (let i = 0; i < 1000; i++) {
				items[i] = i;
			}
		});

		it('Should handle massive large arrays - initial', () => {
			render(template(generateKeyNodes(items)), container);

			expect(container.textContent).toEqual(items.join(''));
		});

		it('Should handle massive arrays shifting once by 2', () => {
			items = items.concat(items.splice(0, 2));
			render(template(generateKeyNodes(items)), container);

			expect(container.textContent).toEqual(items.join(''));
		});

		for (let i = 0; i < 10; i++) {
			// eslint-disable-next-line
			it('Should handle massive arrays shifting ' + i + ' times by ' + i, () => {
				for (let j = 0; j < i; j++) {
					items = items.concat(items.splice(i, j));
				}
				render(template(generateKeyNodes(items)), container);
				expect(container.textContent).toEqual(items.join(''));
			});
		}
	});

	describe('Calendar like layout', () => {
		function o(text) {
			return createElement(
				'span',
				{
					key: 'o' + text,
				},
				',o' + text,
			);
		}

		function d(text) {
			return createElement(
				'span',
				{
					key: 'd' + text,
				},
				',d' + text,
			);
		}

		function wk(text) {
			return createElement(
				'span',
				{
					key: 'wk' + text,
				},
				',wk' + text,
			);
		}

		it('Should do complex suffle without duplications', () => {
			const layout1 = [
				wk(31),
				d(1),
				d(2),
				d(3),
				d(4),
				d(5),
				d(6),
				d(7),
				wk(32),
				d(8),
				d(9),
				d(10),
				d(11),
				d(12),
				d(13),
				d(14),
				wk(33),
				d(15),
				d(16),
				d(17),
				d(18),
				d(19),
				d(20),
				d(21),
				wk(34),
				d(22),
				d(23),
				d(24),
				d(25),
				d(26),
				d(27),
				d(28),
				wk(35),
				d(29),
				d(30),
				d(31),
				o(1),
				o(2),
				o(3),
				o(4),
				wk(36),
				o(5),
				o(6),
				o(7),
				o(8),
				o(9),
				o(10),
				o(11),
			];
			render(template(layout1), container);

			expect(container.textContent).toBe(
				',wk31,d1,d2,d3,d4,d5,d6,d7,wk32,d8,d9,d10,d11,d12,d13,d14,wk33,d15,d16,d17,d18,d19,d20,d21,wk34,d22,d23,d24,d25,d26,d27,d28,wk35,d29,d30,d31,o1,o2,o3,o4,wk36,o5,o6,o7,o8,o9,o10,o11',
			);

			const layout2 = [
				wk(35),
				o(29),
				o(30),
				o(31),
				d(1),
				d(2),
				d(3),
				d(4),
				wk(36),
				d(5),
				d(6),
				d(7),
				d(8),
				d(9),
				d(10),
				d(11),
				wk(37),
				d(12),
				d(13),
				d(14),
				d(15),
				d(16),
				d(17),
				d(18),
				wk(38),
				d(19),
				d(20),
				d(21),
				d(22),
				d(23),
				d(24),
				d(25),
				wk(39),
				d(26),
				d(27),
				d(28),
				d(29),
				d(30),
				o(1),
				o(2),
				wk(40),
				o(3),
				o(4),
				o(5),
				o(6),
				o(7),
				o(8),
				o(9),
			];
			render(template(layout2), container);

			expect(container.textContent).toBe(
				',wk35,o29,o30,o31,d1,d2,d3,d4,wk36,d5,d6,d7,d8,d9,d10,d11,wk37,d12,d13,d14,d15,d16,d17,d18,wk38,d19,d20,d21,d22,d23,d24,d25,wk39,d26,d27,d28,d29,d30,o1,o2,wk40,o3,o4,o5,o6,o7,o8,o9',
			);
		});
	});

	// VDom tests ported from Kivi - credits: https://github.com/localvoid
	// https://github.com/localvoid/kivi/blob/master/tests/vdom.spec.ts
	describe('children', () => {
		const TESTS = [
			[[0], [0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2], [0, 1, 2], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]],

			[[], [1], [0, 0, 1, 0, 1, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[], [4, 9], [0, 0, 2, 0, 2, 0, 0], [0, 0, 2, 0, 2, 0, 0]],
			[[], [9, 3, 6, 1, 0], [0, 0, 5, 0, 5, 0, 0], [0, 0, 5, 0, 5, 0, 0]],

			[[999], [1], [0, 0, 1, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[999], [1, 999], [0, 0, 1, 0, 1, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[999], [999, 1], [0, 0, 1, 0, 1, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[999], [4, 9, 999], [0, 0, 2, 0, 2, 0, 0], [0, 0, 2, 0, 2, 0, 0]],
			[[999], [999, 4, 9], [0, 0, 2, 0, 2, 0, 0], [0, 0, 2, 0, 2, 0, 0]],
			[[999], [9, 3, 6, 1, 0, 999], [0, 0, 5, 0, 5, 0, 0], [0, 0, 5, 0, 5, 0, 0]],
			[[999], [999, 9, 3, 6, 1, 0], [0, 0, 5, 0, 5, 0, 0], [0, 0, 5, 0, 5, 0, 0]],
			[[999], [0, 999, 1], [0, 0, 2, 0, 2, 0, 0], [0, 0, 2, 0, 2, 0, 0]],
			[[999], [0, 3, 999, 1, 4], [0, 0, 4, 0, 4, 0, 0], [0, 0, 4, 0, 4, 0, 0]],
			[[999], [0, 999, 1, 4, 5], [0, 0, 4, 0, 4, 0, 0], [0, 0, 4, 0, 4, 0, 0]],

			[[998, 999], [1, 998, 999], [0, 0, 1, 0, 1, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[998, 999], [998, 999, 1], [0, 0, 1, 0, 1, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[998, 999], [998, 1, 999], [0, 0, 1, 0, 1, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[998, 999], [1, 2, 998, 999], [0, 0, 2, 0, 2, 0, 0], [0, 0, 2, 0, 2, 0, 0]],
			[[998, 999], [998, 999, 1, 2], [0, 0, 2, 0, 2, 0, 0], [0, 0, 2, 0, 2, 0, 0]],
			[[998, 999], [1, 998, 999, 2], [0, 0, 2, 0, 2, 0, 0], [0, 0, 2, 0, 2, 0, 0]],
			[[998, 999], [1, 998, 2, 999, 3], [0, 0, 3, 0, 3, 0, 0], [0, 0, 3, 0, 3, 0, 0]],
			[[998, 999], [1, 4, 998, 2, 5, 999, 3, 6], [0, 0, 6, 0, 6, 0, 0], [0, 0, 6, 0, 6, 0, 0]],
			[[998, 999], [1, 998, 2, 999], [0, 0, 2, 0, 2, 0, 0], [0, 0, 2, 0, 2, 0, 0]],
			[[998, 999], [998, 1, 999, 2], [0, 0, 2, 0, 2, 0, 0], [0, 0, 2, 0, 2, 0, 0]],
			[[998, 999], [1, 2, 998, 3, 4, 999], [0, 0, 4, 0, 4, 0, 0], [0, 0, 4, 0, 4, 0, 0]],
			[[998, 999], [998, 1, 2, 999, 3, 4], [0, 0, 4, 0, 4, 0, 0], [0, 0, 4, 0, 4, 0, 0]],
			[[998, 999], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 998, 999], [0, 0, 10, 0, 10, 0, 0], [0, 0, 10, 0, 10, 0, 0]],
			[[998, 999], [998, 999, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 0, 10, 0, 10, 0, 0], [0, 0, 10, 0, 10, 0, 0]],
			[[998, 999], [0, 1, 2, 3, 4, 998, 999, 5, 6, 7, 8, 9], [0, 0, 10, 0, 10, 0, 0], [0, 0, 10, 0, 10, 0, 0]],
			[[998, 999], [0, 1, 2, 998, 3, 4, 5, 6, 999, 7, 8, 9], [0, 0, 10, 0, 10, 0, 0], [0, 0, 10, 0, 10, 0, 0]],
			[[998, 999], [0, 1, 2, 3, 4, 998, 5, 6, 7, 8, 9, 999], [0, 0, 10, 0, 10, 0, 0], [0, 0, 10, 0, 10, 0, 0]],
			[[998, 999], [998, 0, 1, 2, 3, 4, 999, 5, 6, 7, 8, 9], [0, 0, 10, 0, 10, 0, 0], [0, 0, 10, 0, 10, 0, 0]],

			[[1], [], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[1, 2], [2], [0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[1, 2], [1], [0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[1, 2, 3], [2, 3], [0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[1, 2, 3], [1, 2], [0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[1, 2, 3], [1, 3], [0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[1, 2, 3, 4, 5], [2, 3, 4, 5], [0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[1, 2, 3, 4, 5], [1, 2, 3, 4], [0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[1, 2, 3, 4, 5], [1, 2, 4, 5], [0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 1]],

			[[1, 2], [], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[1, 2, 3], [3], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[1, 2, 3], [1], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[1, 2, 3, 4], [3, 4], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[1, 2, 3, 4], [1, 2], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[1, 2, 3, 4], [1, 4], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[1, 2, 3, 4, 5, 6], [2, 3, 4, 5], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[1, 2, 3, 4, 5, 6], [2, 3, 5, 6], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[1, 2, 3, 4, 5, 6], [1, 2, 3, 5], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [2, 3, 4, 5, 6, 7, 8, 9], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 6, 7, 8, 9], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 6, 7, 8], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 4, 6, 7, 8, 9], [0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 2]],

			[[0, 1], [1, 0], [0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3], [3, 2, 1, 0], [0, 0, 0, 0, 3, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4], [1, 2, 3, 4, 0], [0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4], [4, 0, 1, 2, 3], [0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4], [1, 0, 2, 3, 4], [0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4], [2, 0, 1, 3, 4], [0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4], [0, 1, 4, 2, 3], [0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4], [0, 1, 3, 4, 2], [0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4], [0, 1, 3, 2, 4], [0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5, 6], [2, 1, 0, 3, 4, 5, 6], [0, 0, 0, 0, 2, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5, 6], [0, 3, 4, 1, 2, 5, 6], [0, 0, 0, 0, 2, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5, 6], [0, 2, 3, 5, 6, 1, 4], [0, 0, 0, 0, 2, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5, 6], [0, 1, 5, 3, 2, 4, 6], [0, 0, 0, 0, 2, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [8, 1, 3, 4, 5, 6, 0, 7, 2, 9], [0, 0, 0, 0, 3, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [9, 5, 0, 7, 1, 2, 3, 4, 6, 8], [0, 0, 0, 0, 3, 0, 0], [0, 0, 0, 0, 0, 0, 0]],

			[[0, 1], [2, 1, 0], [0, 0, 1, 0, 2, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[0, 1], [1, 0, 2], [0, 0, 1, 0, 2, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[0, 1, 2], [3, 0, 2, 1], [0, 0, 1, 0, 2, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[0, 1, 2], [0, 2, 1, 3], [0, 0, 1, 0, 2, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[0, 1, 2], [0, 2, 3, 1], [0, 0, 1, 0, 2, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[0, 1, 2], [1, 2, 3, 0], [0, 0, 1, 0, 2, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[0, 1, 2, 3, 4], [5, 4, 3, 2, 1, 0], [0, 0, 1, 0, 5, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[0, 1, 2, 3, 4], [5, 4, 3, 6, 2, 1, 0], [0, 0, 2, 0, 6, 0, 0], [0, 0, 2, 0, 2, 0, 0]],
			[[0, 1, 2, 3, 4], [5, 4, 3, 6, 2, 1, 0, 7], [0, 0, 3, 0, 7, 0, 0], [0, 0, 3, 0, 3, 0, 0]],

			[[0, 1, 2], [1, 0], [0, 0, 0, 0, 1, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[2, 0, 1], [1, 0], [0, 0, 0, 0, 1, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[7, 0, 1, 8, 2, 3, 4, 5, 9], [7, 5, 4, 8, 3, 2, 1, 0], [0, 0, 0, 0, 5, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[7, 0, 1, 8, 2, 3, 4, 5, 9], [5, 4, 8, 3, 2, 1, 0, 9], [0, 0, 0, 0, 5, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[7, 0, 1, 8, 2, 3, 4, 5, 9], [7, 5, 4, 3, 2, 1, 0, 9], [0, 0, 0, 0, 5, 0, 1], [0, 0, 0, 0, 0, 0, 1]],
			[[7, 0, 1, 8, 2, 3, 4, 5, 9], [5, 4, 3, 2, 1, 0, 9], [0, 0, 0, 0, 5, 0, 2], [0, 0, 0, 0, 0, 0, 2]],
			[[7, 0, 1, 8, 2, 3, 4, 5, 9], [5, 4, 3, 2, 1, 0], [0, 0, 0, 0, 5, 0, 3], [0, 0, 0, 0, 0, 0, 3]],

			[[0], [1], [0, 0, 1, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0], [1, 2], [0, 0, 2, 0, 2, 0, 0], [0, 0, 1, 0, 1, 0, 0]],
			[[0, 2], [1], [0, 0, 1, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 1]],
			[[0, 2], [1, 2], [0, 0, 1, 0, 1, 0, 1], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 2], [2, 1], [0, 0, 1, 0, 2, 0, 1], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2], [3, 4, 5], [0, 0, 3, 0, 3, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2], [2, 4, 5], [0, 0, 2, 0, 3, 0, 2], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11], [0, 0, 6, 0, 6, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5], [6, 1, 7, 3, 4, 8], [0, 0, 3, 0, 3, 0, 3], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5], [6, 7, 3, 8], [0, 0, 3, 0, 3, 0, 5], [0, 0, 0, 0, 0, 0, 2]],

			[[0, 1, 2], [3, 2, 1], [0, 0, 1, 0, 2, 0, 1], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2], [2, 1, 3], [0, 0, 1, 0, 3, 0, 1], [0, 0, 0, 0, 0, 0, 0]],
			[[1, 2, 0], [2, 1, 3], [0, 0, 1, 0, 2, 0, 1], [0, 0, 0, 0, 0, 0, 0]],
			[[1, 2, 0], [3, 2, 1], [0, 0, 1, 0, 3, 0, 1], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5], [6, 1, 3, 2, 4, 7], [0, 0, 2, 0, 3, 0, 2], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5], [6, 1, 7, 3, 2, 4], [0, 0, 2, 0, 3, 0, 2], [0, 0, 0, 0, 0, 0, 0]],
			[[0, 1, 2, 3, 4, 5], [6, 7, 3, 2, 4], [0, 0, 2, 0, 3, 0, 3], [0, 0, 0, 0, 0, 0, 1]],
			[[0, 2, 3, 4, 5], [6, 1, 7, 3, 2, 4], [0, 0, 3, 0, 4, 0, 2], [0, 0, 1, 0, 1, 0, 0]],

			[[{ key: 0, children: [0] }], [{ key: 0, children: [] }], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]],

			[[0, 1, { children: [0], key: 2 }], [{ key: 2, children: [] }], [0, 0, 0, 0, 0, 0, 2], [1, 0, 0, 0, 0, 1, 2]],

			[[{ key: 0, children: [] }], [1, 2, { key: 0, children: [0] }], [0, 0, 3, 0, 3, 0, 0], [1, 0, 3, 0, 3, 1, 0]],

			[
				[0, { key: 1, children: [0, 1] }, 2],
				[3, 2, { key: 1, children: [1, 0] }],
				[0, 0, 1, 0, 3, 0, 1],
				[1, 0, 3, 0, 2, 2, 0],
			],

			[
				[0, { key: 1, children: [0, 1] }, 2],
				[2, { key: 1, children: [1, 0] }, 3],
				[0, 0, 1, 0, 4, 0, 1],
				[0, 0, 0, 0, 0, 0, 0],
			],

			[
				[{ key: 1, children: [0, 1] }, { key: 2, children: [0, 1] }, 0],
				[{ key: 2, children: [1, 0] }, { key: 1, children: [1, 0] }, 3],
				[0, 0, 1, 0, 4, 0, 1],
				[0, 0, 0, 0, 0, 0, 0],
			],

			[
				[{ key: 1, children: [0, 1] }, { key: 2, children: [] }, 0],
				[3, { key: 2, children: [1, 0] }, { key: 1, children: [] }],
				[0, 0, 3, 0, 5, 0, 1],
				[1, 0, 3, 0, 2, 2, 0],
			],

			[
				[0, { key: 1, children: [] }, 2, { key: 3, children: [1, 0] }, 4, 5],
				[6, { key: 1, children: [0, 1] }, { key: 3, children: [] }, 2, 4, 7],
				[0, 0, 4, 0, 5, 0, 2],
				[1, 0, 3, 0, 2, 2, 0],
			],

			[
				[0, { key: 1, children: [] }, { key: 2, children: [] }, { key: 3, children: [] }, { key: 4, children: [] }, 5],
				[
					{ key: 6, children: [{ key: 1, children: [1] }] },
					7,
					{ key: 3, children: [1] },
					{ key: 2, children: [1] },
					{ key: 4, children: [1] },
				],
				[2, 0, 5, 0, 8, 0, 3],
				[2, 0, 5, 0, 5, 2, 1],
			],

			[
				[0, 1, { key: 2, children: [0] }, 3, { key: 4, children: [0] }, 5],
				[6, 7, 3, { key: 2, children: [] }, { key: 4, children: [] }],
				[0, 0, 2, 0, 3, 0, 3],
				[1, 0, 1, 0, 0, 2, 1],
			],
		];

		describe('syncChildren string children', () => {
			it("null => 'abc'", () => {
				const f = document.createDocumentFragment();
				const a = createElement('div', null);
				const b = createElement('div', null, 'abc');
				render(a, f);
				render(b, f);
				expect(f.firstChild.childNodes.length).toBe(1);
				expect(f.firstChild.firstChild.nodeValue).toBe('abc');
			});

			it("'abc' => null", () => {
				const f = document.createDocumentFragment();
				const a = createElement('div', null, 'abc');
				const b = createElement('div', null);
				render(a, f);
				render(b, f);
				expect(f.firstChild.childNodes.length).toBe(0);
			});

			it("'abc' => 'cde'", () => {
				const f = document.createDocumentFragment();
				const a = createElement('div', null, 'abc');
				const b = createElement('div', null, 'cde');
				render(a, f);
				render(b, f);
				expect(f.firstChild.childNodes.length).toBe(1);
				expect(f.firstChild.firstChild.nodeValue).toBe('cde');
			});

			it("[ div ] => 'cde'", () => {
				const f = document.createDocumentFragment();
				const a = createElement('div', null, createElement('div', null));
				const b = createElement('div', null, 'cde');
				render(a, f);
				render(b, f);
				expect(f.firstChild.childNodes.length).toBe(1);
				expect(f.firstChild.firstChild.nodeValue).toBe('cde');
			});

			it("'cde' => [ div ]", () => {
				const f = document.createDocumentFragment();
				const a = createElement('div', null, 'cde');
				const b = createElement('div', null, createElement('div', null));
				render(a, f);
				render(b, f);
				expect(f.firstChild.childNodes.length).toBe(1);
				expect(f.firstChild.firstChild.tagName).toBe('DIV');
			});

			function gen(item, keys) {
				if (typeof item === 'number') {
					return keys ? createTextVNode(item, item) : createTextVNode(item);
				} else if (Array.isArray(item)) {
					let result = [];
					for (let i = 0; i < item.length; i++) {
						result.push(gen(item[i], keys));
					}
					return result;
				} else {
					if (keys) {
						return createElement('div', { key: item.key }, gen(item.children, keys));
					} else {
						return createElement('div', null, gen(item.children, keys));
					}
				}
			}

			function checkInnerHtmlEquals(ax, bx, cx, keys) {
				let a, b, c;

				if (keys) {
					a = createElement('div', { key: ax }, ax);
					b = createElement('div', { key: bx }, bx);
					c = createElement('div', { key: cx }, cx);
				} else {
					a = createElement('div', null, ax);
					b = createElement('div', null, bx);
					c = createElement('div', null, cx);
				}

				const aDiv = document.createElement('div');
				const bDiv = document.createElement('div');
				render(a, aDiv);
				render(b, bDiv);

				render(c, aDiv);

				expect(aDiv.innerHTML).toBe(bDiv.innerHTML);
			}

			describe('Keyed algorithm', () => {
				TESTS.forEach(t => {
					const name = JSON.stringify(t[0]) + ' => ' + JSON.stringify(t[1]);
					const testFn = () => {
						checkInnerHtmlEquals(gen(t[0], true), gen(t[1], true), gen(t[1], true), true);
					};
					it(name, testFn);
				});
			});

			describe('Non keyed algorithm', () => {
				TESTS.forEach(t => {
					const name = JSON.stringify(t[0]) + ' => ' + JSON.stringify(t[1]);
					const testFn = () => {
						checkInnerHtmlEquals(gen(t[0], false), gen(t[1], false), gen(t[1], false), false);
					};
					it(name, testFn);
				});
			});
		});
	});
});
