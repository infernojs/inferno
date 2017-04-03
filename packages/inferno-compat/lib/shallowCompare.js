function shallowDiffers(a, b) {
	for (var i in a) if (!(i in b)) return true
	for (var i in b) if (a[ i ] !== b[ i ]) return true
	return false
}

module.exports = function(instance, nextProps, nextState) {
	return (
		shallowDiffers(instance.props, nextProps) ||
		shallowDiffers(instance.state, nextState)
	)
}
