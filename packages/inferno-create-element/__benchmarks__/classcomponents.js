import { createVNode, render } from 'inferno';
import Component from 'inferno-component';
import InfernoVNodeFlags from 'inferno-vnode-flags';

suite('class components', function() {
	benchmark('single component', function() {
		class Com extends Component {
			render() {
				return createVNode(InfernoVNodeFlags.Element, 'div', null, '1');
			}
		}

		render(createVNode(InfernoVNodeFlags.ComponentClass, Com), this.testDiv);
	}, {
		setup: function() {
			this.testDiv = document.createElement('div');
		},

		teardown: function() {
			this.testDiv.innerHTML = '';
		}
	});


	benchmark('single component + state change in CWM', function() {
		class Com extends Component {

			componentWillMount() {
				this.setState({
					foo: 'bar',
					daa: 'jaa',
					c: 'g'
				});
			}

			render() {
				return createVNode(InfernoVNodeFlags.Element, 'div', null, '1');
			}
		}

		render(createVNode(InfernoVNodeFlags.ComponentClass, Com), this.testDiv);
	}, {
		setup: function() {
			this.testDiv = document.createElement('div');
		},

		teardown: function() {
			this.testDiv.innerHTML = '';
		}
	});

	benchmark('20 children components with state change in CWM', function() {

		class Com extends Component {

			componentWillMount() {
				this.setState({
					foo: 'bar',
					daa: 'jaa',
					c: 'g'
				});
			}

			render() {
				return createVNode(InfernoVNodeFlags.Element, 'div', this.props.children, '1');
			}
		}

		render(createVNode(InfernoVNodeFlags.ComponentClass, Com, null, [
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com),
			createVNode(InfernoVNodeFlags.ComponentClass, Com)
		]), this.testDiv);
	}, {
		setup: function() {
			this.testDiv = document.createElement('div');
		},

		teardown: function() {
			this.testDiv.innerHTML = '';
		}
	});
});
