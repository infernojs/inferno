function isEndish(topLevelType) {
	return topLevelType === 'topMouseUp' ||
		topLevelType === 'topTouchEnd' ||
		topLevelType === 'topTouchCancel';
}

function isMoveish(topLevelType) {
	return topLevelType === 'topMouseMove' ||
		topLevelType === 'topTouchMove';
}
function isStartish(topLevelType) {
	return topLevelType === 'topMouseDown' ||
		topLevelType === 'topTouchStart';
}

module.exports = {
	isEndish: isEndish,
	isMoveish: isMoveish,
	isStartish: isStartish
};
