var Framework = (state, renderer, node) => {
	var render = () => {
		Inferno.render(renderer(state, update), node);
	}

	var update = fn => {
		fn(state);
		render();
	};

	render();
	return update;
};
