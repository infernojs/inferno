export default class Lifecycle {
	public listeners: Function[] = [];
	public fastUnmount = true;

	addListener(callback) {
		this.listeners.push(callback);
	}
	trigger() {
		for (let i = 0; i < this.listeners.length; i++) {
			this.listeners[i]();
		}
	}
}
