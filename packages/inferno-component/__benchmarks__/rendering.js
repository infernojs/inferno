import { createVNode, render } from 'inferno';
import Component from '../';

/* eslint-disable */

suite('render', function () {
	/* Do not compare results between each other, these only measure OPS / sec for different structures */
	class FooCom extends Component {
		render() {
			return createVNode(2, 'div', 1);
		}
	}

	function FunctCom() {
		return createVNode(2, 'div', 1);
	}

	let stateChange = null;

	class StateCom extends Component {
		constructor(props, context) {
			super(props, context);

			this.state = {
				foo: 1
			};

			stateChange = () => {
				this.setStateSync({
					foo: this.state.foo + 1
				});
			};
		}

		render() {
			return createVNode(2, 'div', this.state.foo);
		}
	}


	let asyncState = null;

	function empty() {}

	class AsyncCom extends Component {
		constructor(props, context) {
			super(props, context);

			this.state = {
				foo: 1
			};

			asyncState = () => {
				this.setState({
					foo: this.state.foo + 1
				}, empty);
			};
		}

		render() {
			return createVNode(2, 'div', this.state.foo);
		}
	}


	benchmark('Single DIV', function () {
		render(createVNode(2, 'div', 1), this.container);
	}, {
		setup: function () {
			this.container = document.createElement('div');
			document.body.appendChild(this.container);
		},
		teardown: function () {
			render(null, this.container);
			this.container.innerHTML = '';
			document.body.removeChild(this.container);
		}
	});

	benchmark('Single ES6 Component', function () {
		render(createVNode(4, FooCom), this.container);
	}, {
		setup: function () {
			this.container = document.createElement('div');
			document.body.appendChild(this.container);
		},
		teardown: function () {
			render(null, this.container);
			this.container.innerHTML = '';
			document.body.removeChild(this.container);
		}
	});

	benchmark('Single Function Component', function () {
		render(createVNode(8, FunctCom), this.container);
	}, {
		setup: function () {
			this.container = document.createElement('div');
			document.body.appendChild(this.container);
		},
		teardown: function () {
			render(null, this.container);
			this.container.innerHTML = '';
			document.body.removeChild(this.container);
		}
	});

	benchmark('ES6 render + state change sync ( 10 times )', function () {
		render(createVNode(4, StateCom), this.container);
		stateChange();
		stateChange();
		stateChange();
		stateChange();
		stateChange();
		stateChange();
		stateChange();
		stateChange();
		stateChange();
		stateChange();
	}, {
		setup: function () {
			this.container = document.createElement('div');
			document.body.appendChild(this.container);
		},
		teardown: function () {
			render(null, this.container);
			this.container.innerHTML = '';
			document.body.removeChild(this.container);
		}
	});

	benchmark('ES6 render + state change async ( 10 times )', function () {
		render(createVNode(4, AsyncCom), this.container);
		asyncState();
		asyncState();
		asyncState();
		asyncState();
		asyncState();
		asyncState();
		asyncState();
		asyncState();
		asyncState();
		asyncState();
	}, {
		setup: function () {
			this.container = document.createElement('div');
			document.body.appendChild(this.container);
		},
		teardown: function () {
			render(null, this.container);
			this.container.innerHTML = '';
			document.body.removeChild(this.container);
		}
	});
});
