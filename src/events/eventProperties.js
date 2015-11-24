import checkBitmask from '../template/checkBitmask';

let USE_PREFIX = 0x2,
    SHOULD_NOT_BUBBLE = 0x3;
	
const events = {
  abort: USE_PREFIX,
  blur: USE_PREFIX | SHOULD_NOT_BUBBLE,
  canPlay: USE_PREFIX,
  canPlayThrough: USE_PREFIX,
  change: USE_PREFIX,
  click: USE_PREFIX,
  compositiEnd: USE_PREFIX,
  compositionStart: USE_PREFIX,
  compositionUpdate: USE_PREFIX,
  contextMenu: USE_PREFIX,
  copy: USE_PREFIX,
  cut: USE_PREFIX,
  doubleClick: USE_PREFIX,
  drag: USE_PREFIX,
  dragEnd: USE_PREFIX,
  dragEnter: USE_PREFIX,
  dragExit: USE_PREFIX,
  dragLeave: USE_PREFIX,
  dragOver: USE_PREFIX,
  dragStart: USE_PREFIX,
  drop: USE_PREFIX,
  durationChange: USE_PREFIX,
  emptied: USE_PREFIX,
  encrypted: USE_PREFIX,
  ended: USE_PREFIX,
  error: USE_PREFIX | SHOULD_NOT_BUBBLE,
  focus: USE_PREFIX | SHOULD_NOT_BUBBLE,
  input: USE_PREFIX,
  keyDown: USE_PREFIX,
  keyPress: USE_PREFIX,
  keyUp: USE_PREFIX,
  load: SHOULD_NOT_BUBBLE,
  loadedData: USE_PREFIX,
  loadedMetadata: USE_PREFIX,
  loadStart: USE_PREFIX,
  mouseDown: USE_PREFIX,
  mouseMove: USE_PREFIX,
  mouseOut: USE_PREFIX,
  mouseOver: USE_PREFIX,
  mouseUp: USE_PREFIX,
  paste: USE_PREFIX,
  pause: USE_PREFIX,
  play: USE_PREFIX,
  playing: USE_PREFIX,
  progress: USE_PREFIX,
  rateChange: USE_PREFIX,
  scroll: USE_PREFIX | SHOULD_NOT_BUBBLE,
  seeked: USE_PREFIX,
  seeking: USE_PREFIX,
  selectionChange: USE_PREFIX,
  stalled: USE_PREFIX,
  suspend: USE_PREFIX,
  textInput: USE_PREFIX,
  timeUpdate: USE_PREFIX,
  touchCancel: USE_PREFIX,
  touchEnd: USE_PREFIX,
  touchMove: USE_PREFIX,
  touchStart: USE_PREFIX,
  volumeChange: USE_PREFIX,
  waiting: USE_PREFIX,
  wheel: USE_PREFIX
};

const focusEvents = {
    focus: 'focusin',
    blur: 'focusout'
};

let EventContainer = {};

for (let eventName in events) {

    let propConfig = events[eventName],
	shouldUsePrefix = checkBitmask(propConfig, USE_PREFIX);

    let propertyInfo = {
        eventName: eventName,
        shouldNottBubble: checkBitmask(propConfig, SHOULD_NOT_BUBBLE),
        shouldUsePrefix: shouldUsePrefix
    };

    if (focusEvents[eventName]) {
        propertyInfo.focusEvent = focusEvents[eventName];
    }
	if ( shouldUsePrefix) {
	  propertyInfo.prefixedEvents = 'on' + eventName.charAt(0).toUpperCase() + eventName.substring(1);
	}

    EventContainer[eventName] = propertyInfo;
}

export default EventContainer;