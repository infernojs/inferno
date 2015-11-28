export default {
	set: {}, // setter
	unset: {},
	renderToString: {},
    _custom(node, name, value) {
        node.setAttribute(name, value);
    }
};