import Inferno from '../../src';
import events from '../../src/events/shared/events';

export default function domOperationTests(describe, expect) {
    describe('DOM event tests', () => {
        let container;

        beforeEach(() => {
            container = document.createElement('div');
        });
        afterEach(() => {
            Inferno.clearDomElement(container);
        });

         it('should support common events', () => {
             expect(events.onBlur).to.eql('blur');
             expect(events.onClick).to.eql('click');
             expect(events.onMouseOver).to.eql('mouseover');			 
        });
    });
}
