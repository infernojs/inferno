let screenWidth = window.screen.width;
let screenHeight = window.screen.height;
let scrollX = 0;
let scrollY = 0;

window.onscroll = function(e) {
	scrollX = window.scrollX;
	scrollY = window.scrollY;
};

window.resize = function(e) {
	scrollX = window.scrollX;
	scrollY = window.scrollY;
	screenWidth = window.screen.width;
	screenHeight = window.screen.height;
};

export default function Lifecycle() {
	this._listeners = [];
	this.scrollX = null;
	this.scrollY = null;
	this.screenHeight = screenHeight;
	this.screenWidth = screenWidth;
}

Lifecycle.prototype = {
	refresh() {
		this.scrollX = window.scrollX;
		this.scrollY = window.scrollY;
	},
	addListener(callback) {
		this._listeners.push(callback);
	},
	trigger() {
		for (let i = 0; i < this._listeners.length; i++) {
			this._listeners[i]();
		}
	}
};
