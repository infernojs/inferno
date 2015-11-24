import checkBitmask from '../template/checkBitmask';

const SHOULD_NOT_BUBBLE = 1,
	NATIVE_EVENT = 2;
	
const events = {
  abort: null,
  blur: SHOULD_NOT_BUBBLE,
  canPlay: null,
  canPlayThrough: null,
  change: null,
  click: NATIVE_EVENT,
  compositiEnd: null,
  compositionStart: null,
  compositionUpdate: null,
  contextMenu: NATIVE_EVENT,
  copy: NATIVE_EVENT,
  cut: NATIVE_EVENT,
  doubleClick: NATIVE_EVENT,
  drag: NATIVE_EVENT,
  dragEnd: NATIVE_EVENT,
  dragEnter: NATIVE_EVENT,
  dragExit: NATIVE_EVENT,
  dragLeave: NATIVE_EVENT,
  dragOver: NATIVE_EVENT,
  dragStart: NATIVE_EVENT,
  drop: NATIVE_EVENT,
  durationChange: null,
  emptied: null,
  encrypted: null,
  ended: null,
  error: NATIVE_EVENT,
  focus: NATIVE_EVENT,
  input: NATIVE_EVENT,
  keyDown: NATIVE_EVENT,
  keyPress: NATIVE_EVENT,
  keyUp: NATIVE_EVENT,
  load: SHOULD_NOT_BUBBLE,
  loadedData: null,
  loadedMetadata: null,
  loadStart: null,
  mouseDown: NATIVE_EVENT,
  mouseMove: NATIVE_EVENT,
  mouseOut: NATIVE_EVENT,
  mouseOver: NATIVE_EVENT,
  mouseUp: NATIVE_EVENT,
  paste: NATIVE_EVENT,
  pause: null,
  play: null,
  playing: null,
  progress: null,
  rateChange: NATIVE_EVENT,
  scroll: SHOULD_NOT_BUBBLE,
  seeked: null,
  seeking: null,
  selectionChange: null,
  stalled: null,
  submit: NATIVE_EVENT,
  suspend: null,
  textInput: null,
  timeUpdate: null,
  touchCancel: null,
  touchEnd: null,
  touchMove: null,
  touchStart: null,
  volumeChange: null,
  waiting: null,
  wheel: NATIVE_EVENT
};

const focusEvents = {
    focus: 'focusin',
    blur: 'focusout'
};

const EventContainer = {};

for (let eventName in events) {

    let propConfig = events[eventName];

    let propertyInfo = {
        eventName: eventName,
        shouldNotBubble: checkBitmask(propConfig, SHOULD_NOT_BUBBLE)
    };

    if (focusEvents[eventName]) {
        propertyInfo.focusEvent = focusEvents[eventName];
    }
		
    EventContainer['on' + eventName[0].toUpperCase() + eventName.substring(1)] = propertyInfo;
}

export default EventContainer;