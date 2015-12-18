import isArray from '../../util/isArray';

export default function createStaticNode(templateNode) {
	var domNode;

	const node = {
		create() {
			domNode = templateNode.cloneNode(true);
			return domNode;
		},
		update() {},
    remove(lastItem) {

    }
	};
	return node;
}
