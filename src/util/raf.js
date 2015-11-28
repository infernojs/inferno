import ExecutionEnvironment from './ExecutionEnvironment';

let raf = function() {};

if (ExecutionEnvironment.canUseDOM) {
    var lastTime = 0,
        propName = ["r", "webkitR", "mozR", "oR"].reduce((memo, name) => {
            var prop = name + "equestAnimationFrame";

            return memo || window[prop] && prop;
        }, 0);


    export default function raf(callback) {
        if (propName) {
            window[propName](callback);
        } else {
            var currTime = Date.now(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime));

            lastTime = currTime + timeToCall;

            if (timeToCall) {
                setTimeout(callback, timeToCall);
            } else {
                callback(currTime + timeToCall);
            }
        }
    };

}

export default raf;