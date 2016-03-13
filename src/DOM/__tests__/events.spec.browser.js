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


        let calledFirstTest = false;
        function test() {
            calledFirstTest = true;
        }
        // different event
        let calledSecondTest = false;
        function test2() {
            calledSecondTest = true;
        }

        render(template(test), container);

        document.body.appendChild(container);

        let divs = Array.prototype.slice.call(container.querySelectorAll('div'));
        divs.forEach(div => div.click());
        expect(calledFirstTest).to.equal(true);

        // reset
        calledFirstTest = false;

        render(template(test2), container);
        divs = Array.prototype.slice.call(container.querySelectorAll('div'));
        divs.forEach(div => div.click());

        expect(calledFirstTest).to.equal(false);
        expect(calledSecondTest).to.equal(true);

        // reset
        calledFirstTest = false;
        calledSecondTest = false;


        render(null, container);
        divs = Array.prototype.slice.call(container.querySelectorAll('div'));
        divs.forEach(div => div.click());

        expect(calledFirstTest).to.equal(false);
        expect(calledSecondTest).to.equal(false);
        done();
    });
});
