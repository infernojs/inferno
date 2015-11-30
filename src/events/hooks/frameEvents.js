import { requestAnimationFrame } from '../../util/requestAnimationFrame';
import registerEventHooks from './registerEventHooks';

registerEventHooks([
    'scroll',
    'mousemove',
    'drag',
    'touchmove'
], function(listener) {
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