
import { findDOMNode, options, render } from 'inferno';
import Component from 'inferno-component';

describe('findDOMNodes (JSX)', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		container.innerHTML = '';
		document.body.removeChild(container);
	});

	describe('various tests to see if the DOM node is right for the component', () => {
		options.findDOMNodeEnabled = true;
		let instance1;
		let instance2;
		let instance3;
		let ref;
		const refFunc = (dom) => {
			if (dom) {
				ref = dom;
			}
		};

		class Example1 extends Component {
			render() {
				instance1 = this;
				return <div id="example1"></div>;
			}
		}

		class Example2 extends Component {
			render() {
				instance2 = this;
				return <div id="example2"></div>;
			}
		}

		class Example3 extends Component {
			render() {
				instance3 = this;
				return <div id="example3" ref={ refFunc }><Example2 /><Example1 /></div>;
			}
		}

		it('simple findDOMNodes', () => {
			render(<Example1 />, container);
			expect(findDOMNode(instance1) === document.getElementById('example1')).to.equal(true);
			render(null, container);
			expect(findDOMNode(instance1) === null).to.equal(true);
			render(<Example2 />, container);
			expect(findDOMNode(instance2) === document.getElementById('example2')).to.equal(true);
			render(<Example1 />, container);
			expect(findDOMNode(instance1) === document.getElementById('example1')).to.equal(true);
			render(<Example3 />, container);
			expect(findDOMNode(instance3) === document.getElementById('example3')).to.equal(true);
			expect(findDOMNode(instance2) === document.getElementById('example2')).to.equal(true);
			expect(findDOMNode(instance1) === document.getElementById('example1')).to.equal(true);
			render(null, container);
			expect(findDOMNode(instance1) === null).to.equal(true);
			expect(findDOMNode(instance2) === null).to.equal(true);
			expect(findDOMNode(instance3) === null).to.equal(true);
			expect(findDOMNode(ref) === ref).to.equal(true);
		});
	});
});
