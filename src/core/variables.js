export const ObjectTypes = {
	VARIABLE: 1
};

export function createVariable(index) {
	return {
		index,
		type: ObjectTypes.VARIABLE
	};
}

export function getValueWithIndex(item, index) {
	return (index < 2) ? ((index === 0) ? item.v0 : item.v1) : item.values[index - 2];
}