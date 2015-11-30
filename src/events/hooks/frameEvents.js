import { requestAnimationFrame } from '../../util/requestAnimationFrame';
import registerEventHooks from './registerEventHooks';

const frameEvents = [
    'scroll',
    'mousemove',
    'drag',
    'dragover',
    'touchmove'
];

registerEventHooks(frameEvents, function(listener) {
    let rafId = 0;
    const handler = (...args) => {
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                listener.apply(args[0].currentTarget, args);
                rafId = 0;
            });
        }
    };

    const destroy = () => {
        cancelAnimationFrame(rafId);
    };

    return {
        destroy,
        handler
    };
});