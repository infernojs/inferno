import {  updateKeyed } from '../domMutate';
import createDOMTree from '../createTree';
import { render, renderToString } from '../rendering';
import createTemplate from '../../core/createTemplate';
import { addTreeConstructor } from '../../core/createTemplate';



addTreeConstructor( 'dom', createDOMTree );



function createDataModels() {
	let dataModels = [];

	dataModels.push(addGroupSingleChild(500));
	dataModels.push(addGroupSingleChild(400));
	dataModels.push(addGroupSingleChild(5));
	dataModels.push(addGroupSingleChild(50));
	dataModels.push(addGroupSingleChild(300));
	dataModels.push(addGroupSingleChild(0));


	return dataModels;
}

function addGroupSingleChild(count) {
	let dataModel = [];
	for(let i = 0; i < count; i++) {
		dataModel.push({
			key: i,
			children: null
		});
	}
	return dataModel;
}

function shuffle(dataModel) {
	for (var e, t, n = dataModel.length; 0 !== n; ) {
		e = Math.floor(Math.random() * n--);
		t = dataModel[n];
		dataModel[n] = dataModel[e];
		dataModel[e] = t;
	}
}

function createExpectedChildren(nodes) {
	var children = [];
	var j;
	var c;
	var i;
	var e;
	var n;

	for (i = 0; i < nodes.length; i++) {
		n = nodes[i];
		if (n.children !== null) {
			e = document.createElement('div');
			c = render(n.children);
			for (j = 0; j < c.length; j++) {
				e.appendChild(c[j]);
			}
			children.push(e);
		} else {
			e = document.createElement('span');
			e.textContent = n.key.toString();
			children.push(e);
		}
	}

	return children;
}

function createExpected(nodes) {
	var c = document.createElement('div');
	var e = document.createElement('div');
	var children = createExpectedChildren(nodes);
	for (var i = 0; i < children.length; i++) {
		e.appendChild(children[i]);
	}
	c.appendChild(e);
	return c.innerHTML;
}


let container = document.createElement('div');
let dataModels = null;

beforeEach(() => {
	dataModels = createDataModels();
});

afterEach(() => {
	dataModels = null;
});

const t1 = createTemplate((key, children) => {
	return {
		tag: 'div',
		key: key,
		children: children
	}
});

const t2 = createTemplate((key) => {
	return {
		tag: 'span',
		key: key,
		text: key
	}
});

const t3 = createTemplate((key, children) => {
	return {
		tag: 'div',
		key: key,
		children: children
	}
});

const t4 = createTemplate((key) => {
	return {
		tag: 'span',
		key: key,
		children: key
	}
});

function renderTree(nodes) {
	var children = new Array(nodes.length);
	var i;
	var n;

	for (i = 0; i < nodes.length; i++) {
		n = nodes[i];
		if (n.children !== null) {
			children[i] = t1(n.key, renderTree(n.children));
		} else {
			children[i] = t2(n.key);
		}
	}
	return children;
}

function renderTree1(nodes) {
	var children = new Array(nodes.length);
	var i;
	var n;

	for (i = 0; i < nodes.length; i++) {
		n = nodes[i];
		if (n.children !== null) {
			children[i] = t3(n.key, renderTree1(n.children));
		} else {
			children[i] = t4(n.key);
		}
	}
	return children;
}

function renderr(dataModel) {
	render(t1(null, renderTree(dataModel)), container);
}

function second_render(dataModel) {
	render(t1(null, renderTree1(dataModel)), container);
}

it('should render various combinations', () => {

	let dataModel = dataModels[0];

	renderr(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	dataModel = dataModels[0];

	renderr(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	dataModel = dataModels[3];
	dataModel.reverse();

	renderr(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);

	dataModel = dataModels[0];
	dataModel.reverse();

	second_render(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);

	dataModel = dataModels[0];
	dataModel.reverse();

	renderr(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);

	dataModel = dataModels[1];
	dataModel.reverse();

	renderr(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);


	dataModel = dataModels[3];
	dataModel;

	renderr(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);

	dataModel = dataModels[1];

	second_render(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);


	dataModel = dataModels[1];

	renderr(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);

	dataModel = dataModels[4];

	renderr(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);

	dataModel = dataModels[2];
	dataModel.reverse()

	second_render(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);

	dataModel = dataModels[2];
	dataModel.reverse()

	renderr(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);

	dataModel = dataModels[3];
	dataModel.reverse()

	second_render(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);

	dataModel = dataModels[3];
	dataModel.reverse()

	renderr(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);

	dataModel = dataModels[1];
	shuffle(dataModel);

	second_render(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);

	dataModel = dataModels[1];
	shuffle(dataModel);

	renderr(dataModel);

	expect(container.innerHTML).to.equal(
		createExpected(dataModel)
	);

	render(null, container);
});