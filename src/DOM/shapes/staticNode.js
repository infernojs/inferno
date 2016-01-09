
export default function createStaticNode(templateNode) {
	const node = {
		overrideItem: null,
		create() {
			return templateNode.cloneNode(true);
		},
		update() {},
		remove() {},
		hydrate() {}
	};

	return node;
}
