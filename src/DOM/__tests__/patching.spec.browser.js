import { render } from './../rendering';
import { createUniversalElement } from './../../core/universal';

describe('patching keyed lists (non-jsx)', () => {
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
		for (let i = 0; i < count; i++) {
			dataModel.push({
				key: i,
				children: null
			});
		}
		return dataModel;
	}

	function shuffle(dataModel) {
		for (let e, t, n = dataModel.length; n !== 0;) {
			e = Math.floor(Math.random() * n--);
			t = dataModel[n];
			dataModel[n] = dataModel[e];
			dataModel[e] = t;
		}
	}

	function createExpectedChildren(nodes) {
		const children = [];
		let j, c, i, e, n;

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
		let c = document.createElement('div');
		let e = document.createElement('div');
		let children = createExpectedChildren(nodes);
		for (let i = 0; i < children.length; i++) {
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

	const bp1 = {
		dom: createUniversalElement('div'),
		pool: [],
		tag: 'div',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 4 // multiple children
	};

	const bp2 = {
		dom: createUniversalElement('span'),
		pool: [],
		tag: 'span',
		isComponent: false,
		hasAttrs: false,
		hasHooks: false,
		hasEvents: false,
		hasClassName: false,
		hasStyle: false,
		childrenType: 1 // text child
	};

	function renderTree(nodes) {
		var children = new Array(nodes.length);
		var i;
		var n;

		for (i = 0; i < nodes.length; i++) {
			n = nodes[i];
			if (n.children !== null) {
				children[i] = {
					dom: null,
					bp: bp1,
					key: n.key,
					children: renderTree(n.children)
				};
			} else {
				children[i] = {
					dom: null,
					bp: bp2,
					key: n.key,
					children: n.key
				};
			}
		}
		return children;
	}

	function renderModel(dataModel) {
		render({
			dom: null,
			bp: bp1,
			children: renderTree(dataModel)
		}, container);
	}

	it('should render various combinations', () => {
		let dataModel = dataModels[0];

		renderModel(dataModel);

		expect(container.innerHTML).to.equal(
			createExpected(dataModel)
		);

		dataModel = dataModels[0];

		renderModel(dataModel);

		expect(container.innerHTML).to.equal(
			createExpected(dataModel)
		);

		dataModel = dataModels[3];
		dataModel.reverse();

		renderModel(dataModel);

		expect(container.innerHTML).to.equal(
			createExpected(dataModel)
		);

		render(null, container);

		dataModel = dataModels[0];
		dataModel.reverse();
		render(null, container);

		dataModel = dataModels[0];
		dataModel.reverse();

		renderModel(dataModel);

		expect(container.innerHTML).to.equal(
			createExpected(dataModel)
		);

		render(null, container);

		dataModel = dataModels[1];
		dataModel.reverse();

		renderModel(dataModel);

		expect(container.innerHTML).to.equal(
			createExpected(dataModel)
		);

		render(null, container);

		dataModel = dataModels[3];

		renderModel(dataModel);

		expect(container.innerHTML).to.equal(
			createExpected(dataModel)
		);

		render(null, container);

		dataModel = dataModels[1];

		renderModel(dataModel);

		expect(container.innerHTML).to.equal(
			createExpected(dataModel)
		);

		render(null, container);

		dataModel = dataModels[4];

		renderModel(dataModel);

		expect(container.innerHTML).to.equal(
			createExpected(dataModel)
		);

		render(null, container);

		dataModel = dataModels[2];
		dataModel.reverse();

		renderModel(dataModel);

		expect(container.innerHTML).to.equal(
			createExpected(dataModel)
		);

		render(null, container);

		dataModel = dataModels[3];
		dataModel.reverse();

		renderModel(dataModel);

		expect(container.innerHTML).to.equal(
			createExpected(dataModel)
		);

		render(null, container);

		dataModel = dataModels[1];
		shuffle(dataModel);

		renderModel(dataModel);

		expect(container.innerHTML).to.equal(
			createExpected(dataModel)
		);

		render(null, container);
	});
});
