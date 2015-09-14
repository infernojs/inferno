export default (arr, item) => {
	const len = arr.length;
	let i = 0;
	while (i < len) {
		if (arr[i++] === item) {
			return true;
		}
	}
	return false;
};
