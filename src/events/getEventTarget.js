// Support: Safari 6-8+
// Target should not be a text node
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}
export default function getEventTarget(nativeEvent) {
    var target = nativeEvent.target || window;
    // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
    // @see http://www.quirksmode.org/js/events_properties.html
    return target.nodeType === 3 ? target.parentNode : target;
}