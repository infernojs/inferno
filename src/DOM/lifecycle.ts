export default class Lifecycle {
	private _listeners: Array<Function>;

	constructor() {
		this._listeners = [];
	}
	addListener(callback) {
		this._listeners.push(callback);
	}
	trigger() {
		for (let i = 0; i < this._listeners.length; i++) {
			this._listeners[i]();
		}
	}
}
