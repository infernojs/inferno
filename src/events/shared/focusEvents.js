let focusEvents = null;

// support: Firefox
if (typeof InstallTrigger !== 'undefined') {
    focusEvents = {
        focus: 'focusin',
        blur: 'focusout'
    }
}

export default focusEvents;