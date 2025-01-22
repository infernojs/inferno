function shallowDiffers(a, b) {
	let i;
	for (i in a) if (!(i in b)) return true;
	for (i in b) if (a[ i ] !== b[ i ]) return true;
	return false
}

export default function (instance, nextProps, nextState) {
	return (
		shallowDiffers(instance.props, nextProps) ||
		shallowDiffers(instance.state, nextState)
	)
}
