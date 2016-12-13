import { expect } from 'chai';
import Component from 'inferno-component';
import { innerHTML } from '../../tools/utils';
import Inferno, { render } from 'inferno';
Inferno;

/* These must be in their own files for test to reproduce */
import { ParentFirstCommon } from '../../../testdata/common-render/parentfirstcommon';
import { ParentSecondCommon } from '../../../testdata/common-render/parentsecondcommon';

describe('Components (JSX) #2', () => {
	let container;
	let Inner;
	let attachedListener = null;
	let renderedName = null;

	beforeEach(function () {

		attachedListener = null;
		renderedName = null;

		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);

		Inner = class extends Component {
			render() {
				attachedListener = this.props.onClick;
				renderedName = this.props.name;
				return <div className={this.props.name}/>;
			}
		};
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	describe('tracking DOM state', () => {
		class ComponentA extends Component {
			render() {
				return <div><span>Something</span></div>;
			}
		}

		class ComponentB extends Component {
			render() {
				return <div><span>Something</span></div>;
			}
		}

		function ComA() {
            return <div><span>Something</span></div>;
		}

		function ComB() {
            return <div><span>Something</span></div>;
		}

		it('patching component A to component B, given they have the same children, should replace DOM tree ( for lifecycle ) with identical one', () => {
			render(<ComponentA />, container);
			expect(container.innerHTML).to.equal(innerHTML('<div><span>Something</span></div>'));
			const trackElemDiv = container.firstChild;
			const trackElemSpan = container.firstChild.firstChild;

			render(<ComponentB />, container);
			// These are same but not equal
			expect(container.innerHTML).to.equal(innerHTML('<div><span>Something</span></div>'));
			expect(container.firstChild === trackElemDiv).to.equal(false);
			expect(container.firstChild.firstChild === trackElemSpan).to.equal(false);
		});

        it('patching component A to component B, given they have the same children, should not change the DOM tree when stateless components', () => {
            render(<ComA />, container);
            expect(container.innerHTML).to.equal(innerHTML('<div><span>Something</span></div>'));
            const trackElemDiv = container.firstChild;
            const trackElemSpan = container.firstChild.firstChild;

            render(<ComB />, container);
            expect(container.innerHTML).to.equal(innerHTML('<div><span>Something</span></div>'));
            expect(container.firstChild === trackElemDiv).to.equal(true);
            expect(container.firstChild.firstChild === trackElemSpan).to.equal(true);
        });
	});

	describe('Inheritance with common render', () => {
		class Child extends Component {
			constructor(props) {
				super(props);

				this._update = this._update.bind(this);
			}

			_update() {
				this.setState({
					data: 'bar'
				});
			}

			componentWillMount() {
				this.setState({
					data: 'foo'
				});
			}

			render() {
				return (
					<div onclick={this._update}>
						{this.props.name}
						{this.state.data}
					</div>
				);
			}
		}

		class ParentBase extends Component {
			render() {
				return (
					<div>
						<Child name={this.foo}/>
					</div>
				);
			}
		}

		class ParentFirst extends ParentBase {
			constructor(props) {
				super(props);

				this.foo = 'First';
			}
		}

		class ParentSecond extends ParentBase {
			constructor(props) {
				super(props);

				this.foo = 'Second';
			}
		}

		// For some reason this one breaks but if components are imported separately, it works
		it('Should not reuse children if parent changes #1', () => {
			render(<ParentFirst />, container);
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Firstfoo</div></div>'));
			container.firstChild.firstChild.click();
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Firstbar</div></div>'));
			render(<ParentSecond />, container);
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Secondfoo</div></div>'));
		});
	});

	describe('Inheritance with duplicate render', () => {
		class Child extends Component {
			constructor(props) {
				super(props);

				this._update = this._update.bind(this);
			}

			_update() {
				this.setState({
					data: 'bar'
				});
			}

			componentWillMount() {
				this.setState({
					data: 'foo'
				});
			}

			render() {
				return (
					<div onclick={this._update}>
						{this.props.name}
						{this.state.data}
					</div>
				);
			}
		}

		class ParentFirst extends Component {
			constructor(props) {
				super(props);

				this.foo = 'First';
			}

			render() {
				return (
					<div>
						<Child name={this.foo}/>
					</div>
				);
			}

		}

		class ParentSecond extends Component {
			constructor(props) {
				super(props);

				this.foo = 'Second';
			}

			render() {
				return (
					<div>
						<Child name={this.foo}/>
					</div>
				);
			}
		}

		// For some reason this one breaks but if components are imported separately, it works
		it('Should not reuse children if parent changes #2', () => {
			render(<ParentFirst />, container);
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Firstfoo</div></div>'));
			container.firstChild.firstChild.click();
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Firstbar</div></div>'));
			render(<ParentSecond />, container);
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Secondfoo</div></div>'));
		});
	});

	describe('Inheritance with 1 component per file Common BASE', () => {
		it('Should not reuse children if parent changes #3', () => {
			render(<ParentFirstCommon />, container);
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Firstfoo</div></div>'));
			container.firstChild.firstChild.click();
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Firstbar</div></div>'));
			render(<ParentSecondCommon />, container);
			expect(container.innerHTML).to.equal(innerHTML('<div><div>Secondfoo</div></div>'));
		});
	});

	// Ref: https://github.com/trueadm/inferno/issues/513
	describe('String components (React compat)', () => {
		it('Should render a string div', () => {
			const Div = 'div';
			render(<Div>Hello World</Div>, container);
			expect(container.innerHTML).to.equal(innerHTML('<div>Hello World</div>'));
		});
	});
});
