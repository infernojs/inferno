const canUseDOM = !!(
	typeof window !== 'undefined' &&
	// Nwjs doesn't add document as a global in their node context, but does have it on window.document,
	// As a workaround, check if document is undefined
	typeof document !== 'undefined' &&
	window.document.createElement
);

export default {
	canUseDOM: canUseDOM,
	canUseWorkers: typeof Worker !== 'undefined',
	canUseEventListeners: canUseDOM && !!(window.addEventListener),
	canUseViewport: canUseDOM && !!window.screen,
	canUseSymbol: typeof Symbol === 'function' && typeof Symbol['for'] === 'function'
};
