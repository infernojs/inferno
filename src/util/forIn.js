export default (obj, callback) => {
	if (obj) {
		// v8 optimizing. To have a fast "for In", the "key" must be a pure local variable
		for (let key in obj) {
			callback(key, obj[key]);
		}
	}
	return obj;
};
