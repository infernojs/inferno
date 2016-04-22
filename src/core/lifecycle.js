let screenWidth = window.screen.width;
let screenHeight = window.screen.height;
let scrollX = window.scrollX;
let scrollY = window.scrollY;

document.onscroll = function(e) {
	scrollX = window.scrollX;
	scrollY = window.scrollY;
};

export default function Lifecycle() {
	this._listeners = [];
	this.scrollX = scrollX;
	this.scrollY = scrollY;
	this.screenHeight = screenHeight;
	this.screenWidth = screenWidth;
}

Lifecycle.prototype = {
	addListener(callback) {
		this._listeners.push(callback);
	},
	trigger() {
		for (let i = 0; i < this._listeners.length; i++) {
			this._listeners[i]();
		}
	}
};
