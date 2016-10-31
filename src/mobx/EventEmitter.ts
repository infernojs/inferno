export default class EventEmitter {

	private listeners: any = [];

	public on(cb: any) {
		this.listeners.push(cb);
		return () => {
			const index = this.listeners.indexOf(cb);
			if (index !== -1) {
				this.listeners.splice(index, 1);
			}
		};
	}

	public emit(data: any) {
		this.listeners.forEach(fn => fn(data));
	};

	public getTotalListeners(): number {
		return this.listeners.length;
	}

	public clearListeners(): void {
		this.listeners = [];
	}
}
