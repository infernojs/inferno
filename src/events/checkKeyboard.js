// Workaround for https://bugs.webkit.org/show_bug.cgi?id=16735
export default (ev, type) => {
    if (ev.ctrlKey != (type || false) ||
        ev.altKey != (type || false) ||
        ev.shiftKey != (type || false) ||
        ev.metaKey != (type || false) ||
        ev.keyCode != (type || 0) ||
        ev.charCode != (type || 0)) {

        ev = document.createEvent('Event');
        ev.initEvent(type, true, true);
        ev.ctrlKey  = type || false;
        ev.altKey   = type || false;
        ev.shiftKey = type || false;
        ev.metaKey  = type || false;
        ev.keyCode  = type || 0;
        ev.charCode = type || 0;
    }

    return ev;
};