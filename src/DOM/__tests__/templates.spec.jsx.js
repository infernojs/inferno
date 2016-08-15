import { render } from './../rendering';
import Component from './../../component/es2015';
import { createVTemplate, createVElement, createVComponent } from './../../core/shapes';
import { createTemplateReducers } from './../../DOM/templates';
import innerHTML from "../../../tools/innerHTML";

const Inferno = {
	createVTemplate,
	createVElement,
	createVComponent
};
const InfernoDOM = {
	createTemplateReducers
};

describe('Templates', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	describe('Should have parentDOM defined #1', () => {
		class A extends Component {
			render() {
				return <div>A</div>
			}
		}

		class B extends Component {
			render() {
				return <span>B</span>
			}
		}

		class Counter extends Component {
			constructor(props) {
				super(props);
				this.state = {
					bool: false
				};
				this.btnCount = this.btnCount.bind(this);
			}
			btnCount(){
				this.setState({
					bool: !this.state.bool
				});
			}
			render(){
				return (
					<div class="my-component">
						<h1>{ this.props.car } { this.state.bool ? <A /> : <B /> }</h1>
						<button type="button" onClick={ this.btnCount }>btn</button>
					</div>
				);
			}
		}

		class Wrapper extends Component {
			constructor(props) {
				super(props);
			}
			render() {
				return (
					<div>
						{ [ 'Saab', 'Volvo', 'BMW' ].map(function (c) {
							return (<Counter car={ c } />);
						}) }
					</div>
				);
			}
		}

		it('Initial render (creation)', () => {
			render(<Wrapper/>, container);

			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><div class="my-component"><h1>Saab <span>B</span></h1><button type="button">btn</button></div><div class="my-component"><h1>Volvo <span>B</span></h1><button type="button">btn</button></div><div class="my-component"><h1>BMW <span>B</span></h1><button type="button">btn</button></div></div>')
			);

			render(null, container);
		});

		it('Second render (update)', (done) => {
			render(<Wrapper/>, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
			buttons.forEach(button => button.click());

			// requestAnimationFrame is needed here because
			// setState fires after a requestAnimationFrame
			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div><div class="my-component"><h1>Saab <div>A</div></h1><button type="button">btn</button></div><div class="my-component"><h1>Volvo <div>A</div></h1><button type="button">btn</button></div><div class="my-component"><h1>BMW <div>A</div></h1><button type="button">btn</button></div></div>')
				);
				render(null, container);
				done();
			});
		});
	});

	describe('Infinite loop issue', () => {
		it('Should not get stuck when doing setState from ref callback', () => {
			class A extends Component {
				constructor(props) {
					super(props);

					this.state = {
						text: 'foo'
					};

					this.onWilAttach = this.onWilAttach.bind(this);
				}

				onWilAttach(node) {
					// Do something with node and setState
					this.setState({
						text: 'animate'
					})
				}

				render() {
					if (!this.props.open) {
						return null;
					}

					return (
						<div ref={this.onWilAttach}>
							{this.state.text}
						</div>
					)
				}
			}

			render(<A />, container);

			render(<A open={true}/>, container);
			expect(container.innerHTML).to.equal(innerHTML(<div>animate</div>));
		})
	})
});
