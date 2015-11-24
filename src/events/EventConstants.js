const nativeEvents = [
        'mouseover', 'mousemove', 'mouseout', 'mousedown', 'mouseup',
        'click', 'dblclick', 'keydown', 'keypress', 'keyup',
        'change', 'input', 'submit', 'focus', 'blur',
        'dragstart', 'drag', 'dragenter', 'dragover', 'dragleave', 'dragend', 'drop',
        'contextmenu', 'wheel', 'copy', 'cut', 'paste'
    ];
	
const nonBubbleableEvents = [
        'scroll', 'load', 'error'
    ];

export default {
	nativeEvents,	
	nonBubbleableEvents
	};
