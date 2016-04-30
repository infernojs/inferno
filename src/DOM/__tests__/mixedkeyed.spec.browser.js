import { render } from './../rendering';
import { createBlueprint } from './../../core/createBlueprint';

const Inferno = {
    createBlueprint
};

const spanNonKeyedBluePrint = createBlueprint({
    tag: 'span',
    className: 'TableCell',
    children: {arg: 0}
});

const spanWithKeyBluePrint = createBlueprint({
    tag: 'span',
    className: 'TableCell',
    key: {arg: 0},
    children: {arg: 1}
});

function spanTagWithText(text) {
    return spanNonKeyedBluePrint(text);
}

function spanTagWithKeyAndText(key, text) {
    return spanWithKeyBluePrint(key, text);
}

let template = function(child) {
    return {
        tag: 'div',
        children: child
    };
};

describe('Mixed of Keyed/Non-Keyed nodes', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        container.innerHTML = '';
    });


	// TOOD: Is mixin keyed non keyed supported this way?
    it('should remove two keyed nodes, and move a non-key child node', () => {
		debugger;
        render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c')]), container);
        expect(container.textContent).to.equal('bc');
        expect(container.firstChild.childNodes.length).to.equal(2);
        render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c'), spanTagWithText('c')]), container);
        expect(container.textContent).to.equal('abcc');
        expect(container.firstChild.childNodes.length).to.equal(4);
        render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c')]), container);
        expect(container.textContent).to.equal('bc');
        expect(container.firstChild.childNodes.length).to.equal(2);
        render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c'), spanTagWithText('c')]), container);
        expect(container.textContent).to.equal('abcc');
        expect(container.firstChild.childNodes.length).to.equal(4);
		// TODO: is mixin nulls undefineds inside keyed array supported?
		// render(template([spanTagWithKeyAndText('a', 'a'), null, spanTagWithKeyAndText('b', 'b'), undefined, spanTagWithKeyAndText('e', 'c'), spanTagWithText('c')]), container);
		// expect(container.textContent).to.equal('abcc');
		// expect(container.firstChild.childNodes.length).to.equal(4);
		// render(template([spanTagWithKeyAndText('a', 'a'), null, spanTagWithKeyAndText('b', 'b'), undefined, spanTagWithKeyAndText('e', 'c'), spanTagWithText('c')]), container);
		// expect(container.textContent).to.equal('abcc');
		// expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c')]), container);
	    expect(container.textContent).to.equal('bc');
	    expect(container.firstChild.childNodes.length).to.equal(2);
    });

    it('should swap the last child and add three non-key children', () => {
        render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b')]), container);
        expect(container.textContent).to.equal('ab');
        expect(container.firstChild.childNodes.length).to.equal(2);
        render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c'), spanTagWithKeyAndText('e', 'a'), spanTagWithKeyAndText('f', 'c')]), container);
        expect(container.textContent).to.equal('bcac');
        expect(container.firstChild.childNodes.length).to.equal(4);
		render(template([spanTagWithKeyAndText('a', 1), spanTagWithKeyAndText('b', 'b')]), container);
		expect(container.textContent).to.equal('1b');
		render(template([spanTagWithKeyAndText('a', 1), spanTagWithKeyAndText('b', '')]), container);
		expect(container.textContent).to.equal('1');
		render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b')]), container);
        expect(container.textContent).to.equal('ab');
        expect(container.firstChild.childNodes.length).to.equal(2);
    });

    it('should swap, and a keyed child at the end, and add one non-key child', () => {
        render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithKeyAndText('e', 'a'), spanTagWithKeyAndText('f', 'c'), spanTagWithText('c')]), container);
        expect(container.textContent).to.equal('bacc');
        expect(container.firstChild.childNodes.length).to.equal(4);
		// TODO: is mixin nulls undefineds inside keyed array supported?
		// render(template([spanTagWithKeyAndText('a', 'a'), null, spanTagWithKeyAndText('b', 'b')]), container);
		// expect(container.textContent).to.equal('ab');
		// expect(container.firstChild.childNodes.length).to.equal(2);
        render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithKeyAndText('e', 'a'), spanTagWithKeyAndText('f', 'c'), spanTagWithText('c')]), container);
        expect(container.textContent).to.equal('bacc');
        expect(container.firstChild.childNodes.length).to.equal(4);
		// TODO: is mixin nulls undefineds inside keyed array supported?
	    // render(template([spanTagWithKeyAndText('d', 'b'), undefined, spanTagWithKeyAndText('e', 'a'), spanTagWithKeyAndText('f', 'c'), spanTagWithText('c')]), container);
	    // expect(container.textContent).to.equal('bacc');
	    // expect(container.firstChild.childNodes.length).to.equal(4);
        render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b')]), container);
        expect(container.textContent).to.equal('ab');
        expect(container.firstChild.childNodes.length).to.equal(2);
    });

    it('should insert keyed nodes where the last key is a non-keyed node', () => {
        render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('f', 'b')]), container);
        expect(container.textContent).to.equal('ab');
        expect(container.firstChild.childNodes.length).to.equal(2);
        render(template([spanTagWithKeyAndText('a', 'c'), spanTagWithKeyAndText('e', 'c'), spanTagWithKeyAndText('d', 'b'), spanTagWithKeyAndText('e2', 'b'), spanTagWithText('g')]), container);
        expect(container.textContent).to.equal('ccbbg');
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('f', 'b')]), container);
	    expect(container.textContent).to.equal('ab');
        render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('f', 'b')]), container);
        expect(container.textContent).to.equal('ab');
    });

it('should push a child node forward', () => {
	render(template([spanTagWithText(1), spanTagWithText(2), spanTagWithText(3), spanTagWithText(4)]), container);
expect(container.firstChild.childNodes.length).to.equal(4);
render(template([spanTagWithText(2), spanTagWithText(3), spanTagWithText(1), spanTagWithText(4)]), container);
expect(container.textContent).to.equal('2314');
expect(container.firstChild.childNodes.length).to.equal(4);
render(template([spanTagWithText(1), spanTagWithText(2), spanTagWithText(3), spanTagWithText(4)]), container);
expect(container.firstChild.childNodes.length).to.equal(4);
render(template([spanTagWithText(2), spanTagWithText(3), spanTagWithText(1), spanTagWithText(4)]), container);
expect(container.textContent).to.equal('2314');
expect(container.firstChild.childNodes.length).to.equal(4);
render(template([spanTagWithText(1), spanTagWithText(2), spanTagWithText(3), spanTagWithText(4)]), container);
expect(container.firstChild.childNodes.length).to.equal(4);
render(template([spanTagWithText(2), spanTagWithText(3), spanTagWithText(1), spanTagWithText(4)]), container);
expect(container.textContent).to.equal('2314');
expect(container.firstChild.childNodes.length).to.equal(4);
render(template([spanTagWithText(1), spanTagWithText(2), spanTagWithText(3), spanTagWithText(4)]), container);
expect(container.firstChild.childNodes.length).to.equal(4);
render(template([spanTagWithText(2), spanTagWithText(3), spanTagWithText(1), spanTagWithText(4)]), container);
expect(container.textContent).to.equal('2314');
expect(container.firstChild.childNodes.length).to.equal(4);

});

it('should remove a non-keyed child', () => {
	render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('c')]), container);
expect(container.textContent).to.equal('c');
expect(container.firstChild.childNodes.length).to.equal(1);
render(template([spanTagWithText('c')]), container);
expect(container.textContent).to.equal('c');
expect(container.firstChild.childNodes.length).to.equal(1);
render(template([spanTagWithText('c')]), container);
expect(container.textContent).to.equal('c');
expect(container.firstChild.childNodes.length).to.equal(1);
render(template([spanTagWithText('c')]), container);
expect(container.textContent).to.equal('c');
expect(container.firstChild.childNodes.length).to.equal(1);
render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);

});

it('should swap two non-keyed children', () => {
	render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('b'), spanTagWithText('a')]), container);
expect(container.textContent).to.equal('ba');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('b'), spanTagWithText('a')]), container);
expect(container.textContent).to.equal('ba');
expect(container.firstChild.childNodes.length).to.equal(2);
});

it('should append a non-keyed child', () => {
	render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('c'), spanTagWithText('d'), spanTagWithText('e')]), container);
expect(container.textContent).to.equal('cde');
expect(container.firstChild.childNodes.length).to.equal(3);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('c'), spanTagWithText('d'), spanTagWithText('e')]), container);
expect(container.textContent).to.equal('cde');
render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
expect(container.firstChild.childNodes.length).to.equal(3);expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('c'), spanTagWithText('d'), spanTagWithText('e')]), container);
expect(container.textContent).to.equal('cde');
expect(container.firstChild.childNodes.length).to.equal(3);expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('c'), spanTagWithText('d'), spanTagWithText('e')]), container);
expect(container.textContent).to.equal('cde');
expect(container.firstChild.childNodes.length).to.equal(3);
render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);

});

    it('should remove the first keyed node child, and add two non-key child nodes', () => {
        render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
        expect(container.textContent).to.equal('bc1c2c');
        expect(container.firstChild.childNodes.length).to.equal(4);
        render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
        expect(container.textContent).to.equal('abc');
        expect(container.firstChild.childNodes.length).to.equal(3);
        render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
        expect(container.textContent).to.equal('bc1c2c');
        expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
render(template([spanTagWithText('a'), spanTagWithText('b')]), container);
expect(container.textContent).to.equal('ab');
expect(container.firstChild.childNodes.length).to.equal(2);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', '1'), spanTagWithKeyAndText('b', '2'), spanTagWithKeyAndText('e', 3)]), container);
	    expect(container.textContent).to.equal('123');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('bbc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
	    render(template([spanTagWithKeyAndText('a', 'a'), spanTagWithKeyAndText('b', 'b'), spanTagWithKeyAndText('e', 'c')]), container);
	    expect(container.textContent).to.equal('abc');
	    expect(container.firstChild.childNodes.length).to.equal(3);
	    render(template([spanTagWithKeyAndText('d', 'b'), spanTagWithText('c1'), spanTagWithText('c2'), spanTagWithKeyAndText('f', 'c')]), container);
	    expect(container.textContent).to.equal('bc1c2c');
	    expect(container.firstChild.childNodes.length).to.equal(4);
    });

it('should update single array element with another single array element', () => {
	render(template([spanTagWithText(1)]), container);
expect(container.firstChild.childNodes.length).to.equal(1);
expect(container.textContent).to.equal('1');
render(template([spanTagWithText(2)]), container);
expect(container.textContent).to.equal('2');
expect(container.firstChild.childNodes.length).to.equal(1);
render(template([spanTagWithText(1)]), container);
expect(container.firstChild.childNodes.length).to.equal(1);
expect(container.textContent).to.equal('1');
render(template([spanTagWithText(2)]), container);
expect(container.textContent).to.equal('2');
expect(container.firstChild.childNodes.length).to.equal(1);
render(template([spanTagWithText(1)]), container);
expect(container.firstChild.childNodes.length).to.equal(1);
expect(container.textContent).to.equal('1');
render(template([spanTagWithText(3)]), container);
expect(container.textContent).to.equal('3');
expect(container.firstChild.childNodes.length).to.equal(1);
render(template([spanTagWithText(1)]), container);
expect(container.firstChild.childNodes.length).to.equal(1);

});
});

