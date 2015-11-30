import Inferno from '../../src';
import Event from '../../src/events';
import triggerEvent from '../tools/triggerEvent';

export default function domOperationTests(describe, expect) {

    describe('Inferno.Event', () => {

        var container = document.createElement('div');

        document.body.appendChild(container)

        beforeEach(() => {
            container.innerHTML = '';
        });
        afterEach(() => {
            Inferno.clearDomElement(container);
        });

        it('should properly add handler and work with the "click" event', () => {
            let called = 0;
            let template = Inferno.createTemplate(createElement =>
                createElement('input', {
                    type: 'checkbox',
                    id: 'id1',
                    onClick: function(e) {
                        expect(e.type).to.eql('click');
                        called = 1;
                        expect(called).to.eql(1);
                    }
                })
            );

            Inferno.render(Inferno.createFragment(null, template), container);

            triggerEvent('click', document.getElementById('id1'));
        });
    });
}