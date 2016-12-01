export default class Lifecycle {
	public listeners: Function[] = [];
	public fastUnmount = true;

	addListener(callback) {
		this.listeners.push(callback);
	}
	trigger() {
		for (let listener of this.listeners) {
			listener();
		}
	}
}
