import { patchNode } from './patching';

let screenWidth = window.screen.width;
let screenHeight = window.screen.height;
let scrollX = 0;
let scrollY = 0;
let lastScrollTime = 0;

window.onscroll = function (e) {
	scrollX = window.scrollX;
	scrollY = window.scrollY;
	lastScrollTime = performance.now();
};

window.resize = function (e) {
	scrollX = window.scrollX;
	scrollY = window.scrollY;
	screenWidth = window.screen.width;
	screenHeight = window.screen.height;
	lastScrollTime = performance.now();
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

const lazyNodeMap = new Map();
let lazyCheckRunning = false;

export function handleLazyAttached(node, lifecycle, dom) {
	lifecycle.addListener(() => {
		const rect = dom.getBoundingClientRect();

		if (lifecycle.scrollY === null) {
			lifecycle.refresh();
		}
		node.clipData = {
			top: rect.top + lifecycle.scrollY,
			left: rect.left + lifecycle.scrollX,
			bottom: rect.bottom + lifecycle.scrollY,
			right: rect.right + lifecycle.scrollX,
			pending: false
		};
	});
}

function patchLazyNode(value) {
	patchNode(value.lastNode, value.nextNode, value.parentDom, value.lifecycle, null, null, false, true);
	value.clipData.pending = false;
}

function runPatchLazyNodes() {
	lazyCheckRunning = true;
	setTimeout(patchLazyNodes, 100);
}

function patchLazyNodes() {
	lazyNodeMap.forEach(patchLazyNode);
	lazyNodeMap.clear();
	lazyCheckRunning = false;
}

export function setClipNode(clipData, dom, lastNode, nextNode, parentDom, lifecycle) {
	if (performance.now() > lastScrollTime + 2000) {
		const lazyNodeEntry = lazyNodeMap.get(dom);

		if (lazyNodeEntry === undefined) {
			lazyNodeMap.set(dom, { lastNode, nextNode, parentDom, clipData, lifecycle });
		} else {
			lazyNodeEntry.nextNode = nextNode;
		}
		clipData.pending = true;
		if (lazyCheckRunning === false) {
			runPatchLazyNodes();
		}
		return true;
	} else {
		patchLazyNodes();
	}
	return false;
}