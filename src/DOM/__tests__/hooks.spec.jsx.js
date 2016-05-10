import { render } from './../../DOM/rendering';
import Component from './../../component/index';
import innerHTML from './../../../tools/innerHTML';
import { createBlueprint } from './../../core/createBlueprint';

const Inferno = {
	createBlueprint
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

		it('Should trigger UnMount for all children', (done) => {
			let updater = null,
				aCalled = false,
				bCalled = false,
				cCalled = false,
				dCalled = false;

			class A extends Component {
				constructor(props) {
					super(props);

					this.state = {
						foo: true
					};

					this.updateme = this.updateme.bind(this);
					updater = this.updateme;
				}
				componentWillUnmount() {
					aCalled = true; // This should not be called
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
				componentWillUnmount() {
					bCalled = true;
				}

				render() {
					return (
						<div>
							<C />
						</div>
					)
				}
			}

			class C extends Component {
				componentWillUnmount() {
					cCalled = true;
				}
				render() {
					return (
						<div>
							<D />
						</div>
					)
				}
			}

			class D extends Component {
				componentWillUnmount() {
					dCalled = true;
				}
				render() {
					return (
						<div>
							Terve
						</div>
					)
				}
			}



			render(<A />, container);
			expect(container.innerHTML).to.equal('<div><button>btn</button></div>');
			expect(aCalled).to.equal(false);
			expect(bCalled).to.equal(false);
			expect(cCalled).to.equal(false);
			expect(dCalled).to.equal(false);

			updater();
			expect(container.innerHTML).to.equal('<div><div><div><div>Terve</div></div></div><button>btn</button></div>');
			expect(aCalled).to.equal(false);
			expect(bCalled).to.equal(false);
			expect(cCalled).to.equal(false);
			expect(dCalled).to.equal(false);

			updater();
			expect(container.innerHTML).to.equal('<div><button>btn</button></div>');
			expect(aCalled).to.equal(false, 'componentWillUnmount triggered for A');
			expect(bCalled).to.equal(true, 'componentWillUnmount not triggered for B');
			expect(cCalled).to.equal(true, 'componentWillUnmount not triggered for C'); // It should have called componentWillUnmount
			expect(dCalled).to.equal(true, 'componentWillUnmount not triggered for D');

			done();
		});

		it('Should trigger unMount for direct nested children', (done) => {
			let updater = null,
				aCalled = false,
				bCalled = false,
				cCalled = false,
				dCalled = false;

			class A extends Component {
				constructor(props) {
					super(props);

					this.state = {
						foo: true
					};

					this.updateme = this.updateme.bind(this);
					updater = this.updateme;
				}
				componentWillUnmount() {
					aCalled = true; // This should not be called
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
				componentWillUnmount() {
					bCalled = true;
				}

				render() {
					return (<C />)
				}
			}

			class C extends Component {
				componentWillUnmount() {
					cCalled = true;
				}
				render() {
					return (<D />)
				}
			}

			class D extends Component {
				componentWillUnmount() {
					dCalled = true;
				}
				render() {
					return (
						<div>
							Terve
						</div>
					)
				}
			}



			render(<A />, container);
			expect(container.innerHTML).to.equal('<div><button>btn</button></div>');
			expect(aCalled).to.equal(false);
			expect(bCalled).to.equal(false);
			expect(cCalled).to.equal(false);
			expect(dCalled).to.equal(false);

			updater();
			expect(container.innerHTML).to.equal('<div><div>Terve</div><button>btn</button></div>');
			expect(aCalled).to.equal(false);
			expect(bCalled).to.equal(false);
			expect(cCalled).to.equal(false);
			expect(dCalled).to.equal(false);

			updater();
			expect(container.innerHTML).to.equal('<div><button>btn</button></div>');
			expect(aCalled).to.equal(false, 'componentWillUnmount triggered for A');
			expect(bCalled).to.equal(true, 'componentWillUnmount not triggered for B');
			expect(cCalled).to.equal(true, 'componentWillUnmount not triggered for C'); // It should have called componentWillUnmount
			expect(dCalled).to.equal(true, 'componentWillUnmount not triggered for D');

			done();
		});
	});

});
