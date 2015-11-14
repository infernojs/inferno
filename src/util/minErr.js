var Wrapper = function(module, msg) {
	this.message = module
		? (msg || 'This operation is not supported')
			+ (module.length > 4
				? ' -> Module: ' + module
				: ' -> Core')
		: 'The string did not match the expected pattern';
	// use the name on the framework
	this.name = 'Inferno';
};

Wrapper.prototype = Object.create(Error.prototype);

export default function minErr(module, msg) {
	throw new Wrapper(module, msg);
}
