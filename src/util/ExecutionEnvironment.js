const canUseDOM = !!( typeof window !== 'undefined' &&
	window.document &&
	window.document.createElement
);

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
export default {

	canUseDOM: canUseDOM,

	canUseWorkers: typeof Worker !== 'undefined',

	canUseEventListeners: canUseDOM && !!( window.addEventListener || window.attachEvent ),

	canUseViewport: canUseDOM && !!window.screen,

	isInWorker: !canUseDOM // For now, this is true - might change in the future.

};
