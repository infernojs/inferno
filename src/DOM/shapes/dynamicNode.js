import { getValueWithIndex, getTypeFromValue, ValueTypes } from '../../core/variables';

export default function createDynamicNode(valueIndex, domNamespace) {
	let domNode;

	const node = {
		create(item, parentComponent) {
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

			return domNode;
		},
		update(lastItem, nextItem, parentComponent) {
			let nextValue = getValueWithIndex(nextItem, valueIndex);
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
						if (nextValue == null) {
							nextValue = '';
						}
						domNode.nodeValue = nextValue;
						break;
					case ValueTypes.ARRAY:
						throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
						break;
					case ValueTypes.TREE:
						//debugger;
						break;
					default: break;
				}
			}
		}
	};
	return node;
}