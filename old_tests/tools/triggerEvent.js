export default function triggerEvent(name, element) {

    var eventType;

    if (name === "click" || name === "dblclick" || name === "mousedown" || name === "mouseup") {
        eventType = "MouseEvents";
    } else if (name === "focus" || name === "change" || name === "blur" || name === "select") {
        eventType = "HTMLEvents";
    } else {
        throw new Error("Unsupported `'" + name + "'`event");

    }

    var event = document.createEvent(eventType);
    event.initEvent(name, name !== "change", true);
    element.dispatchEvent(event, true);
}