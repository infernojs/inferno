import ExecutionEnvironment from './ExecutionEnvironment';

// Server side workaround
let requestAnimationFrame = function() { return function() {}; };

if (ExecutionEnvironment.canUseDOM) {

    let lastTime = 0;

    const nativeRequestAnimationFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;

    requestAnimationFrame =
        nativeRequestAnimationFrame ||
        function(callback) {
            const currTime = Date.now();
            let timeDelay = Math.max(0, 16 - (currTime - lastTime));
            lastTime = currTime + timeDelay;
            return window.setTimeout(function() {
                callback(Date.now());
            }, timeDelay);
        };
}

export default requestAnimationFrame;