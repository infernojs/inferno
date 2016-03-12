import { render } from '../rendering';
import createElement from '../../core/createElement';
import innerHTML from '../../../tools/innerHTML';

describe('Basic event tests', () => {

    let container;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        container.innerHTML = '';
    });

    it('should attach basic click events', (done) => {

        const template = (val) => ({
            tag: 'div',
            attrs: {
                id: 'test'
            },
            events: {
                click: val
            }
        });


        let foo = 'foo';
        function test() {
            foo = 'triggered';
        }

        render(template(test), container);

        document.body.appendChild(container);

        debugger;
        const divs = Array.prototype.slice.call(container.querySelectorAll('div'));
        divs.forEach(div => div.click());

        requestAnimationFrame(() => {
            expect(foo).to.equal('triggered');
            done();
        });
    });
});
