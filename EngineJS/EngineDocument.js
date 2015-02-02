
class EngineDocument {

	constructor(funcs) {
		this._funcs = funcs;
		this.data = {};
		this._vDom = {};

		this._render();
	}

	mount(virtualDom) {
		//we run the init and get the properties
		this._funcs.init.call(this, this.data);

		//do a render
		this._vDom = this._funcs.render.call(this, this.data);

		debugger;
		//use the window.document
		if(virtualDom == null) {

		}
	}

	_render() {
		//check the diff

		requestAnimationFrame(this._render.bind(this));
	}
};

module.exports = EngineDocument;