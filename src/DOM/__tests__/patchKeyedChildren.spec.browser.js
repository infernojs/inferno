import { render } from './../rendering';

function generateKeyNodes(array) {

	let i, id, key;
	let children = [];
	let newKey;

	for (i = 0; i < array.length; i++) {
		id = key = array[i];
		if (key !== null && (typeof key !== 'string' || key[0] !== '#')) {
			newKey = key;
		}

		const template = function (k) {
			return {
				tag: 'div',
				key: k,
				attrs: {id: String(id)},
				children: id
			};
		};

		children.push(template(newKey));
	}
	return children;
}

describe('keyed-nodes', () => {
	let container;

	let template = function(child) {
		return {
			tag: 'div',
			children: child
		};
	};

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	it('should add all nodes', () => {
		render(template(generateKeyNodes([])), container);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		expect(container.textContent).to.equal('#0#1#2#3');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});
	it('should remove two keys at the beginning', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		render(template(generateKeyNodes(['c'])), container);
		expect(container.textContent).to.equal('c');
		expect(container.firstChild.childNodes.length).to.equal(1);
	});
	it('should size up', () => {
		render(template(generateKeyNodes(['#0', '#1'])), container);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		expect(container.textContent).to.equal('#0#1#2#3');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});
	it('should size down', () => {
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes(['#0', '#1'])), container);
		expect(container.textContent).to.equal('#0#1');
		expect(container.firstChild.childNodes.length).to.equal(2);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes(['#0', '#1'])), container);
		expect(container.textContent).to.equal('#0#1');
		expect(container.firstChild.childNodes.length).to.equal(2);
	});

	it('should clear all nodes', () => {
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes([])), container);
		expect(container.textContent).to.equal('');
		expect(container.firstChild.childNodes.length).to.equal(0);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes([])), container);
	});

	it('should work with mixed nodes', () => {
		render(template(generateKeyNodes(['1', '#0', '#1', '#2'])), container);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3'])), container);
		expect(container.textContent).to.equal('#0#1#2#3');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});
	it('should move a key for start to end', () => {
		render(template(generateKeyNodes(['a', '#0', '#1', '#2'])), container);
		render(template(generateKeyNodes(['#0', '#1', '#2', 'a'])), container);
		expect(container.textContent).to.equal('#0#1#2a');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});
	it('should move a key', () => {
		render(template(generateKeyNodes(['#0', 'a', '#2', '#3'])), container);
		render(template(generateKeyNodes(['#0', '#1', 'a', '#3'])), container);
		expect(container.textContent).to.equal('#0#1a#3');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});
	it('should move a key with a size up', () => {
		render(template(generateKeyNodes(['a', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes(['#0', '#1', '#2', '#3', 'a', '#5'])), container);
		expect(container.textContent).to.equal('#0#1#2#3a#5');
		expect(container.firstChild.childNodes.length).to.equal(6);
	});
	it('should move a key with a size down', () => {
		render(template(generateKeyNodes(['a', '#1', '#2', '#3'])), container);
		render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
		expect(container.textContent).to.equal('#0a#2');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});
	it('should avoid unnecessary reordering', () => {
		render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
		render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
		expect(container.textContent).to.equal('#0a#2');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});
	it('should work with keyed nodes', () => {
		render(template(generateKeyNodes([0, 1, 2, 3, 4])), container);
		render(template(generateKeyNodes([1, 2, 3, 4, 0])), container);
		expect(container.textContent).to.equal('12340');
		expect(container.firstChild.childNodes.length).to.equal(5);
		render(template(generateKeyNodes([0, 1, 2, 3, 4])), container);
		render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
		expect(container.textContent).to.equal('74326abcdef1');
		expect(container.firstChild.childNodes.length).to.equal(8);
		render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
		expect(container.textContent).to.equal('#0a#2');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});

	it('should reorder keys', () => {
		render(template(generateKeyNodes(['1', '2', '3', '4', 'abc', '6', 'def', '7'])), container);
		render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
		expect(container.textContent).to.equal('74326abcdef1');
		expect(container.firstChild.childNodes.length).to.equal(8);
	});
	it('should remove one key at the start', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		render(template(generateKeyNodes(['b', 'c'])), container);
		expect(container.textContent).to.equal('bc');
		expect(container.firstChild.childNodes.length).to.equal(2);
	});
	it('should do a complex reverse', () => {
		render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
		render(template(generateKeyNodes(['d', 'c', 'b', 'a'])), container);
		expect(container.textContent).to.equal('dcba');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});
	it('should remove two keys at the start', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		render(template(generateKeyNodes(['c'])), container);
		expect(container.textContent).to.equal('c');
		expect(container.firstChild.childNodes.length).to.equal(1);
	});
	it('should add one key to start', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).to.equal('abc');
		expect(container.firstChild.childNodes.length).to.equal(3);
		render(template(generateKeyNodes(['a', 'b'])), container);
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).to.equal('abc');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});

	it('should add two key to start', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).to.equal('abc');
		expect(container.firstChild.childNodes.length).to.equal(3);
		render(template(generateKeyNodes(['c'])), container);
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).to.equal('abc');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});
	it('should remove one key at the end', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		render(template(generateKeyNodes(['a', 'b'])), container);
		expect(container.textContent).to.equal('ab');
		expect(container.firstChild.childNodes.length).to.equal(2);
	});
	it('should remove two keys at the end', () => {
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		render(template(generateKeyNodes(['a'])), container);
		expect(container.textContent).to.equal('a');
		expect(container.firstChild.childNodes.length).to.equal(1);
	});
	it('should add one key at the end', () => {
		render(template(generateKeyNodes(['a', 'b'])), container);
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).to.equal('abc');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});
	it('should add two key at the end', () => {
		render(template(generateKeyNodes(['a'])), container);
		render(template(generateKeyNodes(['a', 'b', 'c'])), container);
		expect(container.textContent).to.equal('abc');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});
	it('should add to end, delete from center & reverse', () => {
		render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
		render(template(generateKeyNodes(['e', 'd', 'c', 'a'])), container);
		expect(container.textContent).to.equal('edca');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});
	it('should add to the beginning and remove', () => {
		render(template(generateKeyNodes(['c', 'd'])), container);
		render(template(generateKeyNodes(['a', 'b', 'c', 'e'])), container);
		expect(container.textContent).to.equal('abce');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});
	it('should keep a central pivot', () => {
		render(template(generateKeyNodes(['1', '2', '3'])), container);
		render(template(generateKeyNodes(['4', '2', '5'])), container);
		expect(container.textContent).to.equal('425');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});
	it('should insert to the middle', () => {
		render(template(generateKeyNodes(['c', 'd', 'e'])), container);
		render(template(generateKeyNodes(['a', 'b', 'e'])), container);
		expect(container.textContent).to.equal('abe');
		expect(container.firstChild.childNodes.length).to.equal(3);
		render(template(generateKeyNodes(['c', 'd', 'e'])), container);
		render(template(generateKeyNodes(['c', 'd', 'e'])), container);
		render(template(generateKeyNodes(['a', 'p', 'e'])), container);
		expect(container.textContent).to.equal('ape');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});

	it('should shuffle, insert and remove', () => {
		render(template(generateKeyNodes(['a', 'b', 'c', 'd', 'e', 'f', 'g'])), container);
		render(template(generateKeyNodes(['b', 'c', 'a'])), container);
		expect(container.textContent).to.equal('bca');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});
	it('should remove a element from the middle', () => {
		render(template(generateKeyNodes([1, 2, 3, 4, 5])), container);
		expect(container.firstChild.childNodes.length).to.equal(5);
		render(template(generateKeyNodes([1, 2, 4, 5])), container);
		expect(container.textContent).to.equal('1245');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});
	it('should move a element forward', () => {
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		render(template(generateKeyNodes([2, 3, 1, 4])), container);
		expect(container.textContent).to.equal('2314');
		expect(container.firstChild.childNodes.length).to.equal(4);
		render(template(generateKeyNodes([3, 2, 1, 4])), container);
		expect(container.textContent).to.equal('3214');
		expect(container.firstChild.childNodes.length).to.equal(4);
		render(template(generateKeyNodes([3, 2, 4, 1])), container);
		expect(container.textContent).to.equal('3241');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});

	it('should move a element to the end', () => {
		render(template(generateKeyNodes([1, 2, 3])), container);
		expect(container.firstChild.childNodes.length).to.equal(3);
		render(template(generateKeyNodes([2, 3, 1])), container);
		expect(container.textContent).to.equal('231');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});
	it('should move a element backwards', () => {
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		render(template(generateKeyNodes([1, 4, 2, 3])), container);
		expect(container.textContent).to.equal('1423');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});
	it('should swap first and last', () => {
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		render(template(generateKeyNodes([4, 2, 3, 1])), container);
		expect(container.textContent).to.equal('4231');
		expect(container.firstChild.childNodes.length).to.equal(4);
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
	});

	it('should move to left and replace', () => {
		render(template(generateKeyNodes([1, 2, 3, 4, 5])), container);
		expect(container.firstChild.childNodes.length).to.equal(5);
		render(template(generateKeyNodes([4, 1, 2, 3, 6])), container);
		expect(container.textContent).to.equal('41236');
		expect(container.firstChild.childNodes.length).to.equal(5);
		render(template(generateKeyNodes([4, 5, 2, 3, 0])), container);
		expect(container.textContent).to.equal('45230');
		render(template(generateKeyNodes([1, 2, 3, 4, 5])), container);
		expect(container.firstChild.childNodes.length).to.equal(5);
	});

	it('should move to left and leave a hole', () => {
		render(template(generateKeyNodes([1, 4, 5])), container);
		expect(container.firstChild.childNodes.length).to.equal(3);
		render(template(generateKeyNodes([4, 6])), container);
		expect(container.textContent).to.equal('46');
		expect(container.firstChild.childNodes.length).to.equal(2);
	});
	it('should do something', () => {
		render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);
		expect(container.firstChild.childNodes.length).to.equal(6);
		render(template(generateKeyNodes([4, 3, 2, 1, 5, 0])), container);
		expect(container.textContent).to.equal('432150');
		expect(container.firstChild.childNodes.length).to.equal(6);
	});

	it('should cycle order correctly', () => {
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		expect(container.textContent).to.equal('1234');
		render(template(generateKeyNodes([2, 3, 4, 1])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		expect(container.textContent).to.equal('2341');
		render(template(generateKeyNodes([3, 4, 1, 2])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		expect(container.textContent).to.equal('3412');
		render(template(generateKeyNodes([4, 1, 2, 3])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		expect(container.textContent).to.equal('4123');
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		expect(container.textContent).to.equal('1234');
	});

	it('should cycle order correctly in the other direction', () => {
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		expect(container.textContent).to.equal('1234');
		render(template(generateKeyNodes([4, 1, 2, 3])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		expect(container.textContent).to.equal('4123');
		render(template(generateKeyNodes([3, 4, 1, 2])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		expect(container.textContent).to.equal('3412');
		render(template(generateKeyNodes([2, 3, 4, 1])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		expect(container.textContent).to.equal('2341');
		render(template(generateKeyNodes([1, 2, 3, 4])), container);
		expect(container.firstChild.childNodes.length).to.equal(4);
		expect(container.textContent).to.equal('1234');
	});

	it('should allow any character as a key', () => {
		render(template(generateKeyNodes(['<WEIRD/&\\key>'])), container);
		render(template(generateKeyNodes(['INSANE/(/&\\key', '<CRAZY/&\\key>', '<WEIRD/&\\key>'])), container);
		expect(container.textContent).to.equal('INSANE/(/&\\key<CRAZY/&\\key><WEIRD/&\\key>');
		expect(container.firstChild.childNodes.length).to.equal(3);
	});

	it('should reorder nodes', () => {
		render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
		expect(container.textContent).to.equal('74326abcdef1');
		expect(container.firstChild.childNodes.length).to.equal(8);
		render(template(generateKeyNodes(['1', '2', '3', '4', 'abc', '6', 'def', '7'])), container);
		render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
		expect(container.textContent).to.equal('74326abcdef1');
		expect(container.firstChild.childNodes.length).to.equal(8);
		render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
		expect(container.textContent).to.equal('74326abcdef1');
		expect(container.firstChild.childNodes.length).to.equal(8);
	});

	it('should do a advanced shuffle - numbers and letters', () => {
		render(template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])), container);
		expect(container.textContent).to.equal('abcd123');
		expect(container.firstChild.childNodes.length).to.equal(7);
		render(template(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3])), container);
		expect(container.textContent).to.equal('1e2bfgca3');
		expect(container.firstChild.childNodes.length).to.equal(9);
		render(template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])), container);
		expect(container.textContent).to.equal('abcd123');
		expect(container.firstChild.childNodes.length).to.equal(7);
		render(template(generateKeyNodes([0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4])), container);
		expect(container.textContent).to.equal('0e2bfgca4');
		expect(container.firstChild.childNodes.length).to.equal(9);
		render(template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])), container);
		expect(container.textContent).to.equal('abcd123');
		expect(container.firstChild.childNodes.length).to.equal(7);
		render(template(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3])), container);
		expect(container.textContent).to.equal('1e2bfgca3');
		expect(container.firstChild.childNodes.length).to.equal(9);

	});

	it('should do a complex removal at the beginning', () => {
		render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
		expect(container.textContent).to.equal('abcd');
		expect(container.firstChild.childNodes.length).to.equal(4);
		render(template(generateKeyNodes(['c', 'd'])), container);
		expect(container.textContent).to.equal('cd');
		expect(container.firstChild.childNodes.length).to.equal(2);
		render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
		expect(container.textContent).to.equal('abcd');
		expect(container.firstChild.childNodes.length).to.equal(4);
		render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
		expect(container.textContent).to.equal('abcd');
		expect(container.firstChild.childNodes.length).to.equal(4);
	});
});
