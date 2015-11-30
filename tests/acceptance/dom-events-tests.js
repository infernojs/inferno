import Inferno from '../../src';
import Event from '../../src/events';

export default function domOperationTests(describe, expect) {

    describe('Inferno.Event', () => {

        var container = document.createElement('div');

        beforeEach(() => {
            container.innerHTML = "<div id=\"foo\" class=\"mount-point\"></div>";
        });
        afterEach(() => {
            Inferno.clearDomElement(container);
        });
    });
}