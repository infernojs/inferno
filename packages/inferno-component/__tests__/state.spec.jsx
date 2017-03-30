import { createVNode, render } from 'inferno';
import Component from '../dist-es';
import VNodeFlags from 'inferno-vnode-flags';

class TestCWRP extends Component {
	constructor(props) {
		super(props);

		this.state = {
			a: 0,
			b: 0
		};
	}

	componentWillReceiveProps() {
		this.setStateSync({ a: 1 });

		if (this.state.a !== 1){
			this.props.done('state is not correct');
			return;
		}

		this.props.done();
	}

	render() {
		return <div>{JSON.stringify(this.state)}</div>;
	}
}

describe('setting state', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		container.innerHTML = '';
		document.body.removeChild(container);
	});

	it('setStateSync should apply state during componentWillReceiveProps', (done) => {
		const node = createVNode(VNodeFlags.ComponentClass, TestCWRP, null, null, { done }, null);
		render(node, container);
		node.props.foo = 1;
		render(node, container);
	});
});
