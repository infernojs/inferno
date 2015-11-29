import ExecutionEnvironment from './ExecutionEnvironment';

// Server side workaround
let requestAnimationFrame = function() {
    return function() {};
};
let cancelAnimationFrame = function() {
    return function() {};
};

if (ExecutionEnvironment.canUseDOM) {

    let lastTime = 0;

    const nativeRequestAnimationFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;

    const nativecancelAnimationFrame =
        window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelAnimationFrame;

    requestAnimationFrame =
        nativeRequestAnimationFrame ||
        function(callback) {
            const currTime = Date.now();
            let timeDelay = Math.max(0, 16 - (currTime - lastTime)); // 1000 / 60 = 16.666
            lastTime = currTime + timeDelay;
            return window.setTimeout(function() {
                callback(Date.now());
            }, timeDelay);
        };

    cancelAnimationFrame = cancelAnimationFrame ||
        function(frameId) {
            window.clearTimeout(frameId);
        };
}

export {
    requestAnimationFrame,
    cancelAnimationFrame
};