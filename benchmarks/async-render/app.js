(function() {
	"use strict";

	// React
	// http://jsfiddle.net/4a3avjqy/

	/* (flags, type, props, children, key, ref, noNormalise) */
	Inferno.options.recyclingEnabled = true; // Advanced optimisation
	var createVNode = Inferno.createVNode;
	var Component = Inferno.Component.default;
	var createElement = Inferno.createElement.default;
	var setStateCounter = 0;


	class List extends Component {
		constructor() {
			super();
			// set initial time:
			this.state = {
				items: []
			};
			this.items = [];
		}

		componentDidMount() {
			while (this.items.length < 20000) {
				this.items[this.items.length] = createVNode(2, 'li', null, `${this.items.length}bar`), null, null, null, true;
				this.setState({ items: this.items }, function () {
					console.log(setStateCounter++);
				});
			}
		}

		render() {
			return createVNode(2, 'ul', null, this.state.items, null, null, null, true);
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		var container = document.querySelector('#App');

		const times = [];
		const count = 100;
		let totalTime = 0;

		for (var i = 0; i < count; i++) {
			var start = window.performance.now();
			console.log("Iteration", i);

			Inferno.render(createElement(List), container);

			var end = window.performance.now();

			// Inferno.render(null, container);

			var roundTime = end - start;
			totalTime += roundTime;

			times.push(roundTime);
		}

		Inferno.render(createElement('div', null, `
			Rounds: ${count},
			Average: ${totalTime / count},
			Total: ${totalTime}
		`), document.querySelector('#results'));
	});
})();
