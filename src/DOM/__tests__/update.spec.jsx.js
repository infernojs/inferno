import { render } from './../rendering';
import { createBlueprint } from './../../core/createBlueprint';
import Component from './../../component/index';

const Inferno = {
    createBlueprint
};

describe('Stateful Component updates', () => {

    let container;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        container.innerHTML = '';
    });

    it('Should forget old updates', (done) => {
        let updatesAfromOutside;

        class A extends Component {
            constructor(props) {
                super(props);

                this.state = {
                    stuff: true
                };

                updatesAfromOutside = this.updateMe.bind(this);
            }

            updateMe() {
                this.setState({
                    stuff: false
                })
            }

            render() {
                return <div>A Component A</div>;
            }
        }

        class B extends Component {
            constructor(props) {
                super(props);
            }

            render() {
                return <div>B Component B</div>;
            }
        }

        // Render A
        var spy = sinon.spy(A.prototype, 'componentWillUnmount');
        render(<A />, container);
        expect(container.innerHTML).to.equal('<div>A Component A</div>');
        // Render B
        render(<B />, container);
        expect(container.innerHTML).to.equal('<div>B Component B</div>');
        sinon.assert.calledOnce(spy); // componentUnMount should have been called
	    spy.restore();

        // delayed update triggers for A
        expect(() => updatesAfromOutside()).to.throw();
        expect(container.innerHTML).to.equal('<div>B Component B</div>');

        done();
    });
});
