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
    const handler = e => {
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                listener(e);
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