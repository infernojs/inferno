function renderer() {
	let output = null;

	return {
		render(item) {
			if (!output) {
				output = item.tree.shallow.create(item);
			}
		},
		getRenderOutput() {
			return output;
		}
	}
}

export default function createRenderer() {
	return renderer();
}