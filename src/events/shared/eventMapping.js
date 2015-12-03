export const standardNativeEventMapping = {
     onBlur: 'blur',
     onChange: 'change',
     onClick: 'click',
     onCompositionEnd: 'compositionend',
     onCompositionStart: 'compositionstart',
     onCompositionUpdate: 'compositionupdate',
     onContextMenu: 'contextmenu',
     onCopy: 'copy',
     onCut: 'cut',
     onDoubleClick: 'dblclick',
     onDrag: 'drag',
     onDragEnd: 'dragend',
     onDragEnter: 'dragenter',
     onDragExit: 'dragexit',
     onDragLeave: 'dragleave',
     onDragOver: 'dragover',
     onDragStart: 'dragstart',
     onDrop: 'drop',
     onFocus: 'focus',
     onFocusIn: 'focusin',
     onFocusOut: 'focusout',
     onInput: 'input',
     onKeyDown: 'keydown',
     onKeyPress: 'keypress',
     onKeyUp: 'keyup',
     onMouseDown: 'mousedown',
     onMouseMove: 'mousemove',
     onMouseOut: 'mouseout',
     onMouseOver: 'mouseover',
     onMouseUp: 'mouseup',
     onMouseWheel: 'mousewheel',
     onPaste: 'paste',
     onReset: 'reset',
     onSelect: 'select',
     onSelectionChange: 'selectionchange',
     onSelectStart: 'selectstart',
     onShow: 'show',
     onSubmit: 'submit',
     onTextInput: 'textInput',
     onTouchCancel: 'touchcancel',
     onTouchEnd: 'touchend',
     onTouchMove: 'touchmove',
     onTouchStart: 'touchstart',
     onWheel: 'wheel'
};

export const nonBubbleableEventMapping = {
     onAbort: 'abort',
     onBeforeUnload: 'beforeunload',
     onCanPlay: 'canplay',
     onCanPlayThrough: 'canplaythrough',
     onDurationChange: 'durationchange',
     onEmptied: 'emptied',
     onEnded: 'ended',
     onError: 'error',
     onInput: 'input',
     onInvalid: 'invalid',
     onLoad: 'load',
     onLoadedData: 'loadeddata',
     onLoadedMetadata: 'loadedmetadata',
     onLoadStart: 'loadstart',
     onMouseEnter: 'mouseenter',
     onMouseLeave: 'mouseleave',
     onOrientationChange: 'orientationchange',
     onPause: 'pause',
     onPlay: 'play',
     onPlaying: 'playing',
     onProgress: 'progress',
     onRateChange: 'ratechange',
     onResize: 'resize',
     onScroll: 'scroll',
     onSeeked: 'seeked',
     onSeeking: 'seeking',
     onSelect: 'select',
     onStalled: 'stalled',
     onSuspend: 'suspend',
     onTimeUpdate: 'timeupdate',
     onUnload: 'unload',
     onVolumeChange: 'volumechange',
     onWaiting: 'waiting'
};

let propertyToEventType = {};
[standardNativeEventMapping, nonBubbleableEventMapping].forEach(mapping => {
    Object.keys(mapping).reduce((state, property) => {
        console.log(property, mapping[property]);
        state[property] = mapping[property];
        return state;
    }, propertyToEventType);
});

export default propertyToEventType;