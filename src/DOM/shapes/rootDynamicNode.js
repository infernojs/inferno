import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex } from '../../core/variables';
import recreateRootNode from '../recreateRootNode';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootDynamicNode(valueIndex, domNamespace) {
	const node = {
		pool: [],
		keyedPool: [],
		create(item, parentComponent, treeLifecycle) {
			let domNode;

			if (recyclingEnabled) {
				domNode = recycle(node, item);
				if (domNode) {
					return domNode;
				}
			}
			let value = getValueWithIndex(item, valueIndex);
			const type = getTypeFromValue(value);

			switch (type) {
				case ValueTypes.TEXT:
					// TODO check if string is empty?
					if (value == null) {
						value = '';
					}
					domNode = document.createTextNode(value);
					break;
				case ValueTypes.ARRAY:
					throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
					break;
				case ValueTypes.TREE:
					domNode = value.create(item, parentComponent);
					break;
				default: break;
			}

			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem, parentComponent, treeLifecycle) {
			if (node !== lastItem.domTree) {
				recreateRootNode(lastItem, nextItem, node);
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;

			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (nextValue !== lastValue) {
				const nextType = getTypeFromValue(nextValue);
				const lastType = getTypeFromValue(lastValue);

				if(lastType !== nextType) {
					// TODO replace node and rebuild
					return;
				}

				switch (nextType) {
					case ValueTypes.TEXT:
						// TODO check if string is empty?
						domNode.nodeValue = nextValue;
						break;
					default: break;
				}
			}
		}
	};
	return node;
}