import { requestAnimationFrame } from '../../util/requestAnimationFrame';

export default function register(registerEventHooks) {
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
}