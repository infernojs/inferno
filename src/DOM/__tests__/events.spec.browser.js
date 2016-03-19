import { render } from '../rendering';
import createElement from '../../core/createElement';
import innerHTML from '../../../tools/innerHTML';

describe('Basic event tests', () => {

    let container;

    beforeEach(() => {
        container = document.createElement('div');
	    document.body.appendChild(container);
    });

    afterEach(() => {
		document.body.removeChild(container);
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

	it('should update events', () => {
		var data = {
			count: 0
		};

		function onClick(d) {
			return function (e) {
				data = { count: d.count + 1 };

				renderIt();
			};
		}
		function App(d) {
			return {
				tag: "button",
				events: {
					click: onClick(d)
				},
				children: ['Count ', d.count],
				dom: null
			};
		}

		function renderIt() {
			render(App(data), container);
		}

		renderIt();
		const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));

		expect(container.firstChild.innerHTML).to.equal('Count 0');
		expect(data.count).to.equal(0);
		buttons.forEach(button => button.click());
		expect(container.firstChild.innerHTML).to.equal('Count 1');
		expect(data.count).to.equal(1);
		buttons.forEach(button => button.click());
		expect(container.firstChild.innerHTML).to.equal('Count 2');
		expect(data.count).to.equal(2);
	});
});


