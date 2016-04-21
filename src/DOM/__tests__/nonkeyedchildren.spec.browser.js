import { render } from './../rendering';

function generateNodes(array) {

    let i, id;
    let children = [];

    for (i = 0; i < array.length; i++) {
        id = array[i];

        const template = function () {
            return {
                tag: 'div',
                attrs: {id: String(id)},
                children: id
            };
        };

        children.push(template());
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
        render(template(generateNodes([])), container);
        render(template(generateNodes(['#0', '#1', '#2', '#3'])), container);
        expect(container.textContent).to.equal('#0#1#2#3');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should remove two keys at the beginning', () => {
        render(template(generateNodes(['a', 'b', 'c'])), container);
        render(template(generateNodes(['c'])), container);
        expect(container.textContent).to.equal('c');
        expect(container.firstChild.childNodes.length).to.equal(1);
    });
    it('should size up', () => {
        render(template(generateNodes(['#0', '#1'])), container);
        render(template(generateNodes(['#0', '#1', '#2', '#3'])), container);
        expect(container.textContent).to.equal('#0#1#2#3');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should size down', () => {
        render(template(generateNodes(['#0', '#1', '#2', '#3'])), container);
        render(template(generateNodes(['#0', '#1'])), container);
        expect(container.textContent).to.equal('#0#1');
        expect(container.firstChild.childNodes.length).to.equal(2);
    });
    it('should clear all nodes', () => {
        render(template(generateNodes(['#0', '#1', '#2', '#3'])), container);
        render(template(generateNodes([])), container);
        expect(container.textContent).to.equal('');
        expect(container.firstChild.childNodes.length).to.equal(0);
    });
    it('should work with mixed nodes', () => {
        render(template(generateNodes(['1', '#0', '#1', '#2'])), container);
        render(template(generateNodes(['#0', '#1', '#2', '#3'])), container);
        expect(container.textContent).to.equal('#0#1#2#3');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should move a key for start to end', () => {
        render(template(generateNodes(['a', '#0', '#1', '#2'])), container);
        render(template(generateNodes(['#0', '#1', '#2', 'a'])), container);
        expect(container.textContent).to.equal('#0#1#2a');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should move a key', () => {
        render(template(generateNodes(['#0', 'a', '#2', '#3'])), container);
        render(template(generateNodes(['#0', '#1', 'a', '#3'])), container);
        expect(container.textContent).to.equal('#0#1a#3');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should move a key with a size up', () => {
        render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
        render(template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])), container);
        expect(container.textContent).to.equal('#0#1#2#3a#5');
        expect(container.firstChild.childNodes.length).to.equal(6);
    });
    it('should move a key with a size down', () => {
        render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
        render(template(generateNodes(['#0', 'a', '#2'])), container);
        expect(container.textContent).to.equal('#0a#2');
        expect(container.firstChild.childNodes.length).to.equal(3);
    });
    it('should avoid unnecessary reordering', () => {
        render(template(generateNodes(['#0', 'a', '#2'])), container);
        render(template(generateNodes(['#0', 'a', '#2'])), container);
        expect(container.textContent).to.equal('#0a#2');
        expect(container.firstChild.childNodes.length).to.equal(3);
    });
    it('should work with keyed nodes', () => {
        render(template(generateNodes([0, 1, 2, 3, 4])), container);
        render(template(generateNodes([1, 2, 3, 4, 0])), container);
        expect(container.textContent).to.equal('12340');
        expect(container.firstChild.childNodes.length).to.equal(5);
    });
    it('should reorder keys', () => {
        render(template(generateNodes(['1', '2', '3', '4', 'abc', '6', 'def', '7'])), container);
        render(template(generateNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
        expect(container.textContent).to.equal('74326abcdef1');
        expect(container.firstChild.childNodes.length).to.equal(8);
    });
    it('should remove one key at the start', () => {
        render(template(generateNodes(['a', 'b', 'c'])), container);
        render(template(generateNodes(['b', 'c'])), container);
        expect(container.textContent).to.equal('bc');
        expect(container.firstChild.childNodes.length).to.equal(2);
    });
    it('should do a complex reverse', () => {
        render(template(generateNodes(['a', 'b', 'c', 'd'])), container);
        render(template(generateNodes(['d', 'c', 'b', 'a'])), container);
        expect(container.textContent).to.equal('dcba');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should remove two keys at the start', () => {
        render(template(generateNodes(['a', 'b', 'c'])), container);
        render(template(generateNodes(['c'])), container);
        expect(container.textContent).to.equal('c');
        expect(container.firstChild.childNodes.length).to.equal(1);
    });
    it('should add one key to start', () => {
        render(template(generateNodes(['a', 'b'])), container);
        render(template(generateNodes(['a', 'b', 'c'])), container);
        expect(container.textContent).to.equal('abc');
        expect(container.firstChild.childNodes.length).to.equal(3);
    });
    it('should add two key to start', () => {
        render(template(generateNodes(['c'])), container);
        render(template(generateNodes(['a', 'b', 'c'])), container);
        expect(container.textContent).to.equal('abc');
        expect(container.firstChild.childNodes.length).to.equal(3);
    });
    it('should remove one key at the end', () => {
        render(template(generateNodes(['a', 'b', 'c'])), container);
        render(template(generateNodes(['a', 'b'])), container);
        expect(container.textContent).to.equal('ab');
        expect(container.firstChild.childNodes.length).to.equal(2);
    });
    it('should remove two keys at the end', () => {
        render(template(generateNodes(['a', 'b', 'c'])), container);
        render(template(generateNodes(['a'])), container);
        expect(container.textContent).to.equal('a');
        expect(container.firstChild.childNodes.length).to.equal(1);
    });
    it('should add one key at the end', () => {
        render(template(generateNodes(['a', 'b'])), container);
        render(template(generateNodes(['a', 'b', 'c'])), container);
        expect(container.textContent).to.equal('abc');
        expect(container.firstChild.childNodes.length).to.equal(3);
    });
    it('should add two key at the end', () => {
        render(template(generateNodes(['a'])), container);
        render(template(generateNodes(['a', 'b', 'c'])), container);
        expect(container.textContent).to.equal('abc');
        expect(container.firstChild.childNodes.length).to.equal(3);
    });
    it('should add to end, delete from center & reverse', () => {
        render(template(generateNodes(['a', 'b', 'c', 'd'])), container);
        render(template(generateNodes(['e', 'd', 'c', 'a'])), container);
        expect(container.textContent).to.equal('edca');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should add to the beginning and remove', () => {
        render(template(generateNodes(['c', 'd'])), container);
        render(template(generateNodes(['a', 'b', 'c', 'e'])), container);
        expect(container.textContent).to.equal('abce');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should keep a central pivot', () => {
        render(template(generateNodes(['1', '2', '3'])), container);
        render(template(generateNodes(['4', '2', '5'])), container);
        expect(container.textContent).to.equal('425');
        expect(container.firstChild.childNodes.length).to.equal(3);
    });
    it('should insert to the middle', () => {
        render(template(generateNodes(['c', 'd', 'e'])), container);
        render(template(generateNodes(['a', 'b', 'e'])), container);
        expect(container.textContent).to.equal('abe');
        expect(container.firstChild.childNodes.length).to.equal(3);
    });
    it('should shuffle, insert and remove', () => {
        render(template(generateNodes(['a', 'b', 'c', 'd', 'e', 'f', 'g'])), container);
        render(template(generateNodes(['b', 'c', 'a'])), container);
        expect(container.textContent).to.equal('bca');
        expect(container.firstChild.childNodes.length).to.equal(3);
    });
    it('should remove a element from the middle', () => {
        render(template(generateNodes([1, 2, 3, 4, 5])), container);
        expect(container.firstChild.childNodes.length).to.equal(5);
        render(template(generateNodes([1, 2, 4, 5])), container);
        expect(container.textContent).to.equal('1245');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should move a element forward', () => {
        render(template(generateNodes([1, 2, 3, 4])), container);
        expect(container.firstChild.childNodes.length).to.equal(4);
        render(template(generateNodes([2, 3, 1, 4])), container);
        expect(container.textContent).to.equal('2314');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should move a element to the end', () => {
        render(template(generateNodes([1, 2, 3])), container);
        expect(container.firstChild.childNodes.length).to.equal(3);
        render(template(generateNodes([2, 3, 1])), container);
        expect(container.textContent).to.equal('231');
        expect(container.firstChild.childNodes.length).to.equal(3);
    });
    it('should move a element backwards', () => {
        render(template(generateNodes([1, 2, 3, 4])), container);
        expect(container.firstChild.childNodes.length).to.equal(4);
        render(template(generateNodes([1, 4, 2, 3])), container);
        expect(container.textContent).to.equal('1423');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should swap first and last', () => {
        render(template(generateNodes([1, 2, 3, 4])), container);
        expect(container.firstChild.childNodes.length).to.equal(4);
        render(template(generateNodes([4, 2, 3, 1])), container);
        expect(container.textContent).to.equal('4231');
        expect(container.firstChild.childNodes.length).to.equal(4);
    });
    it('should move to left and replace', () => {
        render(template(generateNodes([1, 2, 3, 4, 5])), container);
        expect(container.firstChild.childNodes.length).to.equal(5);
        render(template(generateNodes([4, 1, 2, 3, 6])), container);
        expect(container.textContent).to.equal('41236');
        expect(container.firstChild.childNodes.length).to.equal(5);
    });
    it('should move to left and leave a hole', () => {
        render(template(generateNodes([1, 4, 5])), container);
        expect(container.firstChild.childNodes.length).to.equal(3);
        render(template(generateNodes([4, 6])), container);
        expect(container.textContent).to.equal('46');
        expect(container.firstChild.childNodes.length).to.equal(2);
    });
    it('should do something', () => {
        render(template(generateNodes([0, 1, 2, 3, 4, 5])), container);
        expect(container.firstChild.childNodes.length).to.equal(6);
        render(template(generateNodes([4, 3, 2, 1, 5, 0])), container);
        expect(container.textContent).to.equal('432150');
        expect(container.firstChild.childNodes.length).to.equal(6);
    });
});
