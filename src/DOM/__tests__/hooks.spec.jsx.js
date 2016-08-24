import { render } from './../../DOM/rendering';
import Component from './../../component/es2015';
import { createVTemplateFactory as createVTemplate, createVElement, createVComponent } from './../../core/shapes';
import { createTemplateReducers } from './../../DOM/templates';

const sinon = require('sinon/pkg/sinon');

const Inferno = {
	createVTemplate,
	createVElement,
	createVComponent
};
const InfernoDOM = {
	createTemplateReducers
};

describe('Components (JSX)', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
	});

	afterEach(function () {
		container.innerHTML = '';
	});

	describe('componentWillUnmount', () => {

		it('Should trigger UnMount for all children', () => {
			let updater = null;

			class A extends Component {
				constructor(props) {
					super(props);

					this.state = {
						foo: true
					};

					this.updateme = this.updateme.bind(this);
					updater = this.updateme;
				}

				updateme() {
					this.setState({
						foo: !this.state.foo
					});
				}

				render() {
					return (
						<div>
							{(() => {
								if (this.state.foo) {
									return null;
								}
								return <B />;
							})()}
							<button onClick={this.updateme} >btn</button>
						</div>
					);
				}
			}

			class B extends Component {
				render() {
					return (
						<div>
							<C />
						</div>
					);
				}
			}

			class C extends Component {
				render() {
					return (
						<div>
							<D />
						</div>
					);
				}
			}

			class D extends Component {
				render() {
					return (
						<div>
							Terve
						</div>
					);
				}
			}

			const Aspy = sinon.spy(A.prototype, 'componentWillUnmount');
			const Bspy = sinon.spy(B.prototype, 'componentWillUnmount');
			const CSpy = sinon.spy(C.prototype, 'componentWillUnmount');
			const DSpy = sinon.spy(D.prototype, 'componentWillUnmount');
			const notCalled = sinon.assert.notCalled;

			render(<A />, container);
			expect(container.innerHTML).to.equal('<div><button>btn</button></div>');
			notCalled(Aspy);
			notCalled(Bspy);
			notCalled(CSpy);
			notCalled(DSpy);

			updater();
			expect(container.innerHTML).to.equal('<div><div><div><div>Terve</div></div></div><button>btn</button></div>');
			notCalled(Aspy);
			notCalled(Bspy);
			notCalled(CSpy);
			notCalled(DSpy);

			updater();
			expect(container.innerHTML).to.equal('<div><button>btn</button></div>');
			notCalled(Aspy);
			const calledOnce = sinon.assert.calledOnce;
			calledOnce(Bspy);
			calledOnce(CSpy);
			calledOnce(DSpy);
		});

		it('Should not trigger unmount for new node', () => {
			let updater = null;

			class A extends Component {
				constructor(props) {
					super(props);

					this.state = {
						foo: true
					};

					this.updateme = this.updateme.bind(this);
					updater = this.updateme;
				}

				updateme() {
					this.setState({
						foo: !this.state.foo
					});
				}

				render() {
					return (
						<div>
							{(() => {
								if (this.state.foo) {
									return null
								}
								return <B />
							})()}
							<button onClick={this.updateme} >btn</button>
						</div>
					)
				}
			}

			class B extends Component {
				render() {
					return (<C />)
				}
			}

			class C extends Component {
				render() {
					return (<D />)
				}
			}

			class D extends Component {
				render() {
					return (
						<div>
							Terve
						</div>
					)
				}
			}

			const Aspy = sinon.spy(A.prototype, 'componentWillUnmount');
			const Bspy = sinon.spy(B.prototype, 'componentWillUnmount');
			const CSpy = sinon.spy(C.prototype, 'componentWillUnmount');
			const DSpy = sinon.spy(D.prototype, 'componentWillUnmount');
			const notCalled = sinon.assert.notCalled;

			render(<A />, container);
			expect(container.innerHTML).to.equal('<div><button>btn</button></div>');
			notCalled(Aspy);
			notCalled(Bspy);
			notCalled(CSpy);
			notCalled(DSpy);

			updater();
			expect(container.innerHTML).to.equal('<div><div>Terve</div><button>btn</button></div>');
			notCalled(Aspy);
			notCalled(Bspy);
			notCalled(CSpy);
			notCalled(DSpy);

			updater();
			expect(container.innerHTML).to.equal('<div><button>btn</button></div>');
			notCalled(Aspy);
			const calledOnce = sinon.assert.calledOnce;
			calledOnce(Bspy);
			calledOnce(CSpy);
			calledOnce(DSpy);
		});

		it('Should trigger unMount once for direct nested children', () => {
			class B extends Component {
				render() {
					return <div>B</div>;
				}
			}

			class C extends Component {
				render() {
					return <div>C</div>;
				}
			}

			class D extends Component {
				render() {
					return <div>D</div>;
				}
			}


			const Bspy = sinon.spy(B.prototype, 'componentWillUnmount');
			const CSpy = sinon.spy(C.prototype, 'componentWillUnmount');
			const DSpy = sinon.spy(D.prototype, 'componentWillUnmount');
			const notCalled = sinon.assert.notCalled;
			const calledOnce = sinon.assert.calledOnce;

			render(<B />, container);
			expect(container.innerHTML).to.equal('<div>B</div>');
			notCalled(Bspy);
			notCalled(CSpy);
			notCalled(DSpy);

			render(<C />, container);
			expect(container.innerHTML).to.equal('<div>C</div>');
			calledOnce(Bspy);
			notCalled(CSpy);
			notCalled(DSpy);

			render(<D />, container);
			expect(container.innerHTML).to.equal('<div>D</div>');
			calledOnce(Bspy);
			calledOnce(CSpy);
			notCalled(DSpy);

			render(<B />, container);
			expect(container.innerHTML).to.equal('<div>B</div>');
			calledOnce(Bspy);
			calledOnce(CSpy);
			calledOnce(DSpy);
		});


		it('Should trigger unmount once for children', () => {
			let updater = null;

			class B extends Component {
				render() {
					return (
						<div>
							<B1 />
							<B2 />
						</div>
					)
				}
			}

			class B1 extends Component {
				render() {
					return <p>B1</p>;
				}
			}

			class B2 extends Component {
				render() {
					return <p>B2</p>;
				}
			}

			class C extends Component {
				constructor(props) {
					super(props);

					this.state = {
						text: 'C0'
					};

					this.updateMe = this.updateMe.bind(this);
					updater = this.updateMe;
				}

				updateMe() {
					this.setState({
						text: 'C1'
					})
				}

				render() {
					return (
						<div class="c">
							<C1 />
							<C2 />
						</div>
					);
				}
			}

			class C1 extends Component {
				render() {
					return <p>C1</p>;
				}
			}

			class C2 extends Component {
				render() {
					return <p>C2</p>;
				}
			}


			const Bspy = sinon.spy(B.prototype, 'componentWillUnmount');
			const B1spy = sinon.spy(B1.prototype, 'componentWillUnmount');
			const B2spy = sinon.spy(B2.prototype, 'componentWillUnmount');
			const CSpy = sinon.spy(C.prototype, 'componentWillUnmount');
			const notCalled = sinon.assert.notCalled;
			const calledOnce = sinon.assert.calledOnce;

			render(<B />, container);
			expect(container.innerHTML).to.equal('<div><p>B1</p><p>B2</p></div>');
			notCalled(Bspy);
			notCalled(B1spy);
			notCalled(B2spy);
			notCalled(CSpy);

			Bspy.reset();
			B1spy.reset();
			B2spy.reset();
			CSpy.reset();

			render(<C />, container);
			expect(container.innerHTML).to.equal('<div class="c"><p>C1</p><p>C2</p></div>');
			calledOnce(Bspy);
			calledOnce(B1spy);
			calledOnce(B2spy);
		});

	});

});
