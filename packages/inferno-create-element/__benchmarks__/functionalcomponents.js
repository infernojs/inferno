import { createVNode, render } from 'inferno';
import InfernoVNodeFlags from 'inferno-vnode-flags';

suite('functional components', function() {
	benchmark('single functional component (with div) + render', function() {
		function Com() {
			return createVNode(InfernoVNodeFlags.Element, 'div', null, '1');
		}

		render(createVNode(InfernoVNodeFlags.ComponentFunction, Com), this.testDiv);
	}, {
		setup: function() {
			this.testDiv = document.createElement('div');
		},

		teardown: function() {
			this.testDiv.innerHTML = '';
		}
	});

	benchmark('20 children functional components', function() {

		function Com() {
			return createVNode(InfernoVNodeFlags.Element, 'div', null, '1');
		}

		render(createVNode(InfernoVNodeFlags.ComponentFunction, Com, null, [
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com),
			createVNode(InfernoVNodeFlags.ComponentFunction, Com)
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
