import { patchVNode } from './patching';
import { isBrowser } from '../core/utils';

let screenWidth = isBrowser && window.screen.width;
let screenHeight = isBrowser && window.screen.height;
let scrollX = 0;
let scrollY = 0;
let lastScrollTime = 0;

if (isBrowser) {
	window.onscroll = function () {
		scrollX = window.scrollX;
		scrollY = window.scrollY;
		lastScrollTime = performance.now();
	};

	window.resize = function () {
		scrollX = window.scrollX;
		scrollY = window.scrollY;
		screenWidth = window.screen.width;
		screenHeight = window.screen.height;
		lastScrollTime = performance.now();
	};
}

export default function Lifecycle() {
	this._listeners = [];
	this.scrollX = null;
	this.scrollY = null;
	this.screenHeight = screenHeight;
	this.screenWidth = screenWidth;
}

Lifecycle.prototype = {
	refresh() {
		this.scrollX = isBrowser && window.scrollX;
		this.scrollY = isBrowser && window.scrollY;
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
	patchVNode(value.lastNode, value.nextNode, value.parentDom, value.lifecycle, value.context, value.instance, isSVG, true);
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

export function setClipNode(clipData, dom, lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG) {
	if (performance.now() > lastScrollTime + 2000) {
		const lazyNodeEntry = lazyNodeMap.get(dom);

		if (lazyNodeEntry === undefined) {
			lazyNodeMap.set(dom, { lastNode, nextNode, parentDom, clipData, lifecycle, context, instance, isSVG });
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
